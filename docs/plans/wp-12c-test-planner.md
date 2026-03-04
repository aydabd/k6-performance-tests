# WP-12c — Test Planner Agent

> **Status**: Draft · **Parent**: [WP-12](wp-12-ai-agent-test-automation.md)
> · **Depends on**: WP-12a

## Goal

Build an agent that converts user stories (markdown) and an endpoint map
into **test case descriptors** — structured markdown documents that link
each requirement to specific API endpoints, steps, and expected results.

## Scope

- [ ] Accept user stories in markdown format (one file or directory).
- [ ] Accept an `EndpointMap` from the API Analyzer (WP-12b output).
- [ ] Map each user story to one or more test case descriptors.
- [ ] Use an LLM (via the chosen SDK) to interpret natural-language
      stories and match them to API endpoints.
- [ ] Output test case descriptors in markdown with requirements
      traceability.

## Test Case Descriptor Format

```markdown
## TC-001 — List all breeds

- **User Story**: US-42 "As a user I can list all dog breeds"
- **Endpoint**: `GET /api/v2/breeds`
- **Auth**: Bearer token (see auth instructions)
- **Preconditions**: None
- **Steps**:
  1. Send GET request to `/api/v2/breeds`
  2. Assert HTTP 200
  3. Assert response body contains `data` array
- **Performance Criteria**: p95 < 500 ms, error rate < 1%
- **Database Check**: `SELECT count(*) FROM breeds` matches array length
- **Tags**: `smoke`, `regression`, `US-42`
```

## User Story Input Format

```markdown
## US-42 — List all breeds

As a **user** I want to **list all dog breeds**
so that I can **browse available breeds**.

### Acceptance Criteria

- API returns HTTP 200
- Response contains a JSON array of breeds
- Response time under 500 ms for 95th percentile
```

## Definition of Done

- [ ] Agent reads a sample user story and endpoint map.
- [ ] Agent produces a test case descriptor with correct traceability.
- [ ] Works without LLM (template-based fallback) for deterministic tests.
- [ ] Unit tests cover mapping logic.
- [ ] `go test ./test-planner/...` passes.
