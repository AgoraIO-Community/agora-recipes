import type { MetadataRoute } from "next"
import { getAllEntries } from "@/lib/recipes"
import { absoluteUrl } from "@/lib/site"
import { locales, localePath } from "@/lib/locales"
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap(locale => [
    { url: absoluteUrl(localePath("/", locale)) },
    { url: absoluteUrl(localePath("/contribute", locale)) },
    ...getAllEntries().map(entry => ({ url: absoluteUrl(localePath(`/recipes/${entry.slug}`, locale)), lastModified: entry.updated })),
  ])
}
