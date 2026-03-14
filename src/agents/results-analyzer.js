/**
 * k6 results analyzer: evaluates summary metrics against test case thresholds.
 * @module results-analyzer
 * @example
 * ```javascript
 * import { analyzeResults, parseK6Summary } from './results-analyzer.js';
 * const report = analyzeResults(summary, descriptors);
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { createAgentOutput, createAgentError } from './agent-framework.js';

/**
 * Parse a k6 JSON summary string into a validated object.
 * @param {string} jsonString - Raw JSON string from k6 handleSummary.
 * @returns {object} Parsed summary object.
 * @throws {Error} If the string is not valid JSON or is missing required fields.
 */
function parseK6Summary(jsonString) {
    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        throw new Error('Invalid k6 summary: not valid JSON');
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid k6 summary: expected an object');
    }

    if (!parsed.metrics || typeof parsed.metrics !== 'object') {
        throw new Error('Invalid k6 summary: missing metrics');
    }

    return parsed;
}

/**
 * Extract a metric value from a k6 summary safely.
 * @param {object} metrics - The metrics map.
 * @param {string} metricName - Name of the metric.
 * @param {string} valueName - Value key within the metric.
 * @returns {number} The metric value, or Infinity if absent.
 */
function getMetricValue(metrics, metricName, valueName) {
    const metric = metrics[metricName];
    if (!metric || !metric.values) return Infinity;
    const val = metric.values[valueName];
    return typeof val === 'number' ? val : Infinity;
}

/**
 * Analyze k6 summary metrics against test case descriptors.
 * @param {object} k6Summary - Parsed k6 JSON summary object.
 * @param {object[]} descriptors - Test case descriptors with performance thresholds.
 * @returns {{ testCases: Array, overallPassed: boolean }} Analysis result.
 */
function analyzeResults(k6Summary, descriptors) {
    const metrics = (k6Summary && k6Summary.metrics) || {};
    const p95Actual = getMetricValue(metrics, 'http_req_duration', 'p(95)');
    const errorRateActual = getMetricValue(metrics, 'http_req_failed', 'rate');

    const testCases = (descriptors || []).map((desc) => {
        const { p95 = 500, errorRate = 0.01 } = (desc.performance || {});
        const passed = p95Actual < p95 && errorRateActual < errorRate;
        return {
            id: desc.id,
            userStory: desc.userStory,
            passed,
            p95: p95Actual,
            errorRate: errorRateActual,
        };
    });

    const overallPassed = testCases.length > 0 && testCases.every((tc) => tc.passed);
    return { testCases, overallPassed };
}

/**
 * Create a results analyzer agent function.
 * @returns {Function} Async agent function `(input) → output`.
 */
function createResultsAnalyzerAgent() {
    /**
     * Analyze k6 results from pipeline state.
     * @param {{ type: string, payload: { summary: object|string, descriptors?: Array }, context: object }} input - Agent input.
     * @returns {Promise<object>} Agent output or error.
     */
    return async function resultsAnalyzerAgent(input) {
        try {
            const { summary, descriptors = [] } = input.payload || {};
            const k6Summary = typeof summary === 'string' ? parseK6Summary(summary) : summary;
            const report = analyzeResults(k6Summary, descriptors);
            return createAgentOutput(input.type, { report });
        } catch (error) {
            return createAgentError(input.type, error, input.context);
        }
    };
}

export { analyzeResults, parseK6Summary, createResultsAnalyzerAgent };
