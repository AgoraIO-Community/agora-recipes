import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import type { DocLevel, FeaturePrompt, ProgressiveDisclosure } from "@/lib/recipes"

type RecipeDocsProps = {
  progressiveDisclosure: ProgressiveDisclosure | null
  featurePrompts: FeaturePrompt[]
  agentMdRawUrl: string
  githubUrl: string
}

const LEVEL_LABELS: Record<DocLevel, string> = {
  AGENTS: "AGENTS.md",
  L0: "L0",
  L1: "L1",
  L2: "L2",
}

const LEVEL_DESCRIPTIONS: Record<DocLevel, string> = {
  AGENTS: "Entry point",
  L0: "Repo card",
  L1: "Summary",
  L2: "Deep dives",
}

export function RecipeDocs({
  progressiveDisclosure,
  featurePrompts,
  agentMdRawUrl,
  githubUrl,
}: RecipeDocsProps) {
  return (
    <section aria-labelledby="recipe-docs-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2
          id="recipe-docs-heading"
          className="font-brand text-xl font-semibold tracking-tight"
        >
          Recipe documents
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These are the files the prompt above tells your agent to load.
        </p>
      </div>

      {progressiveDisclosure ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Progressive disclosure documents for this recipe
              </caption>
              <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Document</th>
                  <th className="px-4 py-3 text-left font-medium">Level</th>
                  <th className="px-4 py-3 text-left font-medium">Raw</th>
                  <th className="px-4 py-3 text-left font-medium">GitHub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {progressiveDisclosure.docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{doc.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.level === "L2"
                          ? "Index only; agents load linked deep dives as needed."
                          : LEVEL_DESCRIPTIONS[doc.level]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        {LEVEL_LABELS[doc.level]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DocLink href={doc.rawUrl}>raw</DocLink>
                    </td>
                    <td className="px-4 py-3">
                      <DocLink href={doc.viewUrl}>view</DocLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          This recipe has not declared progressive disclosure docs yet. Use the{" "}
          <DocLink href={agentMdRawUrl}>raw AGENTS.md</DocLink> or review the{" "}
          <DocLink href={githubUrl}>source repo</DocLink>.
        </div>
      )}

      {featurePrompts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-brand text-base font-semibold tracking-tight">
            Feature prompts
          </h3>
          <div className="grid gap-3">
            {featurePrompts.map((feature) => (
              <article
                key={feature.id}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {feature.purpose}
                    </p>
                  </div>
                  <DocLink href={feature.docUrl}>doc</DocLink>
                </div>
                <pre className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                  <code>{feature.prompt}</code>
                </pre>
                {feature.relatedCodeUrls.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {feature.relatedCodeUrls.map((url) => (
                      <DocLink key={url} href={url}>
                        reference
                      </DocLink>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function DocLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {children}
      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
    </Link>
  )
}
