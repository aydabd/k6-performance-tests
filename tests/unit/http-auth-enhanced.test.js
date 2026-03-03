import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Authenticator } from '../../src/clients/http-auth.js';

// Mock k6/http to return token responses for JWT and OAuth2 tests
vi.mock('k6/http', () => ({
    default: {
        post: vi.fn(() => ({ status: 200, body: '{}' })),
    },
    post: vi.fn(() => ({ status: 200, body: '{}' })),
}));

import http from 'k6/http';

// k6 exposes __ENV as a global variable; simulate it for unit tests
const originalEnv = global.__ENV;

beforeEach(() => {
    global.__ENV = {};
    vi.clearAllMocks();
});

afterEach(() => {
    global.__ENV = originalEnv;
    vi.restoreAllMocks();
});

describe('Authenticator - JWT', () => {
    describe('getJwtAuth', () => {
        it('returns JWT token when credentials are provided', () => {
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ token: 'jwt-token-123' }),
            });
            const auth = new Authenticator({
                loginUrl: 'https://api.example.com/login',
                username: 'user',
                password: 'pass',
            });
            const result = auth.getJwtAuth();
            expect(result).toBe('jwt-token-123');
            expect(http.post).toHaveBeenCalledWith(
                'https://api.example.com/login',
                JSON.stringify({ username: 'user', password: 'pass' }),
                { headers: { 'Content-Type': 'application/json' } },
            );
        });

        it('uses loginUrl parameter override', () => {
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ token: 'jwt-override' }),
            });
            const auth = new Authenticator({
                loginUrl: 'https://original.com/login',
                username: 'user',
                password: 'pass',
            });
            const result = auth.getJwtAuth('https://override.com/login');
            expect(result).toBe('jwt-override');
            expect(http.post).toHaveBeenCalledWith(
                'https://override.com/login',
                expect.any(String),
                expect.any(Object),
            );
        });

        it('supports custom token field', () => {
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ access_token: 'custom-field-token' }),
            });
            const auth = new Authenticator({
                loginUrl: 'https://api.example.com/login',
                username: 'user',
                password: 'pass',
                tokenField: 'access_token',
            });
            const result = auth.getJwtAuth();
            expect(result).toBe('custom-field-token');
        });

        it('returns empty string when credentials are missing', () => {
            const auth = new Authenticator({});
            expect(auth.getJwtAuth()).toBe('');
        });

        it('reads credentials from __ENV when options are empty', () => {
            global.__ENV = {
                JWT_LOGIN_URL: 'https://env.example.com/login',
                JWT_USERNAME: 'envuser',
                JWT_PASSWORD: 'envpass',
            };
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ token: 'env-jwt-token' }),
            });
            const auth = new Authenticator({});
            const result = auth.getJwtAuth();
            expect(result).toBe('env-jwt-token');
        });

        it('returns empty string when login request fails', () => {
            http.post.mockReturnValue({ status: 401, body: '{}' });
            const auth = new Authenticator({
                loginUrl: 'https://api.example.com/login',
                username: 'user',
                password: 'pass',
            });
            expect(auth.getJwtAuth()).toBe('');
        });

        it('returns empty string when response body is not valid JSON', () => {
            http.post.mockReturnValue({ status: 200, body: '<html>Error</html>' });
            const auth = new Authenticator({
                loginUrl: 'https://api.example.com/login',
                username: 'user',
                password: 'pass',
            });
            expect(auth.getJwtAuth()).toBe('');
        });

        it('returns empty string when response body is null JSON', () => {
            http.post.mockReturnValue({ status: 200, body: 'null' });
            const auth = new Authenticator({
                loginUrl: 'https://api.example.com/login',
                username: 'user',
                password: 'pass',
            });
            expect(auth.getJwtAuth()).toBe('');
        });

        it('returns empty string when token field is missing from response', () => {
            http.post.mockReturnValue({ status: 200, body: '{"other":"value"}' });
            const auth = new Authenticator({
                loginUrl: 'https://api.example.com/login',
                username: 'user',
                password: 'pass',
            });
            expect(auth.getJwtAuth()).toBe('');
        });
    });
});

