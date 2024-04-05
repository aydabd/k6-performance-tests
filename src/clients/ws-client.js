/**
 * This module contains the WebSocket client class and options generator class.
 * @module WebSocketClient
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { WebSocket } from 'k6/experimental/websockets';
import { setTimeout, clearTimeout } from 'k6/experimental/timers';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { Authenticator } from './http-auth.js';
import { BaseUrl } from './base-url.js';
import { HttpHeaders } from './http-client.js';


/**
 * Class representing a generator for WebSocket options.
 * @class WSOptionsGenerator
 * @example
 * ```javascript
 * const options = new WSOptionsGenerator({ host: 'api.example.com', port: 443, protocol: 'wss' });
 * ```
 */
class WSOptionsGenerator {

    /**
     * Create a WebSocket options generator.
     * @param {object} options - The options object. (default: {})
     * @param {string} options.host - The host name. (default: '')
     * @param {number} options.port - The port number. (default: 443)
     * @param {string} options.protocol - The protocol. (default: 'wss')
     * @param {number} options.timeoutDuration - The timeout duration. (default: 10000)
     * @param {string} options.baseURL - The base URL. (default: '')
     * @param {string} options.authenticator - The authenticator. (default: '')
     * @param {string} options.headers - The headers. (default: {})
     * @param {string} options.sessionId - The session id. (default: '')
     * @param {string} options.tags - The tags. (default: { sessionId: '' })
     * @returns {object} The WebSocket options.
     * @example
     * ```javascript
     * const options = new WSOptionsGenerator({ host: 'api.example.com', port: 443, protocol: 'wss' });
     * ```
     */
    constructor(options = {}) {
        options.baseURL = new BaseUrl(options).baseURL;
        // Override the headers if not provided
        if (!options.headers) {
            options.authenticator = new Authenticator(options);
            options.headers = new HttpHeaders(options);
        }
        options.headers = Object.assign({}, options.headers);
        this.sessionId = options.sessionId || uuidv4();
        this.tags = Object.assign({ sessionId: this.sessionId }, options.tags);
        this.params = { headers: options.headers, tags: this.tags };
        this.options = options;
        this.url = options.baseURL;
    }
}


/**
 * Class representing a WebSocket client.
 * @class WebSocketClient
 * @example
 * ```javascript
 * const options = { host: 'api.example.com', port: 443, protocol: 'wss' };
 * const wsClient = new WebSocketClient(options);
 * socket.onopen = () => {
 *  console.log('connected');
 *  socket.send('Hello, Server!');
 * };
 * socket.onmessage = (e) => console.log(e.data);
 * socket.onclose = () => console.log('disconnected');
 * ```
 */
class WebSocketClient {
    constructor(options = {}) {
        this.wsOptions = new WSOptionsGenerator(options);
        this.url = this.wsOptions.url;
        this.params = this.wsOptions.params;
        this.options = this.wsOptions.options;

        this.socket = new WebSocket(this.url, this.params);
        this.tags = this.params.tags;
        this.headers = this.params.headers;
        this.timeoutDuration = this.options.timeoutDuration || 30000; // 30 seconds
        this.timeoutId = null;
        this.sessionId = this.options.sessionId || this.tags.sessionId;
        console.log(`Created WebSocket Instance with url: ${this.url}, and sessionId: ${this.tags.sessionId}`); // eslint-disable-line no-undef
    }

    /**
     * Add an event listener.
     * @param {string} event - The event name.
     * @param {Function} handler - The event handler.
     * @example
     * ```javascript
     * socket.addEventListener('message', (event) => console.log(event.data));
     * ```
     */
    addEventListener(event = 'message', handler = () => { }) {
        this.socket.addEventListener(event, handler);
    }

    /**
     * Close the WebSocket connection.
     * @param {number} code - The close code. (default: 1000)
     * @param {string} reason - The close reason. (default: 'Normal Closure')
     * @example
     * ```javascript
     * socket.close(1000, 'Normal Closure');
     * ```
     */
    close(code = 1000, reason = 'Normal Closure') {
        this.socket.close(code, reason);
    }

