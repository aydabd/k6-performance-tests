/**
 * This module contains the HttpClientFactory, HttpClient, HttpHeaders, HttpOptionsGenerator.
 * @module http-client
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { check } from 'k6';
import { Httpx } from 'https://jslib.k6.io/httpx/0.1.0/index.js';
import { URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { ErrorHandler } from './http-error-handler.js'
import { Authenticator } from './http-auth.js';
import  { BaseUrl } from './base-url.js';


const DEFAULT_API_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "k6-http-client",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache"
};


/**
 * Class representing the headers for the API requests.
 * @class HttpHeaders
 * @example
 * ```javascript
 * const headers = new HttpHeaders({
 *     headers: { 'Content-Type': 'application/json' },
 *     authenticator: new Authenticator('username', 'password')
 * });
 * headers.options;
 * headers.HttpHeaders.basicAuth;
 * ```
 */
class HttpHeaders {
    /**
     * Create a new Headers instance.
     * @param {object} options - The options to configure the headers.
     * @param {object} options.headers - The headers to add to the request.
     * @param {object} options.authenticator - The authenticator to use for the request.
     * @returns {object} options - The options updated with the headers and HttpHeaders instance.
     */
    constructor(options = {}) {
        // Desctructure the options object to get the headers and authenticator and set default values if not provided
        let { headers = DEFAULT_API_HEADERS, authenticator = {} } = options;
        if (!authenticator) {
            console.warn('No authenticator provided.'); // eslint-disable-line no-undef
            return Object.assign(options, { HttpHeadersInstance: this }, { headers: headers });
        }
        options = this.addAuthHeaders(options);

        // Return the options updated with the headers
        return options.headers;
    }

    /**
     * Add the basic authorization headers to the existing headers.
     * @param {object} options - The options to add the basic authorization headers to.
     * @param {object} options.authenticator - The authenticator to use for the request.
     * @returns {object} The options updated with the headers.
     */
    addBasicAuthorization(options = {}) {
        let { authenticator = {} } = options;
        if (!authenticator) {
            console.warn('No authenticator provided.'); // eslint-disable-line no-undef
            return options;
        }
        let basicAuth = authenticator.getBasicAuth() || '';
        if (!basicAuth) {
            console.debug('Basic auth token is not set.'); // eslint-disable-line no-undef
            return options;
        }
        // set the Authorization header with the basic auth token
        options.headers = options.headers || {};
        options.headers = Object.assign(options.headers, { Authorization: `Basic ${basicAuth}` });
        return options;
    }

    /**
     * Add Authorization headers to the existing headers.
     * @param {object} options - The options to add the Authorization headers to.
     * @param {object} options.authenticator - The authenticator to use for the request.
     * @returns {object} The options updated with the headers.
     */
    addTokenBearerAuthorization(options = {}) {
        let { authenticator = {} } = options;
        if (!authenticator) {
            console.debug('No authenticator provided.'); // eslint-disable-line no-undef
            return options;
        }
        let token = authenticator.getTokenBearerAuth() || '';
        if (!token) {
            console.debug('Token bearer is not set.'); // eslint-disable-line no-undef
            return options;
        }
        // set the Authorization header with the token bearer
        options.headers = options.headers || {};
        options.headers = Object.assign(options.headers, { Authorization: `Bearer ${token}` });
        return options;
    }

    /**
     * Add the basic and token bearer authorization headers to the existing headers.
     * @param {object} options - The options to add the headers to.
     * @returns {object} The options updated with the headers.
     */
    addAuthHeaders(options = {}) {
        if (options.username && options.password && !options.headers.Authorization) {
            options = this.addBasicAuthorization(options);
        }
        if (options.token) {
            options = this.addTokenBearerAuthorization(options);
        }
        return options;
    }
}


/**
 * Class representing the options for the HttpClient.
 * @class HttpOptionsGenerator
 * @example
 * ```javascript
 * const options = new HttpOptionsGenerator({
 *      host: 'api.example
 *      username: 'username',
 *      password: 'password',
 *      headers: { 'Content-Type': 'application/json' },
 *      vuId: 1,
 *      iterId: 1
 * });
 * ```
 */
class HttpOptionsGenerator {

