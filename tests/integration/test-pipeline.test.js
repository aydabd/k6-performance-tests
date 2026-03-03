/**
 * Integration tests for the end-to-end test pipeline.
 * Tests cross-module workflows: TestCase → Reporters → SummaryHandler.
 */
import { describe, it, expect } from 'vitest';
import { TestCaseBuilder } from '../../src/test-case.js';
import { XrayReporter } from '../../src/reporters/xray-reporter.js';
import { JUnitReporter } from '../../src/reporters/junit-reporter.js';
import { SummaryHandler } from '../../src/summary-handler.js';
import { ScenarioRunner } from '../../src/scenario-runner.js';

const createK6Results = (passed = true) => ({
    metrics: {
        http_req_duration: {
            values: { avg: passed ? 100 : 800 },
            thresholds: { 'p(95)<500': { ok: passed } },
        },
    },
    state: {
        testRunDurationMs: 15000,
    },
});

describe('TestCase → XrayReporter pipeline', () => {
    it('formats TestCase summaries as Xray import JSON', () => {
        const tc1 = new TestCaseBuilder('TC-001', 'Login')
            .steps(['Navigate', 'Enter credentials', 'Submit'])
            .externalId('XRAY-001')
            .build();
        const tc2 = new TestCaseBuilder('TC-002', 'Search')
            .externalId('XRAY-002')
            .build();

        const summaries = [tc1.toSummary(), tc2.toSummary()];
        const report = XrayReporter.format(summaries, createK6Results());

        expect(report.tests).toHaveLength(2);
        expect(report.tests[0].testKey).toBe('XRAY-001');
        expect(report.tests[0].status).toBe('PASSED');
        expect(report.tests[0].steps).toHaveLength(3);
        expect(report.tests[1].testKey).toBe('XRAY-002');
    });

    it('marks all tests as FAILED when thresholds are breached', () => {
        const tc = new TestCaseBuilder('TC-003', 'Checkout')
            .externalId('XRAY-003')
            .build();

        const report = XrayReporter.format([tc.toSummary()], createK6Results(false));

        expect(report.tests[0].status).toBe('FAILED');
    });

    it('produces valid JSON string through toJSON', () => {
        const tc = new TestCaseBuilder('TC-004', 'Profile')
            .externalId('XRAY-004')
            .tags({ testType: 'smoke' })
            .build();

        const json = XrayReporter.toJSON([tc.toSummary()], createK6Results());
        const parsed = JSON.parse(json);

        expect(parsed.tests[0].testKey).toBe('XRAY-004');
        expect(parsed.tests[0].comment).toBe('Profile');
    });
});

describe('TestCase → JUnitReporter pipeline', () => {
    it('formats TestCase summaries as JUnit XML', () => {
        const tc1 = new TestCaseBuilder('TC-010', 'Login Flow')
            .externalId('EXT-010')
            .build();
        const tc2 = new TestCaseBuilder('TC-011', 'Dashboard')
            .externalId('EXT-011')
            .build();

        const xml = JUnitReporter.format(
            [tc1.toSummary(), tc2.toSummary()],
            createK6Results(),
            { suiteName: 'Integration Suite' }
        );

        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('name="Integration Suite"');
        expect(xml).toContain('[EXT-010] Login Flow');
        expect(xml).toContain('[EXT-011] Dashboard');
        expect(xml).toContain('failures="0"');
    });

    it('includes failure elements when thresholds are breached', () => {
        const tc = new TestCaseBuilder('TC-012', 'Slow Endpoint')
            .externalId('EXT-012')
            .build();

        const xml = JUnitReporter.format([tc.toSummary()], createK6Results(false));

        expect(xml).toContain('<failure');
        expect(xml).toContain('failures="1"');
    });
});

