import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';

const baseDockerfile = new URL('../../Dockerfile', import.meta.url);

it('pins the k6 version supported by the InfluxDB output extension', async () => {
    const dockerfile = await readFile(baseDockerfile, 'utf8');

    expect(dockerfile).toMatch(/ARG K6_VERSION="v1\.0\.0"/);
    expect(dockerfile).toContain('ARG XK6_EXTENSION_NAME="xk6-output-influxdb"');
    expect(dockerfile).toContain('ARG XK6_EXTENSION_VERSION="v0.7.0"');
});
