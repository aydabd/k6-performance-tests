# WP-12e — Auth Instructions & End-to-End Integration

> **Parent**: [WP-12](wp-12-ai-agent-test-automation.md) · **Depends on**: WP-12a

## Goal

Create a configurable auth framework and wire all agents into a
deployable end-to-end system.

## Auth Instructions

Every company has unique auth flows. Users provide a YAML file that
agents follow. Secrets use `${ENV_VAR}` references — never stored in files.

Supports all types in `src/clients/http-auth.js`: Basic, Bearer, JWT,
API Key, OAuth2 Client Credentials.

```yaml
auth:
  type: jwt  # basic | bearer | jwt | api-key | oauth2
  jwt:
    login_url: "https://api.example.com/auth/login"
    payload:
      username: "${JWT_USERNAME}"
      password: "${JWT_PASSWORD}"
    token_field: "access_token"
    token_prefix: "Bearer"
  # oauth2:
  #   token_url: "${OAUTH2_TOKEN_URL}"
  #   client_id: "${OAUTH2_CLIENT_ID}"
  #   client_secret: "${OAUTH2_CLIENT_SECRET}"
```

Agents use this to:

1. **Generate** correct `Authenticator` calls in k6 scripts.
2. **Pass** env vars to test containers at runtime.

## End-to-End Integration

- Wire all agents via the orchestrator (WP-12a).
- Add agent service to `compose.yaml`.
- Add build + test + lint to CI.
- Create a `demo/` directory with sample inputs:
  - User stories (markdown).
  - OpenAPI spec (JSON).
  - Auth instructions (YAML).
  - Optional HAR recording.

## Integration Tests

Scoped and bounded:

- [ ] Orchestrator state transitions (mock agents).
- [ ] Agent dispatch sequence (correct order).
- [ ] Auth instructions parsing (all auth types).
- [ ] Report generation from synthetic results.

## Scope

- [ ] YAML schema for auth instructions defined and documented.
- [ ] Config loader parses auth YAML and resolves `${ENV_VAR}` refs.
- [ ] Test generator produces correct auth code per type.
- [ ] Container runner passes auth env vars.
- [ ] All agents wired end-to-end via orchestrator.
- [ ] Demo with sample inputs documented.
- [ ] CI updated.

## Definition of Done

- [ ] Auth instructions work for JWT, OAuth2, API Key, Basic.
- [ ] End-to-end: user story in → k6 test → report out.
- [ ] Demo reproducible from docs.
- [ ] `lint` and `test` pass.
