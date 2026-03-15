# Demo: AI Agent-Driven Test Automation

This demo shows the WP-12 agent pipeline running against the
[Dog CEO API](https://dog.ceo/api).

## Prerequisites

- Node.js ≥ 24
- Docker with the `grafana/k6` image pulled

```bash
docker pull grafana/k6
npm install
```

## Files

| File | Purpose |
| ---- | ------- |
| `user-stories/US-42.md` | Sample user story (browse dog breeds) |
| `openapi/sample-api.json` | OpenAPI v3 spec for the Dog CEO API |
| `har/sample-dogapi.har` | Sample HAR recording of the Dog CEO API browser session |
| `auth-instructions.yaml` | JWT auth config (uses `${ENV_VAR}` references) |
| `run-pipeline.js` | Runnable end-to-end demo (OpenAPI → k6 scripts → Docker commands) |
| `run-har-pipeline.js` | Runnable HAR-to-k6 demo (HAR recording → k6 script) |

## Run the Pipeline (OpenAPI spec → k6 scripts)

```bash
node demo/run-pipeline.js
```

This runs the full 5-stage pipeline:

1. **ANALYZE** — parses `openapi/sample-api.json` into a normalized endpoint map
2. **PLAN** — converts endpoints + user story into test case descriptors
3. **GENERATE** — produces runnable k6 ES module scripts (group/sleep pattern)
4. **EXECUTE** — writes scripts to `/tmp/k6-agent-pipeline/` and builds Docker commands
5. **REPORT** — evaluates results against performance thresholds

Each generated script follows the proven `simple-test.js` pattern:

- `import { group, sleep } from 'k6'`
- `new HttpClientFactory({ host: __ENV.API_SERVER })` — no static `.create()`
- No `export const options` — thresholds come from the config file
- No `TestCaseBuilder` — would cause k6 init failure in Docker

To run a generated script in Docker:

```bash
docker run --rm \
  -v "/tmp/k6-agent-pipeline/TC-001.js:/scripts/TC-001.js" \
  -e API_SERVER=dog.ceo \
  grafana/k6 run /scripts/TC-001.js
```

## Run the HAR Pipeline (browser recording → k6 script)

```bash
node demo/run-har-pipeline.js
```

This simulates the Playwright/MCP browser recording workflow:

1. A browser session is recorded as a HAR file (`har/sample-dogapi.har`)
2. The HAR converter agent transforms each request into a `httpClient.request()` call
3. Requests are grouped by page (reflecting the original navigation flow)
4. The resulting k6 script can run in Docker immediately

To run the HAR-generated script in Docker:

```bash
docker run --rm \
  -v "/tmp/k6-agent-pipeline/har-generated-test.js:/scripts/har-test.js" \
  -e BASE_URL=https://dog.ceo \
  grafana/k6 run /scripts/har-test.js
```

## Auth Config

Set environment variables before running a test with JWT auth:

```bash
export JWT_LOGIN_URL=https://auth.example.com/token
export JWT_USERNAME=myuser
export JWT_PASSWORD=mypassword
```

The `auth-instructions.yaml` file uses `${ENV_VAR}` references that are
resolved from `process.env` at parse time by `parseAuthConfig`.
