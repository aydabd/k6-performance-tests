import { describe, it, expect } from 'vitest';
import { XrayReporter } from '../../src/reporters/xray-reporter.js';
import { JUnitReporter } from '../../src/reporters/junit-reporter.js';

const createPassingResults = () => ({
    metrics: {
        http_req_duration: {
            values: { avg: 150 },
            thresholds: { 'p(95)<500': { ok: true } },
        },
    },
});

const createFailingResults = () => ({
    metrics: {
        http_req_duration: {
            values: { avg: 600 },
            thresholds: { 'p(95)<500': { ok: false } },
        },
    },
});

const createTestCases = () => [
    { externalId: 'PROJ-101', title: 'Login flow' },
    { externalId: 'PROJ-102', title: 'Search products' },
];

describe('XrayReporter', () => {
    describe('format', () => {
        it('returns tests array with testKey and status', () => {
            const report = XrayReporter.format(createTestCases(), createPassingResults());

            expect(report.tests).toHaveLength(2);
            expect(report.tests[0].testKey).toBe('PROJ-101');
            expect(report.tests[0].status).toBe('PASSED');
            expect(report.tests[1].testKey).toBe('PROJ-102');
        });

        it('includes steps when testCase has steps', () => {
            const cases = [
                { externalId: 'PROJ-201', title: 'Checkout', steps: ['Add to cart', 'Enter payment', 'Confirm'] },
            ];
            const report = XrayReporter.format(cases, createPassingResults());

            expect(report.tests[0].steps).toHaveLength(3);
            expect(report.tests[0].steps[0]).toEqual({ status: 'PASSED', comment: 'Add to cart' });
            expect(report.tests[0].steps[2]).toEqual({ status: 'PASSED', comment: 'Confirm' });
        });

        it('adds testPlanKey when provided', () => {
            const report = XrayReporter.format(createTestCases(), {}, { testPlanKey: 'PLAN-1' });

            expect(report.testPlanKey).toBe('PLAN-1');
        });

        it('adds environment and revision info', () => {
            const report = XrayReporter.format(createTestCases(), {}, {
                testEnvironment: 'staging',
                revision: 'abc123',
            });

            expect(report.info.environment).toBe('staging');
            expect(report.info.revision).toBe('abc123');
        });

        it('handles empty testCases array', () => {
            const report = XrayReporter.format([], createPassingResults());

            expect(report.tests).toEqual([]);
        });

        it('handles null testCases', () => {
            const report = XrayReporter.format(null, createPassingResults());

            expect(report.tests).toEqual([]);
        });
    });

    describe('toJSON', () => {
        it('returns valid JSON string', () => {
            const json = XrayReporter.toJSON(createTestCases(), createPassingResults());
            const parsed = JSON.parse(json);

            expect(parsed.tests).toHaveLength(2);
            expect(parsed.tests[0].testKey).toBe('PROJ-101');
        });
    });

    describe('_determineStatus', () => {
        it('returns PASSED when no threshold breaches', () => {
            const status = XrayReporter._determineStatus({}, createPassingResults());

            expect(status).toBe('PASSED');
        });

        it('returns FAILED when threshold breached', () => {
            const status = XrayReporter._determineStatus({}, createFailingResults());

            expect(status).toBe('FAILED');
        });

        it('returns TODO when no results', () => {
            expect(XrayReporter._determineStatus({}, null)).toBe('TODO');
            expect(XrayReporter._determineStatus({}, {})).toBe('TODO');
        });
    });
});

describe('JUnitReporter', () => {
    describe('format', () => {
        it('returns valid XML with header', () => {
            const xml = JUnitReporter.format(createTestCases(), createPassingResults());

            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<testsuites>');
            expect(xml).toContain('</testsuites>');
        });

        it('includes custom suite name', () => {
            const xml = JUnitReporter.format(createTestCases(), {}, { suiteName: 'My Suite' });

            expect(xml).toContain('name="My Suite"');
        });

        it('creates testcases from test case descriptors', () => {
            const xml = JUnitReporter.format(createTestCases(), createPassingResults());

            expect(xml).toContain('<testcase name="[PROJ-101] Login flow"');
            expect(xml).toContain('<testcase name="[PROJ-102] Search products"');
        });

        it('marks failures for breached thresholds', () => {
            const xml = JUnitReporter.format(createTestCases(), createFailingResults());

            expect(xml).toContain('<failure message="Performance threshold breached">');
            expect(xml).toContain('failures="2"');
        });

        it('reports zero failures for passing thresholds', () => {
            const xml = JUnitReporter.format(createTestCases(), createPassingResults());

            expect(xml).toContain('failures="0"');
            expect(xml).not.toContain('<failure');
        });

        it('creates fallback testcase when no test cases provided', () => {
            const xml = JUnitReporter.format([], {}, { duration: 30 });

            expect(xml).toContain('name="k6 test run"');
            expect(xml).toContain('time="30"');
        });

        it('includes externalId in test case name', () => {
            const cases = [{ externalId: 'EXT-5', title: 'My test' }];
            const xml = JUnitReporter.format(cases, createPassingResults());

            expect(xml).toContain('[EXT-5] My test');
        });

        it('escapes XML special characters', () => {
            const cases = [{ title: 'Test <with> "special" & \'chars\'' }];
            const xml = JUnitReporter.format(cases, createPassingResults());

            expect(xml).toContain('&lt;with&gt;');
            expect(xml).toContain('&quot;special&quot;');
            expect(xml).toContain('&amp;');
            expect(xml).toContain('&apos;chars&apos;');
        });
    });

    describe('_isPassed', () => {
        it('returns true when no thresholds exist', () => {
            expect(JUnitReporter._isPassed({})).toBe(true);
            expect(JUnitReporter._isPassed(null)).toBe(true);
            expect(JUnitReporter._isPassed({ metrics: {} })).toBe(true);
        });

        it('returns false when threshold breached', () => {
            expect(JUnitReporter._isPassed(createFailingResults())).toBe(false);
        });
    });
});
