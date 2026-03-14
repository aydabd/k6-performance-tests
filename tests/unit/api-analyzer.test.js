import { describe, it, expect } from 'vitest';
import { analyzeApi, createApiAnalyzerAgent } from '../../src/agents/api-analyzer.js';

const V3_SPEC = {
    openapi: '3.0.0',
    info: { title: 'Dogs API', version: '1.0' },
    servers: [{ url: 'https://dog.ceo/api' }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer' },
            apiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
            basicAuth: { type: 'http', scheme: 'basic' },
        },
    },
    paths: {
        '/v2/breeds/list/all': {
            get: {
                summary: 'List all breeds',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'limit', in: 'query' }],
                responses: { '200': { description: 'ok' } },
            },
        },
        '/v2/breeds/image/random': {
            get: {
                summary: 'Random image',
                security: [],
                responses: { '200': { description: 'ok' } },
            },
        },
    },
};

const V2_SPEC = {
    swagger: '2.0',
    info: { title: 'Dogs API', version: '1.0' },
    host: 'dog.ceo',
    basePath: '/api',
    schemes: ['https'],
    securityDefinitions: {
        apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    },
    paths: {
        '/v2/breeds/list/all': {
            get: {
                summary: 'List breeds',
                security: [{ apiKey: [] }],
                responses: { '200': { description: 'ok' } },
            },
        },
    },
};

describe('analyzeApi - OpenAPI v3', () => {
    it('returns correct baseUrl', () => {
        const result = analyzeApi(V3_SPEC);
        expect(result.baseUrl).toBe('https://dog.ceo/api');
    });

    it('returns version v3', () => {
        expect(analyzeApi(V3_SPEC).version).toBe('v3');
    });

    it('extracts endpoints with correct method and path', () => {
        const { endpoints } = analyzeApi(V3_SPEC);
        expect(endpoints.some((e) => e.method === 'GET' && e.path === '/v2/breeds/list/all')).toBe(true);
    });

    it('extracts summary', () => {
        const { endpoints } = analyzeApi(V3_SPEC);
        const ep = endpoints.find((e) => e.path === '/v2/breeds/list/all');
        expect(ep.summary).toBe('List all breeds');
    });

    it('extracts parameters', () => {
        const { endpoints } = analyzeApi(V3_SPEC);
        const ep = endpoints.find((e) => e.path === '/v2/breeds/list/all');
        expect(ep.parameters).toHaveLength(1);
    });

    it('detects bearer auth', () => {
        const { endpoints } = analyzeApi(V3_SPEC);
        const ep = endpoints.find((e) => e.path === '/v2/breeds/list/all');
        expect(ep.auth).toBe('bearer');
    });

    it('detects none auth when security is empty array', () => {
        const { endpoints } = analyzeApi(V3_SPEC);
        const ep = endpoints.find((e) => e.path === '/v2/breeds/image/random');
        expect(ep.auth).toBe('none');
    });
});

describe('analyzeApi - auth detection', () => {
    const makeSpec = (scheme) => ({
        openapi: '3.0.0',
        servers: [{ url: 'https://api.example.com' }],
        components: { securitySchemes: { myAuth: scheme } },
        paths: {
            '/test': {
                get: {
                    summary: 'test',
                    security: [{ myAuth: [] }],
                    responses: {},
                },
            },
        },
    });

    it('detects apiKey auth', () => {
        const spec = makeSpec({ type: 'apiKey', in: 'header', name: 'X-Key' });
        const { endpoints } = analyzeApi(spec);
        expect(endpoints[0].auth).toBe('apiKey');
    });

    it('detects basic auth', () => {
        const spec = makeSpec({ type: 'http', scheme: 'basic' });
        const { endpoints } = analyzeApi(spec);
        expect(endpoints[0].auth).toBe('basic');
    });

    it('detects bearer from oauth2', () => {
        const spec = makeSpec({ type: 'oauth2', flows: {} });
        const { endpoints } = analyzeApi(spec);
        expect(endpoints[0].auth).toBe('bearer');
    });
});

describe('analyzeApi - Swagger v2', () => {
    it('returns correct baseUrl', () => {
        const result = analyzeApi(V2_SPEC);
        expect(result.baseUrl).toBe('https://dog.ceo/api');
    });

    it('returns version v2', () => {
        expect(analyzeApi(V2_SPEC).version).toBe('v2');
    });

    it('detects apiKey auth', () => {
        const { endpoints } = analyzeApi(V2_SPEC);
        expect(endpoints[0].auth).toBe('apiKey');
    });
});

describe('analyzeApi - global security inheritance', () => {
    it('inherits global security when operation has no security field', () => {
        const spec = {
            openapi: '3.0.0',
            servers: [{ url: 'https://api.example.com' }],
            security: [{ bearerAuth: [] }],
            components: {
                securitySchemes: {
                    bearerAuth: { type: 'http', scheme: 'bearer' },
                },
            },
            paths: {
                '/items': {
                    get: {
                        summary: 'No local security — inherits global',
                        responses: {},
                    },
                },
            },
        };
        const { endpoints } = analyzeApi(spec);
        expect(endpoints[0].auth).toBe('bearer');
    });

    it('operation-level security: [] overrides global and means no auth', () => {
        const spec = {
            openapi: '3.0.0',
            servers: [{ url: 'https://api.example.com' }],
            security: [{ bearerAuth: [] }],
            components: {
                securitySchemes: {
                    bearerAuth: { type: 'http', scheme: 'bearer' },
                },
            },
            paths: {
                '/public': {
                    get: {
                        summary: 'Explicitly no auth',
                        security: [],
                        responses: {},
                    },
                },
            },
        };
        const { endpoints } = analyzeApi(spec);
        expect(endpoints[0].auth).toBe('none');
    });

    it('inherits global security for Swagger v2 when operation has no security field', () => {
        const spec = {
            swagger: '2.0',
            info: { title: 'Test', version: '1.0' },
            host: 'api.example.com',
            basePath: '/api',
            schemes: ['https'],
            security: [{ apiKey: [] }],
            securityDefinitions: {
                apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
            },
            paths: {
                '/items': {
                    get: { summary: 'list', responses: {} },
                },
            },
        };
        const { endpoints } = analyzeApi(spec);
        expect(endpoints[0].auth).toBe('apiKey');
    });
});

describe('analyzeApi - error cases', () => {
    it('throws when paths is missing', () => {
        expect(() => analyzeApi({ openapi: '3.0.0' }))
            .toThrow('Invalid spec: missing paths');
    });

    it('throws when spec is unknown version', () => {
        expect(() => analyzeApi({ paths: {}, info: {} }))
            .toThrow('Unknown spec version');
    });

    it('throws when spec is null', () => {
        expect(() => analyzeApi(null)).toThrow('Invalid spec');
    });
});

describe('createApiAnalyzerAgent', () => {
    it('returns ok output for valid spec', async () => {
        const agent = createApiAnalyzerAgent();
        const output = await agent({ type: 'ANALYZE', payload: { spec: V3_SPEC }, context: {} });
        expect(output.status).toBe('ok');
        expect(output.payload.version).toBe('v3');
    });

    it('returns error output for invalid spec', async () => {
        const agent = createApiAnalyzerAgent();
        const output = await agent({ type: 'ANALYZE', payload: { spec: null }, context: {} });
        expect(output.status).toBe('error');
        expect(output.payload).toBeNull();
    });
});
