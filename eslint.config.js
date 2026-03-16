import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";


const config = [
    // Configs included in the recommended config
    js.configs.recommended,
    jsdoc.configs["flat/recommended"],
    {
        files: ["**/*.js"],
        ignores: ["**/*.config.js"],
        languageOptions: {
            sourceType: "module",
        },
        plugins: {
            jsdoc: jsdoc,
        },
        rules: {
            "jsdoc/require-description": "warn",
            strict: "error",
        },
    },
    {
        files: ["src/**/*.js"],
        ignores: ["src/agents/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                // k6 built-in globals available in the k6 runtime
                crypto: "readonly",
                URLSearchParams: "readonly",
                __ENV: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                console: "readonly",
            },
        },
    },
    {
        files: ["src/agents/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                // Node.js globals for agent code
                process: "readonly",
                Buffer: "readonly",
                console: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
            },
        },
    },
    {
        files: ["demo/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                // Node.js globals for demo scripts
                process: "readonly",
                Buffer: "readonly",
                console: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
            },
        },
        rules: {
            "jsdoc/require-jsdoc": "off",
        },
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            sourceType: "module",
            globals: {
                console: "readonly",
                global: "readonly",
                Buffer: "readonly",
                process: "readonly",
                URL: "readonly",
            },
        },
        rules: {
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-description": "off",
        },
    },
];

export default config;