    /**
     * Create a new HttpOptionsGenerator instance.
     * @param {object} options - The options to configure the HttpClient.
     * @param {string} options.baseURL - The base URL for the API requests.
     * @param {string} options.host - The hostname of the API.
     * @param {string} options.username - The username for the request.
     * @param {string} options.password - The password for the request.
     * @param {string} options.token - The token bearer for the request.
     * @param {object} options.authenticator - The authenticator for the request.
     * @param {object} options.headers - The headers for the request.
     * @returns {object} - The options for the HttpClient.
     */
    constructor(options = {}) {
        options.baseURL = new BaseUrl(options).baseURL;
        options.authenticator = new Authenticator(options);
        options.headers = new HttpHeaders(options);
        // options.headers = Object.assign(DEFAULT_API_HEADERS, options.headers);
        return options;
    }
}


/**
 * Class representing a client for HTTP requests, supporting dynamic endpoint construction.
 * @class HttpClient
 * @example
 * ```javascript
 * const client = new HttpClient({ host: 'api.example.com', port: 443, protocol: 'https' });
 * client.request('get', { queryParams: { key1: 'value1' } });
 * client.createProxy().api.v2.users(1).get();
 * ```
 * @example
 * Use the HttpClient to send a request to the API.
 * ```javascript
 * const genOptions = generateOptions('api.example.com', 'username', 'password');
 * const httpC = new HttpClient(genOptions);
 * let headers = httpC.session.k6params.headers;
 * headers["Content-Type"] = "application/json";
 * httpC.session.put(`/api/test/user/${caseId}`, JSON.stringify({ id: caseId}), { headers: headers });
 * ```
 */
class HttpClient {
    /**
     * Create a new HttpClient instance.
     * @param {object} options - The options to configure the client.
     */
    constructor(options) {
        // Create a new Httpx session which have access to Httpx methods
        this.session = new Httpx(options);
        this.httpOptions = new HttpOptionsGenerator(options);
        this.session.setBaseUrl(this.httpOptions.baseURL);
        this.session.addHeaders(this.httpOptions.headers);
        this.reset();
    }

    /**
     * Reset the path segments, body, method and params for the next request.
     * @returns {void}
     */
    reset() {
        this.pathSegments = [];
        this.body = null;
        this.method = '';
        this.params = {};
    }

    /**
     * Build the complete URL using the base URL and the path segments.
     * @returns {string} The complete URL.
     * @example
     * ```javascript
     * // returns 'https://api.example.com:443/v1/users'
     * buildUrl();
     * ```
     * @example
     * ```javascript
     * // returns 'https://api.example.com:443/v1/users-name'
     * this.pathSegments = ['v1', 'users_name'];
     * buildUrl();
     * ```
     */
    buildUrl() {
        // Check first that pathSegments is an array and contains values
        if (!Array.isArray(this.pathSegments)) {
            console.error('pathSegments is not an array'); // eslint-disable-line no-undef
            return '';
        }

        // Change underscores to hyphens in the path segments and remove empty segments
        this.pathSegments = this.pathSegments.map(segment =>
            segment ? (isNaN(segment) ? segment.replace(/_/g, '-') : segment) : ''
        );

        // Join the path segments and return the complete URL
        let path = this.pathSegments.join('/');
        return `${this.session.baseURL}/${path}`;
    }

    /**
     * Construct the query parameters string from an object.
     * @param {object} queryParams - The query parameters.
     * @returns {string} The query parameters string.
     * @example
     * ```javascript
     * buildQueryParams({ key1: 'value1', key2: 'value2' });
     * // returns '/?key1=value1&key2=value2'
     * ```
     */
    buildQueryParams(queryParams = {}) {
        let searchParams = new URLSearchParams(queryParams);
        return searchParams.toString() ? `?${searchParams.toString()}` : '';
    }

    /**
     * Send a request to the API.
     * @param {string} method - The HTTP method.
     * @param {string} url - The request URL.
     * @param {object} body - The request body.
     * @param {object} params - The request parameters.
     * @returns {object} The response.
     * @example
     * ```javascript
     * request('get', { queryParams: { key1: 'value1' } });
     * ```
     */
    request(method, url = "", body = null, params = {}) {
        // Build the complete URL if url is not provided
        url = url || `${this.buildUrl()}`;
        if (body && typeof body === 'object') {
            if (body.queryParams && body.queryParams.soapPath && body.queryParams.soapBody) {
                url = `${url}/${body.queryParams.soapPath}`;
                this.httpOptions.headers["Content-Type"] = "application/soap+xml";
                body = body.queryParams.soapBody;
            } else {
                let queryParams = this.buildQueryParams(body.queryParams);
                url += queryParams;
                delete body.queryParams;
                body = JSON.stringify(body);
            }
        }

        // add or merge all keys in params to this.httpOptions
        Object.entries(params).forEach(([key, value]) => {
            this.httpOptions[key] = value;
        });

        // Send the request to the API
        let response = this.session.request(method.toUpperCase(), url, body, this.httpOptions);
        console.debug(`Response: ${JSON.stringify(response, null, 2)}`); // eslint-disable-line no-undef

        // Reset path segments, body, method and params for the next request
        this.reset();

        return this.handleResponse(response);
    }

