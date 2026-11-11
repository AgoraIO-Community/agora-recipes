"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ArrowDownWideNarrow, ChevronDown, Grid2X2, List, Search, SlidersHorizontal } from "lucide-react"
import { RecipeDocument } from "@/components/recipe-document"
import { RecipeStartActions } from "@/components/recipe-start-actions"
import { ShareActions } from "@/components/share-actions"
import { usePrivacySettings } from "@/components/privacy-provider"
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/ui/disclosure"
import { Toolbar, ToolbarActions } from "@/components/ui/toolbar"
import { CodePanel, CopyTextButton } from "@/components/code-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, ButtonArrow } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectionIndicator } from "@/components/ui/selection-indicator"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Live reference for shared primitives; all state is local and disposable. */
export function DesignSystemShowcase() {
  const mobile = useIsMobile()
  const openPrivacy = usePrivacySettings()
  const [category, setCategory] = useState("all")
  const [view, setView] = useState("grid")
  const [recovered, setRecovered] = useState(false)
  const [includeVideo, setIncludeVideo] = useState(false)
  return <div className="shell ds-reference">
    <header><p className="ds-caption">Development reference</p><h1>Recipes design system</h1><p>Shared components, real states, and reusable compositions. Appearance follows your system.</p></header>

    <section aria-labelledby="ds-controls"><h2 id="ds-controls">Controls</h2><p className="ds-caption">32px controls · 13px regular labels · 16px icons · 6px corners · 46px touch targets</p>
      <div className="ds-row" data-reference="controls">
        <Button>Get started<ButtonArrow direction="outbound" /></Button>
        <Button variant="outline">Recipes</Button><Button variant="ghost">Topics</Button>
        <Button variant="link" asChild><a href="#ds-feedback">Demo</a></Button>
        <IconButton label="Search recipes" variant="outline"><Search aria-hidden="true" /></IconButton>
        <IconButton label="Filters, 2 active" count={2} variant="outline"><SlidersHorizontal aria-hidden="true" /></IconButton>
        <IconButton label="Filters, 12 active" count={12} variant="outline"><SlidersHorizontal aria-hidden="true" /></IconButton>
      </div>
      <div className="ds-row" data-reference="directional-actions"><Button>Start a submission<ButtonArrow /></Button><Button disabled>Unavailable<ButtonArrow /></Button><Button variant="outline" disabled>Unavailable picker</Button><Button busy>Copy recipe</Button><Button variant="destructive">Remove selection</Button></div>
      <div className="ds-row"><CopyTextButton text="Recipes design system example" label="Copy example" subject="Example" variant="outline" /><span className="ds-caption">Copies example text. Label space stays reserved through every state.</span></div>
    </section>

    <section aria-labelledby="ds-compositions"><h2 id="ds-compositions">One task, one group</h2>
      <div className="ds-row" data-reference="command-states">
        <ButtonGroup aria-label="Catalog commands">
          <Select defaultValue="recommended"><SelectTrigger size="icon" aria-label="Sort example recipes"><ArrowDownWideNarrow aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="recommended">Recommended</SelectItem><SelectItem value="updated">Recently updated</SelectItem><SelectItem value="unavailable" disabled>Unavailable order</SelectItem></SelectGroup></SelectContent></Select>
          <Popover><PopoverTrigger asChild><IconButton variant="outline" label="Filter example recipes"><SlidersHorizontal aria-hidden="true" /></IconButton></PopoverTrigger><PopoverContent><Field orientation="horizontal"><Checkbox id="ds-video-filter" /><Label htmlFor="ds-video-filter">Has a video</Label></Field></PopoverContent></Popover>
        </ButtonGroup><span className="ds-caption">Select and Button share hover, pressed, open, and keyboard focus feedback.</span>
      </div>
      <Toolbar className="ds-bar" data-reference="toolbar" aria-label="Catalog controls">
        <ToggleGroup type="single" value={category} onValueChange={v => v && setCategory(v)} aria-label="Recipe category">
          <SelectionIndicator value={category} />
          <ToggleGroupItem value="all">All</ToggleGroupItem><ToggleGroupItem value="voice">Voice AI</ToggleGroupItem><ToggleGroupItem value="rtc">RTC</ToggleGroupItem>
        </ToggleGroup>
        <ToolbarActions><ToggleGroup type="single" size="icon" value={view} onValueChange={v => v && setView(v)} aria-label="Project view">
          <SelectionIndicator value={view} />
          <ToggleGroupItem value="grid" aria-label="Grid view"><Grid2X2 aria-hidden="true" /></ToggleGroupItem><ToggleGroupItem value="list" aria-label="List view"><List aria-hidden="true" /></ToggleGroupItem>
        </ToggleGroup>
        <ButtonGroup aria-label="Reader actions"><Button variant="outline">Guide</Button><CopyTextButton text="Recipes example guide" subject="Guide" iconOnly variant="outline" /></ButtonGroup></ToolbarActions>
      </Toolbar>
      <div className="ds-row"><Toggle aria-label="Pin recipe">Pin recipe</Toggle><Badge variant="secondary">TypeScript</Badge><Badge variant="outline">Beginner</Badge></div>
      <Tabs defaultValue="guide"><TabsList variant="segmented" aria-label="Reader content"><TabsTrigger value="guide">Guide</TabsTrigger><TabsTrigger value="prompt">Prompt</TabsTrigger><TabsTrigger value="disabled" disabled>Unavailable</TabsTrigger></TabsList><TabsContent value="guide"><p>The reading plane stays opaque. Arrow keys move between reader modes.</p></TabsContent><TabsContent value="prompt"><p>The selected mode changes content without moving the controls.</p></TabsContent></Tabs>
    </section>

    <section aria-labelledby="ds-forms"><h2 id="ds-forms">Forms and refinement</h2><FieldGroup className="ds-form-grid" data-reference="form-controls">
      <Field><FieldLabel htmlFor="ds-query">Search</FieldLabel><InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput id="ds-query" placeholder="Search projects, guides, or authors…" /></InputGroup></Field>
      <Field data-invalid><FieldLabel htmlFor="ds-url">Repository URL</FieldLabel><Input id="ds-url" defaultValue="github.com/example" aria-invalid="true" aria-describedby="ds-url-error" /><FieldError id="ds-url-error">Enter a complete HTTPS repository URL.</FieldError></Field>
      <Field><FieldLabel htmlFor="ds-platform">Platform</FieldLabel><Select defaultValue="all"><SelectTrigger id="ds-platform"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All platforms</SelectItem><SelectItem value="typescript">TypeScript</SelectItem><SelectItem value="long">Real-time communication for native mobile applications</SelectItem></SelectGroup></SelectContent></Select></Field>
      <Field><FieldLabel htmlFor="ds-disabled">Unavailable field</FieldLabel><Input id="ds-disabled" disabled value="Read only while preparing" /></Field>
      <Field><FieldLabel htmlFor="ds-topic">Topic</FieldLabel><DropdownMenu><DropdownMenuTrigger asChild><Button id="ds-topic" variant="field">General catalog submission<ChevronDown data-slot="select-icon" aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup><DropdownMenuItem>General catalog submission</DropdownMenuItem><DropdownMenuItem>Community projects</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></Field>
      <Field><FieldLabel htmlFor="ds-topic-disabled">Unavailable picker</FieldLabel><Button id="ds-topic-disabled" variant="field" disabled>Preparing topics<ChevronDown data-slot="select-icon" aria-hidden="true" /></Button></Field>
      <Field orientation="horizontal"><Checkbox id="ds-platform-check" defaultChecked /><Label htmlFor="ds-platform-check">Include TypeScript recipes</Label></Field>
      <Field><FieldLabel>Optional preferences</FieldLabel><Label className="facet-option" htmlFor="ds-optional-check"><Checkbox id="ds-optional-check" /><span>Include optional usage analytics</span></Label><Label className="facet-option" htmlFor="ds-optional-disabled" data-disabled="true"><Checkbox id="ds-optional-disabled" disabled /><span>Unavailable optional preference</span></Label></Field>
      <Field><FieldLabel htmlFor="ds-notes">Description</FieldLabel><Textarea id="ds-notes" placeholder="Describe what someone can build." /></Field>
    </FieldGroup></section>

    <section aria-labelledby="ds-reader"><h2 id="ds-reader">Reader and document tools</h2><p>The actual reader, prompt actions and shared disclosure used on recipe pages.</p>
      <div className="ds-row"><RecipeStartActions prompt="Use the recipe materials to build your project." command="agora init example --recipe example" /><ShareActions url="https://github.com/AgoraIO-Community/agora-recipes" title="Recipes example" /></div>
      <RecipeDocument markdown="# Example recipe\n\nUse the guide or copy its Markdown." sourceUrl="https://github.com/AgoraIO-Community/agora-recipes/blob/staging/README.md"><div className="prose-recipe"><p>A reading plane with the same control bar as the real recipe.</p><CodePanel code="agora --help" label="Shell" /><Disclosure><DisclosureTrigger meta="2">Requirements and setup</DisclosureTrigger><DisclosureContent>Bring your project and a public repository.</DisclosureContent></Disclosure></div></RecipeDocument>
    </section>

    <section aria-labelledby="ds-surfaces"><h2 id="ds-surfaces">Floating surfaces</h2><p>Menus share the optical surface. Forms and reading content stay solid.</p><div className="ds-row">
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup><DropdownMenuItem>Open guide</DropdownMenuItem><DropdownMenuCheckboxItem checked={includeVideo} onCheckedChange={setIncludeVideo}>Include video</DropdownMenuCheckboxItem><DropdownMenuSub><DropdownMenuSubTrigger>Source options</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuGroup><DropdownMenuItem>View source</DropdownMenuItem></DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub><DropdownMenuItem disabled>Unavailable action</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
      <Popover><PopoverTrigger asChild><Button variant="outline">Details</Button></PopoverTrigger><PopoverContent><p>One compact surface for secondary information.</p></PopoverContent></Popover>
      <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Review recipe</DialogTitle><DialogDescription>Example dialog. Escape dismisses it and restores trigger focus.</DialogDescription></DialogHeader><DialogBody>A solid reading plane inside the floating frame.</DialogBody><DialogFooter><DialogClose asChild><Button variant="outline">Done</Button></DialogClose></DialogFooter></DialogContent></Dialog>
      <Sheet><SheetTrigger asChild><Button variant="outline"><SlidersHorizontal aria-hidden="true" />Open sheet</Button></SheetTrigger><SheetContent side={mobile ? "bottom" : "right"} className="catalog-filter-sheet" aria-describedby={undefined}><SheetHeader><SheetTitle>Refine recipes</SheetTitle></SheetHeader><SheetBody className="catalog-filter-sheet__body"><Field orientation="horizontal"><Checkbox id="ds-sheet-option" /><Label htmlFor="ds-sheet-option">Include native mobile applications</Label></Field></SheetBody><SheetFooter><SheetClose asChild><Button>Show results</Button></SheetClose></SheetFooter></SheetContent></Sheet>
    </div></section>

    <section aria-labelledby="ds-managed-privacy"><h2 id="ds-managed-privacy">Managed privacy notice</h2><p>Inspect the actual managed notice, including its full copy, wrapping and system appearance. Choices use the same preference center as every product route.</p>
      <div className="ds-row"><Button variant="outline" onClick={event => {
        if (window.SecuritiSDK?.onReady) window.SecuritiSDK.onReady(api => api.showBanner())
        else openPrivacy(event.currentTarget)
      }}>Preview managed notice</Button></div>
    </section>

    <section aria-labelledby="ds-feedback"><h2 id="ds-feedback">Content and recovery</h2><div className="ds-columns">
      <Card><CardHeader><CardTitle>Meeting Copilot</CardTitle></CardHeader><CardContent><p>Turn meeting talk into tasks.</p><Separator /><div className="ds-row"><Badge variant="secondary">TypeScript</Badge><Button variant="link" asChild><a href="#ds-controls">Demo</a></Button></div></CardContent></Card>
      <Alert variant={recovered ? "default" : "destructive"}><AlertTitle>{recovered ? "Example recovered" : "Guide unavailable"}</AlertTitle><AlertDescription><p>{recovered ? "The recovery state is now visible." : "The source could not be loaded. You can try again."}</p><Button variant="outline" onClick={() => setRecovered(!recovered)}>{recovered ? "Reset example" : "Try again"}</Button></AlertDescription></Alert>
    </div><Empty><EmptyHeader><EmptyTitle>No recipes found</EmptyTitle><EmptyDescription>Remove a condition to broaden your search.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => { setCategory("all"); setView("grid") }}>Reset example filters</Button></EmptyContent></Empty></section>
  </div>
}
