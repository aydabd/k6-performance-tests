import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: [
            {
                find: /^k6\/(.+)$/,
                replacement: path.resolve(__dirname, 'tests/unit/__mocks__/k6/$1.js'),
            },
            {
                find: 'k6',
                replacement: path.resolve(__dirname, 'tests/unit/__mocks__/k6.js'),
            },
            {
                find: /^https:\/\/jslib\.k6\.io\/httpx\/.+\/index\.js$/,
                replacement: path.resolve(__dirname, 'tests/unit/__mocks__/httpx.js'),
            },
            {
                find: /^https:\/\/jslib\.k6\.io\/.+$/,
                replacement: path.resolve(__dirname, 'tests/unit/__mocks__/k6.js'),
            },
        ],
    },
    test: {
        globals: false,
        environment: 'node',
        include: ['tests/unit/**/*.test.js'],
    },
});
