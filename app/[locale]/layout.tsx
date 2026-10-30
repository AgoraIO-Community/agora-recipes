import { notFound } from "next/navigation"
import SiteLayout, { siteMetadata } from "@/components/site-layout"
import { locales, isLocale } from "@/lib/locales"
export { viewport } from "@/components/site-layout"
export const dynamicParams = false
export function generateStaticParams() { return locales.map(locale => ({ locale })) }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return siteMetadata(isLocale(locale) ? locale : "en")
}
export default async function Layout({ params, children }: { params: Promise<{ locale: string }>; children: React.ReactNode }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <SiteLayout locale={locale}>{children}</SiteLayout>
}
