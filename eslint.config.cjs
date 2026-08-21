const nextPlugin = require("@next/eslint-plugin-next");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/api/client", "**/lib/api/client.ts"],
              message: "Legacy apiClient has been removed. Use v1ApiClient from lib/api/v1-client or getBaseApiUrl from lib/api/base-url.",
            },
            {
              group: ["**/app/(app)/**", "**/app/(auth)/**"],
              message: "Features and components must not import from app/ route composition roots.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/ui/**/*.tsx", "features/*/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/api/v1-client", "**/lib/api/v1-client.ts"],
              message: "Presentational UI components must not perform HTTP requests directly. Use domain feature API modules.",
            },
          ],
        },
      ],
    },
  },
];
