# Research Summary: Phase II – Full-Stack Todo Web Application

**Date**: 2026-01-27
**Feature**: 001-fullstack-todo-app
**Related Files**: [plan.md](./plan.md), [spec.md](./spec.md)

## Architectural Decisions

### 1. Monorepo vs Separate Repositories

**Decision**: Monorepo approach using a single repository with separate frontend and backend directories.

**Rationale**:
- Easier coordination between frontend and backend changes
- Simplified dependency management for shared types/utils
- Better for hackathon timeline with rapid iteration needs
- Maintains clear separation while allowing cross-component validation

**Alternatives Considered**:
- Separate repositories: Would require more complex CI/CD and version synchronization
- Single integrated codebase: Would blur the separation of concerns

### 2. JWT-based Authentication vs Session-based Auth

**Decision**: JWT-based authentication with stateless verification.

**Rationale**:
- Stateless operation aligns with microservices scalability goals
- Client can store JWT and include in headers without server-side session tracking
- Better for distributed systems if application scales
- Matches requirements specified in the feature description

**Alternatives Considered**:
- Session-based: Would require server-side storage and session management
- OAuth providers only: Too restrictive, need custom user registration

### 3. Better Auth Integration Strategy with FastAPI

**Decision**: Use Better Auth for user management and registration/login, with custom FastAPI middleware for JWT verification.

**Rationale**:
- Better Auth provides robust user management and social login options
- FastAPI middleware can intercept requests to verify JWT tokens
- Clear separation: Better Auth handles user lifecycle, FastAPI handles API protection
- Supports the requirement for JWT tokens issued upon successful login

**Implementation Pattern**:
- Better Auth endpoint for login/registration → JWT issuance
- JWT included in requests to backend
- FastAPI middleware validates JWT and extracts user identity
- User ID from JWT used to enforce data access controls

### 4. User Identity Source of Truth

**Decision**: JWT claims will be the authoritative source of user identity for all backend operations.

**Rationale**:
- Prevents privilege escalation by trusting URL parameters or request body data
- Maintains security even if frontend sends incorrect user information
- Ensures consistent user identification across all API endpoints
- Aligns with security-by-design principle from constitution

**Pattern**:
- Extract user_id from verified JWT token
- Use this user_id for all database queries and permission checks
- Reject requests where URL parameters conflict with JWT user_id

### 5. API URL Structure and Versioning

**Decision**: RESTful endpoints with user ID validation from JWT (not from URL).

**Pattern**:
- GET `/api/tasks` - Get current user's tasks (user from JWT)
- POST `/api/tasks` - Create task for current user (user from JWT)
- GET `/api/tasks/{task_id}` - Get specific task (verify task belongs to JWT user)
- PUT `/api/tasks/{task_id}` - Update specific task (verify ownership from JWT)
- DELETE `/api/tasks/{task_id}` - Delete specific task (verify ownership from JWT)

**Rationale**:
- Prevents unauthorized access to other users' resources
- Maintains consistency with user isolation requirement
- Follows REST conventions while enforcing security

### 6. Database Schema Design for Task Ownership

**Decision**: SQLModel with foreign key relationship between Task and User models.

**Schema Pattern**:
```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True)
    # Other user fields

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str | None = None
    completed: bool = False
    user_id: int = Field(foreign_key="user.id")
    user: User | None = Relationship(back_populates="tasks")
```

**Rationale**:
- Enforces referential integrity at database level
- Enables efficient querying with JOINs
- Supports indexing for user-specific task retrieval
- Aligns with SQLModel ORM requirements

### 7. Frontend Data-Fetching Strategy

**Decision**: Combination of server components for initial load and client components for interactivity.

**Rationale**:
- Server components can include auth context for initial rendering
- Client components handle dynamic UI interactions post-authentication
- Optimizes for SEO and initial load performance
- Matches Next.js 16+ App Router patterns

**Pattern**:
- Server components fetch initial data with auth context
- Client components handle form submissions and state changes
- API calls from client components include JWT tokens

### 8. Error Handling and Status Code Conventions

**Decision**: Standard HTTP status codes with detailed error responses.

**Status Code Mapping**:
- 200: Successful requests
- 201: Successful resource creation
- 400: Bad requests (validation errors)
- 401: Unauthorized (missing or invalid JWT)
- 403: Forbidden (valid JWT but insufficient permissions)
- 404: Resource not found
- 500: Internal server errors

**Rationale**:
- Follows REST API best practices
- Clear semantics for frontend error handling
- Aligns with common API consumption patterns

## Technical Implementation Patterns

### JWT Lifecycle Management

**Issuance**: Better Auth generates JWT upon successful login/registration
**Transport**: JWT sent in Authorization header: `Authorization: Bearer <token>`
**Verification**: FastAPI middleware validates JWT signature and expiration
**Expiry**: Configurable TTL for security (likely 15-30 minutes for access tokens)

### FastAPI Middleware for JWT Verification

**Pattern**:
```python
async def jwt_verification_middleware(request, call_next):
    # Extract JWT from Authorization header
    # Verify JWT signature and expiration
    # Extract user_id and attach to request context
    # Continue request with user context
```

### Frontend Authentication State Management

**Pattern**:
- Better Auth provides session management
- JWT automatically included in API requests
- Handle token refresh/expiration gracefully
- Redirect to login on authentication failures

## Dependencies and Best Practices

### Backend Dependencies
- FastAPI: Modern Python web framework with excellent async support
- SQLModel: SQL toolkit that combines SQLAlchemy and Pydantic
- Better Auth: Authentication provider with JWT support
- Neon PostgreSQL: Serverless PostgreSQL with connection pooling

### Frontend Dependencies
- Next.js 16+: React framework with App Router for modern patterns
- TypeScript: Type safety for API contracts
- Tailwind CSS: Utility-first styling approach
- Better Auth client: Frontend authentication integration