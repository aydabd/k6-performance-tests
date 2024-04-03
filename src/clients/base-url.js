/**
 * Class representing the base URL for the API requests.
 */
class BaseUrl {
    /**
     * Create a new HttpBaseUrl instance.
     * @param {object} options - The options to configure the base URL.
     * @param {string} options.baseURL - The base URL for the API requests.
     * @param {string} options.host - The hostname of the API.
     * @param {string} options.protocol - The protocol for the API requests.
     * @returns {object} options - The options updated with the base URL.
     */
    constructor(options = {}) {
        // Desctructure the options object to get the host, port, protocol and baseURL
        let {
            baseURL = '',
            host = '',
            protocol = 'https',
        } = options;

        if (!host && !baseURL) {
            throw new Error('The host or baseURL must be provided.');
        }
        baseURL = baseURL || `${protocol}://${host}`;
        options.baseURL = baseURL;
        return options;
    }
}

export { BaseUrl };
