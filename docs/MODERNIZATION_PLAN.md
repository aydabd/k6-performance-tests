# K6 Performance Test Framework — Modernization Plan

> **Purpose**: Comprehensive plan for modernizing the k6 performance test framework.
> Each work package (WP) is designed to be implemented, tested, and merged
> independently as a separate PR — no cross-WP conflicts.

---

<!-- markdownlint-disable MD024 MD060 -->

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [WP-1: OpenTelemetry Metrics Output](#wp-1-opentelemetry-metrics-output)
3. [WP-2: Enhanced Authentication & Lifecycle Hooks](#wp-2-enhanced-authentication--lifecycle-hooks)
4. [WP-3: Structured Test Case Descriptors](#wp-3-structured-test-case-descriptors)
5. [WP-4: Scenario-Level Setup/Teardown](#wp-4-scenario-level-setupteardown)
6. [WP-5: Grafana Dashboard Refresh](#wp-5-grafana-dashboard-refresh)
7. [WP-6: Centralized Reporting & Multi-Instance Aggregation](#wp-6-centralized-reporting--multi-instance-aggregation)
8. [WP-7: Business-Flow Isolated Containers](#wp-7-business-flow-isolated-containers)
9. [WP-8: Test Management Integration (Xray / TestRail)](#wp-8-test-management-integration-xray--testrail)
10. [WP-9: K6 Runtime & Extension Upgrades](#wp-9-k6-runtime--extension-upgrades)
11. [WP-10: Unit Test Infrastructure](#wp-10-unit-test-infrastructure)
12. [Dependency & Ordering Matrix](#dependency--ordering-matrix)

---

## 1. Current State Summary

| Area               | Status                                                         |
| ------------------ | -------------------------------------------------------------- |
| k6 version         | `grafana/xk6:latest` (unpinned)                                |
| Metrics output     | InfluxDB 2.x via `xk6-output-influxdb`                        |
| Auth               | Basic + Bearer token (no JWT login, no OAuth, no API-key)      |
| Setup / teardown   | Global only (`export function setup/teardown`)                 |
| Dashboards         | 2 Grafana dashboards (static, no test-run isolation)           |
| Test structure     | Free-form; no standard descriptor, no prerequisites            |
| Parallel execution | Via k6 scenarios; no container-level orchestration              |
| Reporting          | Local Grafana + InfluxDB; no centralized aggregation           |
| Test management    | None                                                           |
| Unit tests         | None (`npm test` is a no-op)                                   |

---

## WP-1: OpenTelemetry Metrics Output

### WP-1 Goal

Add native OpenTelemetry (OTLP) export so test metrics can flow to any
OTel-compatible backend (Tempo, Jaeger, Datadog, New Relic, etc.) alongside
or instead of InfluxDB.

### WP-1 Requirements

| ID     | Requirement                                                                      | Tests                                          | Docs                       |
| ------ | -------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------- |
| WP1-R1 | Build k6 binary with `xk6-output-opentelemetry` extension                        | Integration: Dockerfile builds successfully     | Update Dockerfile comments |
| WP1-R2 | Add `K6_OTEL_*` environment variables to compose and k8s manifests               | Integration: container starts with OTel env vars | Update README env-var table |
| WP1-R3 | Add an OTel Collector service to `compose.yaml`                                  | Integration: collector receives k6 metrics      | New section in README      |
| WP1-R4 | Provide a toggle to choose InfluxDB-only, OTel-only, or both                     | Integration: test run with each toggle value    | Document toggle usage      |
| WP1-R5 | Add Grafana Tempo datasource for trace visualization                             | Integration: traces visible in Grafana          | Dashboard docs             |

### WP-1 Files Changed

- `Dockerfile` — add `xk6-output-opentelemetry` build arg
- `compose.yaml` — add `otel-collector` service, env vars
- `k8s/otel-collector.yaml` — new manifest
- `k8s/k6-job-simple.yaml` — add OTel env vars
- `README.md` — document OTel configuration

### WP-1 Validation

- `./ci-deployment -d simple-k6-test-template` passes with OTel enabled
- OTel Collector logs show received metrics
- Grafana Tempo datasource shows traces

---

## WP-2: Enhanced Authentication & Lifecycle Hooks

### WP-2 Goal

Support JWT login flows, API-key headers, OAuth 2.0 client-credentials,
and cookie-based sessions so that tests can authenticate against real APIs
during `setup()` and share credentials across VUs.

### WP-2 Requirements

| ID     | Requirement                                                                           | Tests                                             | Docs                 |
| ------ | ------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------- |
| WP2-R1 | New `JwtAuthenticator` class that calls a login endpoint and returns a token           | Unit: token extraction from mock response          | JSDoc + CLIENT_API   |
| WP2-R2 | New `ApiKeyAuthenticator` class supporting custom header names (e.g., `X-API-Key`)    | Unit: header generation with custom key name       | JSDoc + CLIENT_API   |
| WP2-R3 | New `OAuth2ClientCredentials` class that performs client-credentials grant             | Unit: token request body construction              | JSDoc + CLIENT_API   |
| WP2-R4 | `Authenticator` facade exposes new auth methods alongside existing ones               | Unit: facade delegates correctly                   | JSDoc + CLIENT_API   |
| WP2-R5 | `setup()` returns auth data consumed by default function via `data` parameter         | Integration: full login-request-teardown flow      | Template test docs   |
| WP2-R6 | Auth credentials sourced from environment variables with clear naming                 | Unit: env-var fallback works                       | README env-var table |

### WP-2 Files Changed

- `src/clients/http-auth.js` — add `JwtAuthenticator`, `ApiKeyAuthenticator`, `OAuth2ClientCredentials`
- `src/clients/http-client.js` — use `data` parameter from `setup()`
- New template `jwt-api-test-template/` with example JWT flow
- `docs/CLIENT_API.md` — regenerated

### WP-2 Validation

- Unit tests for each authenticator class
- Integration test with a mock JWT server (e.g., a simple Express container)
- `./ci-deployment -d jwt-api-test-template` passes

---

## WP-3: Structured Test Case Descriptors

### WP-3 Goal

Provide a standard way to describe test cases with metadata — title,
description, prerequisites, steps, expected results, tags — so that every
test is self-documenting and machine-readable.

### WP-3 Requirements

| ID     | Requirement                                                                                                        | Tests                                 | Docs               |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------ |
| WP3-R1 | New `TestCase` class/builder with fields: `id`, `title`, `description`, `prerequisites`, `steps`, `expectedResults`, `tags` | Unit: builder creates valid descriptor | JSDoc + CLIENT_API |
| WP3-R2 | `TestCase.toK6Group()` wraps execution in a `group()` with the title                                               | Unit: group name matches title         | JSDoc              |
| WP3-R3 | `TestCase.toSummary()` returns a JSON object for `handleSummary()` integration                                     | Unit: JSON matches schema              | JSDoc              |
| WP3-R4 | Export descriptors via `handleSummary()` to a JSON report file                                                     | Integration: JSON file created         | README             |
| WP3-R5 | Update existing templates to use `TestCase` descriptors                                                            | Integration: templates still pass      | Template docs      |

### WP-3 Files Changed

- New `src/test-case.js`
- `simple-k6-test-template/simple-test.js` — refactor to use `TestCase`
- `simple-k6-websocket-test/websocket-test.js` — refactor to use `TestCase`

### WP-3 Validation

- Unit tests for `TestCase` builder
- Existing integration tests pass
- JSON summary report is generated

---

## WP-4: Scenario-Level Setup/Teardown

### WP-4 Goal

Use k6 scenario `exec` functions with dedicated setup/teardown per scenario
so that different business flows can have independent initialization and
cleanup, enabling parallel execution of unrelated flows.

### WP-4 Requirements

| ID     | Requirement                                                                         | Tests                                        | Docs             |
| ------ | ----------------------------------------------------------------------------------- | -------------------------------------------- | ---------------- |
| WP4-R1 | New `ScenarioRunner` utility that maps scenario names to setup/exec/teardown        | Unit: correct function mapping                | JSDoc            |
| WP4-R2 | Provide `scenario-lifecycle-config.json` template showing multi-scenario setup      | Unit: config validates against k6 schema      | Config docs      |
| WP4-R3 | Each scenario exec function receives its own auth data from global `setup()`        | Integration: scenarios run with isolated auth  | Template docs    |
| WP4-R4 | Document how to add new business-flow scenarios without modifying existing ones      | —                                             | CONTRIBUTING.md  |

### WP-4 Files Changed

- New `src/scenario-runner.js`
- New `k6-config-options/scenario-lifecycle-config.json`
- `CONTRIBUTING.md` — add scenario authoring guide

### WP-4 Validation

- Unit tests for `ScenarioRunner`
- Integration test with multiple scenarios running in parallel

---

## WP-5: Grafana Dashboard Refresh

### WP-5 Goal

Modernize dashboards with test-run isolation (filter by `testRunId` tag),
percentile histograms, error-rate panels, and business-flow grouping.

### WP-5 Requirements

| ID     | Requirement                                                                                     | Tests                              | Docs             |
| ------ | ----------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------- |
| WP5-R1 | Add `testRunId` tag to all k6 configs (via `__ENV.TEST_RUN_ID` or auto-generated)               | Integration: tag appears in InfluxDB | README           |
| WP5-R2 | Dashboard variable selector for `testRunId` so users can filter by run                          | Integration: Grafana variable works | Dashboard docs   |
| WP5-R3 | New panels: error rate over time, p50/p90/p95/p99 histograms, iteration rate                    | Integration: panels render          | Dashboard docs   |
| WP5-R4 | New dashboard: business-flow view grouped by scenario `testType` tag                            | Integration: dashboard loads        | Dashboard docs   |
| WP5-R5 | Dashboard JSON files are version-controlled and auto-provisioned                                | Integration: Grafana starts         | compose.yaml docs |

### WP-5 Files Changed

- `grafana/dashboards/k6-performance-dashboard.json` — add `testRunId` variable, new panels
- New `grafana/dashboards/k6-business-flow-dashboard.json`
- `k6-config-options/*.json` — add `testRunId` tag pattern
- `compose.yaml` — pass `TEST_RUN_ID` env var

### WP-5 Validation

- `./ci-deployment` runs and dashboards load in Grafana
- Filter by `testRunId` shows only that run's data

---

## WP-6: Centralized Reporting & Multi-Instance Aggregation

### WP-6 Goal

Support running multiple isolated test containers (one per business flow)
and aggregating their metrics into a single reporting instance, or exporting
metrics for import into a centralized system.

### WP-6 Requirements

| ID     | Requirement                                                                                          | Tests                                | Docs        |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------- |
| WP6-R1 | All test containers write to a shared InfluxDB instance with `testRunId` + `businessFlow` tags       | Integration: tags present in InfluxDB | README      |
| WP6-R2 | New `handleSummary()` implementation exports JSON + JUnit XML reports                                | Integration: files created after run  | README      |
| WP6-R3 | `compose.yaml` profile for centralized mode (shared infra, multiple test services)                   | Integration: profile starts correctly | README      |
| WP6-R4 | Script to merge multiple JSON summary reports into one                                               | Unit: merge produces valid output     | Script docs |
| WP6-R5 | JUnit XML output compatible with CI systems (GitHub Actions, Jenkins)                                | Integration: CI parses JUnit XML      | CI docs     |

### WP-6 Files Changed

- New `src/summary-handler.js` — `handleSummary()` implementation
- New `scripts/merge-reports.js` — report merging utility
- `compose.yaml` — add `centralized` profile
- `.github/workflows/ci.yml` — publish JUnit results

### WP-6 Validation

- Multiple test containers run and report to shared InfluxDB
- JSON and JUnit XML reports are generated
- Merged report contains data from all containers

---

## WP-7: Business-Flow Isolated Containers

### WP-7 Goal

Enable each business flow (e.g., login → browse → checkout) to run in its
own container with full isolation, targeting real services for acceptance
testing of caching, performance, and endpoint correctness.

### WP-7 Requirements

| ID     | Requirement                                                                              | Tests                                    | Docs              |
| ------ | ---------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| WP7-R1 | Template `business-flow-template/` with Dockerfile, config, and example test             | Integration: template builds and runs     | Template README   |
| WP7-R2 | Each flow container receives its own `BUSINESS_FLOW_NAME` env var for tagging            | Integration: tag appears in metrics       | README            |
| WP7-R3 | Docker Compose `profiles` to run flows independently or together                         | Integration: `--profile flow-checkout`    | README            |
| WP7-R4 | K8s Job manifest per business flow with configurable parallelism                         | Integration: k8s job runs                 | k8s docs          |
| WP7-R5 | Shared InfluxDB + Grafana infra starts once; flow containers connect to it               | Integration: metrics from all flows       | Architecture docs |

### WP-7 Files Changed

- New `business-flow-template/` directory
- `compose.yaml` — add profile-based flow services
- `k8s/k6-job-business-flow.yaml` — new manifest
- `k8s-deployment` — support `--flow` flag

### WP-7 Validation

- Build and run business-flow template
- Metrics from multiple flows appear in shared Grafana
- K8s deployment with `--flow` flag works

---

## WP-8: Test Management Integration (Xray / TestRail)

### WP-8 Goal

Export test results to external test management systems (Atlassian Xray,
TestRail, or other) so that performance test results are traceable alongside
functional test results.

### WP-8 Requirements

| ID     | Requirement                                                                           | Tests                                        | Docs        |
| ------ | ------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- |
| WP8-R1 | New `src/reporters/xray-reporter.js` formats `handleSummary()` output to Xray JSON    | Unit: JSON matches Xray import schema         | JSDoc       |
| WP8-R2 | New `src/reporters/junit-reporter.js` formats output to JUnit XML                     | Unit: XML validates against JUnit XSD         | JSDoc       |
| WP8-R3 | `TestCase` descriptor `id` field maps to Xray test key or TestRail case ID            | Unit: mapping is correct                      | JSDoc       |
| WP8-R4 | Post-run script uploads results to Xray REST API                                      | Integration: mock Xray server receives upload | Script docs |
| WP8-R5 | Environment variables for Xray/TestRail credentials and project keys                  | Unit: env-var fallback                        | README      |

### WP-8 Files Changed

- New `src/reporters/xray-reporter.js`
- New `src/reporters/junit-reporter.js`
- New `scripts/upload-xray.sh`
- `src/test-case.js` — add `externalId` field
- `.github/workflows/ci.yml` — optional Xray upload step

### WP-8 Validation

- Unit tests for reporter formatting
- Integration test with mock Xray endpoint
- JUnit XML validates

---

## WP-9: K6 Runtime & Extension Upgrades

### WP-9 Goal

Pin k6 and extension versions to specific releases, adopt latest k6
features, and modernize the build pipeline.

### WP-9 Requirements

| ID     | Requirement                                                                              | Tests                                           | Docs                  |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------- |
| WP9-R1 | Pin `XK6_VERSION` and `XK6_EXTENSION_VERSION` to specific release tags in Dockerfile     | Integration: build succeeds with pinned versions | Dockerfile comments   |
| WP9-R2 | Add `K6_VERSION` ARG to control the k6 binary version                                    | Integration: `k6 version` outputs expected       | README                |
| WP9-R3 | Adopt k6 `experimental/browser` module for browser-based performance tests               | Integration: browser test template works         | New template docs     |
| WP9-R4 | Use k6 `experimental/fs` module for file-based test data                                 | Unit: file reading works in k6 context           | JSDoc                 |
| WP9-R5 | Update `Httpx` import to use latest jslib version                                        | Integration: HTTP tests pass                     | —                     |
| WP9-R6 | Add Dependabot or Renovate config for automated dependency updates                       | —                                                | `.github/dependabot.yml` |

### WP-9 Files Changed

- `Dockerfile` — pin versions, add browser dependencies
- New `browser-test-template/` with Chromium-based test
- `src/clients/http-client.js` — update jslib import version
- `.github/dependabot.yml` — new file

### WP-9 Validation

- `./ci-deployment` passes with pinned versions
- Browser test template runs
- Dependabot config is valid YAML

---

## WP-10: Unit Test Infrastructure

### WP-10 Goal

Establish a unit test framework for shared client code so that changes to
`src/` can be validated without running full Docker integration tests.

### WP-10 Requirements

| ID      | Requirement                                                                                      | Tests                                | Docs             |
| ------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ | ---------------- |
| WP10-R1 | Add a test runner compatible with k6 ES module syntax (e.g., Vitest or Jest with ESM)            | Unit: `npm test` runs and passes      | package.json     |
| WP10-R2 | Mock k6 built-in modules (`k6`, `k6/http`, `k6/encoding`, `k6/ws`) for unit testing             | Unit: mocks work for all modules      | Test README      |
| WP10-R3 | Unit tests for `BaseUrl` class                                                                   | Unit: URL construction edge cases     | —                |
| WP10-R4 | Unit tests for `PathFormatter` class                                                             | Unit: all format conversions          | —                |
| WP10-R5 | Unit tests for `Authenticator`, `BasicAuthenticator`, `TokenBearerAuthenticator`                  | Unit: auth header generation          | —                |
| WP10-R6 | Unit tests for `HttpHeaders` class                                                               | Unit: header merging and injection    | —                |
| WP10-R7 | Unit tests for `HttpErrorHandler` class                                                          | Unit: error logging behavior          | —                |
| WP10-R8 | Unit tests for `Logger` class                                                                    | Unit: log level filtering             | —                |
| WP10-R9 | Add `npm test` script to `package.json`                                                          | —                                     | package.json     |
| WP10-R10 | CI workflow runs unit tests before integration tests                                            | —                                     | ci.yml           |

### WP-10 Files Changed

- `package.json` — add test runner dependency, `test` script
- New `tests/unit/` directory with test files
- New `tests/unit/__mocks__/` directory for k6 module mocks
- `.github/workflows/ci.yml` — add unit test step

### WP-10 Validation

- `npm test` passes
- CI runs unit tests before integration tests

---

## Dependency & Ordering Matrix

Work packages are designed to be independent. The table below shows optional
dependencies (soft edges) — a WP can start before its soft dependency is
merged, but may need a rebase after.

```text
WP-10 (Unit Tests)          ← foundation; start first
  │
  ├─► WP-2  (Auth)          ← uses unit test infra
  ├─► WP-3  (Test Case)     ← uses unit test infra
  ├─► WP-4  (Scenario)      ← uses unit test infra
  │
  ├─► WP-1  (OTel)          ← independent infra change
  ├─► WP-5  (Dashboards)    ← independent infra change
  ├─► WP-9  (Upgrades)      ← independent infra change
  │
  ├─► WP-6  (Reporting)     ← soft dep on WP-3 (TestCase)
  ├─► WP-7  (Biz Flows)     ← soft dep on WP-4 (Scenario)
  └─► WP-8  (Test Mgmt)     ← soft dep on WP-3 + WP-6
```

### Recommended Implementation Order

| Phase       | Work Packages          | Rationale                              |
| ----------- | ---------------------- | -------------------------------------- |
| **Phase 1** | WP-10, WP-9           | Foundation: unit tests + version pinning |
| **Phase 2** | WP-1, WP-2, WP-3, WP-5 | Core features in parallel              |
| **Phase 3** | WP-4, WP-6, WP-7      | Build on Phase 2 foundations           |
| **Phase 4** | WP-8                   | External integration last              |

### Parallel PR Strategy

- Each WP lives in its own feature branch: `feature/wp-{N}-{short-name}`
- WPs within the same phase can be developed and reviewed in parallel
- Merge conflicts are avoided because each WP touches different files
- If two WPs must touch the same file, the second WP rebases after the first merges

---

## PR Checklist Template

Each WP PR should include:

- [ ] Implementation code
- [ ] Unit tests (where applicable)
- [ ] Integration test validation (`./ci-deployment` passes)
- [ ] Documentation updates
- [ ] JSDoc regenerated (`npm run jsdoc2mdClient`)
- [ ] Linting passes (`pre-commit run --all-files`)
- [ ] No breaking changes to existing tests
