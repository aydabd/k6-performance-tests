# WP-12b — API Analysis & Test Planning

> **Parent**: [WP-12](wp-12-ai-agent-test-automation.md) · **Depends on**: WP-12a

## Goal

Build two agents: one that reads an OpenAPI spec and produces a structured
endpoint map, and one that maps user stories to test case descriptors.

## API Analyzer

- Parse OpenAPI v3 and Swagger v2 (JSON + YAML).
- Extract: endpoints, methods, parameters, schemas, auth requirements.
- Output a structured endpoint map (JSON).
- Connect via **MCP** to fetch remote specs, or read a local file.

```json
{
  "baseUrl": "https://api.example.com",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v2/breeds",
      "summary": "List all breeds",
      "auth": "bearer",
      "parameters": [],
      "responseSchema": "..."
    }
  ]
}
```

## Test Planner

- Accept user stories (markdown) + endpoint map.
- Map each story to one or more **test case descriptors**.
- Use LLM (via chosen SDK) for interpretation, with a template-based
  fallback for deterministic/offline operation.

### Test Case Descriptor Format

```markdown
## TC-001 — List all breeds

- **User Story**: US-42
- **Endpoint**: `GET /api/v2/breeds`
- **Auth**: bearer (see auth instructions)
- **Steps**: GET /api/v2/breeds → assert 200 → assert data array
- **Performance**: p95 < 500 ms, error rate < 1%
- **Tags**: smoke, regression, US-42
```

## Scope

- [ ] API analyzer parses a sample OpenAPI v3 spec.
- [ ] API analyzer parses a sample Swagger v2 spec.
- [ ] Test planner maps a user story + endpoint map to a descriptor.
- [ ] Template-based fallback works without LLM.
- [ ] Unit tests for parsing and mapping logic.

## Definition of Done

- [ ] Both agents produce correct output for sample inputs.
- [ ] Malformed spec handling tested (error cases).
- [ ] `lint` and `test` pass.
