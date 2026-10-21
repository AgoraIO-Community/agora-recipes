import "server-only"
import { cache } from "react"
import { bundledLanguages, bundledThemes, codeToHtml } from "shiki"
import { CodePanel } from "@/components/code-panel"

const highlight = cache(async (code: string,language: string) => {
  const { default: githubLight } = await bundledThemes["github-light-default"]()
  const lightTheme = { ...githubLight, name: "agora-light", tokenColors: [...(githubLight.tokenColors || []), { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#57606a" } }] }
  return codeToHtml(code,{
  lang: Object.hasOwn(bundledLanguages, language) ? language as keyof typeof bundledLanguages : "text",
  themes: {light:lightTheme,dark:"github-dark-default"},
  transformers: [{ pre(node) { node.properties.tabindex = 0; node.properties.role = "region"; node.properties["aria-label"] = `${language || "Text"} code` } }],
  })
})

export async function HighlightedCode({ code,language }: { code: string;language: string }) {
  const html=await highlight(code,language)
  // Shiki escapes source text; only its server-generated highlighting HTML is inserted.
  return <CodePanel code={code} label={language || "Text"}><div dangerouslySetInnerHTML={{__html:html}} /></CodePanel>
}
