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
| `auth-instructions.yaml` | JWT auth config (uses `${ENV_VAR}` references) |

## Run the Pipeline

```javascript
import { Orchestrator } from '../src/agents/agent-framework.js';
import { createApiAnalyzerAgent } from '../src/agents/api-analyzer.js';
import { createTestPlannerAgent } from '../src/agents/test-planner.js';
import { createTestGeneratorAgent } from '../src/agents/test-generator.js';
import { createTestRunnerAgent } from '../src/agents/test-runner.js';
import { createResultsAnalyzerAgent } from '../src/agents/results-analyzer.js';
import sampleSpec from './openapi/sample-api.json' assert { type: 'json' };

const orchestrator = new Orchestrator({
    ANALYZE: createApiAnalyzerAgent(),
    PLAN: createTestPlannerAgent(),
    GENERATE: createTestGeneratorAgent(),
    EXECUTE: createTestRunnerAgent(),
    REPORT: createResultsAnalyzerAgent(),
});

const result = await orchestrator.run({
    spec: sampleSpec,
    stories: ['US-42: As a user I want to see dog breeds'],
});

console.log(JSON.stringify(result, null, 2));
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
