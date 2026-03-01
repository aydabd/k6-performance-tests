# WP-06: Centralized Reporting & Multi-Instance Aggregation

> **Phase**: 3 — soft dependency on WP-03 (TestCase descriptors).

## Goal

Support running multiple isolated test containers (one per business flow)
and aggregating their metrics into a single reporting instance, or exporting
metrics for import into a centralized system.

> **Note**: k6 v1.5.0 introduced a new **machine-readable summary format**
> via `--new-machine-readable-summary`. This will become the default in k6
> v2 and should be used as the basis for JSON report export.

## Requirements

| ID | Requirement |
| --- | --- |
| WP6-R1 | All test containers write to shared InfluxDB with `testRunId` + `businessFlow` tags |
| WP6-R2 | New `handleSummary()` exports JSON + JUnit XML reports |
| WP6-R3 | `compose.yaml` profile for centralized mode (shared infra, multiple test services) |
| WP6-R4 | Script to merge multiple JSON summary reports into one |
| WP6-R5 | JUnit XML output compatible with CI systems (GitHub Actions, Jenkins) |
| WP6-R6 | Use k6 `--new-machine-readable-summary` format for structured output |

## Files Changed

- New `src/summary-handler.js` — `handleSummary()` implementation
- New `scripts/merge-reports.js` — report merging utility
- `compose.yaml` — add `centralized` profile
- `.github/workflows/ci.yml` — publish JUnit results

## Definition of Done

- [ ] Tags `testRunId` + `businessFlow` present in InfluxDB
- [ ] `handleSummary()` generates JSON + JUnit XML files
- [ ] JSON export uses machine-readable summary format
- [ ] `docker compose --profile centralized up` starts correctly
- [ ] Merge script produces valid combined report (unit test)
- [ ] JUnit XML parsed successfully by CI
- [ ] Integration tests pass
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
