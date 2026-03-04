# WP-12a — Agent Framework & SDK Foundation

> **Status**: Draft · **Parent**: [WP-12](wp-12-ai-agent-test-automation.md)
> · **Depends on**: —

## Goal

Establish the agent runtime, SDK choice, and inter-agent communication
foundation that all other agents build on.

## Key Decisions to Make

1. **Go vs Node.js vs hybrid** — k6 is built on Go, so Go agents share the
   same ecosystem and give better performance. Generated test scripts stay
   in JavaScript/TypeScript for k6 compatibility.
2. **Agent SDK** — evaluate options and pick the simplest one:
   - Claude Agent SDK (Anthropic)
   - GitHub Copilot Agent SDK
   - LangChain Go (`langchaingo`)
   - Custom MCP-native agents (thin wrapper around MCP tool protocol)
3. **Inter-agent protocol** — start with direct Go function calls inside a
   single binary. Design the interface so it can later be swapped to MCP
   tool calls for distributed deployment.

## Scope

- [ ] Create `agents/` directory with `go.mod` and project layout.
- [ ] Define the `Agent` interface in Go:

```go
type Agent interface {
    Name() string
    Execute(ctx context.Context, input Message) (Message, error)
}
```

- [ ] Implement a simple in-process message bus (`internal/bus/`).
- [ ] Create `internal/config/` for loading YAML/JSON configuration.
- [ ] Add a `Makefile` or `taskfile.yml` for build, test, lint.
- [ ] Write unit tests for the bus and config loader.
- [ ] Document the chosen SDK and rationale in a short ADR.

## Agent Interface Contract

Every agent follows the same contract:

```text
Input:  Message { type, payload, metadata }
Output: Message { type, payload, metadata }
Error:  Returned explicitly, never panicked
```

Agents are stateless. State lives in the Orchestrator's checklist.

## Definition of Done

- [ ] `agents/go.mod` compiles with `go build ./...`
- [ ] `Agent` interface defined and documented.
- [ ] In-process bus passes messages between two stub agents in a test.
- [ ] Config loader reads a sample YAML file.
- [ ] `go test ./...` passes.
- [ ] `golangci-lint run` passes.
- [ ] ADR written: which SDK was chosen and why.
