/**
 * This module formats k6 test results for Atlassian Xray import.
 * @module xray-reporter
 * @example
 * ```javascript
 * import { XrayReporter } from '../reporters/xray-reporter.js';
 * const report = XrayReporter.format(testCases, results);
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */


/**
 * Formats test results for Atlassian Xray REST API import.
 * @class XrayReporter
 */
class XrayReporter {
    /**
     * Format test case results for Xray JSON import.
     * @param {Array<{externalId: string, title: string}>} testCases - Test case descriptors with externalId.
     * @param {object} [results] - k6 summary metrics data.
     * @param {object} [options] - Formatting options.
     * @param {string} [options.testPlanKey] - Xray test plan key.
     * @param {string} [options.testEnvironment] - Test environment name.
     * @param {string} [options.revision] - Build/commit revision.
     * @returns {object} Xray-compatible JSON import object.
     */
    static format(testCases, results = {}, options = {}) {
        const tests = (testCases || []).map(tc => {
            const status = XrayReporter._determineStatus(tc, results);
            const testResult = {
                testKey: tc.externalId || '',
                status: status,
                comment: tc.title || '',
            };
            if (tc.steps && tc.steps.length > 0) {
                testResult.steps = tc.steps.map(step => ({
                    status: status,
                    comment: step,
                }));
            }
            return testResult;
        });

        const output = { tests };

        if (options.testPlanKey) {
            output.testPlanKey = options.testPlanKey;
        }
        if (options.testEnvironment) {
            output.info = output.info || {};
            output.info.environment = options.testEnvironment;
        }
        if (options.revision) {
            output.info = output.info || {};
            output.info.revision = options.revision;
        }

        return output;
    }

    /**
     * Convert the Xray report to a JSON string.
     * @param {Array} testCases - Test case descriptors.
     * @param {object} [results] - k6 summary metrics data.
     * @param {object} [options] - Formatting options.
     * @returns {string} JSON string for Xray import.
     */
    static toJSON(testCases, results = {}, options = {}) {
        return JSON.stringify(XrayReporter.format(testCases, results, options), null, 2);
    }

    /**
     * Determine test status based on threshold results.
     * @param {object} testCase - Test case descriptor.
     * @param {object} results - k6 metrics with thresholds.
     * @returns {string} Status: PASSED, FAILED, or TODO.
     * @private
     */
    static _determineStatus(testCase, results) {
        if (!results || !results.metrics) {
            return 'TODO';
        }
        for (const metric of Object.values(results.metrics)) {
            if (metric && metric.thresholds) {
                for (const threshold of Object.values(metric.thresholds)) {
                    if (threshold.ok === false) {
                        return 'FAILED';
                    }
                }
            }
        }
        return 'PASSED';
    }
}

export { XrayReporter };
