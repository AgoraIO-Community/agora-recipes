"use client"

import { ChevronDown } from "lucide-react"
import { useI18n } from "@/components/locale-provider"
import { CodePanel, CopyTextButton } from "@/components/code-panel"
import { CopyPrompt } from "@/components/copy-prompt"
import { IconButton } from "@/components/ui/icon-button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Popover, PopoverAnchor, PopoverBody, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RecipeSetup } from "@/lib/recipes"

function ManualSetup({ setup }: { setup: RecipeSetup }) {
  if (!setup.npmAvailable) return <div className="recipe-setup-content">
    <p>The npm package for this recipe is not available yet. Use AI Assistant to create and run this demo with Agora CLI.</p>
  </div>

  return <div className="recipe-setup-content">
    <p>Create and run the demo locally using its npm package.</p>
    <p>Requires Node.js 24, pnpm 9.15.9, and an Agora project with Conversational AI enabled.</p>
    <section>
      <h3>1. Create the app</h3>
      <CodePanel code={`npx ${setup.packageName}@${setup.packageVersion} ${setup.directory}\ncd ${setup.directory}`} label="Create app" variant="embedded" wrap />
    </section>
    <section>
      <h3>2. Configure credentials</h3>
      <p>Copy <code>env.local.example</code> to <code>.env.local</code> and enter your credentials:</p>
      <CodePanel code={`NEXT_PUBLIC_AGORA_APP_ID=your_app_id\nNEXT_AGORA_APP_CERTIFICATE=your_app_certificate`} label="Environment variables" variant="embedded" wrap />
      <p>Keep the App Certificate server-side.</p>
      {setup.configurationNote && <p>{setup.configurationNote}</p>}
    </section>
    <section>
      <h3>3. Install and start</h3>
      <CodePanel code={`pnpm install --frozen-lockfile\npnpm run doctor\npnpm run dev`} label="Install and start" variant="embedded" wrap />
      <p>Open the local URL shown in your terminal, allow microphone access, and try:</p>
      <blockquote>{setup.testRequest}</blockquote>
    </section>
  </div>
}

export function RecipeStartActions({ prompt, command, setup }: { prompt: string; command?: string; setup?: RecipeSetup }) {
  const { t } = useI18n()
  const title = setup ? "Start building" : t(command ? "Prompt & CLI" : "Recipe prompt")
  return <Popover>
    <PopoverAnchor asChild><ButtonGroup id="build" className="recipe-start-group" data-appearance="primary" aria-label={t("Build with your coding agent")}>
      <CopyTextButton text={prompt} label="Copy recipe prompt" subject="Recipe prompt" primary iconOnly />
      <ButtonGroupSeparator />
      <PopoverTrigger asChild><IconButton variant="primary" label={setup ? title : t(command ? "Prompt & CLI" : "View recipe prompt")}><ChevronDown aria-hidden="true" /></IconButton></PopoverTrigger>
    </ButtonGroup></PopoverAnchor>
    <PopoverContent align="start" sideOffset={10} collisionPadding={16} className="recipe-setup-popover" aria-label={title}>
      <PopoverHeader><PopoverTitle>{title}</PopoverTitle></PopoverHeader>
      <PopoverBody>
      {setup ? <Tabs defaultValue="assistant" className="recipe-setup-tabs">
        <TabsList variant="segmented" aria-label="Setup method">
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
        </TabsList>
        <TabsContent value="assistant" className="recipe-setup-content">
          <p>Copy this prompt into your AI coding assistant.</p>
          <CopyTextButton text={prompt} label="Copy prompt" subject="Recipe prompt" variant="outline" />
          <CopyPrompt prompt={prompt} />
        </TabsContent>
        <TabsContent value="manual"><ManualSetup setup={setup} /></TabsContent>
      </Tabs> : command ? <Tabs defaultValue="prompt" className="recipe-setup-tabs">
        <TabsList variant="segmented" aria-label={t("Prompt & CLI")}>
          <TabsTrigger value="prompt">{t("Prompt")}</TabsTrigger>
          <TabsTrigger value="cli">Agora CLI</TabsTrigger>
        </TabsList>
        <TabsContent value="prompt"><CopyPrompt prompt={prompt} /></TabsContent>
        <TabsContent value="cli"><CodePanel code={command} label="Agora CLI" variant="embedded" /></TabsContent>
      </Tabs> : <CopyPrompt prompt={prompt} />}
      </PopoverBody>
    </PopoverContent>
  </Popover>
}
