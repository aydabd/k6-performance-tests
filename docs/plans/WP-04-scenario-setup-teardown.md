# WP-04: Scenario-Level Setup/Teardown

> **Phase**: 3 — soft dependency on WP-10 (unit test infrastructure).

## Goal

Use k6 scenario `exec` functions with dedicated setup/teardown per scenario
so that different business flows can have independent initialization and
cleanup, enabling parallel execution of unrelated flows.

## Requirements

| ID | Requirement |
| --- | --- |
| WP4-R1 | New `ScenarioRunner` utility that maps scenario names to setup/exec/teardown functions |
| WP4-R2 | Provide `scenario-lifecycle-config.json` template showing multi-scenario setup |
| WP4-R3 | Each scenario exec function receives its own auth data from global `setup()` |
| WP4-R4 | Document how to add new business-flow scenarios without modifying existing ones |

## Files Changed

- New `src/scenario-runner.js`
- New `k6-config-options/scenario-lifecycle-config.json`
- `CONTRIBUTING.md` — add scenario authoring guide

## Definition of Done

- [ ] `ScenarioRunner` maps names to functions correctly (unit test)
- [ ] Config template validates against k6 schema (unit test)
- [ ] Scenarios run with isolated auth data (integration test)
- [ ] Multi-scenario parallel execution works
- [ ] Scenario authoring guide added to CONTRIBUTING.md
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
