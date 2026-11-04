"use client"

import { useI18n } from "@/components/locale-provider"
import { useState } from "react"
import Image from "next/image"
import profiles from "@/content/authors.json"

const authors: Record<string, { avatar: string; profileUrl: string }> = profiles

export function RecipeAuthor({ name }: { name: string }) {
  const { t } = useI18n()
  const [failed, setFailed] = useState(false)
  const profile = Object.hasOwn(authors, name) ? authors[name] : undefined
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
  const content = <>
    <span className="recipe-author__avatar" aria-hidden="true">
      {profile && !failed ? <Image src={profile.avatar} alt="" width={20} height={20} loading="lazy" onError={() => setFailed(true)} /> : initials}
    </span>
    <span className="recipe-author__name">{name}</span>
  </>

  return profile ? (
    <a href={profile.profileUrl} className="recipe-author" target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: `${name} · GitHub` })} title={name}>{content}</a>
  ) : <span className="recipe-author" title={name}>{content}</span>
}
