import { CodePanel } from "@/components/code-panel"

export function CopyPrompt({ prompt }: { prompt: string }) {
  return <CodePanel code={prompt} label="Prompt" wrap />
}
