# WP-02: Enhanced Authentication & Lifecycle Hooks

> **Phase**: 2 — soft dependency on WP-10 (unit test infrastructure).

## Goal

Support JWT login flows, API-key headers, OAuth 2.0 client-credentials,
and cookie-based sessions so that tests can authenticate against real APIs
during `setup()` and share credentials across VUs.

## Requirements

| ID | Requirement |
| --- | --- |
| WP2-R1 | New `JwtAuthenticator` class that calls a login endpoint and returns a token |
| WP2-R2 | New `ApiKeyAuthenticator` class supporting custom header names (e.g., `X-API-Key`) |
| WP2-R3 | New `OAuth2ClientCredentials` class that performs client-credentials grant |
| WP2-R4 | `Authenticator` facade exposes new auth methods alongside existing ones |
| WP2-R5 | `setup()` returns auth data consumed by default function via `data` parameter |
| WP2-R6 | Auth credentials sourced from environment variables with clear naming |

## Files Changed

- `src/clients/http-auth.js` — add new authenticator classes
- `src/clients/http-client.js` — accept `data` from `setup()`
- New `jwt-api-test-template/` with example JWT flow
- `docs/CLIENT_API.md` — regenerated via `npm run jsdoc2mdClient`

## Definition of Done

- [ ] `JwtAuthenticator` implemented with unit tests
- [ ] `ApiKeyAuthenticator` implemented with unit tests
- [ ] `OAuth2ClientCredentials` implemented with unit tests
- [ ] `Authenticator` facade delegates to new + existing authenticators
- [ ] `setup()` → `data` pattern demonstrated in template
- [ ] Environment variable fallbacks documented
- [ ] Integration test: `./ci-deployment -d jwt-api-test-template` passes
- [ ] JSDoc regenerated (`npm run jsdoc2mdClient`)
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
