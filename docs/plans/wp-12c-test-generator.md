# WP-12c — Test Generation & HAR Conversion

> **Parent**: [WP-12](wp-12-ai-agent-test-automation.md) · **Depends on**: WP-12b

## Goal

Build an agent that generates k6 JavaScript test scripts from test case
descriptors, and optionally from HAR (HTTP Archive) recordings.

## Script Generation

Generate k6 ES module scripts that use the existing `src/` libraries:

- `TestCaseBuilder` from `src/test-case.js` for metadata.
- `HttpClientFactory` from `src/clients/http-client.js` for requests.
- `Authenticator` from `src/clients/http-auth.js` for auth.
- `SummaryHandler` from `src/summary-handler.js` for reporting.

### Generated Script Template

```javascript
import { HttpClientFactory } from '../src/clients/http-client.js';
import { TestCaseBuilder } from '../src/test-case.js';

const testCase = new TestCaseBuilder('TC-001', 'List all breeds')
    .description('US-42: As a user I can list all dog breeds')
    .steps(['GET /api/v2/breeds', 'Assert 200', 'Assert data array'])
    .tags({ userStory: 'US-42', testType: 'smoke' })
    .build();

export default function () {
    const { dynamicClient } = new HttpClientFactory({
        host: __ENV.API_SERVER,
    });
    testCase.toK6Group(() => {
        dynamicClient.api.v2.breeds.get();
    });
}
```

## HAR Reverse Engineering

- Accept HAR files from browser sessions, proxy, or k6 browser module.
- Parse request sequences into k6 script flows.
- Group related requests into logical test steps.
- Merge with test case descriptors when both are available.

```text
HAR file → parse entries → group by page/sequence → generate k6 groups
```

## Scope

- [ ] Generate a valid k6 script from a test case descriptor.
- [ ] Generated script passes `k6 inspect` (syntax check).
- [ ] Parse a sample HAR file into a k6 script.
- [ ] HAR-based script groups requests into logical steps.
- [ ] Unit tests for both generation paths.

## Definition of Done

- [ ] Generated scripts use `src/` libraries correctly.
- [ ] Both descriptor-based and HAR-based generation tested.
- [ ] `lint` and `test` pass.
