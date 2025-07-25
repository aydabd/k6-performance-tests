/**
 * This module is used to create a base URL for the API requests.
 * @module base-url
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

/**
 * The BaseUrl class is used to create a base URL for the API requests.
 * @class BaseUrl
 * @example
 * ```javascript
 * const options = {
 *    host: 'api.example.com',
 *    protocol: 'https',
 *    baseURL: 'https://api.example.com',
 *    port: 443,
 * };
 * const baseUrl = new BaseUrl(options);
 * console.log(JSON.stringify(baseUrl, null, 2));
 * ```
 */
class BaseUrl {
    /**
     * Create a new HttpBaseUrl instance.
     * @param {object} options - The options to configure the base URL.
     * @param {string} options.baseURL - The base URL for the API requests.
     * @param {string} options.host - The hostname of the API.
     * @param {string} options.protocol - The protocol for the API requests.
     * @param {string} options.port - The port for the API requests.
     * @returns {object} options - The options updated with the base URL.
     */
    constructor(options = {}) {
        // Desctructure the options object to get the host, port, protocol and baseURL
        let {
            baseURL = '',
            host = '',
            protocol = 'https',
            port = '',
        } = options;

        if (!host && !baseURL) {
            throw new Error('The host or baseURL must be provided.');
        }
        // Only add port if it's provided and not default for protocol
        let defaultPort = (protocol === 'https' || protocol === 'wss') ? '443' : '80';
        let portPart = port && port !== defaultPort ? `:${port}` : '';
        baseURL = baseURL || `${protocol}://${host}${portPart}`;
        options.baseURL = baseURL;
        return options;
    }
}

export { BaseUrl };
