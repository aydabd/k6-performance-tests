# WP-11: K6 API Migration (Experimental → Stable)

> **Phase**: 1 (Foundation) — implement before other work packages.

## Goal

Migrate all deprecated and experimental k6 APIs in the repository to their
stable replacements based on k6 v1.4.0–v1.6.1 release changes. This ensures
the framework uses supported, long-term APIs and avoids future breakage.

## Background — K6 API Changes

The following changes were identified from k6 release notes (v1.2.1–v1.6.1):

### Graduated to Stable

| Old (Experimental) | New (Stable) | Since | Impact |
| --- | --- | --- | --- |
| `k6/experimental/websockets` | `k6/websockets` | v1.6.0 | `src/clients/ws-client.js` imports experimental module |
| `--out experimental-opentelemetry` | `--out opentelemetry` | v1.4.0 | Compose / k8s manifests, docs |
| `--no-summary` flag | `--summary-mode=disabled` | v1.3.0 | CI scripts |
| `legacy` summary mode | `compact` or `full` | v1.3.0 | CI scripts |

### Deprecated

| Module / Flag | Replacement | Since |
| --- | --- | --- |
| `k6/experimental/redis` | `xk6-redis` extension | v1.5.0 |
| `K6_OTEL_EXPORTER_TYPE` | `K6_OTEL_EXPORTER_PROTOCOL` | v1.4.0 |

### New Built-in Capabilities (replace jslib usage)

| jslib / custom code | Built-in alternative | Since |
| --- | --- | --- |
| `https://jslib.k6.io/url/1.0.0/index.js` (`URLSearchParams`) | Native `URL` / `URLSearchParams` in k6 runtime | v1.0+ |
| `https://jslib.k6.io/k6-utils/1.6.0/index.js` (`uuidv4`) | `crypto.randomUUID()` | v1.0+ |
| `https://jslib.k6.io/httpx/0.1.0/index.js` | Latest `httpx/0.1.0` (or native `k6/http`) | — |

### New Features Available for Adoption

| Feature | Module / API | Since |
| --- | --- | --- |
| OpenTelemetry stable output | `--out opentelemetry` | v1.4.0 |
| Machine-readable summary | `--new-machine-readable-summary` | v1.5.0 |
| Automatic extension resolution | built-in (no `xk6 build`) | v1.2.1 |
| Browser module (stable) | `k6/browser` | v1.2.1+ |
| URL-based secrets | `K6_SECRET_SOURCE` | v1.5.0 |
| `k6 deps` command | `k6 deps script.js` | v1.6.0 |
| Crypto PBKDF2 | `k6/crypto` | v1.6.0 |
| TOTP library | `jslib` TOTP | v1.6.0 |

## Requirements

| ID | Requirement | Affected Files |
| --- | --- | --- |
| WP11-R1 | Replace `k6/experimental/websockets` import with `k6/websockets` | `src/clients/ws-client.js` |
| WP11-R2 | Evaluate replacing jslib `URLSearchParams` with native k6 `URLSearchParams` | `src/clients/http-client.js` |
| WP11-R3 | Evaluate replacing jslib `uuidv4` with `crypto.randomUUID()` | `src/clients/ws-client.js` |
| WP11-R4 | Update docs to reference stable `--out opentelemetry` instead of experimental | `README.md`, `docs/` |
| WP11-R5 | Document new k6 features available for adoption in framework | `docs/plans/` |
| WP11-R6 | Verify all existing integration tests pass after migration | CI pipeline |

## Files Changed

- `src/clients/ws-client.js` — update WebSocket import
- `src/clients/http-client.js` — evaluate jslib replacements
- `README.md` — update references
- Integration tests — verify no regressions

## Definition of Done

- [ ] `ws-client.js` imports from `k6/websockets` (stable)
- [ ] jslib usage evaluated and replaced where native alternatives exist
- [ ] Integration tests pass (`./ci-deployment -d simple-k6-websocket-test`)
- [ ] Integration tests pass (`./ci-deployment -d simple-k6-test-template`)
- [ ] Documentation updated to reflect stable APIs
- [ ] No `k6/experimental/websockets` imports remain in codebase
- [ ] ESLint passes
- [ ] PR merged → delete this plan file
