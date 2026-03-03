import { describe, it, expect } from 'vitest';
import { SummaryHandler } from '../../src/summary-handler.js';

const createSummaryData = (overrides = {}) => ({
    metrics: {
        http_req_duration: {
            values: { avg: 150, min: 50, max: 300, p90: 250, p95: 280 },
            thresholds: overrides.thresholds || {
                'p(95)<500': { ok: true },
            },
        },
        http_req_failed: {
            values: { rate: 0.01 },
            thresholds: {
                'rate<0.1': { ok: true },
            },
        },
        ...overrides.extraMetrics,
    },
    state: {
        testRunDurationMs: overrides.durationMs || 5000,
    },
});

describe('SummaryHandler', () => {
    describe('toJSON', () => {
        it('returns valid JSON string with metrics', () => {
            const data = createSummaryData();
            const json = SummaryHandler.toJSON(data);
            const parsed = JSON.parse(json);
            expect(parsed.metrics.http_req_duration).toEqual({
                avg: 150, min: 50, max: 300, p90: 250, p95: 280,
            });
        });

        it('includes metadata when provided', () => {
            const data = createSummaryData();
            const json = SummaryHandler.toJSON(data, {
                testRunId: 'run-123',
                businessFlow: 'checkout',
            });
            const parsed = JSON.parse(json);
            expect(parsed.metadata.testRunId).toBe('run-123');
            expect(parsed.metadata.businessFlow).toBe('checkout');
        });

        it('includes timestamp in metadata', () => {
            const data = createSummaryData();
            const json = SummaryHandler.toJSON(data);
            const parsed = JSON.parse(json);
            expect(parsed.metadata.timestamp).toBeTruthy();
        });

        it('returns empty metrics for null data', () => {
            const json = SummaryHandler.toJSON(null);
            const parsed = JSON.parse(json);
            expect(parsed.metrics).toEqual({});
        });

        it('includes duration from state', () => {
            const data = createSummaryData({ durationMs: 10000 });
            const json = SummaryHandler.toJSON(data);
            const parsed = JSON.parse(json);
            expect(parsed.metrics.duration).toBe(10);
        });
    });

    describe('toJUnitXML', () => {
        it('returns valid XML with header', () => {
            const data = createSummaryData();
            const xml = SummaryHandler.toJUnitXML(data);
            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<testsuites>');
            expect(xml).toContain('</testsuites>');
        });

        it('includes custom suite name', () => {
            const data = createSummaryData();
            const xml = SummaryHandler.toJUnitXML(data, 'My Suite');
            expect(xml).toContain('name="My Suite"');
        });

        it('creates test cases from thresholds', () => {
            const data = createSummaryData();
            const xml = SummaryHandler.toJUnitXML(data);
            expect(xml).toContain('http_req_duration: p(95)&lt;500');
        });

        it('marks failures for breached thresholds', () => {
            const data = createSummaryData({
                thresholds: { 'p(95)<500': { ok: false } },
            });
            const xml = SummaryHandler.toJUnitXML(data);
            expect(xml).toContain('<failure');
            expect(xml).toContain('failures="1"');
        });

        it('reports zero failures for passing thresholds', () => {
            const data = createSummaryData();
            const xml = SummaryHandler.toJUnitXML(data);
            expect(xml).toContain('failures="0"');
        });

        it('creates fallback test case when no thresholds exist', () => {
            const data = { metrics: {} };
            const xml = SummaryHandler.toJUnitXML(data);
            expect(xml).toContain('k6 test run');
        });

        it('escapes XML special characters in suite name', () => {
            const data = createSummaryData();
            const xml = SummaryHandler.toJUnitXML(data, 'Test <&> "Suite"');
            expect(xml).toContain('Test &lt;&amp;&gt; &quot;Suite&quot;');
        });
    });

    describe('handleSummary', () => {
        it('returns empty object when no paths configured', () => {
            const data = createSummaryData();
            const result = SummaryHandler.handleSummary(data);
            expect(result).toEqual({});
        });

        it('includes JSON output when jsonPath specified', () => {
            const data = createSummaryData();
            const result = SummaryHandler.handleSummary(data, {
                jsonPath: 'results/summary.json',
            });
            expect(result['results/summary.json']).toBeTruthy();
            const parsed = JSON.parse(result['results/summary.json']);
            expect(parsed.metrics).toBeTruthy();
        });

        it('includes JUnit XML output when junitPath specified', () => {
            const data = createSummaryData();
            const result = SummaryHandler.handleSummary(data, {
                junitPath: 'results/junit.xml',
            });
            expect(result['results/junit.xml']).toContain('<?xml');
        });

        it('includes both outputs when both paths specified', () => {
            const data = createSummaryData();
            const result = SummaryHandler.handleSummary(data, {
                jsonPath: 'results/summary.json',
                junitPath: 'results/junit.xml',
            });
            expect(Object.keys(result)).toHaveLength(2);
        });

        it('passes metadata to JSON output', () => {
            const data = createSummaryData();
            const result = SummaryHandler.handleSummary(data, {
                jsonPath: 'out.json',
                testRunId: 'run-456',
                businessFlow: 'login',
            });
            const parsed = JSON.parse(result['out.json']);
            expect(parsed.metadata.testRunId).toBe('run-456');
            expect(parsed.metadata.businessFlow).toBe('login');
        });
    });

    describe('_extractThresholds', () => {
        it('returns empty array for null data', () => {
            const result = SummaryHandler._extractThresholds(null);
            expect(result).toEqual([]);
        });

        it('returns empty array when no thresholds exist', () => {
            const result = SummaryHandler._extractThresholds({ metrics: {} });
            expect(result).toEqual([]);
        });
    });

    describe('_escapeXml', () => {
        it('escapes all XML special characters', () => {
            const result = SummaryHandler._escapeXml('a<b>c&d"e\'f');
            expect(result).toBe('a&lt;b&gt;c&amp;d&quot;e&apos;f');
        });
    });
});
