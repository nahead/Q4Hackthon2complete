# Implementation Plan: AI-Powered Todo Chatbot

**Branch**: `1-ai-chatbot` | **Date**: 2026-01-31 | **Spec**: [specs/1-ai-chatbot/spec.md](spec.md)

**Input**: Feature specification from `/specs/1-ai-chatbot/spec.md`

## Summary

Implementation of an AI-powered todo chatbot that processes natural language commands through MCP tools to manage user tasks. The system follows a stateless architecture where all conversation and task state persists in the database. The AI agent operates exclusively through MCP tools without direct database access, ensuring security and auditability.

## Technical Context

**Language/Version**: Python 3.11, TypeScript 5.x
**Primary Dependencies**: FastAPI, SQLModel, Neon PostgreSQL, Gemini API, MCP SDK
**Storage**: Neon PostgreSQL database for tasks, conversations, and messages
**Testing**: pytest with integration and contract tests
**Target Platform**: Linux server (cloud-ready)
**Project Type**: Web application with backend API and provider-agnostic frontend
**Performance Goals**: 95% of natural language commands processed within 3 seconds
**Constraints**: <200ms p95 for database operations, stateless server operation, free-tier API usage
**Scale/Scope**: Support for 1000+ concurrent users with proper user isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Agent Authority via Tools: AI agent will operate exclusively through MCP tools
- ✅ Statelessness by Design: No in-memory state; all data persists in database
- ✅ Deterministic AI Integration: Tool invocation logic will be auditable and reproducible
- ✅ Security & User Isolation: JWT-derived user identity will be enforced on all operations
- ✅ Spec Traceability: All agent behaviors and endpoints will trace back to specs
- ✅ MCP tools are the ONLY interface: AI will not directly access database
- ✅ Stateless chat endpoint: POST /api/{user_id}/chat will reconstruct conversation history
- ✅ Gemini (free tier) API: Will use instead of paid OpenAI keys
- ✅ No prohibited actions: No direct database access, no in-memory state, no bypassing MCP tools

**Post-Design Verification**:
- ✅ Data model enforces user isolation through user_id foreign keys
- ✅ API contracts ensure authenticated user_id is validated
- ✅ MCP tools designed to be stateless with explicit user_id parameters
- ✅ Conversation reconstruction pattern implemented in API design
- ✅ All components trace back to specification requirements

## Project Structure

### Documentation (this feature)
```text
specs/1-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py          # Task entity with user ownership
│   │   ├── conversation.py  # Conversation entity with user_id
│   │   └── message.py       # Message entity linking to conversation
│   ├── services/
│   │   ├── mcp_server.py    # MCP server implementation
│   │   ├── task_service.py  # Business logic for task operations
│   │   └── chat_service.py  # Chat processing logic
│   ├── tools/
│   │   ├── add_task.py      # MCP tool for adding tasks
│   │   ├── list_tasks.py    # MCP tool for listing tasks
│   │   ├── complete_task.py # MCP tool for completing tasks
│   │   ├── update_task.py   # MCP tool for updating tasks
│   │   └── delete_task.py   # MCP tool for deleting tasks
│   ├── api/
│   │   └── chat.py          # Chat endpoint implementation
│   └── agents/
│       └── gemini_agent.py   # Gemini-based agent runner
└── tests/
    ├── unit/
    ├── integration/
    └── contract/

frontend/
├── src/
│   ├── components/
│   │   └── ChatInterface/    # ChatKit-style UI component
│   ├── services/
│   │   └── api-client.ts     # API client for chat endpoint
│   └── types/
│       └── chat-types.ts     # Type definitions for chat interface
└── tests/
    └── e2e/
```

**Structure Decision**: Web application with separate backend and frontend directories to maintain clear separation of concerns while enabling independent scaling of components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None identified | | |

## Phase 0: Research & Resolution of Unknowns

### Research Tasks Identified
1. **Gemini API integration patterns**: How to implement OpenAI Agents SDK patterns with Gemini
2. **MCP SDK usage**: Best practices for implementing Model Context Protocol tools
3. **FastAPI async patterns**: Optimal async implementation for chat endpoints
4. **SQLModel relationships**: Proper user ownership enforcement for tasks
5. **JWT validation in FastAPI**: Correct implementation of user isolation

### Expected Outcomes
- Clear understanding of Gemini API limitations vs OpenAI
- MCP tool implementation patterns established
- Database relationship patterns defined
- Authentication and authorization patterns validated

## Phase 1: Design & Architecture

### Data Model Design
Based on key entities from spec:
- **Task**: With id, title, description, completed status, user_id, timestamps
- **Conversation**: With id, user_id, created_at, updated_at
- **Message**: With id, conversation_id, role (user/assistant), content, timestamp

### API Contract Design
- **POST /api/{user_id}/chat**: Process natural language input and return structured response
- **Request**: JSON with {message: string}
- **Response**: JSON with {response: string, tool_invocations: []}

### Component Architecture
- MCP Server: Handles tool registration and execution
- Gemini Agent: Processes user input and selects appropriate tools
- Chat Service: Manages conversation flow and state persistence
- Task Service: Implements business logic with user isolation
- Frontend UI: Provider-agnostic chat interface

## Phase 2: Implementation Planning

### High-Level Implementation Steps
1. Set up project structure and dependencies
2. Implement database models with proper relationships
3. Create MCP tool implementations for task operations
4. Build Gemini-based agent with intent recognition
5. Implement stateless chat endpoint
6. Create frontend chat interface
7. Integrate all components and test
8. Validate security and isolation requirements