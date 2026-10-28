import "server-only"
import fs from "node:fs"
import path from "node:path"
import { getAllEntries } from "./recipes"
import { getT } from "./i18n"
import type { Locale } from "./locales"

export type TopicAction = { label: string; url: string; type: "participate" | "questions" | "replay" | "source" }
export type Topic = {
  slug: string
  title: string
  summary: string
  kind: "collection" | "activity"
  starts?: string
  ends?: string
  status?: "upcoming" | "active" | "completed"
  sourceUrl?: string
  members: { slug: string; award?: { label: string; sourceUrl: string } }[]
  actions?: TopicAction[]
  sections?: { title: string; body: string; language?: string; sourceUrl?: string }[]
}

function https(value: unknown): value is string {
  try { const url = new URL(String(value)); return typeof value === "string" && url.protocol === "https:" && !url.username && !url.password } catch { return false }
}

let cached: Topic[] | undefined
export function getAllTopics(): Topic[] {
  if (cached) return cached
  const directory = path.join(process.cwd(), "content/topics")
  const entries = new Set(getAllEntries().map(entry => entry.slug))
  cached = fs.readdirSync(directory, { withFileTypes: true }).filter(file => file.isDirectory() && !file.name.startsWith(".")).map(file => {
    const topic = { ...JSON.parse(fs.readFileSync(path.join(directory, file.name, "topic.json"), "utf8")), slug: file.name } as Topic
    const fail = (field: string): never => { throw new Error(`[topics] ${file.name}: invalid ${field}`) }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug)) fail("slug")
    for (const field of ["title", "summary"] as const) if (typeof topic[field] !== "string" || !topic[field].trim()) fail(field)
    if (!["collection", "activity"].includes(topic.kind)) fail("kind")
    if (topic.status && !["upcoming", "active", "completed"].includes(topic.status)) fail("status")
    for (const field of ["starts", "ends"] as const) if (topic[field] && (!/^\d{4}-\d{2}-\d{2}$/.test(topic[field]) || new Date(topic[field]).toISOString().slice(0, 10) !== topic[field])) fail(field)
    if (topic.starts && topic.ends && topic.starts > topic.ends) fail("date order")
    if (topic.sourceUrl && !https(topic.sourceUrl)) fail("sourceUrl")
    if (!Array.isArray(topic.members)) fail("members")
    const seen = new Set<string>()
    for (const member of topic.members) {
      if (!member || !entries.has(member.slug) || seen.has(member.slug)) fail("member reference")
      seen.add(member.slug)
      if (member.award && (!member.award.label || !https(member.award.sourceUrl) || topic.kind !== "activity")) fail("activity award")
    }
    if (topic.actions !== undefined && !Array.isArray(topic.actions)) fail("actions")
    for (const action of topic.actions ?? []) if (!action.label || !https(action.url) || !["participate", "questions", "replay", "source"].includes(action.type)) fail("action")
    if (topic.sections !== undefined && !Array.isArray(topic.sections)) fail("sections")
    for (const section of topic.sections ?? []) if (!section.title || !section.body || (section.sourceUrl && !https(section.sourceUrl))) fail("section")
    return topic
  })
  return cached
}

export function getTopic(slug: string) { return getAllTopics().find(topic => topic.slug === slug) }
export function getEntryTopics(slug: string) { return getAllTopics().filter(topic => topic.members.some(member => member.slug === slug)) }
export function topicNames(locale: Locale) { const t = getT(locale); return Object.fromEntries(getAllTopics().map(topic => [topic.slug, t(topic.title)])) }
export function topicStatus(topic: Topic): string {
  if (topic.kind === "collection") return "Collection"
  if (topic.status) return { active: "Ongoing", upcoming: "Upcoming", completed: "Completed" }[topic.status]
  const today = new Date().toISOString().slice(0, 10)
  return topic.ends && topic.ends < today ? "Completed" : topic.starts && topic.starts > today ? "Upcoming" : "Ongoing"
}
