import { CopyTextButton } from "@/components/code-panel"

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  return <CopyTextButton text={markdown} label="Copy markdown" subject="Markdown" />
}
