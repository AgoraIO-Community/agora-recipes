import fs from "node:fs/promises"
import { locales } from "../lib/locales.ts"

const slugs = (await fs.readdir("content/recipes", { withFileTypes: true })).filter(entry => entry.isDirectory() && !entry.name.startsWith(".")).map(entry => entry.name)
let missing = 0
for (const locale of locales.filter(value => value !== "en")) {
  const dictionary = JSON.parse(await fs.readFile(`content/i18n/${locale}.json`, "utf8"))
  const fallback = slugs.filter(slug => !dictionary.entries[slug]?.tagline || !dictionary.entries[slug]?.description)
  missing += fallback.length
  console.log(`${locale}: ${slugs.length - fallback.length}/${slugs.length} translated introductions${fallback.length ? `; English fallback: ${fallback.join(", ")}` : ""}`)
}
// English-only submissions remain supported. Strict coverage is an editorial opt-in.
if (missing && process.argv.includes("--strict")) process.exitCode = 1
