import * as React from "react"

/**
 * Lightweight, dependency-free Markdown renderer tailored to the subset used
 * in our recipe markdown files: headings, paragraphs, ordered/unordered lists,
 * blockquotes, fenced code, inline code, links, bold/italic, tables, hr,
 * and task list checkboxes.
 *
 * It intentionally renders untrusted HTML as plain text — every output node
 * is a React element, so no `dangerouslySetInnerHTML` is used.
 */
export function Markdown({
  source,
  headingOffset = 0,
}: {
  source: string
  headingOffset?: number
}) {
  const blocks = parseBlocks(source)
  return (
    <div className="prose-recipe">
      {blocks.map((block, i) => (
        <BlockNode key={i} block={block} headingOffset={headingOffset} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Block-level parsing
// ---------------------------------------------------------------------------

type Block =
  | { type: "frontmatter"; fields: FrontmatterField[] }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang?: string; content: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "hr" }
  | { type: "table"; header: string[]; rows: string[][] }

type FrontmatterField = {
  name: string
  values: string[]
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0

  if (
    /^---\s*$/.test(lines[0] ?? "") &&
    /^[A-Za-z0-9_-]+:\s*/.test(lines[1] ?? "")
  ) {
    const closingFence = lines.findIndex(
      (line, index) => index > 0 && /^---\s*$/.test(line),
    )
    if (closingFence > 0) {
      const fields = parseFrontmatter(lines.slice(1, closingFence))
      if (fields.length > 0) {
        blocks.push({ type: "frontmatter", fields })
        i = closingFence + 1
      }
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    const fence = line.match(/^```(\w+)?\s*$/)
    if (fence) {
      const lang = fence[1]
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++ // consume closing fence
      blocks.push({ type: "code", lang, content: buf.join("\n") })
      continue
    }

    // Blank line
    if (/^\s*$/.test(line)) {
      i++
      continue
    }

    // Horizontal rule
    if (/^(\s*[-*_]\s*){3,}\s*$/.test(line)) {
      blocks.push({ type: "hr" })
      i++
      continue
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: heading[2].trim(),
      })
      i++
      continue
    }

    // Table (very small parser, GFM-style)
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*-{2,}/.test(lines[i + 1])) {
      const header = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]))
        i++
      }
      blocks.push({ type: "table", header, rows })
      continue
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      blocks.push({ type: "blockquote", text: buf.join(" ") })
      continue
    }

    // Unordered list (incl. task list)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""))
        i++
      }
      blocks.push({ type: "ul", items })
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""))
        i++
      }
      blocks.push({ type: "ol", items })
      continue
    }

    // Paragraph: greedy until blank line / new block
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") })
  }

  return blocks
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

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim())
}

// ---------------------------------------------------------------------------
// Inline-level parsing (bold, italic, code, links, &nbsp;)
// ---------------------------------------------------------------------------

function renderInline(text: string): React.ReactNode[] {
  // First, decode common HTML entities used in markdown (we only support a
  // very small set — &nbsp; is the main one we use).
  const decoded = text.replace(/&nbsp;/g, "\u00A0")

  const tokens: React.ReactNode[] = []
  let rest = decoded
  let key = 0

  // Order matters: code, then links, then bold, then italic.
  const patterns: Array<{
    re: RegExp
    render: (m: RegExpExecArray) => React.ReactNode
  }> = [
    {
      re: /`([^`]+)`/,
      render: (m) => <code key={key++}>{m[1]}</code>,
    },
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => (
        <a key={key++} href={m[2]} target="_blank" rel="noreferrer">
          {m[1]}
        </a>
      ),
    },
    {
      re: /\*\*([^*]+)\*\*/,
      render: (m) => <strong key={key++}>{m[1]}</strong>,
    },
    {
      re: /\*([^*]+)\*/,
      render: (m) => <em key={key++}>{m[1]}</em>,
    },
    {
      re: /_([^_]+)_/,
      render: (m) => <em key={key++}>{m[1]}</em>,
    },
  ]

  outer: while (rest.length > 0) {
    let earliest = -1
    let chosen: (typeof patterns)[number] | null = null
    let chosenMatch: RegExpExecArray | null = null

    for (const p of patterns) {
      const m = p.re.exec(rest)
      if (m && (earliest === -1 || m.index < earliest)) {
        earliest = m.index
        chosen = p
        chosenMatch = m
      }
    }

    if (!chosen || !chosenMatch || earliest === -1) {
      tokens.push(rest)
      break outer
    }

    if (earliest > 0) tokens.push(rest.slice(0, earliest))
    tokens.push(chosen.render(chosenMatch))
    rest = rest.slice(earliest + chosenMatch[0].length)
  }

  return tokens
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

function BlockNode({
  block,
  headingOffset,
}: {
  block: Block
  headingOffset: number
}) {
  switch (block.type) {
    case "frontmatter":
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
              {block.fields.map((field) => (
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
    case "heading": {
      const level = Math.min(block.level + headingOffset, 6)
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements
      const id = slugify(block.text)
      return <Tag id={id}>{renderInline(block.text)}</Tag>
    }
    case "paragraph":
      return <p>{renderInline(block.text)}</p>
    case "code":
      return (
        <pre>
          <code>{block.content}</code>
        </pre>
      )
    case "ul":
      return (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>{renderListItem(it)}</li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol>
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ol>
      )
    case "blockquote":
      return <blockquote>{renderInline(block.text)}</blockquote>
    case "hr":
      return <hr />
    case "table":
      return (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {block.header.map((h, i) => (
                  <th key={i}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((c, j) => (
                    <td key={j}>{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

function renderListItem(text: string): React.ReactNode {
  // Task list checkbox
  const m = text.match(/^\[( |x|X)\]\s+(.*)$/)
  if (m) {
    const checked = m[1].toLowerCase() === "x"
    const label = stripInlineMarkdown(m[2])
    return (
      <>
        <input
          type="checkbox"
          checked={checked}
          readOnly
          aria-label={`${checked ? "Completed" : "Not completed"}: ${label}`}
        />
        {renderInline(m[2])}
      </>
    )
  }
  return renderInline(text)
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/&nbsp;/g, " ")
    .trim()
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}
