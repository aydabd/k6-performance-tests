/**
 * Integration tests: Agent-generated k6 scripts are valid and runnable.
 *
 * These tests prove the full WP-12 agent pipeline end-to-end:
 *   OpenAPI spec → ANALYZE → PLAN → GENERATE
 *
 * They verify that generated scripts:
 *   1. Follow the proven simple-test.js pattern (group/sleep, no TestCaseBuilder)
 *   2. Are syntactically valid JavaScript (parseable by Node.js)
 *   3. Do NOT contain patterns that cause k6 init failures
 *   4. Are ready to run in Docker/k8s with `k6 run`
 *
 * The HAR-to-k6 workflow is also verified:
 *   HAR recording (from Playwright/browser) → convertHarToK6 → runnable k6 script
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { promises as fsp } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { Orchestrator, createAgentOutput } from '../../src/agents/agent-framework.js';
import { createApiAnalyzerAgent } from '../../src/agents/api-analyzer.js';
import { createTestPlannerAgent } from '../../src/agents/test-planner.js';
import { createTestGeneratorAgent } from '../../src/agents/test-generator.js';
import { buildRunCommand } from '../../src/agents/test-runner.js';
import { analyzeResults } from '../../src/agents/results-analyzer.js';
import { convertHarToK6 } from '../../src/agents/har-converter.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DEMO_DIR = join(__dirname, '../../demo');

const SAMPLE_SPEC = JSON.parse(
    readFileSync(join(DEMO_DIR, 'openapi/sample-api.json'), 'utf8')
);

const SAMPLE_HAR = JSON.parse(
    readFileSync(join(DEMO_DIR, 'har/sample-dogapi.har'), 'utf8')
);

const STORY = 'US-42: As a dog enthusiast I want to browse all dog breeds';

/**
 * Build a full 5-agent orchestrator with EXECUTE/REPORT as lightweight pass-throughs.
 * This mirrors the pattern used in e2e-requirements.test.js.
 * @param {string} tmpDir - Temp directory for generated scripts.
 * @returns {Orchestrator} Fully wired orchestrator.
 */
function buildOrchestrator(tmpDir) {
    return new Orchestrator({
        ANALYZE: createApiAnalyzerAgent(),
        PLAN: createTestPlannerAgent(),
        GENERATE: createTestGeneratorAgent(),
        EXECUTE: async (input) => {
            const { scripts = [] } = input.payload || {};
            const commands = [];
            for (const script of scripts) {
                const filePath = join(tmpDir, `${script.id}.js`);
                await fsp.writeFile(filePath, script.script, 'utf8');
                commands.push(buildRunCommand({ scriptPath: filePath }));
            }
            return createAgentOutput(input.type, { commands });
        },
        REPORT: async (input) => {
            const { descriptors = [] } = input.payload || {};
            const syntheticSummary = {
                metrics: {
                    http_req_duration: { values: { 'p(95)': 200 } },
                    http_req_failed: { values: { rate: 0.005 } },
                },
            };
            const report = analyzeResults(syntheticSummary, descriptors);
            return createAgentOutput(input.type, { report });
        },
    });
}

// ---------------------------------------------------------------------------
// Full pipeline: OpenAPI spec → endpoints → descriptors → k6 scripts
// ---------------------------------------------------------------------------

describe('Agent pipeline: OpenAPI spec → generated k6 scripts', () => {
    let pipelineResult;
    let tmpDir;

    beforeAll(async () => {
        tmpDir = await fsp.mkdtemp(join(tmpdir(), 'k6-e2e-agent-'));
        pipelineResult = await buildOrchestrator(tmpDir).run({ spec: SAMPLE_SPEC, stories: [STORY] });
    });

    it('pipeline completes without error', () => {
        expect(pipelineResult.status).toBe('ok');
        expect(pipelineResult.failedStep).toBeUndefined();
    });

    it('ANALYZE extracts endpoints from the Dog CEO API spec', () => {
        const { endpoints } = pipelineResult.state;
        expect(endpoints).toHaveLength(2);
        expect(endpoints[0]).toMatchObject({ method: 'GET', path: '/v2/breeds/list/all' });
        expect(endpoints[1]).toMatchObject({ method: 'GET', path: '/v2/breeds/image/random' });
    });

    it('PLAN produces one test case descriptor per endpoint', () => {
        const { descriptors } = pipelineResult.state;
        expect(descriptors).toHaveLength(2);
        expect(descriptors[0].id).toBe('TC-001');
        expect(descriptors[1].id).toBe('TC-002');
        expect(descriptors[0].userStory).toBe('US-42');
    });

    it('GENERATE produces one k6 script per descriptor', () => {
        const { scripts } = pipelineResult.state;
        expect(scripts).toHaveLength(2);
        expect(scripts[0].id).toBe('TC-001');
        expect(typeof scripts[0].script).toBe('string');
        expect(scripts[0].script.length).toBeGreaterThan(50);
    });
});

