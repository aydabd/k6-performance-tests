# Modernization Plans

> Work packages for modernizing the k6 performance test framework.
> Each plan is a self-contained document that can be implemented as a single PR.

## Lifecycle

1. Pick a plan from the list below.
2. Create a feature branch: `feature/wp-{N}-{short-name}`.
3. Implement the work, checking off each **Definition of Done** item.
4. Open a PR referencing the plan file.
5. Once the PR is merged, **delete the plan file** from this directory and
   update the table below by moving the entry to the *Completed* section.

## Active Plans

<!-- markdownlint-disable MD013 -->

| Plan | Title | Phase |
| ---- | ----- | ----- |
| [WP-12](wp-12-ai-agent-test-automation.md) | AI Agent-Driven Test Automation (Master Plan) | 5 |
| [WP-12a](wp-12a-agent-framework.md) | Agent Framework & SDK Foundation | 5 |
| [WP-12b](wp-12b-api-analyzer.md) | API Analyzer Agent | 5 |
| [WP-12c](wp-12c-test-planner.md) | Test Planner Agent | 5 |
| [WP-12d](wp-12d-test-implementer.md) | Test Implementer Agent (+ HAR recording) | 5 |
| [WP-12e](wp-12e-test-runner.md) | Test Runner Agent | 5 |
| [WP-12f](wp-12f-results-analyzer.md) | Results Analyzer Agent | 5 |
| [WP-12g](wp-12g-database-verifier.md) | Database Verifier Agent | 5 |
| [WP-12h](wp-12h-observability-reviewer.md) | Observability Reviewer Agent | 5 |
| [WP-12i](wp-12i-orchestrator.md) | Orchestrator Agent | 5 |
| [WP-12j](wp-12j-auth-instructions.md) | Auth Instructions Framework | 5 |
| [WP-12k](wp-12k-integration-deployment.md) | End-to-End Integration & Deployment | 5 |

<!-- markdownlint-enable MD013 -->

## Recommended Phase Order

| Phase | Plans | Rationale |
| ----- | ----- | --------- |
| 1 | WP-10, WP-09, WP-11 | Foundation: tests, versions, API migration |
| 2 | WP-01, WP-02, WP-03, WP-05 | Core features in parallel |
| 3 | WP-04, WP-06, WP-07 | Build on Phase 2 |
| 4 | WP-08 | External integration last |
| 5 | WP-12 | AI-driven agent-based test automation |

## Completed Plans

<!-- markdownlint-disable MD013 -->

| Plan | Title | Phase | PR |
| ---- | ----- | ----- | -- |
| WP-10 | Unit Test Infrastructure | 1 | v2.4.0 |
| WP-09 | K6 Runtime & Extension Upgrades | 1 | v2.4.0 |
| WP-11 | K6 API Migration (Experimental → Stable) | 1 | v2.4.0 |
| WP-01 | OpenTelemetry Metrics Output | 2 | PR #84 |
| WP-02 | Enhanced Authentication & Lifecycle Hooks | 2 | PR #84 |
| WP-03 | Structured Test Case Descriptors | 2 | PR #84 |
| WP-05 | Grafana Dashboard Refresh | 2 | PR #84 |
| WP-04 | Scenario-Level Setup/Teardown | 3 | PR #84 |
| WP-06 | Centralized Reporting & Aggregation | 3 | PR #84 |
| WP-07 | Business-Flow Isolated Containers | 3 | PR #84 |
| WP-08 | Test Management Integration (Xray / TestRail) | 4 | PR #84 |

<!-- markdownlint-enable MD013 -->
