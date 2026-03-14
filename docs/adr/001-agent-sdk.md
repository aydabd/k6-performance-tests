# ADR-001 — Agent SDK Choice: Custom MCP-Native Approach

**Date**: 2025-01-01
**Status**: Accepted
**Deciders**: WP-12 team

## Context

WP-12 requires an agent runtime that can orchestrate a multi-step AI pipeline
(analyze → plan → generate → execute → report). We evaluated four options:

| Option | MCP Support | Dependencies | Testability |
|---|---|---|---|
| Claude Agent SDK | Strong | TypeScript/Python only | Medium |
| Copilot Agent SDK | GitHub-integrated | TypeScript only | Medium |
| LangChain JS | Large community | Heavy (many packages) | Complex |
| Custom MCP-native | Full control | Zero external deps | Excellent |

The existing codebase uses JavaScript ES modules with zero runtime dependencies
beyond k6 built-ins. All new agent code must target Node.js ≥ 24 and integrate
with the existing `src/` libraries.

## Decision

Use a **custom MCP-native approach**: a thin, purpose-built orchestrator written
in plain JavaScript (ES modules) with no external AI SDK dependencies.

Each agent is a plain `async function(input) → output` following a shared
message contract:

```text
Input:  { type, payload, context }
Output: { type, payload, status }
Error:  { type, payload: null, status: 'error', error: string, context }
```

The orchestrator owns all state and drives the pipeline. Agents are stateless
and individually testable in isolation.

## Consequences

**Positive**:
- Zero new runtime dependencies — no supply-chain risk.
- Agents are plain functions — trivial to unit-test with Vitest.
- Message contract is language-agnostic; future MCP tool calls can wrap agents
  without changing internal logic.
- Full control over retry logic, state machine, and error handling.

**Negative**:
- No built-in LLM integration — LLM calls must be added explicitly per agent.
- No community plugins — every feature must be hand-rolled.
- Template-based generation replaces LLM generation for the initial release;
  LLM calls can be added incrementally behind the same agent interface.

## Alternatives Rejected

- **LangChain JS**: Too many transitive dependencies; its abstraction layer
  would obscure the simple pipeline logic.
- **Claude/Copilot SDK**: Language lock-in (TypeScript) and external network
  dependency during tests.
