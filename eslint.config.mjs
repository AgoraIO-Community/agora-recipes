import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
  ...nextVitals,
  // Existing shadcn templates predate the React compiler lint rules. Keep these
  // exceptions local to those templates; new feature code uses the full rules.
  { files: ["components/ui/carousel.tsx", "components/ui/use-mobile.tsx", "hooks/use-mobile.ts"], rules: { "react-hooks/set-state-in-effect": "off" } },
  { files: ["components/ui/sidebar.tsx"], rules: { "react-hooks/purity": "off" } },
  globalIgnores([".next/**", "content/generated/**", "next-env.d.ts"]),
])
