import uvicorn
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_server():
    # Import the app inside the function to avoid issues during reload
    from src.main import app

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,  # Disable reload to avoid import string requirement
        ws="none"  # Disable websockets to avoid the issue
    )

if __name__ == "__main__":
    run_server()