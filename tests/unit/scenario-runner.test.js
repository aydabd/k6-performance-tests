import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScenarioRunner } from '../../src/scenario-runner.js';

describe('ScenarioRunner', () => {
    let runner;

    beforeEach(() => {
        runner = new ScenarioRunner();
    });

    const noop = () => {};
    const registerScenario = (name = 'test-scenario', overrides = {}) => {
        return runner.register(name, {
            exec: overrides.exec || noop,
            setup: overrides.setup,
            teardown: overrides.teardown,
        });
    };

    describe('register', () => {
        it.each([
            ['empty string', ''],
            ['null', null],
            ['undefined', undefined],
        ])('throws when name is %s', (_label, name) => {
            expect(() => runner.register(name, { exec: noop }))
                .toThrow('Scenario name is required');
        });

        it('throws when exec is missing', () => {
            expect(() => runner.register('s1', {}))
                .toThrow("Scenario 's1' requires an exec function");
        });

        it('throws when lifecycle is null', () => {
            expect(() => runner.register('s1', null))
                .toThrow("Scenario 's1' requires an exec function");
        });

        it('returns runner for chaining', () => {
            const result = registerScenario('s1');
            expect(result).toBe(runner);
        });

        it('successfully registers a scenario', () => {
            registerScenario('login-flow');
            expect(runner.has('login-flow')).toBe(true);
        });
    });

    describe('has', () => {
        it('returns true for registered scenario', () => {
            registerScenario('registered');
            expect(runner.has('registered')).toBe(true);
        });

        it('returns false for unregistered scenario', () => {
            expect(runner.has('unknown')).toBe(false);
        });
    });

    describe('getScenarioNames', () => {
        it('returns empty array when no scenarios registered', () => {
            expect(runner.getScenarioNames()).toEqual([]);
        });

        it('returns all registered names', () => {
            registerScenario('alpha');
            registerScenario('beta');
            registerScenario('gamma');
            expect(runner.getScenarioNames()).toEqual(['alpha', 'beta', 'gamma']);
        });
    });

    describe('setupAll', () => {
        it('runs all setup functions and returns combined data', () => {
            runner.register('auth', {
                setup: () => ({ token: 'abc' }),
                exec: noop,
            });
            runner.register('profile', {
                setup: () => ({ userId: 42 }),
                exec: noop,
            });

            const data = runner.setupAll();
            expect(data).toEqual({
                auth: { token: 'abc' },
                profile: { userId: 42 },
            });
        });

        it('uses default setup returning empty object when none provided', () => {
            registerScenario('no-setup');
            const data = runner.setupAll();
            expect(data).toEqual({ 'no-setup': {} });
        });
    });

    describe('setup (single)', () => {
        it('runs setup for a single scenario', () => {
            const setupFn = vi.fn(() => ({ key: 'value' }));
            registerScenario('single', { setup: setupFn });

            const result = runner.setup('single');
            expect(setupFn).toHaveBeenCalledOnce();
            expect(result).toEqual({ key: 'value' });
        });

        it('throws for unregistered scenario', () => {
            expect(() => runner.setup('missing'))
                .toThrow("Scenario 'missing' is not registered");
        });
    });

    describe('exec', () => {
        it('calls exec with scenario-specific data', () => {
            const execFn = vi.fn();
            registerScenario('run-me', { exec: execFn });

            const data = { 'run-me': { token: 'xyz' } };
            runner.exec('run-me', data);

            expect(execFn).toHaveBeenCalledOnce();
            expect(execFn).toHaveBeenCalledWith({ token: 'xyz' });
        });

        it('passes empty object when scenario data is missing', () => {
            const execFn = vi.fn();
            registerScenario('no-data', { exec: execFn });

            runner.exec('no-data', {});
            expect(execFn).toHaveBeenCalledWith({});
        });

        it('passes empty object when data argument is omitted', () => {
            const execFn = vi.fn();
            registerScenario('default-data', { exec: execFn });

            runner.exec('default-data');
            expect(execFn).toHaveBeenCalledWith({});
        });

        it('returns the exec function return value', () => {
            registerScenario('returns', { exec: () => 'result' });
            expect(runner.exec('returns')).toBe('result');
        });

        it('throws for unregistered scenario', () => {
            expect(() => runner.exec('missing'))
                .toThrow("Scenario 'missing' is not registered");
        });
    });

    describe('teardownAll', () => {
        it('runs teardown for all scenarios', () => {
            const teardownA = vi.fn();
            const teardownB = vi.fn();

            runner.register('a', { exec: noop, teardown: teardownA });
            runner.register('b', { exec: noop, teardown: teardownB });

            const data = { a: { x: 1 }, b: { y: 2 } };
            runner.teardownAll(data);

            expect(teardownA).toHaveBeenCalledWith({ x: 1 });
            expect(teardownB).toHaveBeenCalledWith({ y: 2 });
        });

        it('passes empty object for scenarios without data', () => {
            const teardownFn = vi.fn();
            runner.register('lonely', { exec: noop, teardown: teardownFn });

            runner.teardownAll({});
            expect(teardownFn).toHaveBeenCalledWith({});
        });
    });

    describe('teardown (single)', () => {
        it('runs teardown for a single scenario', () => {
            const teardownFn = vi.fn();
            registerScenario('single-td', { teardown: teardownFn });

            const data = { 'single-td': { cleanup: true } };
            runner.teardown('single-td', data);

            expect(teardownFn).toHaveBeenCalledOnce();
            expect(teardownFn).toHaveBeenCalledWith({ cleanup: true });
        });

        it('throws for unregistered scenario', () => {
            expect(() => runner.teardown('missing'))
                .toThrow("Scenario 'missing' is not registered");
        });
    });

    describe('multiple scenarios with isolated data', () => {
        it('each scenario receives only its own data', () => {
            const execLogin = vi.fn();
            const execSearch = vi.fn();

            runner.register('login', {
                setup: () => ({ token: 'login-token' }),
                exec: execLogin,
                teardown: noop,
            });
            runner.register('search', {
                setup: () => ({ query: 'k6' }),
                exec: execSearch,
                teardown: noop,
            });

            const data = runner.setupAll();
            expect(data.login).toEqual({ token: 'login-token' });
            expect(data.search).toEqual({ query: 'k6' });

            runner.exec('login', data);
            runner.exec('search', data);

            expect(execLogin).toHaveBeenCalledWith({ token: 'login-token' });
            expect(execSearch).toHaveBeenCalledWith({ query: 'k6' });
        });
    });
});
