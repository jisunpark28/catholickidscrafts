import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ["vendor/**", "assets/**", "docs/**", "node_modules/**"],
    },
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                THREE: "readonly",
            },
        },
        rules: {
            "no-console": "off",
        },
    },
];
