# WP-12d — Execution & Results Analysis

> **Parent**: [WP-12](wp-12-ai-agent-test-automation.md) · **Depends on**: WP-12c

## Goal

Build agents that execute generated k6 scripts in containers and analyze
results — covering metrics, database verification, and observability.

## Test Runner

- Take generated k6 scripts + k6 config JSON.
- Mount scripts into `k6-template-influxdb-base` container (volume mount
  for dev, multi-stage build for CI — selectable via flag).
- Execute with proper env vars, collect exit code and artifacts.
- Pass auth env vars from auth instructions.

```text
k6 scripts + config → Docker container → exit code + logs + metrics
```

## Results Analyzer

- Parse k6 JSON summary (`--summary-export`) and stdout metrics.
- Evaluate thresholds (p95, p99, error rate) against test descriptors.
- Query InfluxDB via MCP when available (graceful fallback to file).
- Produce a structured pass/fail summary per test case.

```json
{
  "testCases": [
    {
      "id": "TC-001",
      "userStory": "US-42",
      "passed": true,
      "p95": 320,
      "errorRate": 0.001
    }
  ]
}
```

## Database Verifier (Optional)

- Query the service's database via MCP (read-only) to verify side-effects.
- Run before/after comparison for create/update/delete operations.
- Skip gracefully when no database checks are defined.

## Observability Reviewer (Optional)

- Pull OTel metrics and Elasticsearch logs during the test window.
- Flag error spikes and latency regressions.
- Skip gracefully when observability stack is not available.

## Scope

- [ ] Test runner builds and runs a container with generated scripts.
- [ ] Exit code and logs captured correctly.
- [ ] Results analyzer parses k6 JSON and evaluates thresholds.
- [ ] Pass/fail summary links back to user stories.
- [ ] Database and observability checks work when configured.
- [ ] Unit tests for container command construction and parsing.

## Definition of Done

- [ ] End-to-end: generated script → container run → results summary.
- [ ] Threshold evaluation tested (pass and fail cases).
- [ ] `lint` and `test` pass.
