/**
 * This module provides scenario-level setup/teardown management.
 * @module scenario-runner
 * @example
 * ```javascript
 * import { ScenarioRunner } from './scenario-runner.js';
 * const runner = new ScenarioRunner();
 * runner.register('login-flow', {
 *     setup: () => ({ token: 'abc' }),
 *     exec: (data) => { // test logic },
 *     teardown: (data) => { // cleanup }
 * });
 * // In setup():
 * export function setup() { return runner.setupAll(); }
 * // In scenario exec:
 * export function loginFlow() { runner.exec('login-flow', data); }
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */


/**
 * Maps scenario names to lifecycle functions (setup/exec/teardown).
 * @class ScenarioRunner
 */
class ScenarioRunner {
    /**
     * Create a new ScenarioRunner instance.
     */
    constructor() {
        /** @type {Map<string, {setup: Function, exec: Function, teardown: Function}>} */
        this._scenarios = new Map();
    }

    /**
     * Register a scenario with its lifecycle functions.
     * @param {string} name - The scenario name (must match k6 scenario config).
     * @param {object} lifecycle - The lifecycle functions.
     * @param {Function} [lifecycle.setup] - Setup function returning scenario-specific data.
     * @param {Function} lifecycle.exec - Execution function receiving setup data.
     * @param {Function} [lifecycle.teardown] - Teardown function receiving setup data.
     * @throws {Error} If name is empty or exec is not provided.
     * @returns {ScenarioRunner} this runner for chaining.
     */
    register(name, lifecycle) {
        if (!name) {
            throw new Error('Scenario name is required');
        }
        if (!lifecycle || typeof lifecycle.exec !== 'function') {
            throw new Error(`Scenario '${name}' requires an exec function`);
        }
        this._scenarios.set(name, {
            setup: lifecycle.setup || (() => ({})),
            exec: lifecycle.exec,
            teardown: lifecycle.teardown || (() => {}),
        });
        return this;
    }

    /**
     * Run setup for all registered scenarios and return combined data.
     * @returns {object} Combined setup data keyed by scenario name.
     */
    setupAll() {
        const data = {};
        for (const [name, lifecycle] of this._scenarios) {
            data[name] = lifecycle.setup();
        }
        return data;
    }

    /**
     * Run setup for a single scenario.
     * @param {string} name - The scenario name.
     * @returns {*} The setup data for the scenario.
     * @throws {Error} If the scenario is not registered.
     */
    setup(name) {
        const lifecycle = this._getLifecycle(name);
        return lifecycle.setup();
    }

    /**
     * Execute a scenario with the provided data.
     * @param {string} name - The scenario name.
     * @param {object} data - Combined setup data from setupAll().
     * @returns {*} The return value of the exec function.
     * @throws {Error} If the scenario is not registered.
     */
    exec(name, data = {}) {
        const lifecycle = this._getLifecycle(name);
        const scenarioData = data[name] || {};
        return lifecycle.exec(scenarioData);
    }

    /**
     * Run teardown for all registered scenarios.
     * @param {object} data - Combined setup data from setupAll().
     */
    teardownAll(data = {}) {
        for (const [name, lifecycle] of this._scenarios) {
            lifecycle.teardown(data[name] || {});
        }
    }

    /**
     * Run teardown for a single scenario.
     * @param {string} name - The scenario name.
     * @param {object} data - Combined setup data from setupAll().
     * @throws {Error} If the scenario is not registered.
     */
    teardown(name, data = {}) {
        const lifecycle = this._getLifecycle(name);
        lifecycle.teardown(data[name] || {});
    }

    /**
     * Get the list of registered scenario names.
     * @returns {string[]} Array of scenario names.
     */
    getScenarioNames() {
        return [...this._scenarios.keys()];
    }

    /**
     * Check if a scenario is registered.
     * @param {string} name - The scenario name.
     * @returns {boolean} True if the scenario is registered.
     */
    has(name) {
        return this._scenarios.has(name);
    }

    /**
     * Get lifecycle functions for a scenario, throwing if not found.
     * @param {string} name - The scenario name.
     * @returns {object} The lifecycle object.
     * @throws {Error} If the scenario is not registered.
     * @private
     */
    _getLifecycle(name) {
        const lifecycle = this._scenarios.get(name);
        if (!lifecycle) {
            throw new Error(`Scenario '${name}' is not registered`);
        }
        return lifecycle;
    }
}

export { ScenarioRunner };
