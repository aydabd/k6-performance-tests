import { describe, it, expect, vi } from 'vitest';
import { TestCase, TestCaseBuilder } from '../../src/test-case.js';
import * as k6 from 'k6';

describe('TestCaseBuilder', () => {
    const validBuilder = () => new TestCaseBuilder('TC-001', 'Login Flow');

    describe('build - missing id throws error', () => {
        it('throws when id is empty', () => {
            expect(() => new TestCaseBuilder('', 'Title').build())
                .toThrow('TestCase id is required');
        });

        it('throws when id is undefined', () => {
            expect(() => new TestCaseBuilder(undefined, 'Title').build())
                .toThrow('TestCase id is required');
        });
    });

    describe('build - missing title throws error', () => {
        it('throws when title is empty', () => {
            expect(() => new TestCaseBuilder('TC-001', '').build())
                .toThrow('TestCase title is required');
        });

        it('throws when title is undefined', () => {
            expect(() => new TestCaseBuilder('TC-001', undefined).build())
                .toThrow('TestCase title is required');
        });
    });

    describe('build - valid input returns test case', () => {
        it('returns a TestCase with id and title only', () => {
            const tc = validBuilder().build();
            expect(tc).toBeInstanceOf(TestCase);
            expect(tc.id).toBe('TC-001');
            expect(tc.title).toBe('Login Flow');
        });

        it('returns a TestCase with all fields set', () => {
            const tc = validBuilder()
                .description('Verify login')
                .prerequisites(['Account exists'])
                .steps(['Navigate', 'Enter credentials', 'Submit'])
                .expectedResults(['Dashboard displayed'])
                .tags({ testType: 'smoke' })
                .externalId('XRAY-123')
                .build();

            expect(tc.description).toBe('Verify login');
            expect(tc.prerequisites).toEqual(['Account exists']);
            expect(tc.steps).toEqual(['Navigate', 'Enter credentials', 'Submit']);
            expect(tc.expectedResults).toEqual(['Dashboard displayed']);
            expect(tc.tags).toEqual({ testType: 'smoke' });
            expect(tc.externalId).toBe('XRAY-123');
        });
    });

    describe('fluent API returns builder for chaining', () => {
        it.each([
            ['description', 'desc'],
            ['prerequisites', ['pre']],
            ['steps', ['step']],
            ['expectedResults', ['result']],
            ['tags', { k: 'v' }],
            ['externalId', 'EXT-1'],
        ])('%s returns the builder', (method, value) => {
            const builder = validBuilder();
            const result = builder[method](value);
            expect(result).toBe(builder);
        });
    });

    describe('build - immutability descriptor not shared', () => {
        it('does not share internal descriptor between built instances', () => {
            const builder = validBuilder().steps(['Step 1']);
            const tc1 = builder.build();
            builder.steps(['Step 2']);
            const tc2 = builder.build();

            expect(tc1.steps).toEqual(['Step 1']);
            expect(tc2.steps).toEqual(['Step 2']);
        });
    });

    describe('build - immutability clones input references', () => {
        it('clones arrays so external mutation does not affect TestCase', () => {
            const steps = ['Step 1', 'Step 2'];
            const tc = validBuilder().steps(steps).build();
            steps.push('Step 3');
            expect(tc.steps).toEqual(['Step 1', 'Step 2']);
        });

        it('clones tags so external mutation does not affect TestCase', () => {
            const tags = { env: 'staging' };
            const tc = validBuilder().tags(tags).build();
            tags.env = 'production';
            tags.extra = 'value';
            expect(tc.tags).toEqual({ env: 'staging' });
        });

        it('freezes the TestCase instance properties', () => {
            const tc = validBuilder().steps(['Step 1']).build();
            expect(() => { tc.steps.push('Step 2'); }).toThrow();
            expect(() => { tc.tags.newKey = 'value'; }).toThrow();
            expect(() => { tc.id = 'NEW-ID'; }).toThrow();
        });
    });
});

describe('TestCase', () => {
    const buildTestCase = (overrides = {}) => {
        const builder = new TestCaseBuilder(
            overrides.id || 'TC-001',
            overrides.title || 'Login Flow'
        );
        if (overrides.description) builder.description(overrides.description);
        if (overrides.prerequisites) builder.prerequisites(overrides.prerequisites);
        if (overrides.steps) builder.steps(overrides.steps);
        if (overrides.expectedResults) builder.expectedResults(overrides.expectedResults);
        if (overrides.tags) builder.tags(overrides.tags);
        if (overrides.externalId) builder.externalId(overrides.externalId);
        return builder.build();
    };

    describe('toK6Group', () => {
        it('executes the function and returns its result', () => {
            const tc = buildTestCase();
            const result = tc.toK6Group(() => 42);
            expect(result).toBe(42);
        });

        it('calls k6 group with [id] title format', () => {
            const groupSpy = vi.spyOn(k6, 'group');
            const tc = buildTestCase();
            const fn = () => 42;
            tc.toK6Group(fn);
            expect(groupSpy).toHaveBeenCalledWith('[TC-001] Login Flow', fn);
            groupSpy.mockRestore();
        });

        it('calls k6 group with title only when id is empty', () => {
            const groupSpy = vi.spyOn(k6, 'group');
            const tc = new TestCase({ id: '', title: 'No ID Test' });
            const fn = () => 99;
            tc.toK6Group(fn);
            expect(groupSpy).toHaveBeenCalledWith('No ID Test', fn);
            groupSpy.mockRestore();
        });
    });

    describe('toSummary', () => {
        it('returns all fields as a JSON-serializable object', () => {
            const tc = buildTestCase({
                description: 'A test',
                prerequisites: ['pre1'],
                steps: ['step1'],
                expectedResults: ['result1'],
                tags: { env: 'staging' },
                externalId: 'EXT-1',
            });

            const summary = tc.toSummary();
            expect(summary).toEqual({
                id: 'TC-001',
                title: 'Login Flow',
                description: 'A test',
                prerequisites: ['pre1'],
                steps: ['step1'],
                expectedResults: ['result1'],
                tags: { env: 'staging' },
                externalId: 'EXT-1',
            });
        });

        it('returns defaults for unset fields', () => {
            const tc = buildTestCase();
            const summary = tc.toSummary();

            expect(summary.description).toBe('');
            expect(summary.prerequisites).toEqual([]);
            expect(summary.steps).toEqual([]);
            expect(summary.expectedResults).toEqual([]);
            expect(summary.tags).toEqual({});
            expect(summary.externalId).toBe('');
        });

        it('is JSON-serializable', () => {
            const tc = buildTestCase({ tags: { k: 'v' } });
            const json = JSON.stringify(tc.toSummary());
            const parsed = JSON.parse(json);
            expect(parsed.id).toBe('TC-001');
            expect(parsed.tags).toEqual({ k: 'v' });
        });
    });
});
