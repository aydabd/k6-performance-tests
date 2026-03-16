/**
 * HAR (HTTP Archive) to k6 script converter.
 * @module har-converter
 * @example
 * ```javascript
 * import { convertHarToK6 } from './har-converter.js';
 * const script = convertHarToK6(harObject, { relativeImportPath: '../src' });
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/** @type {number} Default group size for sequential fallback grouping */
const SEQUENTIAL_GROUP_SIZE = 5;

/**
 * Group HAR entries by pageref, falling back to sequential groups.
 * @param {Array} entries - HAR log entries.
 * @returns {Map<string, Array>} Map of group name → entries.
 */
function groupEntries(entries) {
    const hasPageref = entries.some((e) => e.pageref);

    if (hasPageref) {
        const groups = new Map();
        for (const entry of entries) {
            const key = entry.pageref || 'default';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(entry);
        }
        return groups;
    }

    const groups = new Map();
    for (let i = 0; i < entries.length; i += SEQUENTIAL_GROUP_SIZE) {
        const key = `group_${Math.floor(i / SEQUENTIAL_GROUP_SIZE) + 1}`;
        groups.set(key, entries.slice(i, i + SEQUENTIAL_GROUP_SIZE));
    }
    return groups;
}

/**
 * Generate k6 code lines for a group of HAR entries.
 * Uses httpClient.request() with the full URL from each HAR entry.
 * @param {string} groupName - The group name used as the k6 group label.
 * @param {Array} entries - HAR entries in this group.
 * @returns {string} k6 group block as a string.
 */
function buildGroupBlock(groupName, entries) {
    const calls = entries.map((entry) => {
        const req = entry.request || {};
        const url = (req.url || '');
        const method = (req.method || 'GET').toUpperCase();
        return `        httpClient.request(${JSON.stringify(method)}, ${JSON.stringify(url)});`;
    });

    return (
        `    group(${JSON.stringify(groupName)}, () => {\n` +
        calls.join('\n') +
        `\n    });`
    );
}

/**
 * Convert a HAR object into a k6 ES module script.
 * @param {object} har - Parsed HAR object.
 * @param {object} [options] - Options.
 * @param {string} [options.relativeImportPath] - Import path to src.
 * @returns {string} Generated k6 script string.
 * @throws {Error} If HAR is malformed or has no entries.
 */
function convertHarToK6(har, options = {}) {
    if (!har || !har.log) {
        throw new Error('Invalid HAR: missing log property');
    }

    const entries = har.log.entries;
    if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error('Invalid HAR: no entries found');
    }

    const importPath = options.relativeImportPath ?? '../src';
    const groups = groupEntries(entries);
    const groupBlocks = [];

    for (const [name, groupEntriesList] of groups) {
        groupBlocks.push(buildGroupBlock(name, groupEntriesList));
    }

    return (
        `import { group } from 'k6';\n` +
        `import { HttpClientFactory } from '${importPath}/clients/http-client.js';\n` +
        `\n` +
        `export default function () {\n` +
        `    const { httpClient } = new HttpClientFactory({ baseURL: __ENV.BASE_URL });\n` +
        groupBlocks.join('\n') +
        `\n}\n`
    );
}

/**
 * Create a HAR converter agent function.
 * @returns {(input: object) => Promise<object>} Async agent function.
 */
function createHarConverterAgent() {
    /**
     * Convert a HAR recording to a k6 script.
     * @param {{ type: string, payload: { har: object, options?: object }, context: object }} input - Agent input.
     * @returns {Promise<object>} Agent output or error.
     */
    return async function harConverterAgent(input) {
        try {
            const { har, options = {} } = input.payload || {};
            const script = convertHarToK6(har, options);
            return createAgentOutput(input.type, { script });
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { convertHarToK6, createHarConverterAgent };
