import os
from typing import Optional


class Config:
    """Application configuration class"""

    @classmethod
    def get_database_url(cls) -> str:
        """Get the appropriate database URL based on environment variables"""
        neon_url = os.getenv("NEON_DATABASE_URL")
        db_url = os.getenv("DATABASE_URL", "postgresql://localhost/todo_app")  # Changed from SQLite to PostgreSQL default
        return neon_url or db_url

    @classmethod
    def get_secret_key(cls) -> str:
        """Get secret key"""
        return os.getenv("SECRET_KEY", "sk_prod_jwt_1234567890abcdefghijklmnopqrstuvwxyz")

    @classmethod
    def get_algorithm(cls) -> str:
        """Get JWT algorithm"""
        return os.getenv("ALGORITHM", "HS256")

    @classmethod
    def get_access_token_expire_minutes(cls) -> int:
        """Get token expiration time"""
        return int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    @classmethod
    def get_environment(cls) -> str:
        """Get environment"""
        return os.getenv("ENVIRONMENT", "development")

    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production environment"""
        return cls.get_environment().lower() == "production"

    @classmethod
    def is_debug(cls) -> bool:
        """Check if debug mode is enabled"""
        return cls.get_environment().lower() == "development"


# Global config instance
config = Config()