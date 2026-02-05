---
id: 4
title: Create AI Chatbot Plan
stage: plan
date: 2026-01-31
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-chatbot
branch: 1-ai-chatbot
user: user
command: /sp.plan
labels: [plan, ai, chatbot, mcp, architecture, design]
links:
  spec: specs/1-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ai-chatbot/plan.md
  - specs/1-ai-chatbot/research.md
  - specs/1-ai-chatbot/data-model.md
  - specs/1-ai-chatbot/contracts/chat-api.yaml
  - specs/1-ai-chatbot/quickstart.md
tests:
---

## Prompt

"""/sp.plan

Create:
- AI system architecture sketch
- MCP tool interaction flow
- Agent behavior decision tree
- Validation & testing strategy

Decisions Needing Documentation:
- Gemini API vs OpenAI API tradeoffs
- Stateless chat vs in-memory sessions
- Single agent vs multi-agent architecture
- MCP tools vs direct function calls
- Conversation reconstruction strategy
- Tool chaining rules
- Error propagation design

Organize by Phases:

Phase 1 – Specification Foundation
- Write specs for:
  - Agent behavior
  - MCP tools
  - Chat API
- Define intent → tool mapping
- Lock tool schemas

Phase 2 – MCP Tool Layer
- Implement MCP server
- Define task tools
- Enforce user ownership
- Log tool invocations

Phase 3 – Agent Logic
- Build Gemini-based agent runner
- Parse user intent
- Select correct tool(s)
- Handle tool responses
- Generate confirmations

Phase 4 – Stateless Chat Flow
- Load conversation from DB
- Append user message
- Run agent
- Store assistant response
- Return structured output

Phase 5 – Frontend Integration
- Connect ChatKit UI
- Display conversation history
- Show confirmations & errors

Phase 6 – Validation & Hardening
- Multi-user isolation tests
- Restart resilience tests
- Tool misuse prevention
- Error handling validation

Research / Discovery Approach:
- Spec-concurrent development
- Refine prompts based on agent behavior
- Treat specs as executable contracts

Testing & Validation Strategy:

Agent Validation:
- Intent mapped to correct tool
- No hallucinated operations
- Tool chaining works correctly

MCP Validation:
- Tools are stateless
- Correct DB mutations
- Ownership enforced

Chat Validation:
- Conversation continuity
- Stateless server verified
- Restart recovery confirmed

Quality Gates:
- No tool without spec
- No AI action without tool
- No state outside DB
- No paid API dependency
- Full traceability for judges

Final Output:
- AI-native Todo chatbot
- MCP-driven architecture
- Stateless, scalable backend
- Clean evolution from Phase I → III
"""

## Response snapshot

Completed comprehensive planning for the AI-Powered Todo Chatbot:

- Created implementation plan (plan.md) with technical context, constitution check, and phased approach
- Conducted detailed research (research.md) resolving all technical unknowns including Gemini API patterns, MCP tools, and stateless architecture
- Designed data model (data-model.md) with proper user isolation and relationships for Task, Conversation, and Message entities
- Defined API contracts (contracts/chat-api.yaml) with OpenAPI specification for chat and task endpoints
- Created quickstart guide (quickstart.md) for easy setup and deployment

All components comply with Phase III constitution requirements including agent authority via tools, statelessness by design, deterministic AI integration, security & user isolation, and spec traceability.

## Outcome

- ✅ Impact: Comprehensive architecture plan completed with all constitutional requirements satisfied
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 5 files created (plan.md, research.md, data-model.md, chat-api.yaml, quickstart.md)
- 🔁 Next prompts: Ready for task generation with /sp.tasks
- 🧠 Reflection: Plan addresses all architectural decisions and provides clear implementation path

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Generate implementation tasks with /sp.tasks