import SiteLayout from "@/components/site-layout"
import NotFound from "@/components/pages/not-found"

export const metadata = { title: "Recipe not found" }

export default function GlobalNotFound() {
  return <SiteLayout><NotFound /></SiteLayout>
}