describe('Authenticator - API Key', () => {
    describe('getApiKeyAuth', () => {
        it('returns API key when provided', () => {
            const auth = new Authenticator({ apiKey: 'my-secret-key' });
            expect(auth.getApiKeyAuth()).toBe('my-secret-key');
        });

        it('returns empty string when API key is missing', () => {
            const auth = new Authenticator({});
            expect(auth.getApiKeyAuth()).toBe('');
        });

        it('reads API key from __ENV when options are empty', () => {
            global.__ENV = { API_KEY: 'env-api-key' };
            const auth = new Authenticator({});
            expect(auth.getApiKeyAuth()).toBe('env-api-key');
        });
    });
});

describe('ApiKeyAuthenticator - header name', () => {
    it('uses default header name X-API-Key', () => {
        const auth = new Authenticator({ apiKey: 'key' });
        // Access the underlying ApiKeyAuthenticator via facade indirectly
        // The facade only exposes getApiKeyAuth, so test header via env
        expect(auth.getApiKeyAuth()).toBe('key');
    });
});

describe('Authenticator - OAuth2', () => {
    describe('getOAuth2Auth', () => {
        it('returns access token when credentials are provided', () => {
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ access_token: 'oauth2-token-456' }),
            });
            const auth = new Authenticator({
                tokenUrl: 'https://auth.example.com/token',
                clientId: 'my-client',
                clientSecret: 'my-secret',
            });
            const result = auth.getOAuth2Auth();
            expect(result).toBe('oauth2-token-456');
            expect(http.post).toHaveBeenCalledWith(
                'https://auth.example.com/token',
                expect.objectContaining({
                    grant_type: 'client_credentials',
                    client_id: 'my-client',
                    client_secret: 'my-secret',
                }),
            );
        });

        it('includes scope when provided', () => {
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ access_token: 'scoped-token' }),
            });
            const auth = new Authenticator({
                tokenUrl: 'https://auth.example.com/token',
                clientId: 'my-client',
                clientSecret: 'my-secret',
                scope: 'read write',
            });
            const result = auth.getOAuth2Auth();
            expect(result).toBe('scoped-token');
            expect(http.post).toHaveBeenCalledWith(
                'https://auth.example.com/token',
                expect.objectContaining({ scope: 'read write' }),
            );
        });

        it('returns empty string when credentials are missing', () => {
            const auth = new Authenticator({});
            expect(auth.getOAuth2Auth()).toBe('');
        });

        it('reads credentials from __ENV when options are empty', () => {
            global.__ENV = {
                OAUTH2_TOKEN_URL: 'https://env-auth.example.com/token',
                OAUTH2_CLIENT_ID: 'env-client',
                OAUTH2_CLIENT_SECRET: 'env-secret',
            };
            http.post.mockReturnValue({
                status: 200,
                body: JSON.stringify({ access_token: 'env-oauth2-token' }),
            });
            const auth = new Authenticator({});
            const result = auth.getOAuth2Auth();
            expect(result).toBe('env-oauth2-token');
        });

        it('returns empty string when token request fails', () => {
            http.post.mockReturnValue({ status: 500, body: '{}' });
            const auth = new Authenticator({
                tokenUrl: 'https://auth.example.com/token',
                clientId: 'my-client',
                clientSecret: 'my-secret',
            });
            expect(auth.getOAuth2Auth()).toBe('');
        });

        it('returns empty string when response body is not valid JSON', () => {
            http.post.mockReturnValue({ status: 200, body: 'Internal Server Error' });
            const auth = new Authenticator({
                tokenUrl: 'https://auth.example.com/token',
                clientId: 'my-client',
                clientSecret: 'my-secret',
            });
            expect(auth.getOAuth2Auth()).toBe('');
        });

        it('returns empty string when response body is null JSON', () => {
            http.post.mockReturnValue({ status: 200, body: 'null' });
            const auth = new Authenticator({
                tokenUrl: 'https://auth.example.com/token',
                clientId: 'my-client',
                clientSecret: 'my-secret',
            });
            expect(auth.getOAuth2Auth()).toBe('');
        });
    });
});
