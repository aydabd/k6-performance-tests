import { describe, it, expect, vi } from 'vitest';
import { Orchestrator, StepStatus, createAgentOutput, createAgentError } from '../../src/agents/agent-framework.js';
import { parseAuthConfig, buildAuthCode } from '../../src/agents/auth-loader.js';
import { analyzeResults } from '../../src/agents/results-analyzer.js';

const PIPELINE_STEPS = ['ANALYZE', 'PLAN', 'GENERATE', 'EXECUTE', 'REPORT'];

/**
 * Build a full set of mock agents that succeed and record call order.
 * @param {string[]} order - Array to push step names into on each call.
 * @returns {{[key: string]: (input: object) => Promise<object>}} Agent map.
 */
function buildMockAgents(order) {
    return Object.fromEntries(
        PIPELINE_STEPS.map((step) => [
            step,
            vi.fn(async (input) => {
                order.push(step);
                return createAgentOutput(input.type, { [`${step.toLowerCase()}Done`]: true });
            }),
        ])
    );
}

describe('Orchestrator - full pipeline state transitions', () => {
    it('all 5 steps reach DONE status', async () => {
        const agents = buildMockAgents([]);
        const orch = new Orchestrator(agents);
        await orch.run({ spec: {} });
        const checklist = orch.getChecklist();
        checklist.forEach((item) => {
            expect(item.status).toBe(StepStatus.DONE);
        });
    });

    it('returns status ok when all steps succeed', async () => {
        const agents = buildMockAgents([]);
        const orch = new Orchestrator(agents);
        const result = await orch.run({});
        expect(result.status).toBe('ok');
    });

    it('accumulates payload from all agents into state', async () => {
        const agents = buildMockAgents([]);
        const orch = new Orchestrator(agents);
        const result = await orch.run({});
        expect(result.state.analyzeDone).toBe(true);
        expect(result.state.planDone).toBe(true);
        expect(result.state.generateDone).toBe(true);
        expect(result.state.executeDone).toBe(true);
        expect(result.state.reportDone).toBe(true);
    });
});

describe('Orchestrator - agent dispatch sequence', () => {
    it('calls agents in correct order: ANALYZE → PLAN → GENERATE → EXECUTE → REPORT', async () => {
        const order = [];
        const agents = buildMockAgents(order);
        const orch = new Orchestrator(agents);
        await orch.run({});
        expect(order).toEqual(PIPELINE_STEPS);
    });

    it('passes pipeline state from previous step to next agent input payload', async () => {
        const receivedPayloads = {};
        const agents = Object.fromEntries(
            PIPELINE_STEPS.map((step) => [
                step,
                async (input) => {
                    receivedPayloads[step] = { ...input.payload };
                    return createAgentOutput(input.type, { [`${step}`]: 'done' });
                },
            ])
        );
        const orch = new Orchestrator(agents);
        await orch.run({});
        expect(receivedPayloads.PLAN.ANALYZE).toBe('done');
        expect(receivedPayloads.GENERATE.PLAN).toBe('done');
    });
});

describe('Orchestrator - failed pipeline', () => {
    it('returns failed status when agent exhausts retries', async () => {
        const agents = {
            ...buildMockAgents([]),
            PLAN: async (input) => createAgentError(input.type, 'plan failed'),
        };
        const orch = new Orchestrator(agents);
        const result = await orch.run({});
        expect(result.status).toBe('failed');
        expect(result.failedStep).toBe('PLAN');
    });

    it('stops pipeline at the failed step', async () => {
        const order = [];
        const generateSpy = vi.fn(async (input) => {
            order.push('GENERATE');
            return createAgentOutput(input.type, {});
        });
        const agents = {
            ANALYZE: async (input) => createAgentOutput(input.type, {}),
            PLAN: async (input) => createAgentError(input.type, 'broken'),
            GENERATE: generateSpy,
            EXECUTE: async (input) => createAgentOutput(input.type, {}),
            REPORT: async (input) => createAgentOutput(input.type, {}),
        };
        const orch = new Orchestrator(agents);
        await orch.run({});
        expect(generateSpy).not.toHaveBeenCalled();
    });
});

describe('Auth instructions parsing - all auth types', () => {
    const cases = [
        ['jwt', 'auth:\n  type: jwt\n  loginUrl: https://example.com\n'],
        ['basic', 'auth:\n  type: basic\n  username: user\n'],
        ['bearer', 'auth:\n  type: bearer\n  token: tok\n'],
        ['apiKey', 'auth:\n  type: apiKey\n  header: X-Key\n'],
        ['oauth2', 'auth:\n  type: oauth2\n  tokenUrl: https://example.com\n'],
    ];

    cases.forEach(([type, yaml]) => {
        it(`parseAuthConfig correctly identifies type: ${type}`, () => {
            const config = parseAuthConfig(yaml);
            expect(config.type).toBe(type);
        });

        it(`buildAuthCode for ${type} returns Authenticator code`, () => {
            const config = parseAuthConfig(yaml);
            const code = buildAuthCode(config);
            expect(code).toContain('new Authenticator(');
        });
    });
});

describe('Report generation from synthetic results', () => {
    const DESCRIPTORS = [
        { id: 'TC-001', userStory: 'US-42', performance: { p95: 500, errorRate: 0.01 } },
        { id: 'TC-002', userStory: 'US-42', performance: { p95: 800, errorRate: 0.05 } },
    ];

    it('generates passed report when metrics are within thresholds', () => {
        const summary = {
            metrics: {
                http_req_duration: { values: { 'p(95)': 200 } },
                http_req_failed: { values: { rate: 0.001 } },
            },
        };
        const report = analyzeResults(summary, DESCRIPTORS);
        expect(report.overallPassed).toBe(true);
        expect(report.testCases).toHaveLength(2);
    });

    it('generates failed report when p95 exceeds threshold', () => {
        const summary = {
            metrics: {
                http_req_duration: { values: { 'p(95)': 600 } },
                http_req_failed: { values: { rate: 0.001 } },
            },
        };
        const report = analyzeResults(summary, DESCRIPTORS);
        expect(report.overallPassed).toBe(false);
        expect(report.testCases[0].passed).toBe(false);
    });

    it('report testCase shape is correct', () => {
        const summary = {
            metrics: {
                http_req_duration: { values: { 'p(95)': 100 } },
                http_req_failed: { values: { rate: 0.001 } },
            },
        };
        const report = analyzeResults(summary, DESCRIPTORS);
        const tc = report.testCases[0];
        expect(tc.id).toBe('TC-001');
        expect(tc.userStory).toBe('US-42');
        expect(typeof tc.passed).toBe('boolean');
        expect(typeof tc.p95).toBe('number');
        expect(typeof tc.errorRate).toBe('number');
    });
});
