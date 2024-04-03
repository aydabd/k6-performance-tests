/**
 * WebSocket test script
 *
 * This script tests a WebSocket connection to a public chat room.
 * The chat room is hosted by test-api.k6.io.
 * The script connects to the chat room and sends a message.
 * It also listens for incoming messages and logs them.
 * The script uses the WebSocketClient class from the ws-client.js module.
 * The script uses the setTimeout function from the k6/experimental/timers module.
 * The script uses the sleep function from the k6 module.
 * @example
 * ```bash
 * k6 run websocket-test.js
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */
import { setTimeout } from 'k6/experimental/timers';
import { sleep } from 'k6';
import { WebSocketClient } from '../src/clients/ws-client.js';

// Environment variables
const K6_API_SERVER = __ENV.API_SERVER || ''; // eslint-disable-line no-undef

/**
 * Main test
 */
export default function () {

    // ################ Public chat room for test ################
    console.log(`Test a WebSocket connection to ${K6_API_SERVER}`); // eslint-disable-line no-undef
    let chatRoomName = 'publicRoom';
    const wsOptK6chat = {
        host: `${K6_API_SERVER}/ws/crocochat/${chatRoomName}/`,
        protocol: 'wss',
    };

    const ws2 = new WebSocketClient(wsOptK6chat);
    console.log(`WebSocketClient: ${JSON.stringify(ws2.params)}`); // eslint-disable-line no-undef
    ws2.addEventListener('open', () => {
        ws2.send({ event: 'SET_NAME', new_name: `Croc ${__VU}:${1}` }); // eslint-disable-line no-undef
        ws2.addEventListener('message', (event) => {
            console.log('Received message', event.data); // eslint-disable-line no-undef
            let msg = JSON.parse(event.data);
            if (msg.event === 'CHAT_MSG') {
                console.log(`[${msg.sender}] ${msg.message}`); // eslint-disable-line no-undef
            } else if (msg.event === 'ERROR') {
                console.error(`VU ${__VU}:${1} received error message: ${msg.message}`); // eslint-disable-line no-undef
            } else {
                console.log(`VU ${__VU}:${1} received unknown message: ${msg.message}`); // eslint-disable-line no-undef
            }
        });
        let timeout1 = setTimeout(() => {
            ws2.send({ event: 'LEAVE' });
        }, 5000);

        let timeout2 = setTimeout(() => {
            ws2.close();
        }, 8000);

        ws2.addEventListener('close', () => {
            ws2.clTimeout(timeout1);
            ws2.clTimeout(timeout2);
            console.log('WebSocket is closed'); // eslint-disable-line no-undef
        });
    });
    sleep(1);
}
