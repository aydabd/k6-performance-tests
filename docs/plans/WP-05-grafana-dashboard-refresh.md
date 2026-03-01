# WP-05: Grafana Dashboard Refresh

> **Phase**: 2 — independent infrastructure change.

## Goal

Modernize dashboards with test-run isolation (filter by `testRunId` tag),
percentile histograms, error-rate panels, and business-flow grouping.

## Requirements

| ID | Requirement |
| --- | --- |
| WP5-R1 | Add `testRunId` tag to all k6 configs (via `__ENV.TEST_RUN_ID` or auto-generated) |
| WP5-R2 | Dashboard variable selector for `testRunId` so users can filter by run |
| WP5-R3 | New panels: error rate over time, p50/p90/p95/p99 histograms, iteration rate |
| WP5-R4 | New dashboard: business-flow view grouped by scenario `testType` tag |
| WP5-R5 | Dashboard JSON files are version-controlled and auto-provisioned |

## Files Changed

- `grafana/dashboards/k6-performance-dashboard.json` — add `testRunId` variable, new panels
- New `grafana/dashboards/k6-business-flow-dashboard.json`
- `k6-config-options/*.json` — add `testRunId` tag pattern
- `compose.yaml` — pass `TEST_RUN_ID` env var

## Definition of Done

- [ ] `testRunId` tag appears in InfluxDB after test run
- [ ] Grafana dashboard variable filters by `testRunId`
- [ ] Error rate, percentile histogram, and iteration rate panels render
- [ ] Business-flow dashboard loads and groups by `testType`
- [ ] Dashboard JSON files auto-provisioned on Grafana start
- [ ] Integration test: `./ci-deployment` passes
- [ ] Markdownlint passes
- [ ] PR merged → delete this plan file
