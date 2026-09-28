import * as React from "react"
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { MermaidDiagram } from "./mermaid-diagram"

// Parse embedded README HTML, then sanitize it before creating React elements.
export function Markdown({
  source,
  headingOffset = 0,
  sourceUrl,
}: {
  source: string
  headingOffset?: number
  sourceUrl?: string
}) {
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  let fields: FrontmatterField[] = []
  let body = source
  if (/^---\s*$/.test(lines[0] ?? "") && /^[A-Za-z0-9_-]+:\s*/.test(lines[1] ?? "")) {
    const end = lines.findIndex((line, index) => index > 0 && /^---\s*$/.test(line))
    if (end > 0) {
      fields = parseFrontmatter(lines.slice(1, end))
      body = lines.slice(end + 1).join("\n")
    }
  }

  const components: Components = {
    pre: ({ children, node }) => {
      const code = node?.children[0]
      if (code?.type === "element" && code.tagName === "code" &&
        Array.isArray(code.properties.className) && code.properties.className.includes("language-mermaid")) {
        return <MermaidDiagram source={nodeText(code).replace(/\n$/, "")} />
      }
      return <pre>{children}</pre>
    },
    a: ({ children, href }) => (
      <a href={href} target={href?.startsWith("#") ? undefined : "_blank"} rel="noreferrer">
        {children}
      </a>
    ),
    table: ({ children }) => <div className="overflow-x-auto"><table>{children}</table></div>,
    input: ({ checked, disabled, type }) => <input type={type} disabled={disabled} checked={checked} readOnly aria-label={checked ? "Completed task" : "Incomplete task"} />,
  }
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    components[`h${level}`] = ({ children, node }) => {
      const Tag = `h${Math.min(Math.max(level + headingOffset, 1), 6)}` as keyof React.JSX.IntrinsicElements
      const text = node ? nodeText(node) : ""
      return <Tag id={slugify(text)}>{children}</Tag>
    }
  }

  return (
    <div className="prose-recipe">
      {fields.length > 0 ? <FrontmatterTable fields={fields} /> : null}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
        urlTransform={(url, key) => {
          const safeUrl = defaultUrlTransform(url)
          if (!safeUrl || safeUrl.startsWith("#")) return safeUrl
          let resolved = safeUrl
          if (sourceUrl) {
            try { resolved = new URL(safeUrl, sourceUrl).href } catch { return "" }
          }
          // GitHub blob URLs display a page; images need the raw file instead.
          if (key === "src") {
            resolved = resolved.replace(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\//, "https://raw.githubusercontent.com/$1/$2/")
          }
          return resolved
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  )
}

function nodeText(node: { type: string; value?: string; children?: typeof node[] }): string {
  return node.type === "text" ? node.value ?? "" : (node.children ?? []).map(nodeText).join("")
}

type FrontmatterField = { name: string; values: string[] }

function FrontmatterTable({ fields }: { fields: FrontmatterField[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="recipe-frontmatter" data-recipe-frontmatter>
        <caption className="sr-only">Recipe metadata</caption>
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name}>
              <th scope="row">
                <code>{field.name}</code>
              </th>
              <td>
                {field.values.length > 1 ? (
                  <ul>
                    {field.values.map((value, index) => (
                      <li key={`${field.name}-${index}`}>
                        <code>{value}</code>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <code>{field.values[0] ?? "—"}</code>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function parseFrontmatter(lines: string[]): FrontmatterField[] {
  const fields: FrontmatterField[] = []
  let currentField: FrontmatterField | undefined

  for (const line of lines) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (field) {
      currentField = {
        name: field[1],
        values: field[2] ? [field[2]] : [],
      }
      fields.push(currentField)
      continue
    }

    if (!currentField) continue

    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (listItem) {
      currentField.values.push(listItem[1].trim())
      continue
    }

    const nestedField = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.+)$/)
    if (nestedField && currentField.values.length > 0) {
      const lastValueIndex = currentField.values.length - 1
      currentField.values[lastValueIndex] += ` · ${nestedField[1]}: ${nestedField[2].trim()}`
    }
  }

  return fields
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}
