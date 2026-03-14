import { describe, it, expect } from 'vitest';
import { analyzeResults, parseK6Summary, createResultsAnalyzerAgent } from '../../src/agents/results-analyzer.js';

const DESCRIPTORS = [
    {
        id: 'TC-001',
        userStory: 'US-42',
        performance: { p95: 500, errorRate: 0.01 },
    },
    {
        id: 'TC-002',
        userStory: 'US-42',
        performance: { p95: 800, errorRate: 0.05 },
    },
];

const makeSummary = (p95, rate) => ({
    metrics: {
        http_req_duration: { values: { 'p(95)': p95 } },
        http_req_failed: { values: { rate } },
    },
});

describe('analyzeResults - passing', () => {
    it('marks test cases as passed when p95 and errorRate are below thresholds', () => {
        const summary = makeSummary(300, 0.005);
        const { testCases } = analyzeResults(summary, DESCRIPTORS);
        expect(testCases[0].passed).toBe(true);
        expect(testCases[1].passed).toBe(true);
    });

    it('sets overallPassed to true when all pass', () => {
        const { overallPassed } = analyzeResults(makeSummary(200, 0.001), DESCRIPTORS);
        expect(overallPassed).toBe(true);
    });
});

describe('analyzeResults - failing', () => {
    it('marks test case as failed when p95 exceeds threshold', () => {
        const summary = makeSummary(600, 0.005);
        const { testCases } = analyzeResults(summary, DESCRIPTORS);
        expect(testCases[0].passed).toBe(false);
    });

    it('marks test case as failed when errorRate exceeds threshold', () => {
        const summary = makeSummary(300, 0.02);
        const { testCases } = analyzeResults(summary, DESCRIPTORS);
        expect(testCases[0].passed).toBe(false);
    });

    it('sets overallPassed to false when any test case fails', () => {
        const summary = makeSummary(600, 0.005);
        const { overallPassed } = analyzeResults(summary, DESCRIPTORS);
        expect(overallPassed).toBe(false);
    });
});

describe('analyzeResults - output shape', () => {
    it('includes id and userStory in each result', () => {
        const { testCases } = analyzeResults(makeSummary(200, 0.001), DESCRIPTORS);
        expect(testCases[0].id).toBe('TC-001');
        expect(testCases[0].userStory).toBe('US-42');
    });

    it('includes actual p95 and errorRate values', () => {
        const { testCases } = analyzeResults(makeSummary(350, 0.008), DESCRIPTORS);
        expect(testCases[0].p95).toBe(350);
        expect(testCases[0].errorRate).toBe(0.008);
    });

    it('returns overallPassed false for empty descriptors', () => {
        const { overallPassed } = analyzeResults(makeSummary(200, 0.001), []);
        expect(overallPassed).toBe(false);
    });
});

describe('parseK6Summary', () => {
    it('parses valid JSON string', () => {
        const json = JSON.stringify(makeSummary(200, 0.001));
        const parsed = parseK6Summary(json);
        expect(parsed.metrics).toBeDefined();
    });

    it('throws on invalid JSON', () => {
        expect(() => parseK6Summary('not-json')).toThrow('Invalid k6 summary');
    });

    it('throws on missing metrics', () => {
        expect(() => parseK6Summary('{"foo": 1}')).toThrow('Invalid k6 summary: missing metrics');
    });

    it('throws on non-object', () => {
        expect(() => parseK6Summary('"string"')).toThrow('Invalid k6 summary');
    });
});

describe('createResultsAnalyzerAgent', () => {
    it('returns ok output with report', async () => {
        const agent = createResultsAnalyzerAgent();
        const output = await agent({
            type: 'REPORT',
            payload: { summary: makeSummary(200, 0.001), descriptors: DESCRIPTORS },
            context: {},
        });
        expect(output.status).toBe('ok');
        expect(output.payload.report).toBeDefined();
        expect(output.payload.report.overallPassed).toBe(true);
    });

    it('accepts summary as JSON string', async () => {
        const agent = createResultsAnalyzerAgent();
        const output = await agent({
            type: 'REPORT',
            payload: {
                summary: JSON.stringify(makeSummary(200, 0.001)),
                descriptors: DESCRIPTORS,
            },
            context: {},
        });
        expect(output.status).toBe('ok');
    });

    it('returns error for invalid summary string', async () => {
        const agent = createResultsAnalyzerAgent();
        const output = await agent({
            type: 'REPORT',
            payload: { summary: 'bad json', descriptors: [] },
            context: {},
        });
        expect(output.status).toBe('error');
    });
});
