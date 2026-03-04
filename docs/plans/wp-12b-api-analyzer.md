# WP-12b — API Analyzer Agent

> **Status**: Draft · **Parent**: [WP-12](wp-12-ai-agent-test-automation.md)
> · **Depends on**: WP-12a

## Goal

Build an agent that reads an OpenAPI (Swagger) specification and produces a
structured endpoint map used by downstream agents.

## Scope

- [ ] Parse OpenAPI v3 and Swagger v2 specs (JSON and YAML).
- [ ] Extract: endpoints, HTTP methods, request/response schemas,
      required headers, path/query parameters, auth requirements.
- [ ] Output a structured `EndpointMap` (Go struct, serializable to JSON).
- [ ] Connect to an **OpenAPI MCP server** for fetching remote specs,
      or accept a local file path.
- [ ] Evaluate using **RAG** (embed the spec into a vector store) so the
      LLM can answer questions about specific endpoints contextually.

## MCP Server

```text
Tool: openapi.fetch_spec    → returns raw spec JSON/YAML
Tool: openapi.list_endpoints → returns endpoint summary
Tool: openapi.get_schema     → returns schema for a specific endpoint
```

The MCP server is configured via environment variable:

```text
OPENAPI_MCP_SERVER_URL=http://localhost:3100
```

## Output Format

```json
{
  "baseUrl": "https://api.example.com",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v2/breeds",
      "summary": "List all breeds",
      "parameters": [],
      "requestBody": null,
      "responses": { "200": { "schema": "..." } },
      "auth": "bearer"
    }
  ]
}
```

## Definition of Done

- [ ] Agent parses a sample OpenAPI v3 spec and produces an `EndpointMap`.
- [ ] Agent parses a sample Swagger v2 spec.
- [ ] MCP server connection works (or graceful fallback to local file).
- [ ] Unit tests cover happy path and malformed spec handling.
- [ ] `go test ./api-analyzer/...` passes.
