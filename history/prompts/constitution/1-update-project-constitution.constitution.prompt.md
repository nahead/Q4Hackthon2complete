---
id: 1
title: "update-project-constitution"
stage: constitution
date: "2026-01-27"
surface: "agent"
model: "Claude Sonnet 4.5"
feature: "none"
branch: "master"
user: "user"
command: "/sp.constitution"
labels: ["constitution", "setup", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - ".specify/memory/constitution.md"
tests: []
outcome: "Successfully updated the project constitution with specific principles for the Phase II Full-Stack Todo Web Application."
evaluation: "Constitution properly updated with all required principles and governance structure."
---

# Constitution Update

## Context
Updated the project constitution for Phase II – Full-Stack Todo Web Application (Hackathon II) to establish clear development principles and governance structure.

## User Prompt
```
"/sp.constitution

Project: Phase II – Full-Stack Todo Web Application (Hackathon II)

Focus:
Transform an in-memory console Todo application into a production-grade, multi-user, full-stack web application using spec-driven, agentic development.

Development Philosophy:
Spec-Driven Development using Spec-Kit Plus and Claude Code.
No manual coding. All implementation must be generated, modified, and iterated through AI agents following written specifications.

Core Principles:
- Spec Fidelity
  All code must strictly follow the written specifications in /specs/**.
  No feature may be implemented without a corresponding spec.

- Cross-Stack Consistency
  Frontend (Next.js), Backend (FastAPI), Database (SQLModel + Neon), and Auth (Better Auth + JWT) must remain aligned at all times.

- Security by Design
  Authentication, authorization, and user isolation are mandatory and enforced at every layer.

- Reproducibility
  Any developer should be able to clone the repo, run the project, and observe identical behavior using the documented workflow.

- Clarity for Review
  Architecture, API behavior, and data flow must be understandable to judges reviewing prompts, specs, and generated code.

Key Standards:
- All functionality must originate from Spec-Kit managed markdown specs
- Specs must be referenced explicitly using @specs/... syntax
- No undocumented endpoints, database fields, or UI behaviors
- Authentication required for all API routes
- JWT verification must occur on every backend request
- Task data must always be filtered by authenticated user ID
- Frontend must never trust client-side user IDs without backend verification

Architecture Constraints:
- Monorepo structure is mandatory
- Separate frontend and backend folders
- Layered CLAUDE.md files must guide agent behavior
- REST API must follow documented endpoint contracts
- Database schema must match /specs/database/schema.md

Technology Constraints:
Frontend:
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- JWT tokens attached to every API request

Backend:
- Python FastAPI
- SQLModel ORM
- Neon Serverless PostgreSQL
- JWT verification middleware
- Environment-based secrets

Authentication Rules:
- Better Auth issues JWT tokens on login
- JWT tokens sent via Authorization: Bearer <token>
- Backend verifies JWT using shared secret
- User identity extracted only from verified token
- URL user_id must match JWT user_id or request is rejected

API Standards:
- All routes under /api/
- RESTful conventions only
- JSON request/response bodies
- Proper HTTP status codes
- 401 for unauthenticated requests
- 403 for unauthorized access
- 404 for missing resources

Spec-Driven Workflow:
1. Write or update spec in /specs/**
2. Reference spec explicitly in prompt
3. Generate implementation via Claude Code
4. Validate against acceptance criteria
5. Update spec if behavior changes
6. Iterate until spec and implementation match exactly

Evaluation Criteria (Hackathon Judging):
- Spec completeness and clarity
- Correct use of Spec-Kit Plus structure
- Secure JWT-based authentication
- Proper user data isolation
- API correctness and consistency
- Frontend–backend contract alignment
- Clean monorepo organization
- Demonstrated agentic development workflow

Prohibited Actions:
- Manual code writing outside Claude Code
- Implementing features not defined in specs
- Hard-coding secrets
- Skipping authentication on any endpoint
- Mixing frontend and backend logic
- Bypassing Spec-Kit conventions

Success Criteria:
- All Phase II requirements implemented via specs
- Fully functional multi-user Todo web application
- JWT-secured REST API
- Persistent storage in Neon PostgreSQL
- Clean, reviewable prompts and specs
- Judges can trace every feature from spec → prompt → code

Output Expectations:
- Production-ready full-stack application
- Clear specs, prompts, and iterations
- Demonstrable evolution from Phase I console app
- A solid foundation for Phase III AI-powered chatbot
"
```

## Response Summary
Successfully updated the constitution file with all the specified principles and requirements for the Phase II Full-Stack Todo Web Application project. The constitution now includes:
- Six core principles (Spec Fidelity, Cross-Stack Consistency, Security by Design, Reproducibility, Clarity for Review, Development Philosophy)
- Key Standards section with technical requirements
- Architecture and Technology Constraints
- Authentication Rules
- API Standards
- Spec-Driven Workflow methodology
- Prohibited Actions and Success Criteria
- Evaluation Criteria for hackathon judging
- Governance section with versioning information

The constitution file is now properly configured for the hackathon project with version 1.0.0, ratified on 2026-01-27.