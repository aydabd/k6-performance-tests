# WP-12 — AI Agent-Driven Test Automation

> **Status**: Draft · **Phase**: 5 — AI-Driven Testing

## Problem

Every k6 test is written by hand. A developer must read a user story,
inspect the API, write a k6 script, run it, and interpret results.
This is slow and does not scale across many services.

## Goal

AI agents automate the k6 testing flow — from user story to final report.
Agents plug into the **existing** k6 infrastructure: `TestCaseBuilder`,
`HttpClientFactory`, `ScenarioRunner`, `SummaryHandler`, and Docker/k8s
execution. The system must stay simple and fully integrated with k6.

## Pipeline

```text
User Story + OpenAPI Spec + (optional) HAR recording
    ↓
[1] Analyze API → endpoint map
    ↓
[2] Plan tests → test case descriptors (markdown)
    ↓
[3] Generate k6 scripts → JS/TS using src/ libraries
    ↓
[4] Execute in containers → collect results
    ↓
[5] Analyze + report → pass/fail per user story
```

## Design Principles

- **Integrate, don't replace** — agents produce k6 scripts that use the
  existing `src/` libraries. No parallel framework.
- **Tech-stack follows community** — use whichever SDK/language has the
  best MCP support and simplest integration. Decided in WP-12a.
- **Auth as instructions** — users provide YAML describing their auth
  flow (JWT, OAuth2, API keys). Agents follow the instructions.
  Secrets stay in environment variables, never in files.
- **HAR reverse engineering** — k6 recordings and HAR files can be
  converted into test flows automatically.
- **Each agent ≤ 1 responsibility** — small, testable, replaceable.

## Sub-Tasks

Five focused tasks, each with its own plan file (≤ 100 lines).

<!-- markdownlint-disable MD013 -->

| Task | File | Focus | Depends On |
|------|------|-------|-----------|
| WP-12a | [wp-12a-agent-framework.md](wp-12a-agent-framework.md) | Agent framework, SDK choice, orchestration | — |
| WP-12b | [wp-12b-api-test-planner.md](wp-12b-api-test-planner.md) | API analysis + test case planning | WP-12a |
| WP-12c | [wp-12c-test-generator.md](wp-12c-test-generator.md) | k6 script generation + HAR conversion | WP-12b |
| WP-12d | [wp-12d-execution-analysis.md](wp-12d-execution-analysis.md) | Container execution + results analysis | WP-12c |
| WP-12e | [wp-12e-auth-and-integration.md](wp-12e-auth-and-integration.md) | Auth instructions + end-to-end wiring | WP-12a |

<!-- markdownlint-enable MD013 -->

## Definition of Done

- [ ] All sub-task plans reviewed and approved.
- [ ] Agents produce valid k6 scripts using `src/` libraries.
- [ ] End-to-end demo: user story in → k6 test executed → report out.
- [ ] CI updated to build and test agent packages.