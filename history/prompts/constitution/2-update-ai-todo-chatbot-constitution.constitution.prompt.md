---
id: 2
title: Update AI Todo Chatbot Constitution
stage: constitution
date: 2026-01-31
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution, ai, todo-chatbot, hackathon-iii]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
---

## Prompt

"""/sp.constitution

Project: Phase III – AI-Powered Todo Chatbot (Hackathon III)

Focus:
Evolve the Phase II secure full-stack Todo application into an AI-powered conversational system that manages tasks via natural language using an MCP (Model Context Protocol) architecture.

Development Philosophy:
Spec-Driven, Agentic Development using Spec-Kit Plus and Claude Code.
No manual coding. All logic, tools, agents, and integrations must be produced through specifications and AI-driven implementation.

Core Principles:
- Agent Authority via Tools
  The AI agent must never directly manipulate data.
  All task operations must occur exclusively through MCP tools.

- Statelessness by Design
  No in-memory server state.
  All conversation and task state must persist in the database.

- Deterministic AI Integration
  The AI agent must behave predictably based on specs.
  Tool invocation logic must be auditable and reproducible.

- Security & User Isolation
  All AI actions must respect authenticated user boundaries.
  JWT-derived user identity is the sole source of truth.

- Spec Traceability
  Every agent behavior, tool, and endpoint must trace back to a spec.

Key Standards:
- MCP tools are the ONLY interface between AI and application logic
- Stateless chat endpoint (`POST /api/{user_id}/chat`)
- Conversation history reconstructed from database on every request
- AI agents use MCP tools declaratively, never imperatively
- Gemini (free tier) API is used instead of paid OpenAI keys
- No vendor-locked or paid-only features allowed

Architecture Constraints:
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

AI Framework Constraints:
- Agent logic follows OpenAI Agents SDK patterns (ported to Gemini)
- Tool calls are explicit, structured, and logged
- Agent must confirm actions in natural language

Prohibited Actions:
- AI directly querying or mutating database
- Storing conversation state in memory
- Bypassing MCP tools
- Hard-coding prompts without specs
- Mixing AI logic with business logic
- Assuming paid OpenAI APIs

Success Criteria:
- Users can manage todos via natural language
- AI reliably invokes correct MCP tools
- Conversation survives server restarts
- Multi-user isolation enforced
- Judges can trace: Spec → Tool → Agent → DB change

Outcome:
A scalable, stateless, AI-native Todo system ready for cloud deployment and further agent orchestration.
"""

## Response snapshot

Updated the project constitution at `.specify/memory/constitution.md` to reflect the Phase III AI-Powered Todo Chatbot project requirements. The new constitution includes:

- Core Principles: Agent Authority via Tools, Statelessness by Design, Deterministic AI Integration, Security & User Isolation, and Spec Traceability
- Key Standards: MCP tools as the only interface, stateless chat endpoint, Gemini API usage
- Architecture Constraints: FastAPI backend with chat/MCP endpoints, database storage requirements
- AI Framework Constraints: OpenAI Agents SDK patterns ported to Gemini
- Prohibited Actions: Direct database access, in-memory state, bypassing MCP tools
- Success Criteria: Natural language todo management, reliable tool invocation, multi-user isolation

Version updated from 1.0.0 to 2.0.0 with major changes reflecting the shift from Phase II to Phase III requirements.

## Outcome

- ✅ Impact: Major constitution update from Phase II to Phase III requirements (v1.0.0 → v2.0.0)
- 🧪 Tests: N/A (documentation update)
- 📁 Files: 1 file updated (.specify/memory/constitution.md)
- 🔁 Next prompts: Ready for spec development for AI-powered todo chatbot
- 🧠 Reflection: Constitution properly updated to reflect new AI/MCP architecture requirements

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin Phase III spec development