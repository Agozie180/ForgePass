const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "eslint.config.js",
      "artifacts/**",
      "circuits/**/target/**",
      "contracts/target/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
