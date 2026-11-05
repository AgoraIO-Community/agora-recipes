import { AgoraLogo } from "@/components/agora-logo"

/** The product wordmark stays the same across routes and interface languages. */
export function RecipesBrand() {
  return <><AgoraLogo /><span className="site-brand__name" lang="en">recipes</span></>
}
