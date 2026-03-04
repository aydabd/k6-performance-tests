# WP-12d — Test Implementer Agent

> **Status**: Draft · **Parent**: [WP-12](wp-12-ai-agent-test-automation.md)
> · **Depends on**: WP-12b, WP-12c

## Goal

Build an agent that generates k6 JavaScript/TypeScript test scripts from
test case descriptors, optionally using HAR (HTTP Archive) files — captured
from browser sessions, proxy recordings, or k6 browser module — as
additional input for reverse-engineering real user flows.

## Scope

### Script Generation

- [ ] Accept test case descriptors (WP-12c output) as input.
- [ ] Generate k6 ES module scripts that import from `src/clients/`.
- [ ] Use `TestCaseBuilder` from `src/test-case.js` for metadata.
- [ ] Use `HttpClientFactory` from `src/clients/http-client.js` for requests.
- [ ] Apply auth configuration from auth instructions (WP-12j).
- [ ] Output scripts to a temporary directory for the Test Runner.

### HAR / Recording Reverse Engineering

k6 supports converting HAR (HTTP Archive) files to test scripts.
This agent should also:

- [ ] Accept HAR files captured from browser sessions or proxy recordings.
- [ ] Parse the HAR and extract request sequences, headers, and payloads.
- [ ] Convert HAR entries into k6 script flows, grouping related requests
      into logical test steps.
- [ ] Correlate HAR-derived flows with test case descriptors when both
      are available (enrich generated scripts with assertion logic).

### Script Template

```javascript
import { HttpClientFactory } from '../src/clients/http-client.js';
import { TestCaseBuilder } from '../src/test-case.js';

const testCase = new TestCaseBuilder('TC-001', 'List all breeds')
    .description('US-42: As a user I can list all dog breeds')
    .steps(['GET /api/v2/breeds', 'Assert 200', 'Assert data array'])
    .expectedResults(['p95 < 500ms', 'status 200'])
    .tags({ userStory: 'US-42', testType: 'smoke' })
    .build();

export default function () {
    const { dynamicClient } = new HttpClientFactory({
        host: __ENV.API_SERVER,
        headers: { 'Content-Type': 'application/json' },
    });

    testCase.toK6Group(() => {
        dynamicClient.api.v2.breeds.get();
    });
}
```

## Definition of Done

- [ ] Agent generates a valid k6 script from a test case descriptor.
- [ ] Generated script passes `k6 inspect` (syntax validation).
- [ ] Agent can parse a sample HAR file and produce a k6 script.
- [ ] HAR-based script groups requests into logical steps.
- [ ] Unit tests cover both descriptor-based and HAR-based generation.
- [ ] `go test ./test-implementer/...` passes.
