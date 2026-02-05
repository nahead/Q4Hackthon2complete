# Data Model: Phase II – Full-Stack Todo Web Application

**Date**: 2026-01-27
**Feature**: 001-fullstack-todo-app
**Related Files**: [research.md](./research.md), [spec.md](./spec.md)

## Core Entities

### User
Represents a registered user of the Todo application

**Fields**:
- `id`: Integer (Primary Key, Auto-increment)
- `email`: String (Unique, Required, Validated format)
- `password_hash`: String (Required, Securely hashed)
- `created_at`: DateTime (Auto-set on creation)
- `updated_at`: DateTime (Auto-updated on changes)
- `is_active`: Boolean (Default: true)

**Relationships**:
- One-to-many: User → Tasks (user has many tasks)

**Validation Rules**:
- Email must be valid email format
- Email must be unique across all users
- Password must meet security requirements (handled by Better Auth)

### Task
Represents a user's individual task/to-do item

**Fields**:
- `id`: Integer (Primary Key, Auto-increment)
- `title`: String (Required, Max 200 characters)
- `description`: String | Null (Optional, Max 1000 characters)
- `completed`: Boolean (Default: false)
- `user_id`: Integer (Foreign Key to User.id, Required)
- `created_at`: DateTime (Auto-set on creation)
- `updated_at`: DateTime (Auto-updated on changes)

**Relationships**:
- Many-to-one: Task → User (task belongs to one user)
- One-to-many: Task → TaskActivityLog (optional future extension)

**Validation Rules**:
- Title must not be empty
- User_id must reference an existing, active user
- Completed status can only be true/false

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Index on email for login performance
CREATE INDEX idx_users_email ON users(email);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on user_id for efficient user-specific queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index on completed status for filtering
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Composite index for common user and status queries
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

## State Transitions

### Task State Transitions
- **Pending** → **Completed**: When user marks task as complete
- **Completed** → **Pending**: When user unmarks task as complete

**Transition Rules**:
- Only the task owner (authenticated user with matching user_id) can change completion status
- Task deletion is permanent (CASCADE DELETE from users)

## API Data Contracts

### Request/Response Objects

#### Task Creation Request
```json
{
  "title": "String (required)",
  "description": "String (optional)"
}
```

#### Task Response Object
```json
{
  "id": "Integer",
  "title": "String",
  "description": "String | null",
  "completed": "Boolean",
  "user_id": "Integer",
  "created_at": "ISO 8601 DateTime",
  "updated_at": "ISO 8601 DateTime"
}
```

#### Task Update Request
```json
{
  "title": "String (optional)",
  "description": "String (optional)",
  "completed": "Boolean (optional)"
}
```

## Validation Rules from Requirements

1. **User Isolation**: Tasks can only be accessed by the user who created them
   - Implemented via user_id foreign key and API-level validation
   - Database queries must filter by authenticated user_id

2. **Data Integrity**:
   - Referential integrity maintained through foreign key constraints
   - Cascading deletes prevent orphaned tasks when users are removed

3. **Access Control**:
   - All task operations require valid JWT with matching user_id
   - API endpoints verify JWT user_id matches task's user_id

## Indexing Strategy

1. **Primary Access Patterns**:
   - User's tasks: Index on `tasks.user_id`
   - Completed tasks: Index on `tasks.completed`
   - Combined queries: Composite index on `(user_id, completed)`

2. **Performance Considerations**:
   - Email lookup for authentication: Index on `users.email`
   - Recent tasks: Leverage `created_at` ordering with user_id filter

## Future Extensibility

### Potential Additions (Phase III)
- Task categories/tags: Additional table with many-to-many relationship
- Task sharing: Permissions table for collaborative features
- Activity logging: TaskActivityLog table for audit trails

### Migration Considerations
- Schema changes should maintain backward compatibility
- Additive changes preferred over breaking changes
- Data migration scripts needed for structural changes