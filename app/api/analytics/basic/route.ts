import { analyticsEnabled } from "@/lib/analytics-events"
import { basicSearchVocabulary } from "@/lib/basic-analytics"
import { recordBasicCount } from "@/lib/basic-analytics-server"
import { getAllEntries } from "@/lib/recipes"
import { getAllTopics } from "@/lib/topics"
import { siteUrl } from "@/lib/site"

export const runtime = "nodejs"

export function POST(request: Request) {
  const entries = getAllEntries()
  return recordBasicCount(request, {
    enabled: analyticsEnabled(process.env.NODE_ENV, process.env.VERCEL, process.env.VERCEL_ENV),
    origin: siteUrl.origin,
    token: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    recipes: new Set(entries.map(entry => entry.slug)),
    topics: new Set(getAllTopics().map(topic => topic.slug)),
    terms: new Set(basicSearchVocabulary(entries).values()),
  })
}
