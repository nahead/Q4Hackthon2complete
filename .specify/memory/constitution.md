<!--
Sync Impact Report:
Version change: 2.0.0 → 3.0.0
Added sections: Containerization Requirements, Kubernetes Deployment Standards, AI-Assisted DevOps Principles, Local Development Environment Constraints
Modified principles: Phase III → Phase IV (revised for Local Kubernetes Deployment of Todo Chatbot)
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/commands/*.md ⚠ pending
Follow-up TODOs: None
-->
# Phase IV – Local Kubernetes Deployment of Todo Chatbot Constitution

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

## Containerization Requirements
- Docker containers must be built using AI-generated Dockerfiles
- All environment variables must be configurable via container environment
- Images must follow multi-stage build patterns for optimization
- Container images must support ARM64 and AMD64 architectures
- No hardcoded secrets in Dockerfiles or build context

## Kubernetes Deployment Standards
- All deployments must be defined through AI-generated Helm charts
- Services must expose correct ports (frontend: 3000, backend: 8080)
- Deployments must support configurable replica counts
- Resource limits and requests must be defined for all containers
- Health checks must be implemented for liveness and readiness probes

## AI-Assisted DevOps Principles
- All Docker and Kubernetes manifests must be AI-generated using Claude Code
- Docker AI (Gordon) handles containerization tasks
- kubectl-ai and Kagent handle Kubernetes orchestration
- Infrastructure as Code must be version-controlled
- All deployment steps must be reproducible and documented

## Local Development Environment Constraints
- Deployments must work on local Minikube clusters
- Docker Desktop 4.53+ with Kubernetes enabled is required
- Environment variables and ports must be correctly managed for local deployment
- No manual coding - all manifests generated through Claude Code or AI agents
- Support for scaling frontend/backend replicas must be enabled

## Prohibited Actions
- AI directly manipulating Kubernetes resources without manifests
- Manual editing of generated Dockerfiles or Kubernetes manifests
- Bypassing AI-assisted DevOps tools
- Hard-coding environment-specific configurations
- Mixing development and production configurations
- Assuming cloud-only features without local equivalents

## Success Criteria
- Docker containers built successfully for frontend and backend
- Helm charts deploy services to local Minikube cluster
- Frontend accessible at port 3000 and backend at 8080 locally
- Reproducible deployment process on any local machine
- Scalable frontend/backend replicas running in Kubernetes
- All components properly integrated in containerized environment

## Outcome
A cloud-native, containerized Todo chatbot system deployed on local Kubernetes cluster using AI-assisted DevOps tools, ready for scaling and production deployment.

## Governance
This constitution governs all development activities for the Phase IV Local Kubernetes Deployment of Todo Chatbot. All developers must adhere to these principles and standards. Deviations require explicit approval and documentation of the reasoning. The constitution serves as the ultimate authority for development decisions and practices.

**Version**: 3.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-02-05