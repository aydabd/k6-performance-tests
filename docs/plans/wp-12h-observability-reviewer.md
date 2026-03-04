# WP-12h — Observability Reviewer Agent

> **Status**: Draft · **Parent**: [WP-12](wp-12-ai-agent-test-automation.md)
> · **Depends on**: WP-12a

## Goal

Build an agent that pulls OpenTelemetry metrics and Elasticsearch logs
during and after a k6 run to flag anomalies (error spikes, latency
regressions, unexpected log patterns).

## Scope

### OpenTelemetry Metrics

- [ ] Connect to **OTel Collector** or **Grafana Tempo** via MCP to
      retrieve traces and metrics for the test time window.
- [ ] Check for error-rate spikes in downstream services.
- [ ] Check for latency regressions compared to baseline.

### Elasticsearch Logs

- [ ] Connect to **Elasticsearch** via MCP to query application logs.
- [ ] Search for error-level log entries during the test window.
- [ ] Flag unexpected exceptions or stack traces.
- [ ] Correlate log entries with specific k6 test groups/scenarios.

## MCP Servers

```text
# OpenTelemetry
Tool: otel.query_traces   → returns traces for a time window
Tool: otel.query_metrics   → returns metric summaries

# Elasticsearch
Tool: elasticsearch.search → executes a log search query
Tool: elasticsearch.count  → counts matching log entries
```

Configured via:

```text
OTEL_MCP_SERVER_URL=http://localhost:3103
ELASTICSEARCH_MCP_SERVER_URL=http://localhost:3104
```

## Output Format

```json
{
  "anomalies": [
    {
      "type": "error_spike",
      "source": "elasticsearch",
      "message": "23 ERROR entries during test window",
      "severity": "high"
    },
    {
      "type": "latency_regression",
      "source": "otel",
      "message": "p99 latency 2.3x higher than baseline",
      "severity": "medium"
    }
  ],
  "passed": false
}
```

## Definition of Done

- [ ] Agent queries OTel MCP and returns trace/metric summaries.
- [ ] Agent queries Elasticsearch MCP and returns log analysis.
- [ ] Anomaly detection flags error spikes and latency regressions.
- [ ] Graceful skip when OTel or Elasticsearch is not available.
- [ ] Unit tests cover anomaly detection logic.
- [ ] `go test ./observability-reviewer/...` passes.
