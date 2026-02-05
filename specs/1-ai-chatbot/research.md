# Research: AI-Powered Todo Chatbot

**Feature**: 1-ai-chatbot | **Date**: 2026-01-31

## Research Summary

Comprehensive research conducted to resolve technical unknowns for implementing the AI-powered todo chatbot with MCP tools and Gemini API.

## Decision: Gemini API vs OpenAI API Implementation

**Rationale**: The constitution mandates use of Gemini (free tier) API instead of paid OpenAI keys to ensure no vendor-locked or paid-only features. Implementation will adapt OpenAI Agents SDK patterns to Gemini's capabilities.

**Alternatives considered**:
- OpenAI API: Would require paid subscription, violating constitution
- Anthropic Claude: Would require API keys, violating constitution
- Self-hosted models: Would add complexity beyond scope

## Decision: MCP Tool Architecture Pattern

**Rationale**: Model Context Protocol tools provide standardized way to extend AI capabilities while maintaining auditability and control. MCP ensures AI actions are deterministic and traceable.

**Alternatives considered**:
- Direct function calls: Would violate "Agent Authority via Tools" principle
- Plugin architecture: Would be more complex without additional benefits
- REST API calls from AI: Would bypass tool enforcement

## Decision: Stateless Architecture with Database Reconstruction

**Rationale**: To satisfy "Statelessness by Design" principle, conversation history will be reconstructed from database on each request. This ensures server restarts don't affect conversations.

**Alternatives considered**:
- In-memory sessions: Would violate constitution prohibition on storing conversation state in memory
- Redis cache: Would add external dependency and potential state persistence
- Client-side history: Would compromise security and completeness

## Decision: JWT-Based User Authentication and Isolation

**Rationale**: JWT tokens will be validated on each request with user_id extracted to enforce user isolation. This satisfies the "Security & User Isolation" principle.

**Alternatives considered**:
- Session cookies: Would add complexity without benefits
- OAuth tokens: Would be overkill for this context
- API keys: Would complicate user management

## Decision: FastAPI for Backend Framework

**Rationale**: FastAPI provides excellent async support, automatic API documentation, and strong typing capabilities. It integrates well with the required dependencies (SQLModel, JWT, etc.).

**Alternatives considered**:
- Flask: Less modern, weaker async support
- Django: Overkill for this API-focused application
- Express.js: Would require switching to Node.js ecosystem

## Decision: SQLModel for Database Operations

**Rationale**: SQLModel combines Pydantic validation with SQLAlchemy functionality, providing type safety and proper ORM capabilities. Integrates well with Neon PostgreSQL.

**Alternatives considered**:
- Pure SQLAlchemy: Would lack Pydantic-style validation
- Tortoise ORM: Would add async-specific complexity
- Peewee: Would be less feature-rich than SQLModel

## Decision: Provider-Agnostic Frontend with ChatKit Pattern

**Rationale**: Following ChatKit-style UI abstraction ensures the frontend can work with different AI providers while maintaining consistent UX patterns.

**Alternatives considered**:
- Provider-specific UI kits: Would create vendor lock-in
- Custom-built chat UI: Would require more development time
- Pre-built chat widgets: Might not provide necessary customization

## Technical Implementation Patterns

### MCP Tool Structure
Each MCP tool will follow this pattern:
- Stateless execution
- Accept user_id as explicit parameter
- Validate user ownership of resources
- Return structured results for AI consumption
- Log all invocations for auditability

### Gemini Agent Integration
- Use generative model with function calling capabilities
- Map natural language to structured tool calls
- Implement intent recognition with confidence scoring
- Support tool chaining for complex operations

### Database Design Considerations
- Proper indexing on user_id for performance
- Foreign key relationships to enforce referential integrity
- Audit trails for all changes
- Efficient querying patterns for conversation reconstruction

## Key Findings

1. **Gemini API Limitations**: Gemini supports function calling which can replicate most OpenAI Agents functionality, though with different implementation details.

2. **MCP SDK Availability**: Official MCP SDK provides tool registration and execution framework that ensures compliance with constitutional principles.

3. **Stateless Scalability**: Database-based conversation storage enables horizontal scaling without session affinity requirements.

4. **Security Enforcement**: JWT validation on each request combined with user_id filtering provides robust multi-tenant isolation.

5. **Audit Trail**: MCP tool invocation logging provides complete traceability from user intent to database changes, satisfying judge requirements for Phase III.

## Risk Mitigation

### Performance Risks
- Risk: Conversation reconstruction causing slow responses
- Mitigation: Proper indexing and caching of frequently accessed conversations

### Security Risks
- Risk: User data cross-contamination
- Mitigation: Mandatory user_id validation in all database queries

### Scalability Risks
- Risk: Database becoming bottleneck
- Mitigation: Connection pooling and optimized query patterns

### AI Accuracy Risks
- Risk: Misinterpretation of user intent
- Mitigation: Confidence scoring and user confirmation patterns