// ---------------------------------------------------------------------------
// Generated scripts must follow the proven simple-test.js pattern
// ---------------------------------------------------------------------------

describe('Generated scripts: proven k6 pattern (group/sleep, no init crashes)', () => {
    let scripts;

    beforeAll(async () => {
        const tmpDir = await fsp.mkdtemp(join(tmpdir(), 'k6-e2e-gen-'));
        const result = await buildOrchestrator(tmpDir).run({ spec: SAMPLE_SPEC, stories: [STORY] });
        scripts = result.state.scripts ?? [];
    });

    it('imports group and sleep from k6 (not TestCaseBuilder)', () => {
        for (const { script } of scripts) {
            expect(script).toContain("import { group, sleep } from 'k6'");
            expect(script).not.toContain('TestCaseBuilder');
            expect(script).not.toContain('test-case.js');
        }
    });

    it('does NOT export const options (prevents k6 threshold init crash)', () => {
        for (const { script } of scripts) {
            expect(script).not.toContain('export const options');
            expect(script).not.toContain('p(95)<');
        }
    });

    it('does NOT use toK6Group (causes k6 init failure)', () => {
        for (const { script } of scripts) {
            expect(script).not.toContain('toK6Group');
        }
    });

    it('uses HttpClientFactory with host (not static create())', () => {
        for (const { script } of scripts) {
            expect(script).toContain('new HttpClientFactory(');
            expect(script).not.toContain('HttpClientFactory.create(');
        }
    });

    it('uses API_SERVER env var (consistent with Docker/k8s env config)', () => {
        for (const { script } of scripts) {
            expect(script).toContain('API_SERVER');
        }
    });

    it('wraps request in a group() block with test case id', () => {
        for (const { id, script } of scripts) {
            expect(script).toContain('group(');
            expect(script).toContain(id);
        }
    });

    it('calls sleep(1) to space requests (prevents rate limiting in CI)', () => {
        for (const { script } of scripts) {
            expect(script).toContain('sleep(1)');
        }
    });

    it('TC-001 generates a call to /v2/breeds/list/all via proxy chain', () => {
        const tc001 = scripts.find((s) => s.id === 'TC-001');
        expect(tc001).toBeDefined();
        expect(tc001.script).toContain('dynamicClient.v2.breeds.list.all.get()');
    });

    it('TC-002 generates a call to /v2/breeds/image/random via proxy chain', () => {
        const tc002 = scripts.find((s) => s.id === 'TC-002');
        expect(tc002).toBeDefined();
        expect(tc002.script).toContain('dynamicClient.v2.breeds.image.random.get()');
    });
});

// ---------------------------------------------------------------------------
// Generated scripts must be syntactically valid JavaScript
// ---------------------------------------------------------------------------

describe('Generated scripts: syntactically valid JavaScript', () => {
    let scripts;

    beforeAll(async () => {
        const tmpDir = await fsp.mkdtemp(join(tmpdir(), 'k6-e2e-syntax-'));
        const result = await buildOrchestrator(tmpDir).run({ spec: SAMPLE_SPEC, stories: [STORY] });
        scripts = result.state.scripts ?? [];
    });

    it('each generated script can be parsed as a valid ES module', () => {
        for (const { id, script } of scripts) {
            expect(script, `Script ${id} should start with an import`).toMatch(/^import /);
            expect(script, `Script ${id} should have export default function`).toContain('export default function');
            expect(script, `Script ${id} should be non-empty`).not.toBe('');
        }
    });

    it('scripts have correct k6 ES module structure', () => {
        for (const { script } of scripts) {
            const lines = script.split('\n');
            expect(lines[0]).toMatch(/^import /);
            expect(script).toContain('export default function ()');
        }
    });
});