describe('SummaryHandler with real metrics', () => {
    it('generates JSON output with extracted metrics', () => {
        const json = SummaryHandler.toJSON(createK6Results(), {
            testRunId: 'run-001',
            businessFlow: 'checkout',
        });
        const parsed = JSON.parse(json);

        expect(parsed.metadata.testRunId).toBe('run-001');
        expect(parsed.metadata.businessFlow).toBe('checkout');
        expect(parsed.metrics.http_req_duration.avg).toBe(100);
        expect(parsed.metrics.duration).toBe(15);
    });

    it('generates JUnit XML output with threshold-based test cases', () => {
        const xml = SummaryHandler.toJUnitXML(createK6Results(), 'My Suite');

        expect(xml).toContain('name="My Suite"');
        expect(xml).toContain('http_req_duration');
        expect(xml).toContain('failures="0"');
    });

    it('reports failures in JUnit XML when thresholds breached', () => {
        const xml = SummaryHandler.toJUnitXML(createK6Results(false), 'Fail Suite');

        expect(xml).toContain('failures="1"');
        expect(xml).toContain('<failure');
    });

    it('handleSummary returns both JSON and JUnit outputs', () => {
        const result = SummaryHandler.handleSummary(createK6Results(), {
            jsonPath: 'results/summary.json',
            junitPath: 'results/junit.xml',
            testRunId: 'run-002',
            businessFlow: 'search-flow',
            suiteName: 'Full Suite',
        });

        expect(result['results/summary.json']).toBeTruthy();
        expect(result['results/junit.xml']).toBeTruthy();

        const parsed = JSON.parse(result['results/summary.json']);
        expect(parsed.metadata.testRunId).toBe('run-002');
        expect(parsed.metadata.businessFlow).toBe('search-flow');

        expect(result['results/junit.xml']).toContain('name="Full Suite"');
    });
});

describe('ScenarioRunner full lifecycle', () => {
    it('runs setup → exec → teardown for multiple scenarios', () => {
        const runner = new ScenarioRunner();
        const log = [];

        runner.register('auth', {
            setup: () => {
                log.push('auth:setup');
                return { token: 'jwt-abc' };
            },
            exec: (data) => {
                log.push(`auth:exec:${data.token}`);
            },
            teardown: (data) => {
                log.push(`auth:teardown:${data.token}`);
            },
        });

        runner.register('search', {
            setup: () => {
                log.push('search:setup');
                return { query: 'k6' };
            },
            exec: (data) => {
                log.push(`search:exec:${data.query}`);
            },
            teardown: (data) => {
                log.push(`search:teardown:${data.query}`);
            },
        });

        const data = runner.setupAll();
        expect(log).toEqual(['auth:setup', 'search:setup']);

        runner.exec('auth', data);
        runner.exec('search', data);
        expect(log).toEqual([
            'auth:setup', 'search:setup',
            'auth:exec:jwt-abc', 'search:exec:k6',
        ]);

        runner.teardownAll(data);
        expect(log).toEqual([
            'auth:setup', 'search:setup',
            'auth:exec:jwt-abc', 'search:exec:k6',
            'auth:teardown:jwt-abc', 'search:teardown:k6',
        ]);
    });
});

describe('TestCase → ScenarioRunner → Reporters end-to-end', () => {
    it('wires test cases through scenario execution to reporter output', () => {
        const testCases = [
            new TestCaseBuilder('TC-E2E-1', 'Login')
                .steps(['Navigate', 'Enter credentials'])
                .externalId('XRAY-E2E-1')
                .build(),
            new TestCaseBuilder('TC-E2E-2', 'Search')
                .externalId('XRAY-E2E-2')
                .build(),
        ];

        const runner = new ScenarioRunner();
        const executionLog = [];

        runner.register('login-scenario', {
            setup: () => ({ token: 'test-token' }),
            exec: (data) => {
                executionLog.push({ scenario: 'login', token: data.token });
                testCases[0].toK6Group(() => 'login-result');
            },
        });

        runner.register('search-scenario', {
            exec: () => {
                executionLog.push({ scenario: 'search' });
                testCases[1].toK6Group(() => 'search-result');
            },
        });

        const setupData = runner.setupAll();
        runner.exec('login-scenario', setupData);
        runner.exec('search-scenario', setupData);

        expect(executionLog).toHaveLength(2);
        expect(executionLog[0].token).toBe('test-token');

        const summaries = testCases.map(tc => tc.toSummary());
        const results = createK6Results();

        const xrayReport = XrayReporter.format(summaries, results, {
            testPlanKey: 'PLAN-1',
            testEnvironment: 'integration',
        });
        expect(xrayReport.tests).toHaveLength(2);
        expect(xrayReport.testPlanKey).toBe('PLAN-1');
        expect(xrayReport.tests[0].steps).toHaveLength(2);

        const junitXml = JUnitReporter.format(summaries, results, {
            suiteName: 'E2E Suite',
        });
        expect(junitXml).toContain('[XRAY-E2E-1] Login');
        expect(junitXml).toContain('[XRAY-E2E-2] Search');
        expect(junitXml).toContain('failures="0"');

        runner.teardownAll(setupData);
    });
});
