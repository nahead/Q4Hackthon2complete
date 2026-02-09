from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator
import os
import logging
from contextlib import contextmanager
from urllib.parse import urlparse, parse_qs
from src.config import config

# Suppress SQLAlchemy engine logging to reduce verbosity
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARN)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.WARN)
logging.getLogger('sqlalchemy.pool').setLevel(logging.WARN)
logging.getLogger('sqlalchemy.orm').setLevel(logging.WARN)

# Get database URL from configuration
# REQUIRE Neon PostgreSQL ONLY, fail fast if not PostgreSQL
DATABASE_URL = config.get_database_url()

# For development/testing, allow SQLite; for production, require PostgreSQL/Neon
if "sqlite" in DATABASE_URL.lower():
    # SQLite doesn't need SSL
    connect_args = {}
else:
    # REQUIRE PostgreSQL/Neon only - fail if not PostgreSQL
    if not ("neon" in DATABASE_URL.lower() or "postgresql" in DATABASE_URL.lower()):
        raise RuntimeError("Only PostgreSQL/Neon databases are allowed. SQLite is not permitted.")

    # Parse sslmode from DATABASE_URL query parameters
    parsed_url = urlparse(DATABASE_URL)
    query_params = parse_qs(parsed_url.query)
    sslmode = query_params.get('sslmode', ['require'])[0]  # Default to 'require' if not specified

    # Create engine with SSL configuration from URL
    connect_args = {"sslmode": sslmode}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_session():
    """
    Context manager for database sessions
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Import all models here to ensure they are registered with SQLAlchemy
from src.models import Base

def create_tables():
    """
    Create all tables in the database
    """
    try:
        Base.metadata.create_all(bind=engine)
        from src.utils.logging import logger
        logger.info("Database tables created successfully", event="db_tables_created")
    except Exception as e:
        from src.utils.logging import logger
        logger.error(f"Database tables creation failed: {e}", event="db_tables_error")
        # Don't raise the exception to avoid crashing the application