import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import postcss from 'postcss'

const root = fileURLToPath(new URL('../', import.meta.url))
const aliases = new Set()
const stylesheets = []
const controls = /^(Button|IconButton|TabsTrigger|Toggle|ToggleGroup|ToggleGroupItem|SelectTrigger|Input|InputGroup|InputGroupButton|Textarea|Checkbox|DisclosureTrigger|DropdownMenuItem|DropdownMenuRadioItem|DropdownMenuCheckboxItem)$/
function visitFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) {
      if (!['ui', 'design-system'].includes(entry.name)) visitFiles(path)
      continue
    }
    if (entry.name.endsWith('.css')) stylesheets.push(path)
    if (!entry.name.endsWith('.tsx')) continue
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && controls.test(node.tagName.getText(source))) {
        for (const attr of node.attributes.properties) {
          if (!ts.isJsxAttribute(attr) || attr.name.getText(source) !== 'className' || !attr.initializer) continue
          const text = attr.initializer.getText(source)
          for (const name of text.match(/[a-z][\w-]*/g) ?? []) aliases.add(name)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
}
visitFiles(`${root}/components`)
visitFiles(`${root}/app`)

const forbidden = /^(?:font(?:-size|-weight|-family)?|line-height|color|background(?:-color)?|border(?:-(?:color|radius|width|style|top|right|bottom|left)(?:-(?:color|width|style|radius))?)?|padding(?:-(?:inline|block|top|right|bottom|left))?|(?:(?:min|max)-)?height|stroke-width|gap|--(?:control-size|field-size))$/
const errors = []
for (const stylesheet of stylesheets) postcss.parse(readFileSync(stylesheet, 'utf8')).walkRules(rule => {
  const names = [...rule.selector.matchAll(/\.([a-z][\w-]*)/g)].map(match => match[1])
  if (!names.some(name => aliases.has(name) || /^ag-(?:button|tab|toggle|select|input|textarea|checkbox)(?:-|$)/.test(name)) && !/(?:^|[ >+~])summary\b/.test(rule.selector)) return
  for (const decl of rule.nodes ?? []) {
    if (decl.type === 'decl' && forbidden.test(decl.prop)) errors.push(`${stylesheet.slice(root.length)}:${decl.source.start.line} ${rule.selector}: ${decl.prop}`)
  }
})
if (errors.length) {
  process.stderr.write(`Control materials and geometry belong in the shared component layer:\n${errors.join('\n')}\n`)
  process.exitCode = 1
} else process.stdout.write('Shared control styles: no page-level skin or geometry overrides.\n')
