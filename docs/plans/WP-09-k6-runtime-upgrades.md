# WP-09: K6 Runtime & Extension Upgrades

> **Phase**: 1 (Foundation) — implement early.

## Goal

Pin k6 and extension versions to specific releases, adopt latest k6
features, and modernize the build pipeline.

> **Note**: Since k6 v1.2.1, **automatic extension resolution** is built-in.
> Scripts that import `k6/x/*` extensions are automatically provisioned
> without needing manual `xk6 build`. This may simplify or replace the
> current `xk6` build step in the Dockerfile for some use cases.

## Requirements

| ID | Requirement |
| --- | --- |
| WP9-R1 | Pin `XK6_VERSION` and `XK6_EXTENSION_VERSION` to specific release tags in Dockerfile |
| WP9-R2 | Add `K6_VERSION` ARG to control the k6 binary version |
| WP9-R3 | Evaluate k6 `browser` module for browser-based performance tests |
| WP9-R4 | Evaluate k6 `fs` module for file-based test data |
| WP9-R5 | Update `Httpx` import to use latest jslib version |
| WP9-R6 | Add Dependabot or Renovate config for automated dependency updates |
| WP9-R7 | Evaluate automatic extension resolution as alternative to xk6 build |

## Files Changed

- `Dockerfile` — pin versions, evaluate auto-resolution
- New `browser-test-template/` with Chromium-based test (optional)
- `src/clients/http-client.js` — update jslib import version
- `.github/dependabot.yml` — new file

## Definition of Done

- [ ] `XK6_VERSION` and `XK6_EXTENSION_VERSION` pinned to specific tags
- [ ] `K6_VERSION` ARG available in Dockerfile
- [ ] `k6 version` outputs expected version in built image
- [ ] Automatic extension resolution evaluated and documented
- [ ] Browser module feasibility documented
- [ ] `Httpx` import version reviewed / updated
- [ ] Dependabot or Renovate config added
- [ ] Integration test: `./ci-deployment` passes with pinned versions
- [ ] ESLint and markdownlint pass
- [ ] PR merged → delete this plan file
