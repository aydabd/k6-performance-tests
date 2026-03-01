---
applyTo: "**"
---

# Project — AI Agent Instructions

> **Single source of truth** for all AI coding agents (GitHub Copilot, Claude Code,
> OpenAI Codex, Cursor, and others).
> Edit **only this file** to update instructions across every agent.

## Project Overview

This repository contains **k6 performance tests** for non-functional testing
(load, stress, spike, soak, etc.), packaged and run via Docker and Kubernetes.

- **Language**: JavaScript (ES modules) targeting the k6 runtime.
- **Tooling**: Docker, Docker Compose, Kubernetes (k3d/k3s), Grafana, InfluxDB.
- **Linting**: ESLint, markdownlint, codespell, pre-commit hooks.
- **CI**: GitHub Actions (`ci.yml`) — lint, integration tests (Docker & k8s).

## Golden Rules

1. **Simplicity** — simplest working solution wins.
2. **SOLID** — single responsibility, dependency injection, interface-based design.
3. **Testability** — every module must be independently testable.
4. **Long-term** — code must be maintainable for years.
5. **Type safety** — use JSDoc type annotations for k6 JavaScript code.

## Code Style

- Follow k6 JavaScript idioms and ES module syntax (`import`/`export`).
- Keep functions small and focused (max 50 lines).
- Use meaningful variable names; avoid abbreviations.
- Add comments only when code is not self-explanatory (explain _why_, not _what_).
- Handle errors explicitly — never ignore them.
- Write tests for new functionality.
- **Formatting**: 4 spaces for code, 2 spaces for YAML/JSON.
- No trailing whitespace.

## Environment Setup

- Install Node.js dependencies: `npm install`
- Install Python pre-commit: `pip install pre-commit`
- Run linting: `pre-commit run --all-files -c .githooks.d/.pre-commit-config.yaml`
- Run integration tests: `./ci-deployment -d simple-k6-test-template`
- Override API server: `./ci-deployment -d <test-dir> -s <server-address>`

## Testing

- Integration tests run via `./ci-deployment` (Docker) or `./k8s-deployment` (k8s).
- k6 test scripts live in dedicated test directories (e.g., `simple-k6-test-template/`).
- Shared client code lives in `src/clients/`.
- k6 config options live in `k6-config-options/`.
- Test error cases, not just happy paths.
- Aim for at least ~80% test coverage for shared utility code when coverage tooling is available.

## Documentation

Update docs only when:

- Public interface changes.
- Setup process changes.
- New configuration options are added.
- New k6 test scenarios are introduced.

Do **not** update docs for internal refactoring, bug fixes, or performance improvements.

## Skills

Specialised agent skills live in `.github/skills/`.
Each skill directory contains a `SKILL.md` (≤ 100 lines) covering one focused topic.

| Skill directory        | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `testing-strategy`     | Testing philosophy, value-driven approach, corner cases |
| `testing-patterns`     | Table-driven tests, mocking, fixtures, assertions       |
| `testing-integration`  | Integration & E2E testing, test pyramid, traceability   |
| `development-workflow` | Requirements → implementation → testing → review flow   |

Add project-specific skills as the codebase grows.

## What to Avoid

- Features added "just in case"
- Complex abstractions or inheritance hierarchies
- Reflection unless absolutely necessary
- Magic numbers (use named constants)
- Global state
- New dependencies without strong justification
- Premature optimization
- Hardcoded secrets or paths
- Silently ignoring errors
- Placeholder or TODO code in production
