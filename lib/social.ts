import type { Metadata } from "next"
import { absoluteUrl } from "./site"
import type { Locale } from "./locales"

export function socialMetadata({ title, description, path, locale, image, type = "website" }: { title: string; description: string; path: string; locale: Locale; image?: string; type?: "website" | "article" }): Pick<Metadata, "openGraph" | "twitter"> {
  const cover = image?.startsWith("/") && !image.startsWith("//") ? absoluteUrl(image) : image?.startsWith("https://") ? image : absoluteUrl("/social-card.png")
  return {
    openGraph: { title, description, url: absoluteUrl(path), siteName: "Agora Recipes", type, locale: { en: "en_US", "zh-Hans": "zh_CN", "zh-Hant": "zh_TW", ja: "ja_JP", hi: "hi_IN", es: "es_ES", "pt-BR": "pt_BR" }[locale], images: [{ url: cover, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: cover, alt: title }] },
  }
}
