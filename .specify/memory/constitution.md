<!--
Sync Impact Report:
Version change: 1.0.0 → 2.0.0
Added sections: Core Principles (5 principles), Key Standards, Architecture Constraints, AI Framework Constraints, Prohibited Actions
Removed sections: Technology Constraints, Authentication Rules, API Standards, Spec-Driven Workflow, Evaluation Criteria
Modified principles: Phase II → Phase III (completely revised for AI-Powered Todo Chatbot)
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/commands/*.md ⚠ pending
Follow-up TODOs: None
-->
# Phase III – AI-Powered Todo Chatbot (Hackathon III) Constitution

## Core Principles

### I. Agent Authority via Tools
The AI agent must never directly manipulate data. All task operations must occur exclusively through MCP tools.

### II. Statelessness by Design
No in-memory server state. All conversation and task state must persist in the database.

### III. Deterministic AI Integration
The AI agent must behave predictably based on specs. Tool invocation logic must be auditable and reproducible.

### IV. Security & User Isolation
All AI actions must respect authenticated user boundaries. JWT-derived user identity is the sole source of truth.

### V. Spec Traceability
Every agent behavior, tool, and endpoint must trace back to a spec.

## Key Standards
- MCP tools are the ONLY interface between AI and application logic
- Stateless chat endpoint (`POST /api/{user_id}/chat`)
- Conversation history reconstructed from database on every request
- AI agents use MCP tools declaratively, never imperatively
- Gemini (free tier) API is used instead of paid OpenAI keys
- No vendor-locked or paid-only features allowed

## Architecture Constraints
- FastAPI backend hosts:
  - Chat endpoint
  - AI agent runner
  - MCP server
- MCP tools are stateless
- Database stores:
  - tasks
  - conversations
  - messages
- Frontend uses ChatKit-style UI abstraction (provider-agnostic)

## AI Framework Constraints
- Agent logic follows OpenAI Agents SDK patterns (ported to Gemini)
- Tool calls are explicit, structured, and logged
- Agent must confirm actions in natural language

## Prohibited Actions
- AI directly querying or mutating database
- Storing conversation state in memory
- Bypassing MCP tools
- Hard-coding prompts without specs
- Mixing AI logic with business logic
- Assuming paid OpenAI APIs

## Success Criteria
- Users can manage todos via natural language
- AI reliably invokes correct MCP tools
- Conversation survives server restarts
- Multi-user isolation enforced
- Judges can trace: Spec → Tool → Agent → DB change

## Outcome
A scalable, stateless, AI-native Todo system ready for cloud deployment and further agent orchestration.

## Governance
This constitution governs all development activities for the Phase III AI-Powered Todo Chatbot. All developers must adhere to these principles and standards. Deviations require explicit approval and documentation of the reasoning. The constitution serves as the ultimate authority for development decisions and practices.

**Version**: 2.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-31
