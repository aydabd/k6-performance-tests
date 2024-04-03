/**
 * Define the configuration for the k6 test
 * @see https://grafana.com/docs/k6/latest/using-k6/k6-options
 * @see https://grafana.com/docs/k6/latest/using-k6/scenarios/
 */


/**
 * Define Thresholds for the test.
 * http_req_failed: 99% of requests must complete within 1s
 * http_req_duration: 90% of requests should be below 400ms, 95% below 800ms, and 99% below 1500ms
 * @type {{http_req_failed: [{threshold: string, abortOnFail: boolean}], http_req_duration: string[]}}
 * @see https://grafana.com/docs/k6/latest/using-k6/thresholds/
 */
export const thresholdSettings = {
    http_req_failed: [{ threshold: 'rate<0.1', abortOnFail: true }],
    http_req_duration: ['p(90) < 400', 'p(95) < 800', 'p(99) < 1500'],
};


/**
 * Breaking Workload, Simulate ramping up to 10 users, then 20 users, then ramping down to 0 users
 * @type {{executor: string, stages: [{duration: string, target: number}, {duration: string, target: number}, {duration: string, target: number}]}}
 * @see https://grafana.com/docs/k6/latest/using-k6/k6-options/
 */
export const breakingWorkload = {
    executor: 'ramping-vus',
    stages: [
        { duration: '10s', target: 3 },
        { duration: '10s', target: 1 },
        { duration: '10s', target: 0 },
    ],
};


/**
 * Simple Workload, Simulate 10 users for 20 seconds
 * @type {{executor: string, vus: number, duration: string}}
 */
export const simpleWorkload = {
    executor: 'per-vu-iterations',
    vus: 2,
    iterations: 1,
    maxDuration: '10s',
};
