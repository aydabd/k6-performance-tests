import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function read(filePath) {
    return fs.readFileSync(path.join(root, filePath), 'utf8');
}

describe('telemetry deployment orchestration', () => {
    it('waits for storage and Collector health before running k6', () => {
        const compose = read('compose.yaml');

        expect(compose).toContain('condition: service_healthy');
        expect(compose).toContain('healthcheck:');
        expect(compose).toContain('otel/opentelemetry-collector-contrib:0.161.0');
        expect(compose).toContain('INFLUXDB_URL=http://influxdb:8086');
        expect(compose).toContain('INFLUXDB_TOKEN');
        expect(compose).toContain('curlimages/curl:8.16.0');
        expect(compose).toContain('http://otel-collector:13133/');
        expect(compose).toContain('--health');
        expect(compose).toContain('--health.url=http://localhost:3200/ready');
    });

    it('uses the same pinned local image tag and secret contract in Kubernetes', () => {
        const deployment = read('k8s-deployment');
        const jobs = [
            read('k8s/k6-job-simple.yaml'),
            read('k8s/k6-job-websocket.yaml'),
            read('k8s/k6-job-agents-pipeline.yaml'),
            read('k8s/k6-job-business-flow.yaml'),
        ].join('\n');

        expect(deployment).toContain('IMAGE_TAG=${IMAGE_TAG:-2.2.0}');
        expect(deployment).toContain('influxdb-secret.yaml');
        expect(jobs.match(/name: TEST_RUN_ID/g)).toHaveLength(4);
        expect(jobs.match(/value: "\$\{TEST_RUN_ID\}"/g)).toHaveLength(4);
        expect(jobs).toContain('K6_OTEL_GRPC_EXPORTER_ENDPOINT');
        expect(jobs).not.toContain('K6_INFLUXDB_');
    });

    it('keeps failure diagnostics in both deployment runners', () => {
        expect(read('ci-deployment')).toContain('docker compose logs');
        expect(read('ci-deployment')).toContain('EXTERNAL_SERVICES="grafana influxdb otel-collector otel-collector-ready');
        expect(read('ci-deployment')).not.toContain('openssl rand');
        expect(read('ci-deployment')).toContain('export TEST_RUN_ID="${TEST_RUN_ID:-ci-$(date -u');
        expect(read('k8s-deployment')).toContain('kubectl');
        expect(read('k8s-deployment')).toContain('logs');
        expect(read('k8s-deployment')).not.toContain('openssl rand');
        expect(read('k8s-deployment')).toContain('command -v envsubst');
        expect(read('k8s-deployment')).toContain('Install gettext and retry.');
    });

    it('uses fixed-string matching for literal telemetry smoke assertions', () => {
        const smoke = read('scripts/telemetry-smoke.sh');

        expect(smoke).toContain('grep -Fq -- "$RUN_ID"');
        expect(smoke).toContain("grep -Fq -- ',http_req_duration,'");
        expect(smoke).toContain("grep -Fq -- ',iterations,'");
        expect(smoke).toContain("grep -Fq -- ',checks.total,'");
    });
});
