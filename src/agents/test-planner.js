/**
 * Template-based test planner: converts endpoint maps and user stories into test case descriptors.
 * @module test-planner
 * @example
 * ```javascript
 * import { planTests } from './test-planner.js';
 * const descriptors = planTests(endpointMap, ['US-42 As a user ...']);
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/**
 * Default performance thresholds for generated test cases.
 * @type {{ p95: number, errorRate: number }}
 */
const DEFAULT_PERFORMANCE = { p95: 500, errorRate: 0.01 };

/**
 * Extract a US-NNN identifier from a user story string.
 * @param {string} story - The user story text.
 * @returns {string} Extracted story ID or 'US-000'.
 */
function extractStoryId(story) {
    const match = String(story).match(/US-\d+/);
    return match ? match[0] : 'US-000';
}

/**
 * Format a zero-padded test case ID.
 * @param {number} index - 1-based index.
 * @returns {string} Formatted ID, e.g. 'TC-001'.
 */
function formatTcId(index) {
    return `TC-${String(index).padStart(3, '0')}`;
}

/**
 * Build a single test case descriptor for an endpoint.
 * @param {number} index - 1-based counter.
 * @param {{ method: string, path: string, auth: string }} endpoint - Endpoint descriptor.
 * @param {string} storyId - User story ID (e.g. 'US-42').
 * @returns {object} Test case descriptor.
 */
function buildDescriptor(index, endpoint, storyId) {
    return {
        id: formatTcId(index),
        userStory: storyId,
        endpoint: { method: endpoint.method, path: endpoint.path },
        auth: endpoint.auth || 'none',
        steps: [
            `${endpoint.method} ${endpoint.path}`,
            'Assert 200',
            'Assert response body',
        ],
        performance: { ...DEFAULT_PERFORMANCE },
        tags: ['smoke', 'regression', storyId],
    };
}

/**
 * Plan test cases from an endpoint map and user stories.
 * Generates one test case descriptor per endpoint.
 * @param {{ endpoints: Array }} endpointMap - Endpoint map from analyzeApi.
 * @param {string[]} [userStories=[]] - Array of user story strings.
 * @returns {object[]} Array of test case descriptors.
 */
function planTests(endpointMap, userStories = []) {
    if (!endpointMap || !Array.isArray(endpointMap.endpoints)) {
        return [];
    }

    const storyId = userStories.length > 0 ? extractStoryId(userStories[0]) : 'US-000';

    return endpointMap.endpoints.map((endpoint, i) =>
        buildDescriptor(i + 1, endpoint, storyId)
    );
}

/**
 * Create a test planner agent function.
 * @returns {Function} Async agent function `(input) → output`.
 */
function createTestPlannerAgent() {
    /**
     * Plan tests from the current pipeline state.
     * @param {{ type: string, payload: object, context: { stories?: string[] } }} input - Agent input.
     * @returns {Promise<object>} Agent output or error.
     */
    return async function testPlannerAgent(input) {
        try {
            const endpointMap = input.payload;
            const stories = (input.context && input.context.stories) || [];
            const descriptors = planTests(endpointMap, stories);
            return createAgentOutput(input.type, { descriptors });
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { planTests, createTestPlannerAgent };
