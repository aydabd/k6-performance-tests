# WP-12a — Agent Framework & Orchestration

> **Parent**: [WP-12](wp-12-ai-agent-test-automation.md) · **Depends on**: —

## Goal

Set up the agent runtime: pick an SDK, define the agent interface, and
build the orchestrator that drives the pipeline.

## SDK Evaluation

Pick whichever option is simplest and has the best MCP ecosystem.
Criteria: MCP tool-calling support, community activity, ease of testing.

| Option | Notes |
|--------|-------|
| Claude Agent SDK | Strong MCP support, TypeScript/Python |
| Copilot Agent SDK | GitHub-integrated, TypeScript |
| LangChain (JS/Go/Python) | Large community, many connectors |
| Custom MCP-native | Thin wrapper, minimal dependencies |

The SDK choice also determines the agent language. If the best SDK is
TypeScript, agents are TypeScript. If Go or Python has better MCP
tooling, use that. **Generated k6 test scripts are always JS/TS.**

## Agent Interface

Every agent follows the same contract:

```text
Input:  { type, payload, context }
Output: { type, payload, status }
Error:  Returned explicitly, never thrown silently
```

Agents are stateless. The orchestrator owns all state.

## Orchestrator

- Maintains a **checklist** (state machine) tracking pipeline progress.
- Dispatches to agents in order: analyze → plan → generate → execute → report.
- Retries failed steps up to 3 times with corrected context.
- Produces a final report when all checklist items pass.

```text
agent-orchestrator run \
  --stories ./user-stories/ \
  --openapi https://api.example.com/openapi.json \
  --har ./recordings/session.har \
  --config ./auth-instructions.yaml \
  --output ./reports/
```

## Scope

- [ ] Evaluate SDKs, pick one, write a short ADR.
- [ ] Define the agent interface and message types.
- [ ] Implement the orchestrator with checklist state machine.
- [ ] Implement retry logic (simulated failure → re-dispatch).
- [ ] Unit tests for orchestrator and state machine.

## Definition of Done

- [ ] SDK chosen with documented rationale.
- [ ] Orchestrator dispatches to stub agents and tracks state.
- [ ] Retry logic passes unit tests.
- [ ] `lint` and `test` pass.