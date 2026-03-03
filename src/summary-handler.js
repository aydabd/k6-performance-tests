/**
 * This module provides summary handling for k6 test results.
 * Exports test results as JSON and JUnit XML for CI integration.
 * @module summary-handler
 * @example
 * ```javascript
 * import { SummaryHandler } from './summary-handler.js';
 * export function handleSummary(data) {
 *     return SummaryHandler.handleSummary(data, {
 *         jsonPath: 'results/summary.json',
 *         junitPath: 'results/junit.xml',
 *         suiteName: 'k6 Performance Tests',
 *     });
 * }
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */


/**
 * Handles k6 test summary data and exports to multiple formats.
 * @class SummaryHandler
 */
class SummaryHandler {
    /**
     * Convert k6 summary data to a JSON string.
     * @param {object} data - The k6 summary data object.
     * @param {object} [metadata] - Additional metadata to include.
     * @param {string} [metadata.testRunId] - Unique test run identifier.
     * @param {string} [metadata.businessFlow] - Business flow name.
     * @returns {string} JSON string representation of the summary.
     */
    static toJSON(data, metadata = {}) {
        const output = {
            metadata: {
                testRunId: metadata.testRunId || '',
                businessFlow: metadata.businessFlow || '',
                timestamp: new Date().toISOString(),
            },
            metrics: SummaryHandler._extractMetrics(data),
        };
        return JSON.stringify(output, null, 2);
    }

    /**
     * Convert k6 summary data to JUnit XML format.
     * @param {object} data - The k6 summary data object.
     * @param {string} [suiteName] - The test suite name.
     * @returns {string} JUnit XML string.
     */
    static toJUnitXML(data, suiteName = 'k6 Performance Tests') {
        const metrics = SummaryHandler._extractMetrics(data);
        const thresholds = SummaryHandler._extractThresholds(data);

        const testCases = thresholds.map(t => {
            if (t.ok) {
                return `    <testcase name="${SummaryHandler._escapeXml(t.name)}" classname="${SummaryHandler._escapeXml(suiteName)}" time="0" />`;
            }
            return [
                `    <testcase name="${SummaryHandler._escapeXml(t.name)}" classname="${SummaryHandler._escapeXml(suiteName)}" time="0">`,
                `      <failure message="Threshold breached">${SummaryHandler._escapeXml(t.name)}: threshold not met</failure>`,
                '    </testcase>',
            ].join('\n');
        });

        if (testCases.length === 0) {
            testCases.push(
                `    <testcase name="k6 test run" classname="${SummaryHandler._escapeXml(suiteName)}" time="${metrics.duration || 0}" />`
            );
        }

        const failures = thresholds.filter(t => !t.ok).length;
        const lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            `<testsuites>`,
            `  <testsuite name="${SummaryHandler._escapeXml(suiteName)}" tests="${testCases.length}" failures="${failures}" errors="0">`,
            ...testCases,
            '  </testsuite>',
            '</testsuites>',
        ];
        return lines.join('\n');
    }

    /**
     * Generate handleSummary() return object for k6.
     * @param {object} data - The k6 summary data object.
     * @param {object} [options] - Output configuration.
     * @param {string} [options.jsonPath] - File path for JSON output.
     * @param {string} [options.junitPath] - File path for JUnit XML output.
     * @param {string} [options.suiteName] - Test suite name for JUnit.
     * @param {string} [options.testRunId] - Unique test run identifier.
     * @param {string} [options.businessFlow] - Business flow name.
     * @returns {object} k6 handleSummary result with file paths and content.
     */
    static handleSummary(data, options = {}) {
        const result = {};
        const metadata = {
            testRunId: options.testRunId || '',
            businessFlow: options.businessFlow || '',
        };

        if (options.jsonPath) {
            result[options.jsonPath] = SummaryHandler.toJSON(data, metadata);
        }

        if (options.junitPath) {
            result[options.junitPath] = SummaryHandler.toJUnitXML(
                data,
                options.suiteName || 'k6 Performance Tests'
            );
        }

        return result;
    }

    /**
     * Extract metrics from k6 summary data.
     * @param {object} data - The k6 summary data.
     * @returns {object} Extracted metrics.
     * @private
     */
    static _extractMetrics(data) {
        if (!data || !data.metrics) {
            return {};
        }
        const result = {};
        for (const [name, metric] of Object.entries(data.metrics)) {
            if (metric && metric.values) {
                result[name] = metric.values;
            }
        }
        if (data.state && data.state.testRunDurationMs) {
            result.duration = data.state.testRunDurationMs / 1000;
        }
        return result;
    }

    /**
     * Extract threshold results from k6 summary data.
     * @param {object} data - The k6 summary data.
     * @returns {Array<{name: string, ok: boolean}>} Threshold results.
     * @private
     */
    static _extractThresholds(data) {
        if (!data || !data.metrics) {
            return [];
        }
        const results = [];
        for (const [name, metric] of Object.entries(data.metrics)) {
            if (metric && metric.thresholds) {
                for (const [thresholdName, thresholdData] of Object.entries(metric.thresholds)) {
                    results.push({
                        name: `${name}: ${thresholdName}`,
                        ok: thresholdData.ok !== false,
                    });
                }
            }
        }
        return results;
    }

    /**
     * Escape special XML characters.
     * @param {string} str - The string to escape.
     * @returns {string} XML-safe string.
     * @private
     */
    static _escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

export { SummaryHandler };
