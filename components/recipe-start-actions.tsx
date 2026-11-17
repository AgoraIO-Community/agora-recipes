"use client"

import { CodePanel, CopyTextButton } from "@/components/code-panel"

export function RecipeStartActions({ prompt, command }: { prompt: string; command?: string }) {
  return <div id="build" className="recipe-start-actions">
    {command && <CodePanel code={command} label="Agora CLI" wrap />}
    <CopyTextButton text={prompt} label="Copy prompt" subject="Recipe prompt" variant="outline" />
  </div>
}
