# WP-03: Structured Test Case Descriptors

> **Phase**: 2 — soft dependency on WP-10 (unit test infrastructure).

## Goal

Provide a standard way to describe test cases with metadata — title,
description, prerequisites, steps, expected results, tags — so that every
test is self-documenting and machine-readable.

## Requirements

| ID | Requirement |
| --- | --- |
| WP3-R1 | New `TestCase` class/builder with fields: `id`, `title`, `description`, `prerequisites`, `steps`, `expectedResults`, `tags` |
| WP3-R2 | `TestCase.toK6Group()` wraps execution in a `group()` with the title |
| WP3-R3 | `TestCase.toSummary()` returns a JSON object for `handleSummary()` |
| WP3-R4 | Export descriptors via `handleSummary()` to a JSON report file |
| WP3-R5 | Update existing templates to use `TestCase` descriptors |

## Files Changed

- New `src/test-case.js`
- `simple-k6-test-template/simple-test.js` — refactor to use `TestCase`
- `simple-k6-websocket-test/websocket-test.js` — refactor to use `TestCase`

## Definition of Done

- [ ] `TestCase` builder creates valid descriptors (unit test)
- [ ] `toK6Group()` wraps execution with correct group name (unit test)
- [ ] `toSummary()` returns valid JSON matching schema (unit test)
- [ ] `handleSummary()` writes JSON report file (integration test)
- [ ] Existing templates refactored and still pass
- [ ] Integration test: `./ci-deployment -d simple-k6-test-template` passes
- [ ] JSDoc regenerated
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
