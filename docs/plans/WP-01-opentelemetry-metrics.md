# WP-01: OpenTelemetry Metrics Output

> **Phase**: 2 — implement after foundation plans (WP-09, WP-10, WP-11).

## Goal

Add native OpenTelemetry (OTLP) export so test metrics can flow to any
OTel-compatible backend (Tempo, Jaeger, Datadog, New Relic, etc.) alongside
or instead of InfluxDB.

> **Note**: As of k6 v1.4.0 the OpenTelemetry output is **stable**
> (`--out opentelemetry`). The experimental name is deprecated.
> Use the env var `K6_OTEL_EXPORTER_PROTOCOL` (not `K6_OTEL_EXPORTER_TYPE`).

## Requirements

| ID | Requirement |
| --- | --- |
| WP1-R1 | Build k6 binary with OpenTelemetry output support |
| WP1-R2 | Add `K6_OTEL_*` environment variables to compose and k8s manifests |
| WP1-R3 | Add an OTel Collector service to `compose.yaml` |
| WP1-R4 | Provide a toggle to choose InfluxDB-only, OTel-only, or both |
| WP1-R5 | Add Grafana Tempo datasource for trace visualization |

## Files Changed

- `Dockerfile` — add OTel output build arg
- `compose.yaml` — add `otel-collector` service, env vars
- `k8s/otel-collector.yaml` — new manifest
- `k8s/k6-job-simple.yaml` — add OTel env vars
- `README.md` — document OTel configuration

## Definition of Done

- [ ] `compose.yaml` includes OTel Collector service
- [ ] k6 runs with `--out opentelemetry` (stable name)
- [ ] Uses `K6_OTEL_EXPORTER_PROTOCOL` (not deprecated `K6_OTEL_EXPORTER_TYPE`)
- [ ] OTel Collector receives k6 metrics
- [ ] Grafana Tempo datasource added and traces visible
- [ ] Toggle works: InfluxDB-only, OTel-only, both
- [ ] Integration test: `./ci-deployment -d simple-k6-test-template` passes
- [ ] k8s manifest updated
- [ ] Documentation updated in README
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
