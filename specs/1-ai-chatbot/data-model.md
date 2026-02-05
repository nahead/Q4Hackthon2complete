# Data Model: AI-Powered Todo Chatbot

**Feature**: 1-ai-chatbot | **Date**: 2026-01-31

## Overview

Database schema design for the AI-powered todo chatbot, focusing on user isolation, conversation persistence, and task management with proper relationships and constraints.

## Entity Definitions

### Task
**Purpose**: Represents individual todo items with user ownership and state tracking

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the task
- `title`: String(255) - Task title/description
- `description`: Text (Optional) - Detailed task description
- `completed`: Boolean - Whether the task is completed (default: False)
- `user_id`: String - ID of user who owns the task
- `created_at`: DateTime - Timestamp when task was created
- `updated_at`: DateTime - Timestamp when task was last updated
- `completed_at`: DateTime (Optional) - Timestamp when task was completed

**Relationships**:
- Belongs to one User (via user_id foreign key reference)

**Validation Rules**:
- Title must be non-empty
- User_id must match authenticated user
- Cannot modify tasks belonging to other users

### Conversation
**Purpose**: Represents a user's ongoing dialogue with the AI chatbot

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the conversation
- `user_id`: String - ID of user who owns the conversation
- `title`: String(255) - Auto-generated or user-defined conversation title
- `created_at`: DateTime - Timestamp when conversation started
- `updated_at`: DateTime - Timestamp when conversation was last updated

**Relationships**:
- Has many Messages (via conversation_id foreign key)

**Validation Rules**:
- User_id must match authenticated user
- Cannot access conversations belonging to other users

### Message
**Purpose**: Individual exchanges between user and AI in a conversation

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the message
- `conversation_id`: UUID - ID of conversation this message belongs to
- `role`: Enum('user', 'assistant') - Who sent the message
- `content`: Text - The actual message content
- `timestamp`: DateTime - When the message was sent
- `tool_calls`: JSON (Optional) - Details of tools called by AI
- `tool_responses`: JSON (Optional) - Responses from tools

**Relationships**:
- Belongs to one Conversation (via conversation_id foreign key)

**Validation Rules**:
- Role must be either 'user' or 'assistant'
- Conversation_id must reference existing conversation
- User must have access to the conversation

## Database Relationships

```
User (user_id)
    ↓ (owns)
Conversation (user_id)
    ↓ (contains)
Message (conversation_id)
```

```
User (user_id)
    ↓ (owns)
Task (user_id)
```

## Indexes

### Primary Indexes
- Task.id (Primary Key)
- Conversation.id (Primary Key)
- Message.id (Primary Key)

### Secondary Indexes
- Task.user_id (B-tree) - For efficient user-based queries
- Conversation.user_id (B-tree) - For efficient user-based queries
- Message.conversation_id (B-tree) - For efficient conversation-based queries
- Task.created_at (B-tree) - For chronological ordering
- Conversation.updated_at (B-tree) - For conversation ordering
- Message.timestamp (B-tree) - For chronological ordering

## Constraints

### Referential Integrity
- Message.conversation_id must reference existing Conversation.id
- All user-owned entities must match authenticated user_id

### Data Integrity
- Task.title cannot be NULL or empty
- Message.role must be 'user' or 'assistant'
- Timestamps automatically updated on record changes

### Access Control
- All queries must filter by user_id to enforce isolation
- No cross-user access allowed without explicit permission

## State Transitions

### Task States
```
Active (default) → Completed (when complete_task tool called)
Completed → Active (when update_task tool called with completed=False)
```

### Message Flow
```
User sends message → Assistant processes → Assistant responds
                    ↓
              Tool invocation occurs (if needed)
                    ↓
              Tool response recorded
```

## Sample Queries

### Load User's Tasks
```sql
SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC;
```

### Load Conversation History
```sql
SELECT * FROM conversations
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 10;
```

### Load Messages in Conversation
```sql
SELECT * FROM messages
WHERE conversation_id = ?
ORDER BY timestamp ASC;
```

## Performance Considerations

### Optimizations
- UUID primary keys for distributed systems compatibility
- Proper indexing for user-based queries
- Efficient ordering for chronological retrieval
- JSON fields for flexible tool call/response storage

### Scalability Factors
- User-based partitioning possible with user_id field
- Connection pooling recommended for high concurrency
- Query optimization for conversation reconstruction