#!/usr/bin/env node
/**
 * Runnable demo of the full WP-12 agent pipeline.
 * @module run-pipeline
 * @description
 * Shows every stage end-to-end:
 * ANALYZE → PLAN → GENERATE → EXECUTE → REPORT.
 * Generated scripts follow the proven simple-test.js pattern.
 * @example
 * ```bash
 * node demo/run-pipeline.js
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { Orchestrator, createAgentOutput } from '../src/agents/agent-framework.js';
import { createApiAnalyzerAgent } from '../src/agents/api-analyzer.js';
import { createTestPlannerAgent } from '../src/agents/test-planner.js';
import { createTestGeneratorAgent } from '../src/agents/test-generator.js';
import { buildRunCommand } from '../src/agents/test-runner.js';
import { analyzeResults } from '../src/agents/results-analyzer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load sample inputs ──────────────────────────────────────────────────────
const spec = JSON.parse(
    readFileSync(join(__dirname, 'openapi/sample-api.json'), 'utf8')
);

const stories = readFileSync(join(__dirname, 'user-stories/US-42.md'), 'utf8');

// ── Prepare output directory ────────────────────────────────────────────────
const outDir = join(tmpdir(), 'k6-agent-pipeline');
mkdirSync(outDir, { recursive: true });

// ── Build the orchestrator ──────────────────────────────────────────────────
// EXECUTE: writes each generated script to disk, then builds docker run commands.
// REPORT:  evaluates descriptors against synthetic k6 metrics (real k6 needs Docker).
const orchestrator = new Orchestrator({
    ANALYZE: createApiAnalyzerAgent(),
    PLAN: createTestPlannerAgent(),
    GENERATE: createTestGeneratorAgent(),
    EXECUTE: async (input) => {
        const { scripts = [], envVars = {} } = input.payload || {};
        const commands = [];
        for (const script of scripts) {
            const scriptPath = join(outDir, `${script.id}.js`);
            writeFileSync(scriptPath, script.script, 'utf8');
            commands.push(buildRunCommand({ scriptPath, envVars }));
        }
        return createAgentOutput(input.type, { commands });
    },
    REPORT: async (input) => {
        const { descriptors = [] } = input.payload || {};
        // Synthetic summary: real k6 execution requires Docker (not available here)
        const syntheticSummary = {
            metrics: {
                http_req_duration: { values: { 'p(95)': 180 } },
                http_req_failed: { values: { rate: 0.002 } },
            },
        };
        const report = analyzeResults(syntheticSummary, descriptors);
        return createAgentOutput(input.type, { report });
    },
});

// ── Run the pipeline ────────────────────────────────────────────────────────
console.log('🚀  Running agent pipeline…\n');
console.log(`   Spec  : ${spec.info?.title ?? 'OpenAPI spec'} (${spec.info?.version ?? '?'})`);
console.log(`   Server: ${spec.servers?.[0]?.url ?? 'unknown'}`);
console.log(`   Stories: ${stories.split('\n')[0]}\n`);

const result = await orchestrator.run({ spec, stories: [stories] });

if (result.status !== 'ok') {
    console.error(`\n❌  Pipeline failed at step: ${result.failedStep}`);
    console.error(`   Error: ${result.error}`);
    process.exit(1);
}

const { endpoints, descriptors, scripts, commands, report } = result.state;

// ── Stage 1: ANALYZE ────────────────────────────────────────────────────────
console.log(`✅  ANALYZE — found ${endpoints?.length ?? 0} endpoint(s):`);
for (const ep of (endpoints ?? [])) {
    console.log(`   ${ep.method.padEnd(6)} ${ep.path}  auth=${ep.auth}`);
}

// ── Stage 2: PLAN ───────────────────────────────────────────────────────────
console.log(`\n✅  PLAN — created ${descriptors?.length ?? 0} test case descriptor(s):`);
for (const d of (descriptors ?? [])) {
    console.log(`   ${d.id}  story=${d.userStory}  auth=${d.auth}`);
}

// ── Stage 3: GENERATE ───────────────────────────────────────────────────────
console.log(`\n✅  GENERATE — produced ${scripts?.length ?? 0} k6 script(s):`);
for (const s of (scripts ?? [])) {
    const scriptPath = join(outDir, `${s.id}.js`);
    console.log(`\n   📄 ${scriptPath}`);
    console.log('   ─────────────────────────────────────────────────────');
    console.log(s.script.split('\n').map((l) => `   ${l}`).join('\n'));
    console.log('   ─────────────────────────────────────────────────────');
}

// ── Stage 4: EXECUTE ────────────────────────────────────────────────────────
console.log(`\n✅  EXECUTE — built ${commands?.length ?? 0} Docker run command(s):`);
for (const cmd of (commands ?? [])) {
    console.log(`\n   ${cmd.command} ${cmd.args.join(' ')}`);
}

// ── Stage 5: REPORT ─────────────────────────────────────────────────────────
if (report) {
    const status = report.overallPassed ? '✅  PASSED' : '❌  FAILED';
    console.log(`\n${status}  REPORT — ${report.testCases?.length ?? 0} test case(s) analyzed:`);
    for (const tc of (report.testCases ?? [])) {
        const icon = tc.passed ? '✓' : '✗';
        console.log(`   ${icon} ${tc.id}  p95=${tc.p95}ms  errorRate=${tc.errorRate}`);
    }
}

console.log(`\n✨  Pipeline complete.`);
console.log(`   Scripts written to: ${outDir}/`);
console.log('');
console.log('   To run a generated script in Docker:');
if ((scripts ?? []).length > 0) {
    const first = scripts[0];
    const scriptPath = join(outDir, `${first.id}.js`);
    console.log(`   docker run --rm \\`);
    console.log(`     -v "${scriptPath}:/scripts/${first.id}.js" \\`);
    console.log(`     -e API_SERVER=dog.ceo \\`);
    console.log(`     grafana/k6 run /scripts/${first.id}.js`);
}
console.log('');
console.log('   To run via HAR recording (browser → k6 script):');
console.log('   node demo/run-har-pipeline.js');