    /**
     * Handle the response from the API.
     * @param {object} response - The response from the API.
     * @returns {object} The response.
     * @example
     * ```javascript
     * handleResponse(response);
     * ```
     */
    handleResponse(response) {
        if (!response) {
            console.error('Response is undefined or null'); // eslint-disable-line no-undef
            return {};
        }

        let checkStatus = check(
            response,
            {
                'status is 2xx': (r) => r.status >= 200 && r.status < 300,
                'status is 4xx/5xx': (r) => r.status >= 400 && r.status < 600
            }
        );
        if (!checkStatus) {
            ErrorHandler.logError(!checkStatus, response);
            return ErrorHandler.errorResponse;
        }

        return response;
    }

    /**
     * Get the Websocket connection details for Microsoft SignalR Hub connection.
     * @param {string} method - The HTTP method.
     * @param {string} url - The request URL.
     * @param {object} body - The request body.
     * @param {object} params - The request parameters.
     * @returns {object} The Websocket connection details.
     */
    wsSignalRConnection(method= 'get', url = '', body = null, params = {}) {
        let wsConnectionId = '';
        let wsConnectionToken = '';

        // Merge the responseType to the params object
        params = Object.assign(params, { responseType: 'text' });
        let response = this.request(method, url, body, params);

        if (response.status === 200 && response.body) {
            wsConnectionId = JSON.parse(response.body).connectionId || '';
            wsConnectionToken = JSON.parse(response.body).connectionToken || '';
        }
        if (!wsConnectionId || !wsConnectionToken) {
            console.warn(`Websocket connection details not found: ${JSON.stringify(response, null, 2)}`); // eslint-disable-line no-undef
            return {};
        }
        return { wsConnectionId: wsConnectionId, wsConnectionToken: wsConnectionToken };
    }

    /**
     * Create a dynamic client proxy.
     * @returns {object} A Proxy to dynamically handle path segments and HTTP methods.
     */
    createProxy() {
        const client = this;
        const httpMethods = new Set(['get', 'post', 'put']);

        return new Proxy(() => {}, {
            get: function(target, prop) {
                const method = prop.toLowerCase();
                if (httpMethods.has(method)) {
                    // if the property is a method and it is a last segment, then it is a HTTP method
                    if (client.pathSegments.length > 0) {
                        return (body = null, params = {}) => {
                            client.method = method;
                            client.body = body;
                            client.params = params;
                            return client.request(client.method, '', client.body, client.params);
                        };
                    }
                    // if the property is a method and it is not a last segment, then it is a path segment
                    // add the path segment and return a new dynamic path proxy
                    client.pathSegments.push(prop);
                    return client.createProxy();
                }
                // if the property is not a method, then it is a path segment
                // add the path segment and return a new dynamic path proxy
                client.pathSegments.push(prop);
                return client.createProxy();
            },
            apply: function(target, thisArg, argumentsList) {
                // If the proxy is called as a function, return the complete URL
                // add the path segment and return a new dynamic path proxy
                const segment = typeof argumentsList[0] === 'number' ? argumentsList[0].toString() : argumentsList[0];
                client.pathSegments.push(segment);
                return client.createProxy();
            }
        });
    }
}

/**
 * Factory class to create a new HttpClient instance with a dynamic client proxy.
 * @class HttpClientFactory
 * @param {object} options - The options to configure the client.
 * @returns {object} The dynamic client proxy, the HttpClient and the options.
 * @example
 * ```javascript
 * let { dynamicClient, httpClient, options } = new HttpClientFactory({ host: 'api.example.com', port: 443, protocol: 'https' });
 * dynamicClient.api.v1.users(1).get();
 * ```
 * @example
 * ```javascript
 * let { dynamicClient, httpClient, options } = new HttpClientFactory({ host: 'api.example.com', port: 443, protocol: 'https' });
 * dynamicClient.soapapi.xml.post({ queryParams: { soapPath: 'mypath.amsx', soapBody: 'body' } });
 * ```
 */
class HttpClientFactory {
    constructor(options) {
        this.client = new HttpClient(options);
        this.options = options;
        this.dynamicClient = this.client.createProxy();
        this.httpClient = this.client;
        return { dynamicClient: this.dynamicClient, httpClient: this.httpClient, options: this.options };
    }
}

export { HttpClientFactory, HttpHeaders };
