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
  ]),
  {
    rules: {
      // Disabled project-wide: reading localStorage requires setState inside useEffect.
      // There is no synchronous-safe alternative — localStorage is browser-only and the
      // typeof window guard prevents server-side access. useSyncExternalStore would cause
      // hydration mismatches since server and client snapshots always differ for localStorage.
      "react-hooks/set-state-in-effect": "off",
      // Disabled project-wide: dynamic icon resolution (Icons[name]) returns stable module-level
      // references, not new components per render. The linter can't statically verify stability,
      // so it flags the pattern. Declaring all 8+ icons statically would lose the data-driven
      // approach that the blueprint uses (icono field as string in ModuleMeta).
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
