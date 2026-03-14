/**
 * k6 ES module script generator from test case descriptors.
 * @module test-generator
 * @example
 * ```javascript
 * import { generateK6Script } from './test-generator.js';
 * const script = generateK6Script(descriptor, { relativeImportPath: '../src' });
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/**
 * Default options for script generation.
 * @type {{ relativeImportPath: string }}
 */
const DEFAULT_OPTIONS = { relativeImportPath: '../src' };

/**
 * Build the import block for a generated k6 script.
 * @param {string} importPath - Relative path to the src directory.
 * @param {boolean} needsAuth - Whether to include the Authenticator import.
 * @returns {string} Import statements.
 */
function buildImports(importPath, needsAuth) {
    const lines = [
        `import { TestCaseBuilder } from '${importPath}/test-case.js';`,
        `import { HttpClientFactory } from '${importPath}/clients/http-client.js';`,
    ];
    if (needsAuth) {
        lines.push(`import { Authenticator } from '${importPath}/clients/http-auth.js';`);
    }
    return lines.join('\n');
}

/**
 * Build the k6 options export for a descriptor.
 * @param {{ p95: number, errorRate: number }} performance - Performance thresholds.
 * @returns {string} Options export block.
 */
function buildOptions(performance) {
    const p95 = performance.p95 ?? 500;
    const errorRate = performance.errorRate ?? 0.01;
    return (
        `export const options = {\n` +
        `    thresholds: {\n` +
        `        http_req_duration: ['p(95)<${p95}'],\n` +
        `        http_req_failed: ['rate<${errorRate}'],\n` +
        `    },\n` +
        `};`
    );
}

/**
 * Build the default export function body for a test descriptor.
 * @param {{ id: string, endpoint: { method: string, path: string } }} descriptor - Test descriptor.
 * @param {boolean} needsAuth - Whether auth setup is required.
 * @returns {string} Default export function block.
 */
function buildDefaultFn(descriptor, needsAuth) {
    const { id, endpoint } = descriptor;
    const title = `${endpoint.method} ${endpoint.path}`;
    const authLine = needsAuth
        ? `    const auth = new Authenticator(__ENV);\n    const headers = auth.getAuth();\n`
        : '';
    return (
        `export default function () {\n` +
        `    const testCase = new TestCaseBuilder('${id}', '${title}')\n` +
        `        .steps(['${endpoint.method} ${endpoint.path}', 'Assert 200', 'Assert response body'])\n` +
        `        .build();\n` +
        `${authLine}` +
        `    testCase.toK6Group(() => {\n` +
        `        HttpClientFactory.create(__ENV.BASE_URL);\n` +
        `    });\n` +
        `}`
    );
}

/**
 * Generate a k6 ES module script from a test case descriptor.
 * @param {object} descriptor - Test case descriptor from planTests.
 * @param {object} [options] - Generation options.
 * @param {string} [options.relativeImportPath] - Import path to the src directory.
 * @returns {string} Generated k6 script as a string.
 */
function generateK6Script(descriptor, options = {}) {
    const importPath = options.relativeImportPath ?? DEFAULT_OPTIONS.relativeImportPath;
    const needsAuth = descriptor.auth && descriptor.auth !== 'none';
    const imports = buildImports(importPath, needsAuth);
    const opts = buildOptions(descriptor.performance || {});
    const defaultFn = buildDefaultFn(descriptor, needsAuth);
    return `${imports}\n\n${opts}\n\n${defaultFn}\n`;
}

/**
 * Create a test generator agent function.
 * @returns {(input: object) => Promise<object>} Async agent function.
 */
function createTestGeneratorAgent() {
    /**
     * Generate k6 scripts from test descriptors in pipeline state.
     * @param {{ type: string, payload: { descriptors: Array, options?: object }, context: object }} input - Agent input.
     * @returns {Promise<object>} Agent output or error.
     */
    return async function testGeneratorAgent(input) {
        try {
            const { descriptors = [], options = {} } = input.payload || {};
            const scripts = descriptors.map((desc) => ({
                id: desc.id,
                script: generateK6Script(desc, options),
            }));
            return createAgentOutput(input.type, { scripts });
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { generateK6Script, createTestGeneratorAgent };
