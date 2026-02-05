# Quickstart Guide: Phase II – Full-Stack Todo Web Application

**Date**: 2026-01-27
**Feature**: 001-fullstack-todo-app
**Related Files**: [research.md](./research.md), [data-model.md](./data-model.md)

## Prerequisites

- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- PostgreSQL-compatible database (Neon recommended)
- Git
- Package managers: npm/yarn/pnpm (Node.js), pip (Python)

## Project Setup

### 1. Clone and Initialize Repository

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `.env` files for both backend and frontend:

**Backend (.env)**:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-jwt-signing-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
NEON_DATABASE_URL=your-neon-database-url
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Navigate to backend directory
cd backend

# Run database migrations (using Alembic or direct SQL)
python -m src.database.init

# Or if using Alembic:
alembic upgrade head
```

## Running the Application

### Development Mode

**Backend (FastAPI)**:
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Frontend (Next.js)**:
```bash
cd frontend
npm run dev
```

### Production Mode

**Backend**:
```bash
cd backend
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
cd frontend
npm run build
npm run start
```

## Key Endpoints

### Backend API (http://localhost:8000/api)

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /tasks` - Get current user's tasks
- `POST /tasks` - Create new task
- `GET /tasks/{task_id}` - Get specific task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

### Frontend Routes (http://localhost:3000)

- `/` - Home/Dashboard (requires authentication)
- `/login` - Login page
- `/register` - Registration page
- `/tasks` - Task management page
- `/profile` - User profile page

## Authentication Flow

1. User registers via `/auth/register` or logs in via `/auth/login`
2. Better Auth issues JWT token upon successful authentication
3. JWT token is stored in browser (cookies/local storage)
4. All subsequent API requests include `Authorization: Bearer <token>` header
5. Backend middleware verifies JWT and extracts user identity
6. User-specific data is returned based on JWT user_id

## Database Models

### User Model
- Stores user credentials and metadata
- Related to multiple tasks via user_id foreign key

### Task Model
- Belongs to a single user
- Contains title, description, completion status
- User isolation enforced at both API and database levels

## Development Commands

### Backend
```bash
# Run tests
cd backend
pytest

# Format code
black src/

# Check types
mypy src/

# Lint
flake8 src/
```

### Frontend
```bash
# Run tests
cd frontend
npm test

# Format code
npm run format

# Lint
npm run lint

# Build
npm run build
```

## Testing

### Unit Tests
```bash
# Backend
cd backend
pytest tests/unit/

# Frontend
cd frontend
npm run test:unit
```

### Integration Tests
```bash
# Backend
cd backend
pytest tests/integration/

# Frontend
cd frontend
npm run test:integration
```

## Deployment

### Backend to Production
```bash
# Build container
docker build -t todo-backend -f backend/Dockerfile .

# Run container
docker run -d -p 8000:8000 --env-file backend/.env todo-backend
```

### Frontend to Production
```bash
# Build static assets
cd frontend
npm run build

# Serve with production server
npm run start
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL is correctly set in backend .env
   - Check that PostgreSQL server is running
   - Ensure network connectivity to database

2. **Authentication Failures**:
   - Verify SECRET_KEY matches between frontend and backend
   - Check that JWT tokens are being properly included in requests
   - Confirm Better Auth is properly configured

3. **Frontend-Backend Communication**:
   - Verify API_BASE_URL is correctly set in frontend
   - Check CORS settings in backend
   - Ensure both services are running on expected ports

### Debugging Tips

- Enable debug logging in backend by setting `DEBUG=true` in .env
- Use browser developer tools to inspect API requests and responses
- Check server logs for error details
- Verify JWT token validity using online JWT decoders