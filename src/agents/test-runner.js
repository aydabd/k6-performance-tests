/**
 * Test runner: builds Docker command arrays for executing k6 scripts in containers.
 * @module test-runner
 * @example
 * ```javascript
 * import { buildRunCommand } from './test-runner.js';
 * const cmd = buildRunCommand({ scriptPath: '/tests/script.js', image: 'grafana/k6' });
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/** @type {string} Container path for mounted scripts */
const CONTAINER_SCRIPTS_DIR = '/scripts';

/** @type {string} Default k6 Docker image */
const DEFAULT_IMAGE = 'grafana/k6';

/**
 * Build an array of -e KEY=VALUE args from an env vars map.
 * @param {Object.<string, string>} envVars - Environment variable key-value pairs.
 * @returns {string[]} Flat array of ['-e', 'KEY=VALUE', ...].
 */
function buildEnvArgs(envVars) {
    const args = [];
    for (const [key, value] of Object.entries(envVars || {})) {
        args.push('-e', `${key}=${value}`);
    }
    return args;
}

/**
 * Build a Docker run command for executing a k6 script.
 * @param {object} options - Run options.
 * @param {string} options.scriptPath - Absolute path to the script file on the host.
 * @param {string} [options.configPath] - Optional path to k6 config file.
 * @param {string} [options.image=DEFAULT_IMAGE] - Docker image to use.
 * @param {Object.<string, string>} [options.envVars={}] - Environment variables to pass.
 * @param {'volume'|'build'} [options.mountMode='volume'] - Mount strategy.
 * @returns {{ command: string, args: string[] }} Command and argument array.
 */
function buildRunCommand(options = {}) {
    const {
        scriptPath = '',
        image = DEFAULT_IMAGE,
        envVars = {},
        mountMode = 'volume',
    } = options;

    const scriptName = scriptPath.split('/').pop();
    const containerScriptPath = `${CONTAINER_SCRIPTS_DIR}/${scriptName}`;
    const envArgs = buildEnvArgs(envVars);

    if (mountMode === 'volume') {
        const args = [
            'run', '--rm',
            '-v', `${scriptPath}:${containerScriptPath}`,
            ...envArgs,
            image,
            'run', containerScriptPath,
        ];
        return { command: 'docker', args };
    }

    // 'build' mode: script is baked into image
    const args = [
        'run', '--rm',
        ...envArgs,
        image,
        'run', containerScriptPath,
    ];
    return { command: 'docker', args };
}

/**
 * Create a test runner agent function.
 * Builds Docker commands but does NOT execute them.
 * @returns {Function} Async agent function `(input) → output`.
 */
function createTestRunnerAgent() {
    /**
     * Build run commands for a list of scripts.
     * @param {{ type: string, payload: { scripts: Array, config?: string, envVars?: object }, context: object }} input - Agent input.
     * @returns {Promise<object>} Agent output with commands array.
     */
    return async function testRunnerAgent(input) {
        try {
            const { scripts = [], envVars = {} } = input.payload || {};
            const commands = scripts.map((script) =>
                buildRunCommand({
                    scriptPath: script.scriptPath || script.id || '',
                    image: script.image || DEFAULT_IMAGE,
                    envVars,
                    mountMode: script.mountMode || 'volume',
                })
            );
            return createAgentOutput(input.type, { commands });
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { buildRunCommand, createTestRunnerAgent };
