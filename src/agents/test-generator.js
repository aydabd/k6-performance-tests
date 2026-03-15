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
 * Maps descriptor auth type to the correct Authenticator method name.
 * @type {Readonly<{[key: string]: string}>}
 */
const AUTH_METHOD_MAP = Object.freeze({
    bearer: 'getTokenBearerAuth',
    basic: 'getBasicAuth',
    apiKey: 'getApiKeyAuth',
    jwt: 'getJwtAuth',
    oauth2: 'getOAuth2Auth',
});

/**
 * Build the import block for a generated k6 script.
 * Uses the proven simple-test.js pattern: group/sleep from k6, HttpClientFactory from clients.
 * @param {string} importPath - Relative path to the src directory.
 * @param {boolean} needsAuth - Whether to include the Authenticator import.
 * @returns {string} Import statements.
 */
function buildImports(importPath, needsAuth) {
    const lines = [
        `import { group, sleep } from 'k6';`,
        `import { HttpClientFactory } from '${importPath}/clients/http-client.js';`,
    ];
    if (needsAuth) {
        lines.push(`import { Authenticator } from '${importPath}/clients/http-auth.js';`);
    }
    return lines.join('\n');
}

/**
 * Convert an OpenAPI path to a HttpClientFactory dynamic proxy call.
 * Path parameters like `{id}` become function calls: `.endpoint("id")`.
 * @param {string} path - OpenAPI path string e.g. `/v2/breeds/{id}`.
 * @param {string} method - HTTP method e.g. `GET`.
 * @returns {string} Code snippet for the proxy call e.g. `dynamicClient.v2.breeds("id").get()`.
 */
function pathToProxyCall(path, method) {
    const parts = (path || '').replace(/^\//, '').split('/').filter(Boolean);
    const chain = parts.map((part) => {
        if (/^\{.*\}$/.test(part)) {
            return `(${JSON.stringify(part.slice(1, -1))})`;
        }
        return `.${part}`;
    }).join('');
    return `dynamicClient${chain}.${method.toLowerCase()}()`;
}

/**
 * Build the default export function body for a test descriptor.
 * Follows the proven simple-test.js pattern: group/sleep, HttpClientFactory with host,
 * no TestCaseBuilder, no export const options.
 * @param {{ id: string, auth: string, endpoint: { method: string, path: string } }} descriptor - Test descriptor.
 * @param {boolean} needsAuth - Whether auth setup is required.
 * @returns {string} Default export function block.
 */
function buildDefaultFn(descriptor, needsAuth) {
    const { id, endpoint } = descriptor;
    const { method, path } = endpoint;
    const groupTitle = `[${id}] ${method} ${path}`;
    const authMethod = AUTH_METHOD_MAP[descriptor.auth] || 'getTokenBearerAuth';
    const authSetup = needsAuth
        ? `    const auth = new Authenticator(__ENV);\n    const authHeaders = { Authorization: auth.${authMethod}() };\n`
        : '';
    const clientCall = pathToProxyCall(path, method);
    return (
        `export default function () {\n` +
        `    const { dynamicClient } = new HttpClientFactory({ host: __ENV.API_SERVER || 'localhost' });\n` +
        `${authSetup}` +
        `    group(${JSON.stringify(groupTitle)}, () => {\n` +
        `        ${clientCall}; // ${method} ${path}\n` +
        `    });\n` +
        `    sleep(1);\n` +
        `}`
    );
}

/**
 * Generate a k6 ES module script from a test case descriptor.
 * The generated script follows the same proven pattern as simple-test.js and agent-test.js:
 * group/sleep from k6, HttpClientFactory, no export const options (config file handles thresholds).
 * @param {object} descriptor - Test case descriptor from planTests.
 * @param {object} [options] - Generation options.
 * @param {string} [options.relativeImportPath] - Import path to the src directory.
 * @returns {string} Generated k6 script as a string.
 */
function generateK6Script(descriptor, options = {}) {
    const importPath = options.relativeImportPath ?? DEFAULT_OPTIONS.relativeImportPath;
    const needsAuth = descriptor.auth && descriptor.auth !== 'none';
    const imports = buildImports(importPath, needsAuth);
    const defaultFn = buildDefaultFn(descriptor, needsAuth);
    return `${imports}\n\n${defaultFn}\n`;
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

export { generateK6Script, createTestGeneratorAgent, AUTH_METHOD_MAP, pathToProxyCall };
