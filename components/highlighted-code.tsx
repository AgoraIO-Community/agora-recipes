import "server-only"
import { cache } from "react"
import { bundledLanguages, codeToHtml } from "shiki"
import { CodePanel } from "@/components/code-panel"

const highlight = cache(async (code: string,language: string) => {
  return codeToHtml(code,{
  lang: Object.hasOwn(bundledLanguages, language) ? language as keyof typeof bundledLanguages : "text",
  themes: { dark: "github-dark-default", light: "github-light" },
  defaultColor: false,
  transformers: [{ pre(node) { node.properties.tabindex = 0; node.properties.role = "group"; node.properties["aria-label"] = `${language || "Text"} code` } }],
  })
})

export async function HighlightedCode({ code,language }: { code: string;language: string }) {
  const html=await highlight(code,language)
  // Shiki escapes source text; only its server-generated highlighting HTML is inserted.
  return <CodePanel code={code} label={language || "Text"}><div dangerouslySetInnerHTML={{__html:html}} /></CodePanel>
}
