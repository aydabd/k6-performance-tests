import { describe, it, expect } from 'vitest';
import { BaseUrl } from '../../src/clients/base-url.js';

describe('BaseUrl', () => {
    it('builds baseURL from host with default https protocol', () => {
        const result = new BaseUrl({ host: 'api.example.com' });
        expect(result.baseURL).toBe('https://api.example.com');
    });

    it('builds baseURL from host with explicit protocol', () => {
        const result = new BaseUrl({ host: 'api.example.com', protocol: 'http' });
        expect(result.baseURL).toBe('http://api.example.com');
    });

    it('includes non-default port in baseURL', () => {
        const result = new BaseUrl({ host: 'api.example.com', protocol: 'https', port: '8443' });
        expect(result.baseURL).toBe('https://api.example.com:8443');
    });

    it('omits default port 443 for https', () => {
        const result = new BaseUrl({ host: 'api.example.com', protocol: 'https', port: '443' });
        expect(result.baseURL).toBe('https://api.example.com');
    });

    it('omits default port 80 for http', () => {
        const result = new BaseUrl({ host: 'api.example.com', protocol: 'http', port: '80' });
        expect(result.baseURL).toBe('http://api.example.com');
    });

    it('uses provided baseURL directly when supplied', () => {
        const result = new BaseUrl({ baseURL: 'https://custom.example.com:9000' });
        expect(result.baseURL).toBe('https://custom.example.com:9000');
    });

    it('throws when neither host nor baseURL is provided', () => {
        expect(() => new BaseUrl({})).toThrow('The host or baseURL must be provided.');
    });

    it('builds wss baseURL and omits default port 443', () => {
        const result = new BaseUrl({ host: 'ws.example.com', protocol: 'wss', port: '443' });
        expect(result.baseURL).toBe('wss://ws.example.com');
    });

    it('builds wss baseURL with non-default port', () => {
        const result = new BaseUrl({ host: 'ws.example.com', protocol: 'wss', port: '8080' });
        expect(result.baseURL).toBe('wss://ws.example.com:8080');
    });
});
