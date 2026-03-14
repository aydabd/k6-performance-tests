import { describe, it, expect } from 'vitest';
import { convertHarToK6, createHarConverterAgent } from '../../src/agents/har-converter.js';

const ENTRY = (url, method = 'GET', pageref = null) => ({
    pageref,
    request: { url, method },
    response: { status: 200 },
});

const HAR_WITH_PAGEREFS = {
    log: {
        entries: [
            ENTRY('https://api.example.com/v2/breeds', 'GET', 'page_1'),
            ENTRY('https://api.example.com/v2/images', 'GET', 'page_1'),
            ENTRY('https://api.example.com/v2/users', 'POST', 'page_2'),
        ],
    },
};

const HAR_NO_PAGEREFS = {
    log: {
        entries: Array.from({ length: 7 }, (_, i) =>
            ENTRY(`https://api.example.com/item/${i}`, 'GET')
        ),
    },
};

describe('convertHarToK6 - basic output', () => {
    it('returns a string', () => {
        expect(typeof convertHarToK6(HAR_WITH_PAGEREFS)).toBe('string');
    });

    it('contains import for HttpClientFactory', () => {
        const script = convertHarToK6(HAR_WITH_PAGEREFS);
        expect(script).toContain("from '../src/clients/http-client.js'");
    });

    it('contains import for k6 group', () => {
        const script = convertHarToK6(HAR_WITH_PAGEREFS);
        expect(script).toContain("from 'k6'");
    });

    it('uses custom relativeImportPath', () => {
        const script = convertHarToK6(HAR_WITH_PAGEREFS, { relativeImportPath: '../../custom' });
        expect(script).toContain("from '../../custom/clients/http-client.js'");
    });
});

describe('convertHarToK6 - grouping by pageref', () => {
    it('creates groups named after pagerefs', () => {
        const script = convertHarToK6(HAR_WITH_PAGEREFS);
        expect(script).toContain('"page_1"');
        expect(script).toContain('"page_2"');
    });

    it('places both page_1 entries in the same group', () => {
        const script = convertHarToK6(HAR_WITH_PAGEREFS);
        const page1Block = script.split('"page_2"')[0];
        expect(page1Block).toContain('/v2/breeds');
        expect(page1Block).toContain('/v2/images');
    });
});

describe('convertHarToK6 - sequential fallback grouping', () => {
    it('creates groups named group_1 and group_2 for 7 entries', () => {
        const script = convertHarToK6(HAR_NO_PAGEREFS);
        expect(script).toContain('"group_1"');
        expect(script).toContain('"group_2"');
    });

    it('first group has 5 entries', () => {
        const script = convertHarToK6(HAR_NO_PAGEREFS);
        const group1Block = script.split('"group_2"')[0];
        const callCount = (group1Block.match(/httpClient\.request\(/g) || []).length;
        expect(callCount).toBe(5);
    });
});

describe('convertHarToK6 - error cases', () => {
    it('throws for null har', () => {
        expect(() => convertHarToK6(null)).toThrow('Invalid HAR');
    });

    it('throws when log is missing', () => {
        expect(() => convertHarToK6({})).toThrow('Invalid HAR: missing log property');
    });

    it('throws when entries is empty array', () => {
        expect(() => convertHarToK6({ log: { entries: [] } })).toThrow('Invalid HAR: no entries found');
    });

    it('throws when entries is missing', () => {
        expect(() => convertHarToK6({ log: {} })).toThrow('Invalid HAR: no entries found');
    });
});

describe('createHarConverterAgent', () => {
    it('returns ok output with script', async () => {
        const agent = createHarConverterAgent();
        const output = await agent({
            type: 'GENERATE',
            payload: { har: HAR_WITH_PAGEREFS, options: {} },
            context: {},
        });
        expect(output.status).toBe('ok');
        expect(typeof output.payload.script).toBe('string');
    });

    it('returns error for invalid har', async () => {
        const agent = createHarConverterAgent();
        const output = await agent({
            type: 'GENERATE',
            payload: { har: null },
            context: {},
        });
        expect(output.status).toBe('error');
        expect(output.payload).toBeNull();
    });
});
