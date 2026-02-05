"""Main entry point for the AI Chatbot Todo application."""

import uvicorn
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Get port from environment variable or default to 8080
    port = int(os.getenv("PORT", 8080))

    logger.info(f"Starting AI Chatbot Todo application on port {port}")

    # Run the FastAPI application with uvicorn
    # Using string reference to avoid circular import issues
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload for direct execution to avoid import issues
        log_level="info"
    )