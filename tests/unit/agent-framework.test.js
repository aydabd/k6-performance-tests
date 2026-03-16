import { describe, it, expect, vi } from 'vitest';
import {
    AgentMessageType,
    StepStatus,
    MAX_RETRIES,
    createAgentInput,
    createAgentOutput,
    createAgentError,
    Orchestrator,
} from '../../src/agents/agent-framework.js';

describe('AgentMessageType', () => {
    it('has expected keys', () => {
        expect(AgentMessageType.ANALYZE).toBe('ANALYZE');
        expect(AgentMessageType.PLAN).toBe('PLAN');
        expect(AgentMessageType.GENERATE).toBe('GENERATE');
        expect(AgentMessageType.EXECUTE).toBe('EXECUTE');
        expect(AgentMessageType.REPORT).toBe('REPORT');
    });

    it('is frozen', () => {
        expect(() => { AgentMessageType.EXTRA = 'X'; }).toThrow();
    });
});

describe('StepStatus', () => {
    it('has expected keys', () => {
        expect(StepStatus.PENDING).toBe('PENDING');
        expect(StepStatus.IN_PROGRESS).toBe('IN_PROGRESS');
        expect(StepStatus.DONE).toBe('DONE');
        expect(StepStatus.FAILED).toBe('FAILED');
    });

    it('is frozen', () => {
        expect(() => { StepStatus.EXTRA = 'X'; }).toThrow();
    });
});

describe('MAX_RETRIES', () => {
    it('equals 3', () => {
        expect(MAX_RETRIES).toBe(3);
    });
});

describe('createAgentInput', () => {
    it('returns correct shape', () => {
        const input = createAgentInput('ANALYZE', { spec: {} }, { foo: 1 });
        expect(input).toEqual({ type: 'ANALYZE', payload: { spec: {} }, context: { foo: 1 } });
    });
});

describe('createAgentOutput', () => {
    it('returns correct shape with default status', () => {
        const out = createAgentOutput('PLAN', { descriptors: [] });
        expect(out).toEqual({ type: 'PLAN', payload: { descriptors: [] }, status: 'ok' });
    });

    it('accepts custom status', () => {
        const out = createAgentOutput('PLAN', {}, 'partial');
        expect(out.status).toBe('partial');
    });
});

describe('createAgentError', () => {
    it('returns correct shape from Error', () => {
        const err = createAgentError('ANALYZE', new Error('boom'), { key: 'val' });
        expect(err).toEqual({
            type: 'ANALYZE',
            payload: null,
            status: 'error',
            error: 'boom',
            context: { key: 'val' },
        });
    });

    it('accepts string error', () => {
        const err = createAgentError('PLAN', 'bad thing');
        expect(err.error).toBe('bad thing');
        expect(err.status).toBe('error');
    });

    it('defaults context to empty object', () => {
        const err = createAgentError('PLAN', 'err');
        expect(err.context).toEqual({});
    });
});

describe('Orchestrator.getChecklist', () => {
    it('returns 5 steps in pipeline order', () => {
        const orch = new Orchestrator();
        const cl = orch.getChecklist();
        expect(cl.map((i) => i.step)).toEqual([
            'ANALYZE', 'PLAN', 'GENERATE', 'EXECUTE', 'REPORT',
        ]);
    });

    it('all start as PENDING', () => {
        const orch = new Orchestrator();
        orch.getChecklist().forEach((item) => expect(item.status).toBe('PENDING'));
    });

    it('returns a copy — mutation does not affect internal state', () => {
        const orch = new Orchestrator();
        const cl = orch.getChecklist();
        cl[0].status = 'MUTATED';
        expect(orch.getChecklist()[0].status).toBe('PENDING');
    });
});

