/**
 * This module contains a class that is responsible for logging error details.
 * @module http-error-handler
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */


/**
 * This class is responsible for logging error details.
 * @class HttpErrorHandler
 * It can be extended to log errors to a different location.
 * It is used by the API client to log error details.
 */
class HttpErrorHandler {
    /**
     * Creates a new HttpErrorHandler instance.
     * @param {Function} logErrorDetails - A function that logs error details.
     * The function should accept an object with error details as its only argument.
     * The object will contain the following properties:
     * - url: The URL of the request that caused the error.
     *     This can be useful for debugging.
     *     It can be used to identify the request that caused the error.
     * - status: The HTTP status code of the response.
     *   This can be useful for identifying the type of error that occurred.
     *   For example, a 404 status code indicates that the requested resource was not found.
     *   A 500 status code indicates that an internal server error occurred.
     *   A 401 status code indicates that the request was unauthorized.
     * - error_code: The error code returned by the server.
     *   This can be useful for identifying the type of error that occurred.
     *   For example, a 404 status code might be accompanied by a `not_found` error code.
     *   A 500 status code might be accompanied by a `internal_server_error` error code.
     */
    constructor(logErrorDetails) {
        this.logErrorDetails = logErrorDetails;
        this._errorResponse = {};
    }

    /**
     * Logs error details if isError is true.
     * @param {boolean} isError - Indicates whether an error occurred.
     * @param {object} res - The response object.
     * @param {object} tags - Additional tags to include in the error details.
     *  This can be useful for adding context to the error details.
     *  For example, you might include the name of the function that made the request.
     *  Or you might include the name of the service that the request was made to.
     *  This can help you identify the source of the error.
     */
    logError(isError = false, res = {}, tags = {}) {
        if (!isError) return;
        if (!res) return;

        const errorData = Object.assign(
            {
                request: `${res.request.method.toUpperCase()} ${res.request.url}`,
                request_headers: res.request.headers,
                status: res.status,
                error_code: res.error_code,
                error_body: res.body,
                response_headers: res.headers,
                timestamp: new Date().toISOString(),
            },
            tags
        );
        this._errorResponse = errorData;
        this.logErrorDetails(errorData);
    }

    get errorResponse() {
        return this._errorResponse;
    }
}


/**
 * Logs error details to the console.
 * @class ErrorHandler
 * @param {object} errorData - An object containing error details.
 * The object will contain the following properties:
 * - url: The URL of the request that caused the error.
 *   This can be useful for debugging.
 *   It can be used to identify the request that caused the error.
 *   - status: The HTTP status code of the response.
 *   This can be useful for identifying the type of error that occurred.
 *   For example, a 404 status code indicates that the requested resource was not found.
 *   A 500 status code indicates that an internal server error occurred.
 *   A 401 status code indicates that the request was unauthorized.
 *   - error_code: The error code returned by the server.
 *   This can be useful for identifying the type of error that occurred.
 *   For example, a 404 status code might be accompanied by a `not_found` error code.
 *   A 500 status code might be accompanied by a `internal_server_error` error code.
 *   - error_body: The body of the error response.
 *   This can be useful for identifying the cause of the error.
 *   For example, it might contain a message explaining what went wrong.
 *   - timestamp: The time at which the error occurred.
 *   This can be useful for identifying when the error occurred.
 *   - tags: Additional tags to include in the error details.
 *   This can be useful for adding context to the error details.
 *   For example, you might include the name of the function that made the request.
 *   Or you might include the name of the service that the request was made to.
 *   This can help you identify the source of the error.
 */
const ErrorHandler = new HttpErrorHandler((errorData) => {
    console.error(JSON.stringify(errorData, null, 2)); // eslint-disable-line no-undef
});

export { ErrorHandler };
