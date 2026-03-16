/**
 * OpenAPI v3 and Swagger v2 spec analyzer producing a normalized endpoint map.
 * @module api-analyzer
 * @example
 * ```javascript
 * import { analyzeApi } from './api-analyzer.js';
 * const map = analyzeApi(parsedSpec);
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/**
 * Determine auth type from a security scheme definition.
 * @param {object} scheme - The security scheme object.
 * @returns {string} One of 'bearer', 'apiKey', 'basic', 'none'.
 */
function resolveAuthType(scheme) {
    if (!scheme) return 'none';
    const type = (scheme.type || '').toLowerCase();
    const schemeVal = (scheme.scheme || '').toLowerCase();
    if (type === 'http' && (schemeVal === 'bearer' || schemeVal === 'jwt')) return 'bearer';
    if (type === 'http' && schemeVal === 'basic') return 'basic';
    if (type === 'apikey' || type === 'apiKey') return 'apiKey';
    if (type === 'oauth2') return 'bearer';
    return 'none';
}

/**
 * Determine the effective auth type for an operation using global security schemes.
 * Falls back to spec-level global security when the operation has no `security` field.
 * @param {object} operation - The operation object (may have `security` field).
 * @param {object} schemes - Map of scheme name → scheme definition.
 * @param {Array} [globalSecurity] - Spec-level security requirements used as fallback.
 * @returns {string} Auth type string.
 */
function operationAuth(operation, schemes, globalSecurity = []) {
    // operation.security === undefined means "inherit from global"; [] means "no auth"
    const securityReqs = operation.security !== undefined ? operation.security : globalSecurity;
    if (!securityReqs || securityReqs.length === 0) return 'none';
    const firstKey = Object.keys(securityReqs[0])[0];
    return resolveAuthType(schemes[firstKey]);
}

/**
 * Extract endpoints from an OpenAPI v3 spec.
 * @param {object} spec - Parsed OpenAPI v3 object.
 * @returns {{ baseUrl: string, endpoints: Array, version: string }} Endpoint map.
 */
function analyzeV3(spec) {
    const baseUrl = (spec.servers && spec.servers[0] && spec.servers[0].url) || '';
    const schemes = (spec.components && spec.components.securitySchemes) || {};
    const globalSecurity = spec.security || [];
    const endpoints = [];
    const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

    for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (!operation) continue;
            const auth = operationAuth(operation, schemes, globalSecurity);
            const responseSchema = operation.responses
                ? JSON.stringify(operation.responses['200'] || {})
                : '';
            endpoints.push({
                method: method.toUpperCase(),
                path,
                summary: operation.summary || '',
                auth,
                parameters: operation.parameters || [],
                responseSchema,
            });
        }
    }

    return { baseUrl, endpoints, version: 'v3' };
}

/**
 * Extract endpoints from a Swagger v2 spec.
 * @param {object} spec - Parsed Swagger v2 object.
 * @returns {{ baseUrl: string, endpoints: Array, version: string }} Endpoint map.
 */
function analyzeV2(spec) {
    const scheme = (spec.schemes && spec.schemes[0]) || 'https';
    const host = spec.host || '';
    const basePath = spec.basePath || '';
    const baseUrl = `${scheme}://${host}${basePath}`;
    const definitions = (spec.securityDefinitions) || {};
    const globalSecurity = spec.security || [];
    const endpoints = [];
    const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

    for (const [path, pathItem] of Object.entries(spec.paths)) {
        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (!operation) continue;
            const auth = operationAuth(operation, definitions, globalSecurity);
            const responseSchema = operation.responses
                ? JSON.stringify(operation.responses['200'] || {})
                : '';
            endpoints.push({
                method: method.toUpperCase(),
                path,
                summary: operation.summary || '',
                auth,
                parameters: operation.parameters || [],
                responseSchema,
            });
        }
    }

    return { baseUrl, endpoints, version: 'v2' };
}

/**
 * Analyze a parsed OpenAPI v3 or Swagger v2 spec into a normalized endpoint map.
 * @param {object} spec - The parsed spec object.
 * @returns {{ baseUrl: string, endpoints: Array, version: string }} Endpoint map.
 * @throws {Error} If the spec is missing required fields or has an unknown version.
 */
function analyzeApi(spec) {
    if (!spec || typeof spec !== 'object') {
        throw new Error('Invalid spec: must be an object');
    }

    if (!spec.paths || typeof spec.paths !== 'object') {
        throw new Error('Invalid spec: missing paths');
    }

    if (spec.openapi && String(spec.openapi).startsWith('3')) {
        return analyzeV3(spec);
    }

    if (spec.swagger === '2.0') {
        return analyzeV2(spec);
    }

    throw new Error('Unknown spec version: expected openapi 3.x or swagger 2.0');
}

/**
 * Create an API analyzer agent function.
 * @returns {(input: object) => Promise<object>} Async agent function.
 */
function createApiAnalyzerAgent() {
    /**
     * Analyze an OpenAPI/Swagger spec.
     * @param {{ type: string, payload: { spec: object }, context: object }} input - Agent input.
     * @returns {Promise<object>} Agent output or error.
     */
    return async function apiAnalyzerAgent(input) {
        try {
            const { spec } = input.payload;
            const result = analyzeApi(spec);
            return createAgentOutput(input.type, result);
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { analyzeApi, createApiAnalyzerAgent };
