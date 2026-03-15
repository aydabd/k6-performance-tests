#!/usr/bin/env node
/**
 * Runnable demo of the HAR-to-k6 agent pipeline.
 * @module run-har-pipeline
 * @description
 * Shows how browser interactions (recorded with Playwright/DevTools as a HAR file)
 * are converted into a runnable k6 test script via the HAR converter agent.
 * @example
 * ```bash
 * node demo/run-har-pipeline.js
 * ```
 * @author Aydin Abdi <ayd.abd@gmail.com>
 * @license MIT
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { convertHarToK6 } from '../src/agents/har-converter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load sample HAR recording ────────────────────────────────────────────────
const harPath = join(__dirname, 'har/sample-dogapi.har');
const har = JSON.parse(readFileSync(harPath, 'utf8'));

console.log('🎬  HAR-to-k6 agent pipeline\n');
console.log(`   HAR file : ${harPath}`);
console.log(`   Entries  : ${har.log.entries.length}`);
console.log(`   Pages    : ${har.log.pages?.length ?? 0}\n`);

// ── Convert HAR to k6 script ─────────────────────────────────────────────────
const script = convertHarToK6(har, { relativeImportPath: '../src' });

const outDir = join(tmpdir(), 'k6-agent-pipeline');
mkdirSync(outDir, { recursive: true });
const scriptPath = join(outDir, 'har-generated-test.js');
writeFileSync(scriptPath, script, 'utf8');

console.log('✅  CONVERT — generated k6 script from HAR recording:');
console.log('\n   📄 ' + scriptPath);
console.log('   ─────────────────────────────────────────────────────');
console.log(script.split('\n').map((l) => `   ${l}`).join('\n'));
console.log('   ─────────────────────────────────────────────────────');

console.log('\n✨  HAR pipeline complete.');
console.log(`   Script written to: ${scriptPath}`);
console.log('');
console.log('   To run in Docker:');
console.log(`   docker run --rm \\`);
console.log(`     -v "${scriptPath}:/scripts/har-test.js" \\`);
console.log(`     -e BASE_URL=https://dog.ceo \\`);
console.log(`     grafana/k6 run /scripts/har-test.js`);
console.log('');
console.log('   Playwright MCP recording → HAR → this script → Docker k6 run');
