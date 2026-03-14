import { describe, it, expect } from 'vitest';
import { generateK6Script, createTestGeneratorAgent } from '../../src/agents/test-generator.js';

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

    it('imports TestCaseBuilder from correct path', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER, { relativeImportPath: '../src' });
        expect(script).toContain("from '../src/test-case.js'");
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
        expect(script).toContain("from '../../custom/test-case.js'");
    });
});

describe('generateK6Script - options export', () => {
    it('exports options with correct p95 threshold', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain("'p(95)<500'");
    });

    it('exports options with correct error rate threshold', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain("'rate<0.01'");
    });

    it('uses custom thresholds from descriptor', () => {
        const custom = { ...DESCRIPTOR_BEARER, performance: { p95: 1000, errorRate: 0.05 } };
        const script = generateK6Script(custom);
        expect(script).toContain("'p(95)<1000'");
        expect(script).toContain("'rate<0.05'");
    });
});

describe('generateK6Script - default function', () => {
    it('contains TestCaseBuilder with descriptor id', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain("'TC-001'");
    });

    it('contains export default function', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('export default function');
    });

    it('contains toK6Group call', () => {
        const script = generateK6Script(DESCRIPTOR_BEARER);
        expect(script).toContain('toK6Group');
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
});
