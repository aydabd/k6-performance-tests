# WP-07: Business-Flow Isolated Containers

> **Phase**: 3 — soft dependency on WP-04 (Scenario Setup/Teardown).

## Goal

Enable each business flow (e.g., login → browse → checkout) to run in its
own container with full isolation, targeting real services for acceptance
testing of caching, performance, and endpoint correctness.

## Requirements

| ID | Requirement |
| --- | --- |
| WP7-R1 | Template `business-flow-template/` with Dockerfile, config, and example test |
| WP7-R2 | Each flow container receives its own `BUSINESS_FLOW_NAME` env var for tagging |
| WP7-R3 | Docker Compose `profiles` to run flows independently or together |
| WP7-R4 | K8s Job manifest per business flow with configurable parallelism |
| WP7-R5 | Shared InfluxDB + Grafana infra starts once; flow containers connect to it |

## Files Changed

- New `business-flow-template/` directory
- `compose.yaml` — add profile-based flow services
- `k8s/k6-job-business-flow.yaml` — new manifest
- `k8s-deployment` — support `--flow` flag

## Definition of Done

- [ ] Business-flow template builds and runs successfully
- [ ] `BUSINESS_FLOW_NAME` tag appears in metrics
- [ ] `docker compose --profile flow-checkout` works
- [ ] k8s job manifest runs per business flow
- [ ] Shared InfluxDB + Grafana infra starts once
- [ ] Metrics from multiple flows visible in shared Grafana
- [ ] K8s deployment with `--flow` flag works
- [ ] Integration tests pass
- [ ] Markdownlint passes
- [ ] PR merged → delete this plan file
