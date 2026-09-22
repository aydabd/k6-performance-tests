import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function read(filePath) {
    return fs.readFileSync(path.join(root, filePath), 'utf8');
}

describe('deployment telemetry contract', () => {
    it('pins the same platform versions in Docker and Kubernetes', () => {
        const compose = read('compose.yaml');
        const kubernetes = [
            read('k8s/influxdb.yaml'),
            read('k8s/grafana.yaml'),
            read('k8s/otel-collector.yaml'),
            read('k8s/websocket-echo.yaml'),
        ].join('\n');

        expect(compose).toContain('influxdb:2.7.12');
        expect(compose).toContain('grafana/grafana-enterprise:13.2.2');
        expect(compose).toContain('otel/opentelemetry-collector-contrib:0.161.0');
        expect(compose).toContain('grafana/tempo:3.0.3');
        expect(kubernetes).toContain('influxdb:2.7.12');
        expect(kubernetes).toContain('grafana/grafana-enterprise:13.2.2');
        expect(kubernetes).toContain('otel/opentelemetry-collector-contrib:0.161.0');
        expect(kubernetes).not.toMatch(/:latest/);
    });

    it('routes metrics through the Collector InfluxDB exporter', () => {
        const composeCollector = read('otel/otel-collector-config.yaml');
        const kubernetesCollector = read('k8s/otel-collector.yaml');

        for (const contents of [composeCollector, kubernetesCollector]) {
            expect(contents).toContain('influxdb');
            expect(contents).toContain('INFLUXDB_URL');
            expect(contents).toContain('INFLUXDB_ORG');
            expect(contents).toContain('INFLUXDB_BUCKET');
            expect(contents).toContain('INFLUXDB_TOKEN');
            expect(contents).toMatch(/metrics:[\s\S]*exporters:[^\n]*influxdb/);
        }
    });

    it('keeps credentials out of source and dashboard provisioning', () => {
        const sourceFiles = [
            'compose.yaml',
            'grafana/datasources/datasource.yml',
            'k8s/influxdb.yaml',
            'k8s/k6-job-business-flow.yaml',
        ];

        for (const filePath of sourceFiles) {
            expect(read(filePath), filePath).not.toMatch(/y3zTEWhDLPfa05|K6_INFLUXDB_TOKEN=/);
        }
    });
});
