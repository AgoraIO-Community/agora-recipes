"use client"

import { ChevronDown } from "lucide-react"
import { useI18n } from "@/components/locale-provider"
import { CodePanel, CopyTextButton } from "@/components/code-panel"
import { CopyPrompt } from "@/components/copy-prompt"
import { IconButton } from "@/components/ui/icon-button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Popover, PopoverAnchor, PopoverBody, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RecipeStartActions({ prompt, command }: { prompt: string; command?: string }) {
  const { t } = useI18n()
  return <Popover>
    <PopoverAnchor asChild><ButtonGroup id="build" className="recipe-start-group" data-appearance="primary" aria-label={t("Build with your coding agent")}>
      <CopyTextButton text={prompt} label="Copy recipe prompt" subject="Recipe prompt" primary iconOnly />
      <ButtonGroupSeparator />
      <PopoverTrigger asChild><IconButton variant="primary" label={t(command ? "Prompt & CLI" : "View recipe prompt")}><ChevronDown aria-hidden="true" /></IconButton></PopoverTrigger>
    </ButtonGroup></PopoverAnchor>
    <PopoverContent align="start" sideOffset={10} collisionPadding={16} className="recipe-setup-popover" aria-label={t(command ? "Prompt & CLI" : "Recipe prompt")}>
      <PopoverHeader><PopoverTitle>{t(command ? "Prompt & CLI" : "Recipe prompt")}</PopoverTitle></PopoverHeader>
      <PopoverBody>
      {command ? <Tabs defaultValue="prompt" className="recipe-setup-tabs">
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
