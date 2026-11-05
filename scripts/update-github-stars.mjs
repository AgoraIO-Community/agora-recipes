import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

// Maintainer refresh, using the existing GitHub CLI login. Builds and visitors
// read the committed snapshot and never need a GitHub credential or API call.
const content = path.join(process.cwd(), "content")
const directories = await fs.readdir(path.join(content, "recipes"), { withFileTypes: true })
const metadata = await Promise.all(directories.filter(entry => entry.isDirectory() && !entry.name.startsWith(".")).map(async entry => JSON.parse(await fs.readFile(path.join(content, "recipes", entry.name, "recipe.json"), "utf8"))))
const repositories = [...new Set(metadata.flatMap(entry => {
  const match = entry.mainRepoUrl?.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i)
  return match ? [`${match[1]}/${match[2].replace(/\.git$/, "")}`.toLowerCase()] : []
}))].sort()
const stars = {}
for (let offset = 0; offset < repositories.length; offset += 40) {
  const batch = repositories.slice(offset, offset + 40)
  const fields = batch.map((name, index) => {
    const [owner, repo] = name.split("/")
    return `r${index}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(repo)}) { stargazerCount }`
  })
  const response = JSON.parse(execFileSync("gh", ["api", "graphql", "-f", `query=query { ${fields.join(" ")} }`], { encoding: "utf8", maxBuffer: 1024 * 1024 }))
  for (const [index, name] of batch.entries()) {
    const count = response.data?.[`r${index}`]?.stargazerCount
    if (!Number.isSafeInteger(count) || count < 0) throw new Error(`Missing GitHub star count for ${name}; previous snapshot preserved`)
    stars[name] = count
  }
}
await fs.writeFile(path.join(content, "github-stars.json"), JSON.stringify({ updated: new Date().toISOString(), repositories: stars }, null, 2) + "\n")
console.log(`[stars] refreshed ${repositories.length} repository counts`)
