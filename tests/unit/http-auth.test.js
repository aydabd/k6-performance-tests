import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Authenticator } from '../../src/clients/http-auth.js';

// k6 exposes __ENV as a global variable; simulate it for unit tests
const originalEnv = global.__ENV;

beforeEach(() => {
    global.__ENV = {};
});

afterEach(() => {
    global.__ENV = originalEnv;
    vi.restoreAllMocks();
});

describe('Authenticator', () => {
    describe('getBasicAuth', () => {
        it('returns base64-encoded credentials when username and password are provided', () => {
            const auth = new Authenticator({ username: 'user', password: 'pass' });
            const result = auth.getBasicAuth();
            expect(result).toBe(Buffer.from('user:pass').toString('base64'));
        });

        it('returns empty string when username is missing', () => {
            const auth = new Authenticator({ password: 'pass' });
            expect(auth.getBasicAuth()).toBe('');
        });

        it('returns empty string when password is missing', () => {
            const auth = new Authenticator({ username: 'user' });
            expect(auth.getBasicAuth()).toBe('');
        });

        it('returns empty string when neither username nor password are provided', () => {
            const auth = new Authenticator({});
            expect(auth.getBasicAuth()).toBe('');
        });

        it('reads credentials from __ENV when options are empty', () => {
            global.__ENV = { API_USERNAME: 'envuser', API_PASSWORD: 'envpass' };
            const auth = new Authenticator({});
            const result = auth.getBasicAuth();
            expect(result).toBe(Buffer.from('envuser:envpass').toString('base64'));
        });
    });

    describe('getTokenBearerAuth', () => {
        it('returns the token when token is provided', () => {
            const auth = new Authenticator({ token: 'mytoken' });
            expect(auth.getTokenBearerAuth()).toBe('mytoken');
        });

        it('returns empty string when token is not provided', () => {
            const auth = new Authenticator({});
            expect(auth.getTokenBearerAuth()).toBe('');
        });

        it('reads token from __ENV when options are empty', () => {
            global.__ENV = { API_TOKEN: 'envtoken' };
            const auth = new Authenticator({});
            expect(auth.getTokenBearerAuth()).toBe('envtoken');
        });
    });
});
