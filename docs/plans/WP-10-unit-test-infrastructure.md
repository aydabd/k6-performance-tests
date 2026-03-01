# WP-10: Unit Test Infrastructure

> **Phase**: 1 (Foundation) — implement first; other WPs depend on this.

## Goal

Establish a unit test framework for shared client code so that changes to
`src/` can be validated without running full Docker integration tests.

## Requirements

| ID | Requirement |
| --- | --- |
| WP10-R1 | Add a test runner compatible with k6 ES module syntax (e.g., Vitest or Jest with ESM) |
| WP10-R2 | Mock k6 built-in modules (`k6`, `k6/http`, `k6/encoding`, `k6/ws`) for unit testing |
| WP10-R3 | Unit tests for `BaseUrl` class |
| WP10-R4 | Unit tests for `PathFormatter` class |
| WP10-R5 | Unit tests for `Authenticator`, `BasicAuthenticator`, `TokenBearerAuthenticator` |
| WP10-R6 | Unit tests for `HttpHeaders` class |
| WP10-R7 | Unit tests for `HttpErrorHandler` class |
| WP10-R8 | Unit tests for `Logger` class |
| WP10-R9 | Add `npm test` script to `package.json` |
| WP10-R10 | CI workflow runs unit tests before integration tests |

## Files Changed

- `package.json` — add test runner dependency, `test` script
- New `tests/unit/` directory with test files
- New `tests/unit/__mocks__/` directory for k6 module mocks
- `.github/workflows/ci.yml` — add unit test step

## Definition of Done

- [ ] Test runner installed and configured (Vitest or Jest ESM)
- [ ] k6 module mocks work for `k6`, `k6/http`, `k6/encoding`, `k6/websockets`
- [ ] Unit tests for `BaseUrl` — URL construction edge cases
- [ ] Unit tests for `PathFormatter` — all format conversions
- [ ] Unit tests for `Authenticator` — auth header generation
- [ ] Unit tests for `HttpHeaders` — header merging and injection
- [ ] Unit tests for `HttpErrorHandler` — error logging behavior
- [ ] Unit tests for `Logger` — log level filtering
- [ ] `npm test` runs and passes
- [ ] CI workflow runs unit tests before integration tests
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
