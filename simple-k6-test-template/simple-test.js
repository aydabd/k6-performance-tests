/**
 * @file simple-test.js
 * @description Simple test of the API
 * @example
 * How to run:
 * ```shell
 * k6 run simple-test.js
 * # Or by using build the docker image and run the test
 * docker build -t simple-k6-test-template .
 * docker -v run -i --rm --net=host -e API_SERVER=server-address simple-k6-test-template:latest
 * docker run -i --rm --net=host -e API_SERVER=server-address -e API_USERNAME=foo -e API_PASSWORD=bar simple-template-test
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { group, sleep } from 'k6';
import { HttpClientFactory } from '../src/clients/http-client.js';

// Define environment variables
const K6_API_SERVER = __ENV.API_SERVER || 'dogapi.dog'; // eslint-disable-line no-undef
const DEFAULT_API_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "k6-client",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache"
};


/**
 * Setup.
 * @see https://grafana.com/docs/k6/latest/using-k6/test-lifecycle
 * @see https://k6.io/docs/using-k6/test-life-cycle
 */
export function setup() {
    try {
        console.debug('Setup'); // eslint-disable-line no-undef
    } catch (error) {
        console.error('Error setting up the url and authenticator:', error); // eslint-disable-line no-undef
        teardown();
    }
}


/**
 * Teardown function to close the API client
 * @see https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/
 */
export function teardown() {
    console.debug('Teardown'); // eslint-disable-line no-undef
    // TODO: Not implemented yet
    //    httpClient.close();
}


/**
 * Test simple performance of the API crocodiles endpoint
 * Description: "Simple test of the API"
 * Approvals:
 * - "Api shall respond with status code 200"
 * - "Thresholds for duration and failed requests shall be met"
 * Steps:
 * - "Create a new HttpClient"
 * - "Verify that the get with query parameters returns a 200 status code"
 * - "Verify that the get without query parameters returns a 200 status code"
 * - "Verify that the get with crocodile id and query parameters returns a 200 status code"
 * - "Verify that the get with crocodile id without query parameters returns a 200 status code"
 */
export default function () {
    const httpOpt = {
        host: K6_API_SERVER,
        headers: DEFAULT_API_HEADERS,
    };
    // const httpOptions = new HttpOptionsGenerator(httpOpt);
    // Create a new HttpClientFactory
    let { dynamicClient } = new HttpClientFactory(httpOpt);

    group('1. Verify that breeds list returns a 200 status code', () => {
        dynamicClient.api.v2.breeds.get();https: // https://dogapi.dog/api/v2/breeds
    });

    group('2. Verify that facts with query parameters returns a 200 status code', () => {
        dynamicClient.api.v2.facts.get({queryParams: {limit: 1}});
    });


    group('3. Verify that breeds with path variable `id` returns a 200 status code', () => {
        dynamicClient.api.v2.breeds(1).get();
    });

    group('4. Verify that the soap request returns a 200 status code', () => {
        let soapOptions = {
            host: 'www.w3schools.com',
            headers: {
                "Content-Type": "application/soap+xml",
                "SOAPAction": "https://www.w3schools.com/xml/CelsiusToFahrenheit"
            }
        };
        let { dynamicClient } = new HttpClientFactory(soapOptions);
        let soapBody = `
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                    <FahrenheitToCelsius xmlns="https://www.w3schools.com/xml/">
                        <Fahrenheit>75</Fahrenheit>
                    </FahrenheitToCelsius>
                </soap12:Body>
            </soap12:Envelope>`;
        dynamicClient.xml.post({queryParams: {soapPath: 'tempconvert.asmx', soapAction: 'https://www.w3schools.com/xml/FahrenheitToCelsius', soapBody: soapBody}});
    });

    sleep(1);
}
