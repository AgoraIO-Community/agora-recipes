import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

// Generate standalone, editable HTML diagrams. No external fonts, scripts or requests.
// Capture these at 1600 × 900 using agent-browser; never call them app screenshots.
const root = fileURLToPath(new URL("../", import.meta.url))
const output = path.join(root, "marketing/recipe-media/illustrations")
const specs = JSON.parse(await fs.readFile(path.join(root, "content/recipe-illustrations.json"), "utf8"))
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
const text = (x, y, value, size = 30, color = "#fcf9f8", anchor = "middle") => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="Arial, sans-serif">${escape(value)}</text>`
const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#00c2ff" stroke-width="4" fill="none" marker-end="url(#arrow)"/>`
const waveform = (x, y, width = 210) => Array.from({ length: 19 }, (_, i) => {
  const height = 12 + Math.round(Math.abs(Math.sin(i * 1.7)) * Math.sin((i + 1) / 20 * Math.PI) * 72)
  return `<path d="M${x + i * width / 18} ${y - height / 2}v${height}" stroke="#00c2ff" stroke-width="7" stroke-linecap="round"/>`
}).join("")
const node = (x, y, label, emphasis = false) => `<rect x="${x - 172}" y="${y - 64}" width="344" height="128" rx="12" fill="${emphasis ? "#00c2ff" : "#12191c"}" stroke="${emphasis ? "#00c2ff" : "#626262"}" stroke-width="2"/>${text(x, y + 10, label, 30, emphasis ? "#04111d" : "#fcf9f8")}`

function diagram(spec) {
  const [a, b, c] = spec.nodes
  if (spec.layout === "merge") return `${line(485, 365, 850, 470)}${line(485, 585, 850, 470)}${node(310, 365, a)}${node(310, 585, b)}${node(1040, 470, c, true)}`
  if (spec.layout === "device" && /^(esp32|iot-callkit-device)/.test(spec.slug)) return `<rect x="150" y="325" width="310" height="270" rx="12" fill="#12191c" stroke="#626262" stroke-width="3"/><rect x="220" y="355" width="170" height="115" rx="4" fill="none" stroke="#00c2ff" stroke-width="3"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${235 + i * 28} 335v20 M${235 + i * 28} 470v20" stroke="#00c2ff" stroke-width="4"/>`).join("")}${text(305, 550, a, 28)}${line(490, 460, 610, 460)}${node(800, 460, b, true)}${line(990, 460, 1100, 460)}${node(1290, 460, c)}`
  if (spec.layout === "branch") return `${line(485, 470, 850, 365)}${line(485, 470, 850, 585)}${node(310, 470, a, true)}${node(1040, 365, b)}${node(1040, 585, c)}`
  if (spec.layout === "spatial") return `<ellipse cx="800" cy="475" rx="510" ry="176" fill="none" stroke="#383838" stroke-width="2"/><ellipse cx="800" cy="475" rx="330" ry="110" fill="none" stroke="#626262" stroke-width="2" stroke-dasharray="8 8"/>${line(435, 555, 700, 445)}${line(900, 445, 1165, 555)}${node(310, 580, a)}${node(800, 365, b, true)}${node(1290, 580, c)}`
  if (spec.layout === "device") return `<rect x="150" y="280" width="310" height="360" rx="36" fill="#12191c" stroke="#626262" stroke-width="3"/><path d="M255 310h100 M275 612h60" stroke="#b3b3b3" stroke-width="5" stroke-linecap="round"/>${waveform(210, 420, 190)}${text(305, 550, a, 28)}${line(490, 460, 610, 460)}${node(800, 460, b, true)}${line(990, 460, 1100, 460)}<rect x="1130" y="327" width="310" height="268" rx="12" fill="#12191c" stroke="#626262" stroke-width="3"/><rect x="1205" y="370" width="160" height="90" rx="8" fill="none" stroke="#00c2ff" stroke-width="3"/>${text(1285, 535, c, 28)}`
  if (spec.layout === "voice") return `${waveform(210, 335)}${waveform(1185, 335)}${line(490, 490, 610, 490)}${line(990, 490, 1100, 490)}${node(305, 490, a)}${node(800, 490, b, true)}${node(1290, 490, c)}<path d="M1290 590v65H305v-65" stroke="#626262" stroke-width="2" fill="none" stroke-dasharray="10 10"/>`
  return `<rect x="130" y="285" width="350" height="210" rx="12" fill="#12191c" stroke="#626262" stroke-width="2"/><path d="M160 450h290 M160 420h200 M160 390h245" stroke="#00c2ff" stroke-width="5" stroke-linecap="round"/>${text(305, 560, a)}${line(510, 420, 610, 420)}${node(800, 420, b, true)}${line(990, 420, 1090, 420)}<rect x="1120" y="285" width="350" height="210" rx="12" fill="#12191c" stroke="#626262" stroke-width="2"/><path d="M1150 330h290 M1150 365h220 M1150 400h260 M1150 450h150" stroke="#b3b3b3" stroke-width="5" stroke-linecap="round"/>${text(1295, 560, c)}`
}

await fs.mkdir(output, { recursive: true })
for (const spec of specs) {
  const recipe = JSON.parse(await fs.readFile(path.join(root, "content/recipes", spec.slug, "recipe.json"), "utf8"))
  const title = recipe.title
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} — recipe illustration</title><style>*{box-sizing:border-box}body{margin:0;background:#000;color:#fcf9f8;font-family:Arial,sans-serif}main{width:1600px;height:900px;position:relative;overflow:hidden;background:#0a0a0a}h1{position:absolute;left:80px;top:64px;width:1440px;margin:0;font-size:58px;font-weight:400;line-height:1.1;letter-spacing:-.025em;text-wrap:balance}svg{position:absolute;inset:0;width:1600px;height:900px}footer{position:absolute;left:80px;right:80px;bottom:52px;display:flex;align-items:end;justify-content:space-between;border-top:1px solid #383838;padding-top:24px;gap:40px}p{font-size:28px;line-height:1.4;margin:0;max-width:950px}small{font-size:22px;color:#b3b3b3;text-align:right;white-space:nowrap}::selection{background:#00c2ff;color:#04111d}</style></head><body><main><!-- Extends the Agora catalog's dark/cyan visual system. Conceptual recipe-specific geometry only; no invented UI, transcript, session or measured outcome. --><svg viewBox="0 0 1600 900" role="img" aria-label="${escape(spec.nodes.join("; "))}. Conceptual workflow, not an API sequence."><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L8 5L0 9" fill="none" stroke="#00c2ff" stroke-width="2"/></marker></defs>${diagram(spec)}</svg><h1>${escape(title)}</h1><footer><p>${escape(spec.focus)}</p><small>Agora Recipes<br>Illustration · not an app screenshot</small></footer></main></body></html>\n`
  await fs.writeFile(path.join(output, `${spec.slug}.html`), html)
}
console.log(`Wrote ${specs.length} self-contained recipe illustrations to ${output}`)