describe('Orchestrator.run - success path', () => {
    it('dispatches to all 5 agents in order and returns ok', async () => {
        const order = [];
        const makeAgent = (name) => vi.fn(async (input) => {
            order.push(name);
            return createAgentOutput(input.type, { [name]: true });
        });
        const agents = {
            ANALYZE: makeAgent('ANALYZE'),
            PLAN: makeAgent('PLAN'),
            GENERATE: makeAgent('GENERATE'),
            EXECUTE: makeAgent('EXECUTE'),
            REPORT: makeAgent('REPORT'),
        };
        const orch = new Orchestrator(agents);
        const result = await orch.run({});
        expect(result.status).toBe('ok');
        expect(order).toEqual(['ANALYZE', 'PLAN', 'GENERATE', 'EXECUTE', 'REPORT']);
    });

    it('merges each agent output payload into shared state', async () => {
        const agents = {
            ANALYZE: async (input) => createAgentOutput(input.type, { endpoints: [1] }),
            PLAN: async (input) => createAgentOutput(input.type, { descriptors: [2] }),
            GENERATE: async (input) => createAgentOutput(input.type, { scripts: [3] }),
            EXECUTE: async (input) => createAgentOutput(input.type, { executed: true }),
            REPORT: async (input) => createAgentOutput(input.type, { report: 'done' }),
        };
        const orch = new Orchestrator(agents);
        const result = await orch.run({});
        expect(result.state.endpoints).toEqual([1]);
        expect(result.state.descriptors).toEqual([2]);
        expect(result.state.report).toBe('done');
    });

    it('marks all checklist items as DONE', async () => {
        const okAgent = async (input) => createAgentOutput(input.type, {});
        const agents = Object.fromEntries(
            ['ANALYZE', 'PLAN', 'GENERATE', 'EXECUTE', 'REPORT'].map((s) => [s, okAgent])
        );
        const orch = new Orchestrator(agents);
        await orch.run({});
        orch.getChecklist().forEach((item) => expect(item.status).toBe('DONE'));
    });
});

describe('Orchestrator.run - retry logic', () => {
    it('retries a failing agent and succeeds on 3rd attempt', async () => {
        let calls = 0;
        const flakyAgent = async (input) => {
            calls += 1;
            if (calls < 3) return createAgentError(input.type, 'transient');
            return createAgentOutput(input.type, {});
        };
        const okAgent = async (input) => createAgentOutput(input.type, {});
        const agents = {
            ANALYZE: flakyAgent,
            PLAN: okAgent,
            GENERATE: okAgent,
            EXECUTE: okAgent,
            REPORT: okAgent,
        };
        const orch = new Orchestrator(agents);
        const result = await orch.run({});
        expect(result.status).toBe('ok');
        expect(calls).toBe(3);
        const analyzeItem = orch.getChecklist().find((i) => i.step === 'ANALYZE');
        expect(analyzeItem.status).toBe('DONE');
        expect(analyzeItem.attempts).toBe(3);
    });

    it('returns failed when agent always errors (exhausts retries)', async () => {
        const alwaysFail = async (input) => createAgentError(input.type, 'permanent failure');
        const orch = new Orchestrator({ ANALYZE: alwaysFail }, { maxRetries: 3 });
        const result = await orch.run({});
        expect(result.status).toBe('failed');
        expect(result.failedStep).toBe('ANALYZE');
        expect(result.error).toBe('permanent failure');
    });

    it('marks failed step as FAILED in checklist', async () => {
        const alwaysFail = async (input) => createAgentError(input.type, 'err');
        const orch = new Orchestrator({ ANALYZE: alwaysFail });
        await orch.run({});
        const item = orch.getChecklist().find((i) => i.step === 'ANALYZE');
        expect(item.status).toBe('FAILED');
        expect(item.attempts).toBe(MAX_RETRIES);
    });
});

describe('Orchestrator.run - missing agent', () => {
    it('returns failed when no agent is registered for a step', async () => {
        const orch = new Orchestrator({});
        const result = await orch.run({});
        expect(result.status).toBe('failed');
        expect(result.failedStep).toBe('ANALYZE');
        expect(result.error).toMatch(/No agent registered/);
    });
});
