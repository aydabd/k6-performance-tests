/* global __ENV, setTimeout, clearTimeout */

/**
 * Deterministic WebSocket echo test for the current k6 WebSocket API.
 * @module websocket-test
 */
import { check, fail } from 'k6';
import { WebSocket } from 'k6/websockets';

const K6_API_SERVER = typeof __ENV === 'undefined' ? 'websocket-echo' : (__ENV.API_SERVER || 'websocket-echo');
const DEFAULT_MESSAGE = 'deterministic-echo';
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Run one WebSocket echo exchange and report its outcome after close.
 * @param {object} options - Exchange options.
 * @param {Function} options.WebSocketConstructor - WebSocket implementation.
 * @param {string} options.url - WebSocket URL.
 * @param {string} options.message - Expected echo payload.
 * @param {number} options.timeoutMs - Maximum time to wait for the echo.
 * @param {Function} options.onResult - Outcome callback.
 * @returns {object} The created WebSocket.
 */
export function runWebSocketExchange({
    WebSocketConstructor,
    url,
    message = DEFAULT_MESSAGE,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onResult = () => {},
}) {
    const result = { connected: false, echoed: false, timedOut: false, closeFailed: false };
    let timer;
    let reported = false;
    const socket = new WebSocketConstructor(url);

    const report = () => {
        if (!reported) {
            reported = true;
            onResult({ ...result });
        }
    };

    socket.addEventListener('open', () => {
        result.connected = true;
        socket.send(message);
        timer = setTimeout(() => {
            result.timedOut = true;
            socket.close(1000, 'echo timeout');
        }, timeoutMs);
    });

    socket.addEventListener('message', (event) => {
        result.echoed = event.data === message;
        clearTimeout(timer);
        socket.close(1000, result.echoed ? 'echo complete' : 'echo mismatch');
    });

    socket.addEventListener('error', () => {
        clearTimeout(timer);
        result.closeFailed = true;
        report();
    });

    socket.addEventListener('close', (event) => {
        clearTimeout(timer);
        result.closeFailed = event.code !== 1000 || !result.echoed;
        report();
    });

    return socket;
}

/**
 * Execute the k6 WebSocket scenario.
 * @returns {void}
 */
export default function () {
    const webSocket = runWebSocketExchange({
        WebSocketConstructor: WebSocket,
        url: `ws://${K6_API_SERVER}:8080`,
        onResult: (outcome) => {
            const passed = check(outcome, {
                'WebSocket connection opened': (value) => value.connected,
                'WebSocket echo matched': (value) => value.echoed,
                'WebSocket exchange did not time out': (value) => !value.timedOut,
                'WebSocket closed cleanly': (value) => !value.closeFailed,
            });
            if (!passed) {
                fail(`WebSocket exchange failed: ${JSON.stringify(outcome)}`);
            }
        },
    });

    return webSocket;
}
