import uvicorn
from src.main import app

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        ws="none"  # Disable websockets to avoid the issue with null bytes in source
    )