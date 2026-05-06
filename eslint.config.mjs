import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "**/.next/**",
    "node_modules/**",
    ".claude/**",
    "dist/**",
    "out/**",
    "build/**",
    "jaweria-amer/**",
    "next-env.d.ts",
    "public/pdf.worker.min.mjs",
  ]),
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Async client fetch + setState after await is intentional for admin CRUD pages.
  {
    files: ["src/app/admin/**/*.tsx"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
