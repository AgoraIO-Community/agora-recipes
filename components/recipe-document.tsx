"use client"

import { useId, useRef, useState, type ReactNode, type KeyboardEvent } from "react"
import { CopyMarkdownButton } from "@/components/copy-markdown-button"
import { CodePanel } from "@/components/code-panel"

export function RecipeDocument({ markdown,children }: {markdown: string;children: ReactNode}) {
  const [selected,setSelected]=useState(0)
  const id=useId()
  const tabs=useRef<(HTMLButtonElement|null)[]>([])
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let next: number
    if(event.key==="ArrowLeft"||event.key==="ArrowRight")next=1-selected
    else if(event.key==="Home")next=0
    else if(event.key==="End")next=1
    else return
    event.preventDefault();setSelected(next);tabs.current[next]?.focus()
  }
  return <>
    <div className="recipe-document-tabs">
      <div role="tablist" aria-label="Recipe format">{["Rendered","Raw"].map((label,index)=><button key={label} ref={element=>{tabs.current[index]=element}} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={selected===index} tabIndex={selected===index?0:-1} className="underline-tab" onKeyDown={keyDown} onClick={()=>setSelected(index)}>{label}</button>)}</div>
      <CopyMarkdownButton markdown={markdown}/>
    </div>
    <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} hidden={selected!==0}>{children}</div>
    <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} hidden={selected!==1}><CodePanel code={markdown} label="Markdown" wrap/></div>
  </>
}
