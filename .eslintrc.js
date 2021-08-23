module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: { ecmaVersion: 8, sourceType: "module" },
  // We don't want to lint generated files nor node_modules, but we want to lint .prettierrc.js (ignored by default by eslint)
  ignorePatterns: ["node_modules/*", ".next/*", ".out/*", "!.prettierrc.js"],
  extends: ["eslint:recommended", "prettier"],
  overrides: [
    // This configuration will apply only to TypeScript files.
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      settings: { react: { version: "detect" } },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      rules: {
        // Warn about console logs that might have been forgotten.
        "no-console": 1,
        // Use TypeScript's types for component props instead.
        "react/prop-types": "off",
        // No need to import React when using Next.js.
        "react/react-in-jsx-scope": "off",
        // This rule is not compatible with Next.js's <Link /> components.
        "jsx-a11y/anchor-is-valid": "off",
        // Why would you want unused vars?
        "@typescript-eslint/no-unused-vars": ["error"],
        // Allow ts-ignore comment with description.
        "@typescript-eslint/ban-ts-comment": [
          "error",
          {
            "ts-ignore": "allow-with-description",
          },
        ],
        // Require return types on functions only where useful.
        "@typescript-eslint/explicit-function-return-type": [
          "warn",
          {
            allowExpressions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          },
        ],
      },
      overrides: [
        {
          files: ["scripts/**/*.ts"],
          rules: {
            "no-console": "off",
          },
        },
      ],
    },
  ],
};
