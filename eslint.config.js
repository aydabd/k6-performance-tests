import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import airbnb from "eslint-config-airbnb-base";


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
            airbnb: airbnb,
        },
        rules: {
            "jsdoc/require-description": "warn",
            strict: "error",
        },
    },
];

export default config;
