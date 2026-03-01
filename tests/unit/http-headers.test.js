import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HttpHeaders } from '../../src/clients/http-client.js';
import { Authenticator } from '../../src/clients/http-auth.js';

const originalEnv = global.__ENV;

beforeEach(() => {
    global.__ENV = {};
});

afterEach(() => {
    global.__ENV = originalEnv;
});

describe('HttpHeaders', () => {
    it('adds Basic Authorization header when username and password are provided', () => {
        const options = {
            username: 'user',
            password: 'pass',
            headers: { 'Content-Type': 'application/json' },
        };
        options.authenticator = new Authenticator(options);
        const headers = new HttpHeaders(options);
        expect(headers.Authorization).toMatch(/^Basic /);
    });

    it('adds Bearer Authorization header when token is provided', () => {
        const options = {
            token: 'mytoken',
            headers: { 'Content-Type': 'application/json' },
        };
        options.authenticator = new Authenticator(options);
        const headers = new HttpHeaders(options);
        expect(headers.Authorization).toBe('Bearer mytoken');
    });

    it('returns headers without Authorization when no credentials are given', () => {
        const options = {
            headers: { 'Content-Type': 'application/json' },
        };
        options.authenticator = new Authenticator(options);
        const headers = new HttpHeaders(options);
        expect(headers.Authorization).toBeUndefined();
    });

    it('preserves existing headers alongside the Authorization header', () => {
        const options = {
            token: 'tok',
            headers: { 'Content-Type': 'application/json', 'X-Custom': 'value' },
        };
        options.authenticator = new Authenticator(options);
        const headers = new HttpHeaders(options);
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['X-Custom']).toBe('value');
        expect(headers.Authorization).toBe('Bearer tok');
    });
});
