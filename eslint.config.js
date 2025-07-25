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
];

export default config;
