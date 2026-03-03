/**
 * This module provides structured test case descriptors with metadata.
 * @module test-case
 * @example
 * ```javascript
 * import { TestCaseBuilder } from './test-case.js';
 * const tc = new TestCaseBuilder('TC-001', 'Login Flow')
 *     .description('Verify user login with valid credentials')
 *     .prerequisites(['User account exists'])
 *     .steps(['Navigate to login', 'Enter credentials', 'Submit'])
 *     .expectedResults(['Dashboard displayed'])
 *     .tags({ testType: 'smoke' })
 *     .build();
 * tc.toK6Group(() => { // test logic });
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { group } from 'k6';


/**
 * Immutable test case descriptor with metadata.
 * @class TestCase
 */
class TestCase {
    /**
     * Create a new TestCase instance. Use TestCaseBuilder to construct.
     * @param {object} descriptor - The test case descriptor.
     * @param {string} descriptor.id - Unique identifier for the test case.
     * @param {string} descriptor.title - Human-readable title.
     * @param {string} descriptor.description - Detailed description.
     * @param {string[]} descriptor.prerequisites - List of prerequisites.
     * @param {string[]} descriptor.steps - List of test steps.
     * @param {string[]} descriptor.expectedResults - List of expected results.
     * @param {object} descriptor.tags - Key-value tags for categorization.
     * @param {string} descriptor.externalId - External system ID (e.g., Xray key).
     */
    constructor(descriptor) {
        this.id = descriptor.id || '';
        this.title = descriptor.title || '';
        this.description = descriptor.description || '';
        this.prerequisites = [...(descriptor.prerequisites || [])];
        this.steps = [...(descriptor.steps || [])];
        this.expectedResults = [...(descriptor.expectedResults || [])];
        this.tags = { ...(descriptor.tags || {}) };
        this.externalId = descriptor.externalId || '';
        Object.freeze(this.prerequisites);
        Object.freeze(this.steps);
        Object.freeze(this.expectedResults);
        Object.freeze(this.tags);
        Object.freeze(this);
    }

    /**
     * Execute the test function wrapped in a k6 group named after the test title.
     * @param {() => unknown} fn - The test function to execute inside the group.
     * @returns {unknown} The return value of the test function.
     */
    toK6Group(fn) {
        const groupName = this.id ? `[${this.id}] ${this.title}` : this.title;
        return group(groupName, fn);
    }

    /**
     * Return a JSON-serializable summary object for handleSummary().
     * @returns {object} The test case summary.
     */
    toSummary() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            prerequisites: this.prerequisites,
            steps: this.steps,
            expectedResults: this.expectedResults,
            tags: this.tags,
            externalId: this.externalId,
        };
    }
}


/**
 * Builder for constructing TestCase instances with a fluent API.
 * @class TestCaseBuilder
 * @example
 * ```javascript
 * const tc = new TestCaseBuilder('TC-001', 'Login Flow')
 *     .description('Verify login')
 *     .steps(['Login', 'Verify'])
 *     .build();
 * ```
 */
class TestCaseBuilder {
    /**
     * Create a new TestCaseBuilder.
     * @param {string} id - Unique identifier for the test case.
     * @param {string} title - Human-readable title.
     */
    constructor(id, title) {
        this._descriptor = {
            id: id || '',
            title: title || '',
            description: '',
            prerequisites: [],
            steps: [],
            expectedResults: [],
            tags: {},
            externalId: '',
        };
    }

    /**
     * Set the test case description.
     * @param {string} value - The description.
     * @returns {TestCaseBuilder} this builder for chaining.
     */
    description(value) {
        this._descriptor.description = value;
        return this;
    }

    /**
     * Set the prerequisites list.
     * @param {string[]} value - Array of prerequisite descriptions.
     * @returns {TestCaseBuilder} this builder for chaining.
     */
    prerequisites(value) {
        this._descriptor.prerequisites = value;
        return this;
    }

    /**
     * Set the test steps.
     * @param {string[]} value - Array of step descriptions.
     * @returns {TestCaseBuilder} this builder for chaining.
     */
    steps(value) {
        this._descriptor.steps = value;
        return this;
    }

    /**
     * Set the expected results.
     * @param {string[]} value - Array of expected result descriptions.
     * @returns {TestCaseBuilder} this builder for chaining.
     */
    expectedResults(value) {
        this._descriptor.expectedResults = value;
        return this;
    }

    /**
     * Set the tags for categorization.
     * @param {object} value - Key-value tags.
     * @returns {TestCaseBuilder} this builder for chaining.
     */
    tags(value) {
        this._descriptor.tags = value;
        return this;
    }

    /**
     * Set the external system ID (e.g., Xray test key, TestRail case ID).
     * @param {string} value - The external identifier.
     * @returns {TestCaseBuilder} this builder for chaining.
     */
    externalId(value) {
        this._descriptor.externalId = value;
        return this;
    }

    /**
     * Build and return an immutable TestCase instance.
     * @returns {TestCase} The constructed test case.
     * @throws {Error} If id or title is missing.
     */
    build() {
        if (!this._descriptor.id) {
            throw new Error('TestCase id is required');
        }
        if (!this._descriptor.title) {
            throw new Error('TestCase title is required');
        }
        return new TestCase({ ...this._descriptor });
    }
}

export { TestCase, TestCaseBuilder };
