import { describe, expect, it, vi } from 'vitest';
import { runWebSocketExchange } from '../../simple-k6-websocket-test/websocket-test.js';

class FakeSocket {
    constructor() {
        this.listeners = new Map();
        this.sent = [];
        this.closed = [];
    }

    addEventListener(name, handler) {
        this.listeners.set(name, handler);
    }

    send(message) {
        this.sent.push(message);
    }

    close(code, reason) {
        this.closed.push({ code, reason });
    }

    emit(name, event = {}) {
        this.listeners.get(name)?.(event);
    }
}

function createExchange() {
    const socket = new FakeSocket();
    const onResult = vi.fn();
    runWebSocketExchange({
        WebSocketConstructor: class {
            constructor() {
                return socket;
            }
        },
        url: 'ws://websocket-echo:8080',
        message: 'deterministic-echo',
        timeoutMs: 100,
        onResult,
    });
    return { socket, onResult };
}

describe('runWebSocketExchange', () => {
    it('passes after connection, expected echo, and normal close', () => {
        const { socket, onResult } = createExchange();

        socket.emit('open');
        socket.emit('message', { data: 'deterministic-echo' });
        socket.emit('close', { code: 1000 });

        expect(socket.sent).toEqual(['deterministic-echo']);
        expect(socket.closed).toEqual([{ code: 1000, reason: 'echo complete' }]);
        expect(onResult).toHaveBeenCalledWith({ connected: true, echoed: true, timedOut: false, closeFailed: false });
    });

    it('fails when the echo payload does not match', () => {
        const { socket, onResult } = createExchange();

        socket.emit('open');
        socket.emit('message', { data: 'unexpected' });
        socket.emit('close', { code: 1000 });

        expect(socket.closed).toEqual([{ code: 1000, reason: 'echo mismatch' }]);
        expect(onResult).toHaveBeenCalledWith({ connected: true, echoed: false, timedOut: false, closeFailed: true });
    });

    it('fails when the exchange times out', () => {
        vi.useFakeTimers();
        try {
            const { socket, onResult } = createExchange();

            socket.emit('open');
            vi.advanceTimersByTime(100);
            socket.emit('close', { code: 1000 });

            expect(onResult).toHaveBeenCalledWith({ connected: true, echoed: false, timedOut: true, closeFailed: true });
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not time out after receiving the expected echo', () => {
        vi.useFakeTimers();
        try {
            const { socket, onResult } = createExchange();

            socket.emit('open');
            socket.emit('message', { data: 'deterministic-echo' });
            vi.advanceTimersByTime(100);
            expect(onResult).not.toHaveBeenCalled();

            socket.emit('close', { code: 1000 });
            expect(onResult).toHaveBeenCalledWith({ connected: true, echoed: true, timedOut: false, closeFailed: false });
        } finally {
            vi.useRealTimers();
        }
    });

    it('clears the timeout when the socket reports an error', () => {
        vi.useFakeTimers();
        try {
            const { socket, onResult } = createExchange();

            socket.emit('open');
            socket.emit('error');
            vi.advanceTimersByTime(100);

            expect(onResult).toHaveBeenCalledTimes(1);
            expect(onResult).toHaveBeenCalledWith({ connected: true, echoed: false, timedOut: false, closeFailed: true });
        } finally {
            vi.useRealTimers();
        }
    });

    it('fails when the socket closes before the exchange completes', () => {
        const { socket, onResult } = createExchange();

        socket.emit('open');
        socket.emit('close', { code: 1000 });

        expect(onResult).toHaveBeenCalledWith({ connected: true, echoed: false, timedOut: false, closeFailed: true });
    });
});
