/**
 * Auth instructions loader: parses YAML auth config and generates k6 Authenticator code.
 * @module auth-loader
 * @example
 * ```javascript
 * import { parseAuthConfig, buildAuthCode } from './auth-loader.js';
 * const config = parseAuthConfig(yamlString);
 * const code = buildAuthCode(config);
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/** @type {string[]} Supported auth types */
const SUPPORTED_AUTH_TYPES = ['basic', 'bearer', 'jwt', 'apiKey', 'oauth2'];

/**
 * Substitute ${ENV_VAR} references with values from process.env.
 * @param {string} value - String potentially containing env var references.
 * @returns {string} String with substitutions applied.
 */
function resolveEnvRefs(value) {
    return String(value).replace(/\$\{([^}]+)\}/g, (_, name) =>
        process.env[name] !== undefined ? process.env[name] : `\${${name}}`
    );
}

/**
 * Parse a simple nested YAML string (key: value, indented blocks) into an object.
 * Handles string values, ${ENV_VAR} references, and one level of nesting.
 * @param {string} yamlString - The YAML string to parse.
 * @returns {object} Parsed object.
 */
function parseSimpleYaml(yamlString) {
    const result = {};
    let currentSection = null;

    for (const rawLine of yamlString.split('\n')) {
        const line = rawLine.replace(/\r$/, '');
        if (!line.trim() || line.trim().startsWith('#')) continue;

        const isIndented = /^\s+/.test(line);
        const keyValueMatch = line.trim().match(/^([^:]+):\s*(.*)$/);
        if (!keyValueMatch) continue;

        const [, key, rawValue] = keyValueMatch;
        const value = resolveEnvRefs(rawValue.trim());

        if (isIndented && currentSection) {
            if (typeof result[currentSection] !== 'object') {
                result[currentSection] = {};
            }
            result[currentSection][key.trim()] = value;
        } else {
            if (rawValue.trim() === '') {
                result[key.trim()] = {};
                currentSection = key.trim();
            } else {
                result[key.trim()] = value;
                currentSection = null;
            }
        }
    }

    return result;
}

/**
 * Parse an auth YAML configuration string.
 * @param {string} yamlString - The YAML configuration string.
 * @returns {{ type: string, [key: string]: object }} Parsed auth config.
 * @throws {Error} If auth.type is missing or unknown.
 */
function parseAuthConfig(yamlString) {
    const parsed = parseSimpleYaml(yamlString);
    const auth = parsed.auth || parsed;
    const type = auth.type;

    if (!type) {
        throw new Error('Missing auth.type');
    }

    if (!SUPPORTED_AUTH_TYPES.includes(type)) {
        throw new Error(`Unknown auth type: ${type}`);
    }

    // Remove 'type' key and return rest as nested config
    const rest = Object.fromEntries(
        Object.entries(auth).filter(([k]) => k !== 'type')
    );
    return { type, [type]: rest };
}

/**
 * Build a k6 Authenticator constructor call string from an auth config.
 * @param {{ type: string }} authConfig - Parsed auth config from parseAuthConfig.
 * @returns {string} k6 JavaScript code snippet.
 */
function buildAuthCode(authConfig) {
    const { type } = authConfig;
    const config = authConfig[type] || {};
    const entries = Object.entries(config)
        .map(([k, v]) => {
            const envRef = v.startsWith('${') ? v.replace(/\$\{([^}]+)\}/g, '__ENV.$1') : `'${v}'`;
            return `    ${k}: ${envRef}`;
        });

    const body = entries.length > 0
        ? `{\n${entries.join(',\n')}\n}`
        : '{}';

    return `new Authenticator(${body})`;
}

/**
 * Create an auth loader agent function.
 * @returns {Function} Async agent function `(input) → output`.
 */
function createAuthLoaderAgent() {
    /**
     * Parse auth YAML and generate authenticator code.
     * @param {{ type: string, payload: { yaml: string }, context: object }} input - Agent input.
     * @returns {Promise<object>} Agent output or error.
     */
    return async function authLoaderAgent(input) {
        try {
            const { yaml } = input.payload || {};
            const authConfig = parseAuthConfig(yaml);
            const authCode = buildAuthCode(authConfig);
            return createAgentOutput(input.type, { authConfig, authCode });
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { parseAuthConfig, buildAuthCode, createAuthLoaderAgent };