    /**
     * Send a message.
     * @param {object} message - The message object. (default: {})
     * @example
     * ```javascript
     * socket.send({ message: 'Hello, Server!' });
     * ```
     */
    send(message = {}) {
        message = JSON.stringify(message);
        this.socket.send(message);
        console.log(`Sent message: ${message}`); // eslint-disable-line no-undef
    }

    /**
     * Start the timeout.
     * @example
     * ```javascript
     * socket.startTimeout();
     * ```
     */
    startTimeout() {
        console.log(`Starting timeout for ${this.timeoutDuration} ms`); // eslint-disable-line no-undef
        this.timeoutId = setTimeout(() => {
            console.log('Closing WebSocket connection due to timeout.'); // eslint-disable-line no-undef
            this.close(1006, 'Connection Timeout');
        }, this.timeoutDuration);
    }

    /**
     * Clear the timeout.
     * @example
     * ```javascript
     * socket.clTimeout();
     * ```
     */
    clTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    /**
     * Perform the WebSocket handshake for signalR hub connection.
     * @param {string} protocol - The protocol. (default: 'json')
     * @param {number} version - The version. (default: 1)
     */
    signalRhubHandshake(protocol = 'json', version = 1) {
        let message = JSON.stringify({ protocol: protocol, version: version });
        this.socket.send(`${message}\x1e`);
    }

    /**
     * Handle the WebSocket connection open event for signalR hub connection.
     * @example
     * ```javascript
     * socket.onSignalROpen();
     * ```
     */
    onSignalROpen() {
        this.signalRhubHandshake();
        console.log('SignalR Hub connection opened.'); // eslint-disable-line no-undef
    }

    onSignalRMessage(message = '') {
        try {
            const dataBody = JSON.parse(message.data.replace('\u001e', ''));
            if (!dataBody.target || dataBody === '') {
                console.log('SignalR Hub connection message received.'); // eslint-disable-line no-undef
                return;
            }
            switch (dataBody.target) {
                default:
                    console.log(`Unhandled message: ${JSON.stringify(dataBody)}`); // eslint-disable-line no-undef
                    break;
            }
        } catch (error) {
            console.log(`Error parsing message: ${error}`); // eslint-disable-line no-undef
        }
    }

    /**
     * Handle the WebSocket connection close event.
     * @param {object} message - The close message. (default: {})
     * @example
     * ```javascript
     * socket.onClose();
     * ```
     */
    onClose(message = {}) {
        console.log(`WebSocket connection closed: ${JSON.stringify(message)}`); // eslint-disable-line no-undef
        this.clTimeout();
    }

    /**
     * Handle the WebSocket connection error event.
     * @param {object} message - The error message. (default: {})
     * @example
     * ```javascript
     * socket.onError();
     * ```
     */
    onError(message = {}) {
        console.log(`WebSocket connection error: ${JSON.stringify(message)}`); // eslint-disable-line no-undef
        this.clTimeout();
    }

    /**
     * Set up the WebSocket event listeners for signalR hub connection.
     * @example
     * ```javascript
     * socket.setupSignalREventListeners();
     * ```
     */
    setupSignalREventListeners() {
        console.log('Setting up WebSocket event listeners.'); // eslint-disable-line no-undef
        this.addEventListener('open', () => {
            this.onSignalROpen();
            this.addEventListener('message', (message) => this.onSignalRMessage(message));
        });
        this.startTimeout();
    }

    /**
     * Tear down the WebSocket event listeners.
     * @example
     * ```javascript
     * socket.tearDown();
     * ```
     */
    tearDown() {
        this.addEventListener('close', () => {
            this.onClose();
        });
        this.addEventListener('error', () => {
            this.onError();
        });
    }
}


export { WebSocketClient };
