import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dockerfiles = [
    'Dockerfile',
    'simple-k6-test-template/Dockerfile',
    'simple-k6-websocket-test/Dockerfile',
    'agents-pipeline-test/Dockerfile',
    'business-flow-template/Dockerfile',
];

function readRepositoryFile(filePath) {
    return fs.readFileSync(path.join(repositoryRoot, filePath), 'utf8');
}

describe('OTLP runtime contract', () => {
    it('uses the pinned official k6 runtime without legacy output configuration', () => {
        for (const filePath of dockerfiles) {
            const contents = readRepositoryFile(filePath);

            expect(contents, filePath).toContain('2.2.0');
            expect(contents, filePath).not.toMatch(/xk6|K6_OUT|K6_INFLUXDB|latest/);
        }
    });

    it('defines the same OTLP runtime inputs for each test image', () => {
        const requiredVariables = [
            'K6_OTEL_EXPORTER_PROTOCOL',
            'K6_OTEL_GRPC_EXPORTER_ENDPOINT',
            'K6_OTEL_GRPC_EXPORTER_INSECURE',
            'TEST_RUN_ID',
        ];

        for (const filePath of dockerfiles.slice(1)) {
            const contents = readRepositoryFile(filePath);

            for (const variable of requiredVariables) {
                expect(contents, `${filePath} missing ${variable}`).toContain(variable);
            }
        }
    });

    it('does not put telemetry credentials in k6 configuration files', () => {
        const configFiles = fs
            .readdirSync(path.join(repositoryRoot, 'k6-config-options'))
            .filter((fileName) => fileName.endsWith('.json'));

        for (const fileName of configFiles) {
            const contents = readRepositoryFile(`k6-config-options/${fileName}`);

            expect(contents, fileName).not.toMatch(/token|password|K6_INFLUXDB|xk6/i);
        }
    });
});
