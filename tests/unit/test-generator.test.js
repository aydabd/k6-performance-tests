import { describe, it, expect } from 'vitest';
import { generateK6Script, createTestGeneratorAgent, AUTH_METHOD_MAP, pathToProxyCall } from '../../src/agents/test-generator.js';

const DESCRIPTOR_BEARER = {
    id: 'TC-001',
    userStory: 'US-42',
    endpoint: { method: 'GET', path: '/v2/breeds/list/all' },
    auth: 'bearer',
    steps: ['GET /v2/breeds/list/all', 'Assert 200', 'Assert response body'],
    performance: { p95: 500, errorRate: 0.01 },
    tags: ['smoke', 'regression', 'US-42'],
};

const DESCRIPTOR_NO_AUTH = {
    ...DESCRIPTOR_BEARER,
    id: 'TC-002',
    auth: 'none',
};

describe('generateK6Script - imports', () => {
    it('returns a string', () => {
        expect(typeof generateK6Script(DESCRIPTOR_BEARER)).toBe('string');
    });

    it('imports group and sleep from k6', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain("import { group, sleep } from 'k6'");
    });

    it('imports HttpClientFactory from correct path', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER, { relativeImportPath: '../src' });
        expect(script).toContain("from '../src/clients/http-client.js'");
    });

    it('includes Authenticator import when auth is bearer', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain("from '../src/clients/http-auth.js'");
    });

    it('omits Authenticator import when auth is none', () => {
        const script = generateK6Script(DESCRIPTOR_NO_AUTH);
        expect(script).not.toContain('http-auth.js');
    });

    it('uses custom relativeImportPath', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER, { relativeImportPath: '../../custom' });
        expect(script).toContain("from '../../custom/clients/http-client.js'");
    });

    it('does not import TestCaseBuilder (causes k6 init failure)', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).not.toContain('TestCaseBuilder');
        expect(script).not.toContain('test-case.js');
    });
});

describe('generateK6Script - no export const options (config file handles thresholds)', () => {
    it('does not export const options', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).not.toContain('export const options');
    });

    it('does not contain p95 threshold in script', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).not.toContain('p(95)');
    });
});

describe('generateK6Script - default function', () => {
    it('contains export default function', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('export default function');
    });

    it('contains group() call with descriptor id in title', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('group(');
        expect(script).toContain('TC-001');
    });

    it('contains sleep(1) call', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('sleep(1)');
    });

    it('uses new HttpClientFactory constructor with host', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('new HttpClientFactory(');
        expect(script).toContain('host:');
        expect(script).not.toContain('HttpClientFactory.create(');
    });

    it('uses API_SERVER env var (not BASE_URL)', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('API_SERVER');
        expect(script).not.toContain('BASE_URL');
    });

    it('does not contain toK6Group (causes k6 init failure)', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).not.toContain('toK6Group');
    });

    it('maps bearer auth to getTokenBearerAuth()', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('getTokenBearerAuth()');
        expect(script).not.toContain('getAuth()');
    });

    it('maps basic auth to getBasicAuth()', () => {
        const desc = { ...DESCRIPTOR_BEARER, auth: 'basic' };
        const script = generateK6Script(desc);
        expect(script).toContain('getBasicAuth()');
    });

    it('maps apiKey auth to getApiKeyAuth()', () => {
        const desc = { ...DESCRIPTOR_BEARER, auth: 'apiKey' };
        const script = generateK6Script(desc);
        expect(script).toContain('getApiKeyAuth()');
    });

    it('maps jwt auth to getJwtAuth()', () => {
        const desc = { ...DESCRIPTOR_BEARER, auth: 'jwt' };
        const script = generateK6Script(desc);
        expect(script).toContain('getJwtAuth()');
    });

    it('maps oauth2 auth to getOAuth2Auth()', () => {
        const desc = { ...DESCRIPTOR_BEARER, auth: 'oauth2' };
        const script = generateK6Script(desc);
        expect(script).toContain('getOAuth2Auth()');
    });

    it('omits auth lines when auth is none', () => {
        const script = generateK6Script(DESCRIPTOR_NO_AUTH);
        expect(script).not.toContain('new Authenticator(');
        expect(script).not.toContain('getAuth');
    });
});

describe('pathToProxyCall', () => {
    it('converts simple path to proxy chain', () => {
        expect(pathToProxyCall('/v2/breeds', 'GET')).toBe('dynamicClient.v2.breeds.get()');
    });

    it('converts nested path to chained proxy', () => {
        expect(pathToProxyCall('/v2/breeds/list/all', 'GET')).toBe('dynamicClient.v2.breeds.list.all.get()');
    });

    it('converts path parameter to function call', () => {
        expect(pathToProxyCall('/v2/breeds/{id}', 'GET')).toBe('dynamicClient.v2.breeds("id").get()');
    });

    it('handles POST method', () => {
        expect(pathToProxyCall('/api/users', 'POST')).toBe('dynamicClient.api.users.post()');
    });

    it('handles path with leading slash removed', () => {
        expect(pathToProxyCall('breeds', 'GET')).toBe('dynamicClient.breeds.get()');
    });
});

describe('AUTH_METHOD_MAP', () => {
    it('covers all supported auth types', () => {
        expect(AUTH_METHOD_MAP.bearer).toBe('getTokenBearerAuth');
        expect(AUTH_METHOD_MAP.basic).toBe('getBasicAuth');
        expect(AUTH_METHOD_MAP.apiKey).toBe('getApiKeyAuth');
        expect(AUTH_METHOD_MAP.jwt).toBe('getJwtAuth');
        expect(AUTH_METHOD_MAP.oauth2).toBe('getOAuth2Auth');
    });
});

describe('createTestGeneratorAgent', () => {
    it('returns ok output with scripts array', async () => {
        const agent = createTestGeneratorAgent();
        const input = {
            type: 'GENERATE',
            payload: { descriptors: [DESCRIPTOR_BEARER, DESCRIPTOR_NO_AUTH], options: {} },
            context: {},
        };
        const output = await agent(input);
        expect(output.status).toBe('ok');
        expect(output.payload.scripts).toHaveLength(2);
        expect(output.payload.scripts[0].id).toBe('TC-001');
        expect(typeof output.payload.scripts[0].script).toBe('string');
    });

    it('returns empty scripts for empty descriptors', async () => {
        const agent = createTestGeneratorAgent();
        const output = await agent({ type: 'GENERATE', payload: { descriptors: [] }, context: {} });
        expect(output.payload.scripts).toEqual([]);
    });

    it('generated script does not use TestCaseBuilder', async () => {
        const agent = createTestGeneratorAgent();
        const output = await agent({
            type: 'GENERATE',
            payload: { descriptors: [DESCRIPTOR_BEARER] },
            context: {},
        });
        const script = output.payload.scripts[0].script;
        expect(script).not.toContain('TestCaseBuilder');
        expect(script).not.toContain('export const options');
        expect(script).toContain('group(');
        expect(script).toContain('sleep(');
    });
});

