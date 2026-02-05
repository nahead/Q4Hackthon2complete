import uvicorn
from dotenv import load_dotenv
load_dotenv()
from src.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081, log_level="info")