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
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Supabase types (may be binary or auto-generated)
    "lib/supabase/database.types.ts",
    // Node.js CommonJS scripts (not part of the app bundle)
    "scripts/**",
    // Developer-only diagnostic page (uses any extensively for raw API inspection)
    "app/diagnostic/**",
  ]),
]);

export default eslintConfig;
