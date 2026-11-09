import SiteLayout from "@/components/site-layout"

export { metadata, viewport } from "@/components/site-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>
}
