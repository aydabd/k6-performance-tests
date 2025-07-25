/**
 * WebSocket test script
 *
 * This script tests a WebSocket connection to a local echo server.
 * The echo server is hosted by a local WebSocket echo server (see compose.yaml).
 * The script connects to the echo server and sends a message.
 * It also listens for incoming messages and logs them.
 * The script uses the WebSocketClient class from the ws-client.js module.
 * The script uses the setTimeout function, which is globally available in k6 as defined by standard WebAPIs.
 * The script uses the sleep function from the k6 module.
 * @example
 * ```bash
 * k6 run websocket-test.js
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */
import { WebSocketClient } from '../src/clients/ws-client.js';

// Environment variables
const K6_API_SERVER = (__ENV.API_SERVER || 'websocket-echo'); // eslint-disable-line no-undef

/**
 * Main test
 */
export default function () {

    // ################ Local echo server test ################
    console.log(`Test a WebSocket connection to ${K6_API_SERVER}`); // eslint-disable-line no-undef
    const wsOptEcho = {
        host: K6_API_SERVER,
        port: 8080,
        protocol: 'ws',
    };

    const ws2 = new WebSocketClient(wsOptEcho);
    console.log(`WebSocketClient: ${JSON.stringify(ws2.params)}`); // eslint-disable-line no-undef
    ws2.addEventListener('open', () => {
        console.log('WebSocket connection opened'); // eslint-disable-line no-undef
        const testMessage = 'Hello WebSocket Echo!';
        let receivedEcho = false;
        ws2.send(testMessage);
        ws2.addEventListener('message', (event) => {
            if (event.data === testMessage) {
                receivedEcho = true;
                console.log(`Received echo: ${event.data}`); // eslint-disable-line no-undef
            }
        });
        ws2.addEventListener('error', (event) => {
            console.error('WebSocket error:', event); // eslint-disable-line no-undef
        });
        // Set a timeout to close the WebSocket after 5 seconds
        console.log('Setting timeout to close WebSocket after 5 seconds'); // eslint-disable-line no-undef
        let timeout1 = setTimeout(() => { // eslint-disable-line no-undef
            ws2.close();
        }, 5000);
        ws2.addEventListener('close', () => {
            ws2.clTimeout(timeout1);
            if (receivedEcho) {
                console.log('✅ Echo assertion passed: received expected message'); // eslint-disable-line no-undef
            } else {
                console.error('❌ Echo assertion failed: did not receive expected message'); // eslint-disable-line no-undef
            }
            console.log('WebSocket is closed'); // eslint-disable-line no-undef
        });
    });
}