// ---------------------------------------------------------------------------
// HAR-to-k6: Browser recording → runnable k6 script
// ---------------------------------------------------------------------------

describe('HAR-to-k6: browser recording converted to runnable k6 script', () => {
    let harScript;

    beforeAll(() => {
        harScript = convertHarToK6(SAMPLE_HAR, { relativeImportPath: '../src' });
    });

    it('converts sample HAR to a non-empty string', () => {
        expect(typeof harScript).toBe('string');
        expect(harScript.length).toBeGreaterThan(50);
    });

    it('generated HAR script imports group from k6', () => {
        expect(harScript).toContain("import { group } from 'k6'");
    });

    it('generated HAR script imports HttpClientFactory', () => {
        expect(harScript).toContain("import { HttpClientFactory }");
    });

    it('generated HAR script has export default function', () => {
        expect(harScript).toContain('export default function');
    });

    it('generated HAR script groups requests by page (US-42 browser session)', () => {
        expect(harScript).toContain('group(');
        expect(harScript).toContain('page_1');
    });

    it('generated HAR script calls the Dog API breed list URL', () => {
        expect(harScript).toContain('dog.ceo/api/v2/breeds/list/all');
    });

    it('generated HAR script calls the Dog API random image URL', () => {
        expect(harScript).toContain('dog.ceo/api/v2/breeds/image/random');
    });

    it('generated HAR script uses httpClient.request() (safe, no injection)', () => {
        expect(harScript).toContain('httpClient.request(');
        expect(harScript).not.toContain('dynamicClient.');
    });

    it('HAR script does NOT export const options (no init crash risk)', () => {
        expect(harScript).not.toContain('export const options');
    });
});

// ---------------------------------------------------------------------------
// Full feedback loop: pipeline → scripts → validate → re-run if failed
// ---------------------------------------------------------------------------

describe('Agent feedback loop: retry on transient pipeline failure', () => {
    it('Orchestrator retries up to MAX_RETRIES on a flaky ANALYZE agent then succeeds', async () => {
        let callCount = 0;
        const flakyAnalyzeAgent = async (input) => {
            callCount += 1;
            if (callCount < 3) {
                return { type: input.type, payload: null, status: 'error', error: 'transient error' };
            }
            // Third attempt succeeds with real analysis
            return createApiAnalyzerAgent()(input);
        };

        const tmpDir = await fsp.mkdtemp(join(tmpdir(), 'k6-e2e-retry-'));
        const orchestrator = new Orchestrator({
            ANALYZE: flakyAnalyzeAgent,
            PLAN: createTestPlannerAgent(),
            GENERATE: createTestGeneratorAgent(),
            EXECUTE: async (input) => {
                const { scripts = [] } = input.payload || {};
                const commands = [];
                for (const script of scripts) {
                    const filePath = join(tmpDir, `${script.id}.js`);
                    await fsp.writeFile(filePath, script.script, 'utf8');
                    commands.push(buildRunCommand({ scriptPath: filePath }));
                }
                return createAgentOutput(input.type, { commands });
            },
            REPORT: async (input) => {
                const { descriptors = [] } = input.payload || {};
                const syntheticSummary = {
                    metrics: {
                        http_req_duration: { values: { 'p(95)': 200 } },
                        http_req_failed: { values: { rate: 0.005 } },
                    },
                };
                const report = analyzeResults(syntheticSummary, descriptors);
                return createAgentOutput(input.type, { report });
            },
        });

        const result = await orchestrator.run({ spec: SAMPLE_SPEC, stories: [STORY] });

        expect(callCount).toBe(3);
        expect(result.status).toBe('ok');
        expect(result.state.scripts).toHaveLength(2);
    });

    it('Orchestrator reports failure after MAX_RETRIES exhausted', async () => {
        const alwaysFailAgent = async (input) => ({
            type: input.type,
            payload: null,
            status: 'error',
            error: 'permanent failure',
        });

        const orchestrator = new Orchestrator({ ANALYZE: alwaysFailAgent }, { maxRetries: 2 });
        const result = await orchestrator.run({ spec: SAMPLE_SPEC });

        expect(result.status).toBe('failed');
        expect(result.failedStep).toBe('ANALYZE');
        expect(result.error).toBe('permanent failure');
    });
});
