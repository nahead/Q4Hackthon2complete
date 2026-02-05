from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Load environment variables FIRST before any other imports that might need them
load_dotenv()

# Now import modules that depend on environment variables
from src.utils.logging import logger

# Initialize the database tables with error handling (after loading env vars)
try:
    from src.database import create_tables
    create_tables()
    logger.info("Database tables initialized successfully", event="db_init")
except Exception as e:
    logger.error(f"Database initialization failed: {e}", event="db_init_error")
    # Don't crash the app, but log the error

# Create FastAPI app
app = FastAPI(title="Todo App API", version="1.0.0")

# Import and include routers after app creation
from src.api.auth import router as auth_router
from src.api.tasks import router as tasks_router
from src.api.user_tasks import router as user_tasks_router
from src.api.chat import router as chat_router

# Add logging initialization
logger.info("Application starting up", event="startup")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(user_tasks_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}