import { getAllTopics } from "@/lib/topics"
import type { MetadataRoute } from "next"
import { getAllEntries, getEntryModified } from "@/lib/recipes"
import { absoluteUrl } from "@/lib/site"
import { locales, localePath } from "@/lib/locales"
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap(locale => [
    { url: absoluteUrl(localePath("/", locale)) },
    { url: absoluteUrl(localePath("/contribute", locale)) },
    { url: absoluteUrl(localePath("/recipes", locale)) },
    { url: absoluteUrl(localePath("/topics", locale)) },
    ...getAllTopics().map(topic => ({ url: absoluteUrl(localePath(`/topics/${topic.slug}`, locale)) })),
    ...getAllEntries().map(entry => ({ url: absoluteUrl(localePath(`/recipes/${entry.slug}`, locale)), lastModified: getEntryModified(entry) })),
  ])
}
