import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler } from '../../src/clients/http-error-handler.js';

describe('ErrorHandler', () => {
    it('does not log when isError is false', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        ErrorHandler.logError(false, { status: 404 });
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('does not log when response is falsy', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        ErrorHandler.logError(true, null);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('logs error details to console when isError is true', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const res = {
            status: 404,
            error_code: 'not_found',
            body: 'Not Found',
            headers: {},
            request: { method: 'GET', url: 'https://example.com/api', headers: {} },
        };
        ErrorHandler.logError(true, res);
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('stores the error response after logging', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const res = {
            status: 500,
            error_code: 'server_error',
            body: 'Internal Server Error',
            headers: {},
            request: { method: 'POST', url: 'https://example.com/api', headers: {} },
        };
        ErrorHandler.logError(true, res);
        const errorResponse = ErrorHandler.errorResponse;
        expect(errorResponse.status).toBe(500);
        expect(errorResponse.error_code).toBe('server_error');
        vi.restoreAllMocks();
    });

    it('includes request info and timestamp in the error response', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const res = {
            status: 401,
            error_code: 'unauthorized',
            body: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' },
            request: { method: 'GET', url: 'https://example.com/secure', headers: {} },
        };
        ErrorHandler.logError(true, res, { tag: 'auth-test' });
        const errorResponse = ErrorHandler.errorResponse;
        expect(errorResponse.request).toBe('GET https://example.com/secure');
        expect(errorResponse.timestamp).toBeTruthy();
        expect(errorResponse.tag).toBe('auth-test');
        vi.restoreAllMocks();
    });
});
