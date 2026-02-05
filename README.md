# AI Chatbot Todo Application

An AI-powered todo management application that combines natural language processing with traditional task management features. Built with Next.js (App Router) for the frontend and FastAPI for the backend, following MCP-only architecture principles.

## Features

- **AI Chatbot**: Natural language interface for managing todos using Google Gemini
- **Todo Management**: Create, update, delete, and organize tasks
- **User Authentication**: JWT-based secure authentication
- **Task Organization**: Priority levels, status tracking, due dates
- **Conversation History**: Persistent chat history with AI assistant
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **SQLModel**: SQL databases with Python types
- **PostgreSQL**: Robust relational database (Neon-compatible)
- **Google Gemini**: AI model for natural language processing
- **MCP SDK**: Model Context Protocol for tool-based AI interactions
- **Better Auth**: User authentication and isolation

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **OpenAI ChatKit UI**: Chat interface components

## Architecture

### MCP-Only Architecture
- The AI agent (Gemini runner) NEVER accesses the database directly
- The agent ONLY interacts via MCP tools
- ALL state changes occur inside MCP tools
- Ensures clear separation of concerns and security

### Stateless Server
- FastAPI server is completely stateless
- On every chat request, conversation history is loaded from database
- No in-memory session state is maintained
- Server restart does not affect behavior

### Tool-First AI Behavior
- Agent maps natural language → intent → MCP tool call
- Never fabricates task data
- Always verifies task existence before operations

## Project Structure

```
├── backend/
│   ├── models.py           # Database models (Task, User, Conversation, Message)
│   ├── mcp_server.py       # MCP server and tools
│   ├── agents/
│   │   └── gemini_agent.py # AI agent implementation
│   ├── services/
│   │   └── task_service.py # Business logic for MCP tools
│   ├── api/
│   │   └── chat_endpoint.py # Stateless chat API
│   └── main.py             # Application entry point
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── chat/
│   │   │   │   └── page.tsx # Chat interface
│   │   │   └── api/
│   │   │       └── [user_id]/
│   │   │           └── chat/
│   │   │               └── route.ts # API route handler
│   │   ├── lib/
│   │   │   └── api.ts      # API client functions
│   └── package.json        # Frontend dependencies
├── requirements.txt        # Python dependencies
├── package.json            # Project metadata
└── README.md
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (or compatible database)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-chatbot-todo
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env  # If available
# Edit .env with your configuration
```

Required environment variables:
- `GEMINI_API_KEY`: Google Gemini API key
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing

## Usage

### Development

1. Start the backend server:
```bash
cd backend
python main.py
```

2. In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:3000`

### API Endpoints

- `POST /api/{user_id}/chat` - Send messages to the AI assistant
- `GET /health` - Health check endpoint

## MCP Tools

The application implements the following MCP tools:

1. **create_task** - Create a new todo task
2. **list_tasks** - List all tasks for a user
3. **update_task** - Update an existing task
4. **delete_task** - Delete a task
5. **complete_task** - Mark a task as completed

## AI Capabilities

The AI assistant can understand and respond to various todo-related commands:

- "Create a task to buy groceries" → Creates a new task
- "Show me my tasks" → Lists all user's tasks
- "Update task #1 to 'Buy milk'" → Updates task title
- "Mark task #2 as completed" → Marks task as completed
- "Delete task #3" → Deletes the specified task

## Database Models

### User
- ID, email, name, hashed password, creation date, active status

### Task
- ID, title, description, priority, status, due date, creation/update dates, user ID

### Conversation
- ID, user ID, title, creation/update dates

### Message
- ID, role (user/assistant), content, timestamp, conversation ID, user ID

## Error Handling

- Tool errors (task not found, unauthorized access, invalid parameters)
- Agent responds gracefully with clear error messages
- Stack traces are never exposed to users

## Development Guidelines

1. Always follow MCP-only architecture
2. Keep the server stateless
3. Use proper error handling
4. Write comprehensive docstrings
5. Follow type safety practices

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.