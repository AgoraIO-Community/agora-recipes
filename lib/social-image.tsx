import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"

const size = { width: 1200, height: 630 }
export default async function Image() {
  const font = await readFile(path.join(process.cwd(), "public/font/Jokker-Regular.woff"))
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#000000", color: "#fcf9f8", padding: "84px", fontFamily: "Jokker", justifyContent: "center", borderBottom: "12px solid #00c2ff" }}><div style={{ display: "flex", color: "#00c2ff", fontSize: 40 }}>Agora</div><div style={{ display: "flex", fontSize: 100, marginTop: 28 }}>Recipes</div><div style={{ display: "flex", color: "#b3b3b3", fontSize: 32, marginTop: 28 }}>Voice AI and real-time projects, built with Agora.</div></div>, { ...size, fonts: [{ name: "Jokker", data: font, style: "normal", weight: 400 }] })
}
