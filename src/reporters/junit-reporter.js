/**
 * This module formats k6 test results as JUnit XML.
 * @module junit-reporter
 * @example
 * ```javascript
 * import { JUnitReporter } from '../reporters/junit-reporter.js';
 * const xml = JUnitReporter.format(testCases, results);
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */


/**
 * Formats test results as JUnit XML for CI systems.
 * @class JUnitReporter
 */
class JUnitReporter {
    /**
     * Format test case results as JUnit XML string.
     * @param {Array<{id: string, title: string, externalId?: string}>} testCases - Test case descriptors.
     * @param {object} [results] - k6 summary metrics data.
     * @param {object} [options] - Formatting options.
     * @param {string} [options.suiteName] - Test suite name.
     * @param {number} [options.duration] - Total test duration in seconds.
     * @returns {string} JUnit XML string.
     */
    static format(testCases, results = {}, options = {}) {
        const suiteName = options.suiteName || 'k6 Performance Tests';
        const cases = (testCases || []).map(tc => {
            const passed = JUnitReporter._isPassed(results);
            const caseName = tc.externalId
                ? `[${tc.externalId}] ${tc.title}`
                : tc.title || tc.id || 'unnamed';

            if (passed) {
                return `    <testcase name="${JUnitReporter._escapeXml(caseName)}" classname="${JUnitReporter._escapeXml(suiteName)}" time="0" />`;
            }
            return [
                `    <testcase name="${JUnitReporter._escapeXml(caseName)}" classname="${JUnitReporter._escapeXml(suiteName)}" time="0">`,
                `      <failure message="Performance threshold breached">${JUnitReporter._escapeXml(caseName)}: threshold not met</failure>`,
                '    </testcase>',
            ].join('\n');
        });

        if (cases.length === 0) {
            cases.push(
                `    <testcase name="k6 test run" classname="${JUnitReporter._escapeXml(suiteName)}" time="${options.duration || 0}" />`
            );
        }

        const failures = (testCases || []).length > 0 && !JUnitReporter._isPassed(results)
            ? cases.length
            : 0;

        const lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<testsuites>',
            `  <testsuite name="${JUnitReporter._escapeXml(suiteName)}" tests="${cases.length}" failures="${failures}" errors="0" time="${options.duration || 0}">`,
            ...cases,
            '  </testsuite>',
            '</testsuites>',
        ];
        return lines.join('\n');
    }

    /**
     * Check if all thresholds passed.
     * @param {object} results - k6 metrics with thresholds.
     * @returns {boolean} True if all thresholds passed or no thresholds exist.
     * @private
     */
    static _isPassed(results) {
        if (!results || !results.metrics) {
            return true;
        }
        for (const metric of Object.values(results.metrics)) {
            if (metric && metric.thresholds) {
                for (const threshold of Object.values(metric.thresholds)) {
                    if (threshold.ok === false) {
                        return false;
                    }
                }
            }
        }
        return true;
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

export { JUnitReporter };
