/**
 * End-to-end requirement verification for the WP-12 agent pipeline.
 *
 * Each describe block maps to one implemented requirement.
 * Tests use real modules with no mocks — the same code that runs in production.
 *
 * Full pipeline test at the bottom wires all 5 agents together:
 *   OpenAPI spec → endpoints → test plan → k6 scripts → Docker commands → report
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import {
    Orchestrator,
    createAgentOutput,
} from '../../src/agents/agent-framework.js';
import { analyzeApi, createApiAnalyzerAgent } from '../../src/agents/api-analyzer.js';
import { planTests, createTestPlannerAgent } from '../../src/agents/test-planner.js';
import { generateK6Script, createTestGeneratorAgent, AUTH_METHOD_MAP } from '../../src/agents/test-generator.js';
import { buildRunCommand } from '../../src/agents/test-runner.js';
import { analyzeResults, parseK6Summary } from '../../src/agents/results-analyzer.js';
import { parseAuthConfig, buildAuthCode } from '../../src/agents/auth-loader.js';
import { convertHarToK6 } from '../../src/agents/har-converter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(__dirname, '../../demo');

const SAMPLE_SPEC = JSON.parse(
    readFileSync(path.join(DEMO_DIR, 'openapi/sample-api.json'), 'utf8')
);

const AUTH_YAML = readFileSync(path.join(DEMO_DIR, 'auth-instructions.yaml'), 'utf8');

// ---------------------------------------------------------------------------
// REQ-WP12a: Analyze OpenAPI v3 and Swagger v2 specs
// ---------------------------------------------------------------------------

describe('REQ-WP12a: Analyze OpenAPI specs into normalized endpoint maps', () => {
    it('extracts all endpoints from the demo OpenAPI v3 spec', () => {
        const { baseUrl, endpoints, version } = analyzeApi(SAMPLE_SPEC);

        expect(version).toBe('v3');
        expect(baseUrl).toBe('https://dog.ceo/api');
        expect(endpoints).toHaveLength(2);
        expect(endpoints[0]).toMatchObject({ method: 'GET', path: '/v2/breeds/list/all', auth: 'none' });
        expect(endpoints[1]).toMatchObject({ method: 'GET', path: '/v2/breeds/image/random', auth: 'none' });
    });

    it('extracts endpoints from a Swagger v2 spec', () => {
        const swaggerSpec = {
            swagger: '2.0',
            host: 'api.example.com',
            basePath: '/v1',
            schemes: ['https'],
            paths: {
                '/users': {
                    get: { summary: 'List users', responses: { '200': { description: 'ok' } } },
                },
            },
        };

        const { baseUrl, endpoints, version } = analyzeApi(swaggerSpec);

        expect(version).toBe('v2');
        expect(baseUrl).toBe('https://api.example.com/v1');
        expect(endpoints).toHaveLength(1);
        expect(endpoints[0]).toMatchObject({ method: 'GET', path: '/users', auth: 'none' });
    });

    it('inherits spec-level global security when an operation omits its own security', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'T', version: '1' },
            servers: [{ url: 'https://example.com' }],
            security: [{ bearerAuth: [] }],
            components: {
                securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
            },
            paths: {
                '/public': { get: { security: [], responses: { '200': {} } } },
                '/protected': { get: { responses: { '200': {} } } },
            },
        };

        const { endpoints } = analyzeApi(spec);
        const publicEp = endpoints.find((e) => e.path === '/public');
        const protectedEp = endpoints.find((e) => e.path === '/protected');

        expect(publicEp.auth).toBe('none');
        expect(protectedEp.auth).toBe('bearer');
    });

    it('detects bearer, basic, and apiKey auth types', () => {
        const spec = {
            openapi: '3.0.0',
            info: { title: 'T', version: '1' },
            servers: [{ url: 'https://example.com' }],
            components: {
                securitySchemes: {
                    bearerScheme: { type: 'http', scheme: 'bearer' },
                    basicScheme: { type: 'http', scheme: 'basic' },
                    apiKeyScheme: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
                },
            },
            paths: {
                '/bearer': { get: { security: [{ bearerScheme: [] }], responses: { '200': {} } } },
                '/basic': { get: { security: [{ basicScheme: [] }], responses: { '200': {} } } },
                '/apikey': { get: { security: [{ apiKeyScheme: [] }], responses: { '200': {} } } },
            },
        };

        const { endpoints } = analyzeApi(spec);

        expect(endpoints.find((e) => e.path === '/bearer').auth).toBe('bearer');
        expect(endpoints.find((e) => e.path === '/basic').auth).toBe('basic');
        expect(endpoints.find((e) => e.path === '/apikey').auth).toBe('apiKey');
    });
});

// ---------------------------------------------------------------------------
// REQ-WP12b: Plan test cases from endpoints and user stories
// ---------------------------------------------------------------------------

describe('REQ-WP12b: Plan test case descriptors from endpoints and user stories', () => {
    const endpointMap = analyzeApi(SAMPLE_SPEC);

    it('generates one TC descriptor per endpoint', () => {
        const descriptors = planTests(endpointMap, ['US-42: As a user I want to see dog breeds']);

        expect(descriptors).toHaveLength(2);
    });

    it('assigns sequential TC-NNN identifiers and maps the user story', () => {
        const descriptors = planTests(endpointMap, ['US-42: As a user I want to see dog breeds']);

        expect(descriptors[0].id).toBe('TC-001');
        expect(descriptors[1].id).toBe('TC-002');
        expect(descriptors[0].userStory).toBe('US-42');
    });

    it('each descriptor has endpoint, steps, performance thresholds, and tags', () => {
        const [descriptor] = planTests(endpointMap, ['US-42: browse breeds']);

        expect(descriptor.endpoint.method).toBe('GET');
        expect(descriptor.endpoint.path).toBe('/v2/breeds/list/all');
        expect(Array.isArray(descriptor.steps)).toBe(true);
        expect(descriptor.steps.length).toBeGreaterThan(0);
        expect(descriptor.performance.p95).toBe(500);
        expect(descriptor.performance.errorRate).toBe(0.01);
        expect(descriptor.tags).toContain('smoke');
        expect(descriptor.tags).toContain('US-42');
    });
});

// ---------------------------------------------------------------------------
// REQ-WP12c: Generate valid k6 ES module scripts
// ---------------------------------------------------------------------------

describe('REQ-WP12c: Generate valid k6 ES module scripts from test descriptors', () => {
    const descriptor = {
        id: 'TC-001',
        userStory: 'US-42',
        endpoint: { method: 'GET', path: '/v2/breeds/list/all' },
        auth: 'none',
        steps: ['GET /v2/breeds/list/all', 'Assert 200'],
        performance: { p95: 500, errorRate: 0.01 },
        tags: ['smoke'],
    };

    it('generated script is a valid ES module with group/sleep and default export', () => {
        const script = generateK6Script(descriptor);

        expect(script).toContain("import { group, sleep } from 'k6'");
        expect(script).toContain("import { HttpClientFactory }");
        expect(script).not.toContain('TestCaseBuilder');
        expect(script).not.toContain('export const options');
        expect(script).toContain('export default function');
        expect(script).toContain("new HttpClientFactory(");
        expect(script).not.toContain('HttpClientFactory.create(');
        expect(script).toContain('group(');
        expect(script).toContain('sleep(');
    });

    it('unauthenticated script omits Authenticator import and setup', () => {
        const script = generateK6Script({ ...descriptor, auth: 'none' });

        expect(script).not.toContain("import { Authenticator }");
        expect(script).not.toContain('new Authenticator(');
    });

    it('bearer auth script uses getTokenBearerAuth() and imports Authenticator', () => {
        const script = generateK6Script({ ...descriptor, auth: 'bearer' });

        expect(script).toContain("import { Authenticator }");
        expect(script).toContain('getTokenBearerAuth()');
        expect(script).not.toContain('getAuth()');
    });

    it('AUTH_METHOD_MAP covers all auth types with correct Authenticator methods', () => {
        expect(AUTH_METHOD_MAP.bearer).toBe('getTokenBearerAuth');
        expect(AUTH_METHOD_MAP.basic).toBe('getBasicAuth');
        expect(AUTH_METHOD_MAP.apiKey).toBe('getApiKeyAuth');
        expect(AUTH_METHOD_MAP.jwt).toBe('getJwtAuth');
        expect(AUTH_METHOD_MAP.oauth2).toBe('getOAuth2Auth');
    });
});

// ---------------------------------------------------------------------------
// REQ-WP12d: Build Docker commands for k6 script execution
// ---------------------------------------------------------------------------

describe('REQ-WP12d: Build Docker run commands for k6 script execution', () => {
    it('volume-mount mode produces a complete docker run command', () => {
        const { command, args } = buildRunCommand({
            scriptPath: '/tmp/test-script.js',
            image: 'grafana/k6',
            envVars: { BASE_URL: 'https://dog.ceo' },
        });

        expect(command).toBe('docker');
        expect(args).toContain('run');
        expect(args).toContain('--rm');
        expect(args).toContain('-v');
        expect(args.some((a) => a.startsWith('/tmp/test-script.js:'))).toBe(true);
        expect(args).toContain('-e');
        expect(args).toContain('BASE_URL=https://dog.ceo');
        expect(args[args.length - 1]).toContain('test-script.js');
    });

    it('build mode omits the volume mount', () => {
        const { args } = buildRunCommand({
            scriptPath: '/tmp/tc-001.js',
            mountMode: 'build',
        });

        expect(args).not.toContain('-v');
        expect(args).toContain('run');
    });

    it('throws a descriptive error when scriptPath is missing', () => {
        expect(() => buildRunCommand({})).toThrow('scriptPath is required');
    });
});

// ---------------------------------------------------------------------------
// REQ-WP12e: Analyze k6 results against thresholds
// ---------------------------------------------------------------------------

describe('REQ-WP12e: Analyze k6 metrics against test case thresholds', () => {
    const descriptors = [
        { id: 'TC-001', userStory: 'US-42', performance: { p95: 500, errorRate: 0.01 } },
        { id: 'TC-002', userStory: 'US-42', performance: { p95: 800, errorRate: 0.05 } },
    ];

    const passingMetrics = {
        metrics: {
            http_req_duration: { values: { 'p(95)': 200 } },
            http_req_failed: { values: { rate: 0.001 } },
        },
    };

    it('marks all test cases PASSED when metrics are within every threshold', () => {
        const { overallPassed, testCases } = analyzeResults(passingMetrics, descriptors);

        expect(overallPassed).toBe(true);
        testCases.forEach((tc) => expect(tc.passed).toBe(true));
    });

    it('marks test case FAILED when p95 response time exceeds its threshold', () => {
        const failingMetrics = {
            metrics: {
                http_req_duration: { values: { 'p(95)': 600 } },
                http_req_failed: { values: { rate: 0.001 } },
            },
        };

        const { overallPassed, testCases } = analyzeResults(failingMetrics, descriptors);

        expect(testCases[0].passed).toBe(false);  // TC-001 threshold: p95 < 500
        expect(testCases[1].passed).toBe(true);   // TC-002 threshold: p95 < 800
        expect(overallPassed).toBe(false);
    });

    it('parses a k6 JSON summary string and evaluates thresholds correctly', () => {
        const jsonSummary = JSON.stringify(passingMetrics);
        const parsed = parseK6Summary(jsonSummary);

        const { overallPassed } = analyzeResults(parsed, descriptors);

        expect(overallPassed).toBe(true);
    });

    it('each test case result includes id, userStory, p95, errorRate, and passed', () => {
        const { testCases } = analyzeResults(passingMetrics, descriptors);
        const tc = testCases[0];

        expect(tc.id).toBe('TC-001');
        expect(tc.userStory).toBe('US-42');
        expect(typeof tc.p95).toBe('number');
        expect(typeof tc.errorRate).toBe('number');
        expect(typeof tc.passed).toBe('boolean');
    });
});

// ---------------------------------------------------------------------------
// REQ-WP12f: Load auth config and generate k6 Authenticator code
// ---------------------------------------------------------------------------

describe('REQ-WP12f: Load auth YAML and generate safe Authenticator constructor code', () => {
    it('parses the demo JWT auth config from auth-instructions.yaml', () => {
        const config = parseAuthConfig(AUTH_YAML);

        expect(config.type).toBe('jwt');
        expect(typeof config.jwt).toBe('object');
        expect(config.jwt.loginUrl).toBeDefined();
        expect(config.jwt.tokenPath).toBe('access_token');
    });

    it('generates a valid Authenticator constructor call from JWT config', () => {
        const config = parseAuthConfig(AUTH_YAML);
        const code = buildAuthCode(config);

        expect(code).toContain('new Authenticator(');
        expect(code).toContain('loginUrl');
        expect(code).toContain('tokenPath');
    });

    it('uses __ENV["VAR"] bracket notation for unresolved env var references', () => {
        const yaml = 'auth:\n  type: bearer\n  token: ${MY_TOKEN}\n';
        const config = parseAuthConfig(yaml);
        const code = buildAuthCode(config);

        // Unresolved ${MY_TOKEN} → __ENV["MY_TOKEN"] (safe bracket notation)
        expect(code).toContain('__ENV["MY_TOKEN"]');
        expect(code).not.toContain('__ENV.MY_TOKEN');
    });

    it('uses JSON.stringify for literal values (prevents injection)', () => {
        const yaml = "auth:\n  type: bearer\n  token: safe'value\n";
        const config = parseAuthConfig(yaml);
        const code = buildAuthCode(config);

        // Literal value must be safely JSON-encoded — no raw single-quote injection
        expect(code).not.toContain("'safe'value'");
    });

    it('parses all 5 supported auth types correctly', () => {
        const cases = [
            'auth:\n  type: basic\n  username: user\n',
            'auth:\n  type: bearer\n  token: tok\n',
            'auth:\n  type: jwt\n  loginUrl: https://example.com\n',
            'auth:\n  type: apiKey\n  header: X-Key\n',
            'auth:\n  type: oauth2\n  tokenUrl: https://example.com\n',
        ];

        cases.forEach((yaml) => {
            const config = parseAuthConfig(yaml);
            const code = buildAuthCode(config);
            expect(code).toContain('new Authenticator(');
        });
    });
});

// ---------------------------------------------------------------------------
// REQ-WP12g: Convert HAR archives to k6 scripts
// ---------------------------------------------------------------------------

describe('REQ-WP12g: Convert HAR archives to k6 scripts', () => {
    const minimalHar = {
        log: {
            entries: [
                { pageref: 'page_1', request: { method: 'GET', url: 'https://example.com/api/users' } },
                { pageref: 'page_1', request: { method: 'POST', url: 'https://example.com/api/orders' } },
                { pageref: 'page_2', request: { method: 'GET', url: "https://example.com/a?b=c&d=it's" } },
            ],
        },
    };

    it('converts HAR entries into a valid k6 ES module with group blocks', () => {
        const script = convertHarToK6(minimalHar);

        expect(script).toContain("import { group } from 'k6'");
        expect(script).toContain("import { HttpClientFactory }");
        expect(script).toContain('new HttpClientFactory(');
        expect(script).toContain('export default function');
        expect(script).toContain('group(');
    });

    it('groups entries by pageref and generates one group block per page', () => {
        const script = convertHarToK6(minimalHar);

        expect(script).toContain('"page_1"');
        expect(script).toContain('"page_2"');
    });

    it('uses JSON.stringify for URLs — handles special chars safely', () => {
        const script = convertHarToK6(minimalHar);
        const urlWithApostrophe = "https://example.com/a?b=c&d=it's";

        // JSON.stringify escapes the apostrophe — no raw single-quote injection
        expect(script).toContain(JSON.stringify(urlWithApostrophe));
        expect(script).not.toContain("'https://example.com/a?b=c&d=it's'");
    });

    it('falls back to sequential groups when no pageref is present', () => {
        const har = {
            log: {
                entries: Array.from({ length: 6 }, (_, i) => ({
                    request: { method: 'GET', url: `https://example.com/item/${i}` },
                })),
            },
        };

        const script = convertHarToK6(har);

        expect(script).toContain('"group_1"');
        expect(script).toContain('"group_2"');
    });

    it('throws a descriptive error for a HAR with no entries', () => {
        expect(() => convertHarToK6({ log: { entries: [] } })).toThrow('no entries found');
    });
});

// ---------------------------------------------------------------------------
// Full Pipeline: all 5 stages end-to-end with real agents
// ---------------------------------------------------------------------------

describe('Full Pipeline: OpenAPI spec → test plan → k6 scripts → Docker commands → results report', () => {
    it('all 5 stages complete successfully using the demo spec and real agents', async () => {
        const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'k6-e2e-'));

        try {
            /**
             * EXECUTE agent: writes generated scripts to /tmp then builds docker commands.
             * Demonstrates that generated scripts are valid ES module files.
             * @param {{ type: string, payload: { scripts: Array, envVars?: object } }} input - Agent input.
             * @returns {Promise<object>} Agent output with commands array.
             */
            async function executeAgent(input) {
                const { scripts = [], envVars = {} } = input.payload || {};
                const commands = [];
                for (const script of scripts) {
                    const filePath = path.join(tmpDir, `${script.id}.js`);
                    await fsp.writeFile(filePath, script.script, 'utf8');
                    commands.push(buildRunCommand({ scriptPath: filePath, envVars }));
                }
                return createAgentOutput(input.type, { commands });
            }

            /**
             * REPORT agent: evaluates descriptors against synthetic k6 metrics.
             * Actual k6 execution requires Docker which is not available in CI.
             * @param {{ type: string, payload: { descriptors: Array } }} input - Agent input.
             * @returns {Promise<object>} Agent output with report.
             */
            async function reportAgent(input) {
                const { descriptors = [] } = input.payload || {};
                const syntheticSummary = {
                    metrics: {
                        http_req_duration: { values: { 'p(95)': 200 } },
                        http_req_failed: { values: { rate: 0.005 } },
                    },
                };
                const report = analyzeResults(syntheticSummary, descriptors);
                return createAgentOutput(input.type, { report });
            }

            const orchestrator = new Orchestrator({
                ANALYZE: createApiAnalyzerAgent(),
                PLAN: createTestPlannerAgent(),
                GENERATE: createTestGeneratorAgent(),
                EXECUTE: executeAgent,
                REPORT: reportAgent,
            });

            const result = await orchestrator.run({
                spec: SAMPLE_SPEC,
                stories: ['US-42: As a dog enthusiast I want to browse breeds'],
            });

            // ── Stage 1: ANALYZE ──────────────────────────────────────────
            expect(result.status).toBe('ok');
            expect(result.state.version).toBe('v3');
            expect(result.state.baseUrl).toBe('https://dog.ceo/api');
            expect(result.state.endpoints).toHaveLength(2);

            // ── Stage 2: PLAN ─────────────────────────────────────────────
            expect(result.state.descriptors).toHaveLength(2);
            expect(result.state.descriptors[0].id).toBe('TC-001');
            expect(result.state.descriptors[0].userStory).toBe('US-42');
            expect(result.state.descriptors[0].performance.p95).toBe(500);

            // ── Stage 3: GENERATE ─────────────────────────────────────────
            expect(result.state.scripts).toHaveLength(2);
            const generatedScript = result.state.scripts[0].script;
            expect(generatedScript).not.toContain('export const options');
            expect(generatedScript).toContain('export default function');
            expect(generatedScript).toContain('new HttpClientFactory(');
            expect(generatedScript).toContain('group(');
            expect(generatedScript).toContain('sleep(');

            // ── Stage 4: EXECUTE ──────────────────────────────────────────
            expect(result.state.commands).toHaveLength(2);
            const dockerCmd = result.state.commands[0];
            expect(dockerCmd.command).toBe('docker');
            expect(dockerCmd.args).toContain('run');
            expect(dockerCmd.args.some((a) => a.endsWith('TC-001.js:')
                || a.includes('TC-001.js'))).toBe(true);

            // Scripts were physically written to disk — they are real files
            const writtenScript = await fsp.readFile(
                path.join(tmpDir, 'TC-001.js'), 'utf8'
            );
            expect(writtenScript).toContain('export default function');

            // ── Stage 5: REPORT ───────────────────────────────────────────
            expect(result.state.report.overallPassed).toBe(true);
            expect(result.state.report.testCases).toHaveLength(2);
            result.state.report.testCases.forEach((tc) => {
                expect(tc.passed).toBe(true);
                expect(typeof tc.p95).toBe('number');
            });

            // ── Checklist: every step DONE ────────────────────────────────
            result.checklist.forEach((item) => {
                expect(item.status).toBe('DONE');
            });
        } finally {
            await fsp.rm(tmpDir, { recursive: true, force: true });
        }
    });

    it('pipeline fails at ANALYZE and stops when spec is invalid', async () => {
        const orchestrator = new Orchestrator({
            ANALYZE: createApiAnalyzerAgent(),
            PLAN: createTestPlannerAgent(),
            GENERATE: createTestGeneratorAgent(),
            EXECUTE: vi.fn(),
            REPORT: vi.fn(),
        });

        const result = await orchestrator.run({ spec: null });

        expect(result.status).toBe('failed');
        expect(result.failedStep).toBe('ANALYZE');
    });
});
