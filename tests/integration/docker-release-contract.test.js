import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dockerfilePath = path.join(repositoryRoot, 'simple-k6-test-template/Dockerfile');

describe('Docker release contract', () => {
    it('uses the release workflow base-image build arguments', () => {
        const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');

        expect(dockerfile).toMatch(
            /ARG BASE_IMAGE_NAME=.*\nARG BASE_IMAGE_VERSION=.*\nFROM \$\{BASE_IMAGE_NAME\}:\$\{BASE_IMAGE_VERSION\}/,
        );
    });
});
