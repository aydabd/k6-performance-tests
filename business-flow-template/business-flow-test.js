/**
 * @file business-flow-test.js
 * @description Example business-flow test demonstrating isolated container execution
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { sleep } from 'k6';
import { HttpClientFactory } from '../src/clients/http-client.js';
import { TestCaseBuilder } from '../src/test-case.js';

const K6_API_SERVER = __ENV.API_SERVER || 'dogapi.dog'; // eslint-disable-line no-undef
const BUSINESS_FLOW_NAME = __ENV.BUSINESS_FLOW_NAME || 'default-flow'; // eslint-disable-line no-undef

const testCase = new TestCaseBuilder('BF-001', `Business Flow: ${BUSINESS_FLOW_NAME}`)
    .description('Demonstrates isolated business-flow container execution')
    .steps(['Create HTTP client', 'Execute API request', 'Verify response'])
    .expectedResults(['API responds with 200 status'])
    .tags({ testType: 'business-flow', businessFlow: BUSINESS_FLOW_NAME })
    .build();

/**
 * Setup function for the business flow.
 * @returns {object} Setup data.
 */
export function setup() {
    console.debug(`Setting up business flow: ${BUSINESS_FLOW_NAME}`); // eslint-disable-line no-undef
    return { businessFlow: BUSINESS_FLOW_NAME };
}

/**
 * Teardown function for the business flow.
 */
export function teardown() {
    console.debug(`Tearing down business flow: ${BUSINESS_FLOW_NAME}`); // eslint-disable-line no-undef
}

/**
 * Default test function for the business flow.
 */
export default function () {
    const httpOpt = {
        host: K6_API_SERVER,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'k6-business-flow',
        },
    };

    let { dynamicClient } = new HttpClientFactory(httpOpt);

    testCase.toK6Group(() => {
        dynamicClient.api.v2.breeds.get();
    });

    sleep(1);
}
