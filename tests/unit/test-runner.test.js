import { describe, it, expect } from 'vitest';
import { buildRunCommand, createTestRunnerAgent } from '../../src/agents/test-runner.js';

describe('buildRunCommand - volume mode', () => {
    it('returns docker as command', () => {
        const { command } = buildRunCommand({ scriptPath: '/tests/script.js' });
        expect(command).toBe('docker');
    });

    it('includes run and --rm flags', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js' });
        expect(args).toContain('run');
        expect(args).toContain('--rm');
    });

    it('includes volume mount with -v flag', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js', mountMode: 'volume' });
        const vIndex = args.indexOf('-v');
        expect(vIndex).toBeGreaterThan(-1);
        expect(args[vIndex + 1]).toContain('/tests/script.js');
        expect(args[vIndex + 1]).toContain('/scripts/script.js');
    });

    it('uses default image grafana/k6', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js' });
        expect(args).toContain('grafana/k6');
    });

    it('uses custom image when provided', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js', image: 'my/k6:v1' });
        expect(args).toContain('my/k6:v1');
    });

    it('includes the container script path as run argument', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js' });
        expect(args[args.length - 1]).toBe('/scripts/script.js');
    });
});

describe('buildRunCommand - build mode', () => {
    it('does not include -v flag', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js', mountMode: 'build' });
        expect(args).not.toContain('-v');
    });

    it('still runs the container script path', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js', mountMode: 'build' });
        expect(args[args.length - 1]).toBe('/scripts/script.js');
    });
});

describe('buildRunCommand - env vars', () => {
    it('adds -e flags for each env var', () => {
        const { args } = buildRunCommand({
            scriptPath: '/tests/script.js',
            envVars: { BASE_URL: 'https://api.example.com', TOKEN: 'abc' },
        });
        expect(args).toContain('-e');
        expect(args).toContain('BASE_URL=https://api.example.com');
        expect(args).toContain('TOKEN=abc');
    });

    it('adds no -e flags when envVars is empty', () => {
        const { args } = buildRunCommand({ scriptPath: '/tests/script.js', envVars: {} });
        expect(args).not.toContain('-e');
    });
});

describe('createTestRunnerAgent', () => {
    it('returns ok output with commands array', async () => {
        const agent = createTestRunnerAgent();
        const input = {
            type: 'EXECUTE',
            payload: {
                scripts: [{ scriptPath: '/tests/tc001.js' }, { scriptPath: '/tests/tc002.js' }],
                envVars: { BASE_URL: 'https://example.com' },
            },
            context: {},
        };
        const output = await agent(input);
        expect(output.status).toBe('ok');
        expect(output.payload.commands).toHaveLength(2);
        expect(output.payload.commands[0].command).toBe('docker');
    });

    it('returns empty commands for empty scripts', async () => {
        const agent = createTestRunnerAgent();
        const output = await agent({ type: 'EXECUTE', payload: { scripts: [] }, context: {} });
        expect(output.payload.commands).toEqual([]);
    });
});
