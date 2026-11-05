import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import { componentKit } from "./components/design-system/component-kit.mjs"

export default defineConfig([
  ...nextVitals,
  {
    files: ["components/**/*.tsx", "app/**/*.tsx"],
    ignores: ["components/ui/**", "components/design-system/**"],
    rules: {
      "no-restricted-imports": ["error", { paths: [
        { name: "lucide-react", importNames: ["ArrowRight", "ArrowUpRight"], message: "Use ButtonArrow only for a section's main navigation action. Repeated links and ordinary navigation do not need decorative arrows." },
      ], patterns: [
        { group: ["@radix-ui/*"], message: "Use the registered Recipes components in @/components/ui." },
        { regex: `(?:^|/)ui/(?!(?:${componentKit.join("|")})(?:$|\\.))`, message: "Integrate this primitive into the Recipes kit and /design-system reference before feature use." },
      ] }],
      "react/forbid-elements": ["error", { forbid: [
        { element: "button", message: "Use Button or IconButton from the shared Recipes kit." },
        { element: "input", message: "Use Input or InputGroupInput from the shared Recipes kit." },
        { element: "select", message: "Use Select from the shared Recipes kit." },
        { element: "textarea", message: "Use Textarea from the shared Recipes kit." },
        { element: "details", message: "Use Disclosure from the shared Recipes kit." },
        { element: "summary", message: "Use DisclosureTrigger from the shared Recipes kit." },
        { element: "label", message: "Use Label or FieldLabel from the shared Recipes kit." },
      ] }],
      "no-restricted-syntax": ["error", {
        selector: "JSXOpeningElement[name.name=/^(DialogContent|DialogHeader|DialogFooter|SheetContent|SheetHeader|SheetFooter|PopoverContent|PopoverHeader|PopoverFooter)$/] > JSXAttribute[name.name='className'] > Literal[value=/(^|\\s)([\\w-]+:)*(p[xytrbl]?|gap(-[xy])?|overflow(-[xy])?)-/]",
        message: "Panel geometry belongs in panels.css. Use shared Header/Body/Footer slots; put scrolling inside Body.",
      }, {
        selector: "JSXOpeningElement[name.name=/^(Button|IconButton|SelectTrigger|Toggle|ToggleGroupItem|TabsTrigger|Checkbox|Input|InputGroup|Textarea|DisclosureTrigger)$/] > JSXAttribute[name.name='style']",
        message: "Control styles belong in shared variants. Apply layout to a parent instead of an inline control skin.",
      }, {
        selector: "JSXOpeningElement[name.name=/^(Button|IconButton|SelectTrigger|TabsTrigger)$/] > JSXAttribute[name.name='className'] > Literal[value=/(^|\\s)ag-(select|icon-select|icon-tab)(\\s|$)/]",
        message: "Use the shared field or icon size variant instead of applying primitive skin classes.",
      }, {
        selector: "JSXOpeningElement[name.name=/^(Button|IconButton|SelectTrigger|Toggle|ToggleGroupItem|TabsTrigger|Checkbox|Input|InputGroup|Textarea)$/] > JSXAttribute[name.name='className'] > Literal[value=/(hover|active|focus|focus-visible):(bg|text|border|opacity|shadow|ring)-/]",
        message: "Control feedback belongs in controls.css. Extend shared state tokens instead of reskinning a feature control.",
      }],
    },
  },
  // Native media hit targets and read-only authored task checkboxes keep their semantics.
  { files: ["components/recipe-card.tsx", "components/recipe-preview.tsx", "components/markdown.tsx"], rules: { "react/forbid-elements": "off" } },
  // Existing shadcn templates predate the React compiler lint rules. Keep these
  // exceptions local to those templates; new feature code uses the full rules.
  { files: ["components/ui/carousel.tsx", "components/ui/use-mobile.tsx", "hooks/use-mobile.ts"], rules: { "react-hooks/set-state-in-effect": "off" } },
  { files: ["components/ui/sidebar.tsx"], rules: { "react-hooks/purity": "off" } },
  globalIgnores([".next/**", "content/generated/**", "next-env.d.ts"]),
])
