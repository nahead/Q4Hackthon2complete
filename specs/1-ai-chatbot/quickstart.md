# Quickstart Guide: AI-Powered Todo Chatbot

**Feature**: 1-ai-chatbot | **Date**: 2026-01-31

## Overview

This guide provides step-by-step instructions to set up, configure, and run the AI-powered todo chatbot with MCP tools and Gemini API integration.

## Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend development)
- PostgreSQL-compatible database (Neon recommended)
- Gemini API key (free tier)
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_chatbot
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Database Setup
```bash
# Run database migrations
alembic upgrade head

# Or initialize the database directly
python -m src.models.init_db
```

#### Start the Backend Server
```bash
uvicorn src.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

#### Start the Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Core Components

### MCP Tools
The system includes these MCP tools for AI interaction:
- `add_task`: Creates new tasks
- `list_tasks`: Retrieves user's tasks
- `complete_task`: Marks tasks as complete
- `update_task`: Modifies existing tasks
- `delete_task`: Removes tasks

### API Endpoints
- `POST /api/{user_id}/chat` - Main chat endpoint for natural language processing
- `GET /api/{user_id}/tasks` - Retrieve user's tasks
- `POST /api/{user_id}/tasks` - Create new tasks

## Running the Application

### Development Mode
1. Start the backend server (step 2.4)
2. Start the frontend server (step 3.3)
3. Access the application at `http://localhost:3000`

### Testing the Chat Interface
1. Authenticate with a valid user account
2. Navigate to the chat interface
3. Enter natural language commands like:
   - "Add buy groceries to my list"
   - "Show me my tasks"
   - "Complete task 1"
   - "Update task 2 to buy milk instead"
   - "Delete task 3"

## Configuration Options

### Backend Settings
- `GEMINI_MODEL`: Specify which Gemini model to use (default: gemini-pro)
- `TOOL_CHAINING_ENABLED`: Allow AI to chain multiple tools (default: true)
- `CONVERSATION_HISTORY_LIMIT`: Number of messages to include in context (default: 20)

### Frontend Settings
- `MAX_MESSAGE_LENGTH`: Maximum length of user messages (default: 1000)
- `AUTO_SCROLL_CHAT`: Whether to auto-scroll to new messages (default: true)

## Verification Steps

### 1. Verify Backend Health
```bash
curl http://localhost:8000/health
```
Expected response: `{"status": "healthy"}`

### 2. Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/user123/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What can you help me with?"}'
```

### 3. Verify MCP Tools
The AI agent should be able to successfully invoke MCP tools when given appropriate commands.

### 4. Test User Isolation
Verify that user A cannot access tasks belonging to user B by testing with different user IDs.

## Troubleshooting

### Common Issues

**Issue**: Database connection errors
**Solution**: Verify DATABASE_URL is correctly configured and database server is running

**Issue**: Gemini API errors
**Solution**: Check GEMINI_API_KEY is valid and account has sufficient quota

**Issue**: Chat endpoint returns 403 errors
**Solution**: Verify JWT tokens are being passed correctly in Authorization header

**Issue**: MCP tools not being invoked
**Solution**: Check that tool schemas are properly registered with the MCP server

### Logging
- Backend logs are available in the console where uvicorn is running
- Tool invocation logs are stored in the database for audit purposes
- Frontend errors are logged to browser console

## Next Steps

1. Customize the frontend UI to match your branding
2. Extend the MCP tools with additional functionality
3. Implement additional security measures if required
4. Scale the infrastructure for production use