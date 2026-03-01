/**
 * Mock for the k6/websockets built-in module.
 * Used only in unit tests — never imported by k6 itself.
 */

export class WebSocket {
    constructor(url, params) {
        this.url = url;
        this.params = params;
        this._listeners = {};
    }

    addEventListener(event, handler) {
        this._listeners[event] = handler;
    }

    send(message) {
        this._sentMessages = this._sentMessages || [];
        this._sentMessages.push(message);
    }

    close(code, reason) {
        this._closed = { code, reason };
    }
}

export default { WebSocket };
