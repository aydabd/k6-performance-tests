import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dashboardDirectory = path.join(root, 'grafana/dashboards');

function read(filePath) {
    return fs.readFileSync(path.join(root, filePath), 'utf8');
}

describe('Grafana telemetry contract', () => {
    it('loads every dashboard as valid JSON with the new datasource contract', () => {
        for (const fileName of fs.readdirSync(dashboardDirectory).filter((name) => name.endsWith('.json'))) {
            const dashboard = JSON.parse(read(`grafana/dashboards/${fileName}`));
            expect(dashboard.title || dashboard.uid, fileName).toBeTruthy();
            expect(JSON.stringify(dashboard), fileName).not.toContain('y3zTEWhDLPfa05');
        }
    });

    it('uses Collector InfluxDB measurements without the legacy value field', () => {
        for (const fileName of fs.readdirSync(dashboardDirectory).filter((name) => name.endsWith('.json'))) {
            const contents = read(`grafana/dashboards/${fileName}`);

            expect(contents, fileName).toContain('v.defaultBucket');
            expect(contents, fileName).not.toMatch(/_field.*value/);
            expect(contents, fileName).not.toContain('group(columns: ["value"])');
            expect(contents, fileName).not.toContain('bucket: "simple-k6-tests"');
        }
    });

    it('provisions InfluxDB and Tempo without embedded credentials', () => {
        const datasource = read('grafana/datasources/datasource.yml');

        expect(datasource).toContain('url: http://influxdb:8086');
        expect(datasource).toContain('token: $__env{INFLUXDB_TOKEN}');
        expect(datasource).toContain('organization: $__env{INFLUXDB_ORG}');
        expect(datasource).toContain('defaultBucket: $__env{INFLUXDB_BUCKET}');
        expect(datasource).toContain('type: tempo');
        expect(datasource).not.toMatch(/y3zTEWhDLPfa05|k6testorg|simple-k6-tests/);
    });
});
