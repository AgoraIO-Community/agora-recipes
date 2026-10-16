import { ArrowUpRight } from "lucide-react"
import type { Recipe } from "@/lib/recipes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  let owner: string | undefined
  try { const url = new URL(recipe.mainRepoUrl); if (url.hostname === "github.com") owner = url.pathname.split("/").filter(Boolean)[0] } catch {}
  const initials = recipe.author.split(/\s+/).slice(0,2).map(part => part[0]).join("")
  return <article className="recipe-card">
    <div className="recipe-card__meta"><span>{recipe.platforms.join(" / ")}</span><span>{recipe.difficulty}</span></div>
    <h3>{recipe.title}</h3>
    <p className="recipe-card__description line-clamp-3">{recipe.tagline}</p>
    <div className="recipe-card__bottom">
      <div className="recipe-card__author">
        <Avatar className="size-6 bg-muted"><AvatarImage src={owner ? `https://github.com/${owner}.png?size=48` : undefined} alt="" /><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
        <div><span className="text-muted-foreground">By </span>{recipe.author}<small>{recipe.author.trim().toLowerCase() === "agora" ? "Official" : "Community"}</small></div>
      </div>
      <div className="flex flex-wrap gap-2">{recipe.capabilities.slice(0,3).map(capability => <span key={capability} className="metadata-chip">{capability}</span>)}{recipe.capabilities.length > 3 && <span className="metadata-chip">+{recipe.capabilities.length - 3}</span>}</div>
      <span className="recipe-card__action">View recipe<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" /></span>
    </div>
  </article>
}
