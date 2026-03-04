# WP-12f — Results Analyzer Agent

> **Status**: Draft · **Parent**: [WP-12](wp-12-ai-agent-test-automation.md)
> · **Depends on**: WP-12e

## Goal

Build an agent that parses k6 execution output and evaluates whether
performance thresholds defined in test case descriptors were met.

## Scope

- [ ] Parse k6 JSON summary output (`--summary-export`).
- [ ] Parse k6 end-of-test stdout summary (metrics table).
- [ ] Query InfluxDB via MCP for detailed time-series data when available.
- [ ] Evaluate thresholds (p95, p99, error rate, request rate) against
      the criteria defined in each test case descriptor.
- [ ] Produce a structured results summary (JSON + markdown).

## MCP Server (InfluxDB)

```text
Tool: influxdb.query  → executes a Flux query, returns time-series data
Tool: influxdb.buckets → lists available buckets
```

Configured via:

```text
INFLUXDB_MCP_SERVER_URL=http://localhost:3101
```

## Output Format

```json
{
  "runId": "abc-123",
  "timestamp": "2026-03-04T00:00:00Z",
  "testCases": [
    {
      "id": "TC-001",
      "userStory": "US-42",
      "passed": true,
      "metrics": {
        "p95": 320,
        "p99": 450,
        "errorRate": 0.001,
        "requestRate": 150.5
      },
      "thresholds": {
        "p95": { "limit": 500, "passed": true },
        "errorRate": { "limit": 0.01, "passed": true }
      }
    }
  ],
  "summary": "1/1 test cases passed"
}
```

## Definition of Done

- [ ] Agent parses a sample k6 JSON summary and produces a results summary.
- [ ] Threshold evaluation correctly flags pass/fail.
- [ ] MCP InfluxDB query works when InfluxDB is available.
- [ ] Graceful fallback when InfluxDB is not available (file-based only).
- [ ] Unit tests cover parsing and threshold logic.
- [ ] `go test ./results-analyzer/...` passes.
