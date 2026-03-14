import { describe, it, expect } from 'vitest';
import { planTests, createTestPlannerAgent } from '../../src/agents/test-planner.js';

const ENDPOINT_MAP = {
    baseUrl: 'https://dog.ceo/api',
    endpoints: [
        { method: 'GET', path: '/v2/breeds/list/all', auth: 'bearer', summary: 'List breeds' },
        { method: 'POST', path: '/v2/breeds', auth: 'none', summary: 'Create breed' },
    ],
    version: 'v3',
};

describe('planTests - basic output', () => {
    it('returns one descriptor per endpoint', () => {
        const result = planTests(ENDPOINT_MAP, ['US-42: As a user I want to see breeds']);
        expect(result).toHaveLength(2);
    });

    it('returns empty array for empty endpoints', () => {
        const result = planTests({ endpoints: [] }, []);
        expect(result).toEqual([]);
    });

    it('returns empty array when endpointMap is null', () => {
        const result = planTests(null, []);
        expect(result).toEqual([]);
    });

    it('returns empty array when endpoints is missing', () => {
        const result = planTests({}, []);
        expect(result).toEqual([]);
    });
});

describe('planTests - TC ID format', () => {
    it('formats first ID as TC-001', () => {
        const result = planTests(ENDPOINT_MAP, []);
        expect(result[0].id).toBe('TC-001');
    });

    it('formats second ID as TC-002', () => {
        const result = planTests(ENDPOINT_MAP, []);
        expect(result[1].id).toBe('TC-002');
    });

    it('pads to 3 digits for numbers < 10', () => {
        const map = { endpoints: Array.from({ length: 9 }, (_, i) => ({ method: 'GET', path: `/p${i}`, auth: 'none' })) };
        const result = planTests(map, []);
        expect(result[8].id).toBe('TC-009');
    });
});

describe('planTests - user story extraction', () => {
    it('extracts US-42 from story text', () => {
        const result = planTests(ENDPOINT_MAP, ['US-42: As a user I want breeds']);
        expect(result[0].userStory).toBe('US-42');
    });

    it('defaults to US-000 when no US- pattern found', () => {
        const result = planTests(ENDPOINT_MAP, ['As a user I want something']);
        expect(result[0].userStory).toBe('US-000');
    });

    it('defaults to US-000 when no stories provided', () => {
        const result = planTests(ENDPOINT_MAP, []);
        expect(result[0].userStory).toBe('US-000');
    });
});

describe('planTests - descriptor shape', () => {
    it('includes correct endpoint', () => {
        const result = planTests(ENDPOINT_MAP, ['US-42']);
        expect(result[0].endpoint).toEqual({ method: 'GET', path: '/v2/breeds/list/all' });
    });

    it('includes auth from endpoint', () => {
        const result = planTests(ENDPOINT_MAP, []);
        expect(result[0].auth).toBe('bearer');
        expect(result[1].auth).toBe('none');
    });

    it('includes steps array', () => {
        const result = planTests(ENDPOINT_MAP, []);
        expect(result[0].steps).toEqual([
            'GET /v2/breeds/list/all',
            'Assert 200',
            'Assert response body',
        ]);
    });

    it('includes default performance thresholds', () => {
        const result = planTests(ENDPOINT_MAP, []);
        expect(result[0].performance).toEqual({ p95: 500, errorRate: 0.01 });
    });

    it('includes tags with smoke, regression, and story id', () => {
        const result = planTests(ENDPOINT_MAP, ['US-42']);
        expect(result[0].tags).toContain('smoke');
        expect(result[0].tags).toContain('regression');
        expect(result[0].tags).toContain('US-42');
    });
});

describe('createTestPlannerAgent', () => {
    it('returns ok output with descriptors', async () => {
        const agent = createTestPlannerAgent();
        const input = {
            type: 'PLAN',
            payload: ENDPOINT_MAP,
            context: { stories: ['US-42 story'] },
        };
        const output = await agent(input);
        expect(output.status).toBe('ok');
        expect(Array.isArray(output.payload.descriptors)).toBe(true);
        expect(output.payload.descriptors).toHaveLength(2);
    });
});
