import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('telemetry persistence smoke harness', () => {
    it('queries the deterministic run ID and representative metrics', () => {
        const script = fs.readFileSync(path.join(root, 'scripts/telemetry-smoke.sh'), 'utf8');

        expect(script).toContain('TEST_RUN_ID');
        expect(script).toContain('http_req_duration');
        expect(script).toContain('iterations');
        expect(script).toContain('checks.total');
        expect(script).toContain('/api/v2/query');
        expect(script).toContain('service-logs.log');
        expect(script).toContain('query.csv');
    });
});
