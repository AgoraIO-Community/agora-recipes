import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { RecipeBackLink } from "@/components/recipe-back-link"
import { Button } from "@/components/ui/button"
import { getT } from "@/lib/i18n"
import { locales, localePath, type Locale } from "@/lib/locales"

const repository = "https://github.com/AgoraIO-Community/agora-recipes"
export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const { locale = "en" } = await params
  return { title: getT(locale)("Share what you built"), alternates: { canonical: localePath("/contribute", locale), languages: Object.fromEntries(locales.map(value => [value, localePath("/contribute", value)])) } }
}
export default async function ContributePage({ params }: { params: Promise<{ locale?: Locale }> }) {
  const { locale = "en" } = await params
  const t = getT(locale)
  return <article className="recipe-detail"><header className="detail-hero"><div className="shell"><RecipeBackLink /><h1 className="hero-title">{t("Share what you built")}</h1><p className="detail-description">{t("Submit your existing demo, video, source, or guide. A GitHub account is required.")}</p></div></header>
    <div className="shell contribute-content">
      <section className="recipe-guide"><h2 className="detail-title">{t("GitHub form")}</h2><p>{t("Open the form on GitHub. Your Issue is public and keeps the original submission, review discussion, and final publication link.")}</p><p>{t("A guide, source repository, or four translated submissions are not required for every entry.")}</p><div className="detail-actions"><Button asChild><a href={`${repository}/issues/new?template=submission.yml`} target="_blank" rel="noreferrer">{t("Open GitHub form")}<ArrowUpRight aria-hidden="true" /></a></Button></div></section>
      <section className="recipe-guide"><h2 className="detail-title">{t("Direct pull request")}</h2><p>{t("Keep the existing workflow: fork the repository, update catalog metadata, and open a PR to staging. A submission Issue is optional.")}</p><div className="detail-actions"><Button asChild variant="outline"><a href={`${repository}/blob/staging/CONTRIBUTING.md`} target="_blank" rel="noreferrer">{t("Contribution instructions")}<ArrowUpRight aria-hidden="true" /></a></Button></div></section>
      <p className="recipe-source-note">{t("Submit only public materials. Do not include private email addresses, credentials, or other private information.")}</p><p>{t("After submission, follow review in the GitHub Issue. Publication follows a reviewed catalog PR and the existing release process.")}</p>
    </div>
  </article>
}
