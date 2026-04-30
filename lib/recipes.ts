export type Platform = "Web" | "iOS" | "Android"

export type UseCase =
  | "Customer Support"
  | "Education"
  | "Healthcare"
  | "Gaming"
  | "Productivity"
  | "Translation"
  | "Entertainment"
  | "Accessibility"

export type Feature =
  | "Conversational AI"
  | "Real-time STT"
  | "Real-time TTS"
  | "Voice Cloning"
  | "Noise Suppression"
  | "Multi-lingual"
  | "Function Calling"
  | "RAG"
  | "Streaming"
  | "Low Latency"

export type Recipe = {
  slug: string
  title: string
  tagline: string
  description: string
  platforms: Platform[]
  useCases: UseCase[]
  features: Feature[]
  demoUrl: string
  githubUrl: string
  agentMdRawUrl: string
  author: string
  updated: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  /** Markdown body of the Agent.md file. */
  agentMd: string
}

const REPO = "https://github.com/AgoraIO-Community/voice-ai-recipes"

function rawUrl(path: string) {
  return `https://raw.githubusercontent.com/AgoraIO-Community/voice-ai-recipes/main/${path}/Agent.md`
}

function repoUrl(path: string) {
  return `${REPO}/tree/main/${path}`
}

export const recipes: Recipe[] = [
  {
    slug: "realtime-voice-agent",
    title: "Real-time Voice Agent",
    tagline: "Sub-500ms conversational AI agent powered by Agora and OpenAI Realtime.",
    description:
      "A production-ready voice agent that streams microphone audio to OpenAI's Realtime API over Agora's global low-latency network. Includes interruption handling, turn detection, and noise suppression.",
    platforms: ["Web", "iOS", "Android"],
    useCases: ["Customer Support", "Productivity"],
    features: ["Conversational AI", "Streaming", "Low Latency", "Real-time STT", "Real-time TTS", "Noise Suppression"],
    demoUrl: "https://voice-agent.agora.io/demo",
    githubUrl: repoUrl("realtime-voice-agent"),
    agentMdRawUrl: rawUrl("realtime-voice-agent"),
    author: "Agora Devrel",
    updated: "2026-04-12",
    difficulty: "Intermediate",
    agentMd: `# Real-time Voice Agent

A reference implementation of a low-latency voice agent that pairs **Agora's
Real-Time Network** with **OpenAI's Realtime API**. The agent listens, thinks,
and speaks in under 500&nbsp;ms end-to-end.

## What you'll build

- A web client that captures microphone audio and plays back synthesized
  speech.
- A backend service that bridges Agora's RTC channel to the OpenAI Realtime
  WebSocket.
- Server-side **turn detection**, **interruption handling**, and **token
  authentication**.

## Architecture

\`\`\`
 ┌───────────┐    Agora RTC    ┌──────────────┐    WebSocket    ┌──────────┐
 │  Browser  │  ◀──────────▶  │ Agent Worker │  ◀──────────▶  │  OpenAI  │
 └───────────┘                 └──────────────┘                 └──────────┘
\`\`\`

## Prerequisites

- Node.js 20+
- An Agora project (App ID + App Certificate)
- An OpenAI API key with access to \`gpt-realtime\`

## Quick start

\`\`\`bash
git clone https://github.com/AgoraIO-Community/voice-ai-recipes
cd voice-ai-recipes/realtime-voice-agent
pnpm install
cp .env.example .env.local
pnpm dev
\`\`\`

## Configuration

| Variable | Description |
| --- | --- |
| \`AGORA_APP_ID\` | Your Agora project ID |
| \`AGORA_APP_CERTIFICATE\` | Used to mint short-lived RTC tokens |
| \`OPENAI_API_KEY\` | OpenAI key with Realtime access |
| \`AGENT_VOICE\` | Voice preset, e.g. \`alloy\`, \`verse\` |

## How it works

1. The browser joins an Agora channel and publishes a single audio track.
2. The agent worker subscribes to the channel and pipes raw PCM frames into
   OpenAI's Realtime WebSocket.
3. Tokens stream back and are converted to 24&nbsp;kHz audio that the worker
   publishes back into the channel.
4. Agora's network handles jitter, packet loss, and global routing.

## Customization

- Swap the system prompt in \`agent/prompt.ts\`.
- Add tools via \`agent/tools/*.ts\` — they are forwarded to the model with
  function calling.
- Replace OpenAI with any Realtime-compatible provider by implementing the
  \`AgentBridge\` interface.

## Production checklist

- [ ] Mint RTC tokens server-side, never embed certificates in the client.
- [ ] Enable Agora AI Noise Suppression on the publishing track.
- [ ] Set a hard cap on session duration to prevent runaway costs.
- [ ] Stream conversation transcripts to your analytics pipeline.
`,
  },
  {
    slug: "ai-meeting-notes",
    title: "AI Meeting Notes",
    tagline: "Live transcription, speaker diarization, and AI-generated summaries.",
    description:
      "Drop-in meeting assistant that joins an Agora call as a silent participant, transcribes every speaker in real time, and produces a structured summary with action items when the call ends.",
    platforms: ["Web"],
    useCases: ["Productivity"],
    features: ["Real-time STT", "Streaming", "Multi-lingual", "RAG"],
    demoUrl: "https://meeting-notes.agora.io/demo",
    githubUrl: repoUrl("ai-meeting-notes"),
    agentMdRawUrl: rawUrl("ai-meeting-notes"),
    author: "Agora Devrel",
    updated: "2026-03-28",
    difficulty: "Intermediate",
    agentMd: `# AI Meeting Notes

A silent meeting participant that captures every speaker, transcribes them
live, and produces structured notes after the call.

## Highlights

- **Speaker diarization** powered by Agora's per-uid audio streams.
- **Streaming transcription** with sub-second partials.
- **Action item extraction** using a small local LLM.
- Output as Markdown, JSON, or directly to Notion.

## Run it

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Then join the demo channel and start talking — the bot will appear as
\`Notes Bot\` in the participant list.

## Architecture

The bot is a headless web client built on the **Agora Web SDK NG**. Each
remote audio track is piped into a streaming STT provider; partials are
broadcast back to the channel as a data stream so any client can render them.
`,
  },
  {
    slug: "voice-translator",
    title: "Live Voice Translator",
    tagline: "Bidirectional, real-time speech translation across 30+ languages.",
    description:
      "Two participants speak their native language and hear the other translated in their own ear. Built on Agora Spatial Audio so original and translated streams can coexist.",
    platforms: ["iOS", "Android", "Web"],
    useCases: ["Translation", "Accessibility"],
    features: ["Multi-lingual", "Real-time STT", "Real-time TTS", "Streaming", "Low Latency"],
    demoUrl: "https://translator.agora.io/demo",
    githubUrl: repoUrl("voice-translator"),
    agentMdRawUrl: rawUrl("voice-translator"),
    author: "Agora Devrel",
    updated: "2026-04-02",
    difficulty: "Advanced",
    agentMd: `# Live Voice Translator

Real-time, bidirectional speech translation between any two participants.

## How it sounds

Each user hears a low-volume version of the original speaker mixed with a
full-volume translated voice. The original is preserved so emotional cues
aren't lost.

## Languages

English, Spanish, Portuguese, French, German, Italian, Dutch, Japanese,
Korean, Mandarin, Cantonese, Hindi, Arabic, Turkish, Polish, Swedish,
Norwegian, Finnish, Czech, Greek, Hebrew, Thai, Vietnamese, Indonesian,
Malay, Filipino, Ukrainian, Romanian, Hungarian, Bulgarian.

## Setup

1. Pick your source and target language pair in the app.
2. Speak normally — the agent re-publishes a translated audio track on a
   secondary uid.
3. Mute the original on the receiving side or use spatial audio to place it
   behind the listener.

## Implementation notes

- Translation is done via streaming with a 200&nbsp;ms VAD tail.
- Voice is preserved per-speaker using a lightweight cloning step (opt-in).
`,
  },
  {
    slug: "voice-controlled-npc",
    title: "Voice-controlled Game NPC",
    tagline: "Drop-in Unity & Unreal NPCs that hold real conversations with the player.",
    description:
      "Give any non-player character a voice. Players speak naturally, the NPC responds in character with low-latency synthesized speech. Includes Unity and Unreal sample projects.",
    platforms: ["iOS", "Android"],
    useCases: ["Gaming", "Entertainment"],
    features: ["Conversational AI", "Voice Cloning", "Function Calling", "Low Latency"],
    demoUrl: "https://npc.agora.io/demo",
    githubUrl: repoUrl("voice-controlled-npc"),
    agentMdRawUrl: rawUrl("voice-controlled-npc"),
    author: "Agora Devrel",
    updated: "2026-02-19",
    difficulty: "Advanced",
    agentMd: `# Voice-controlled Game NPC

Plug-and-play conversational NPCs for Unity and Unreal.

## Features

- Per-NPC personality, voice, and tool list.
- Push-to-talk or always-on voice activity detection.
- Function calling so NPCs can give items, open doors, or trigger quests.
- Falls back gracefully on poor networks via Agora's global SD-RTN.

## Unity quick start

\`\`\`csharp
var npc = gameObject.AddComponent<AgoraVoiceNPC>();
npc.persona = "A grumpy blacksmith named Doran";
npc.tools = new[] { Tools.GiveItem, Tools.OpenShop };
npc.Begin();
\`\`\`

## Unreal quick start

Drop the **AgoraVoiceNPCComponent** onto any Pawn and configure the persona
and tools in the Details panel.
`,
  },
  {
    slug: "voice-cloned-storyteller",
    title: "Voice-cloned Storyteller",
    tagline: "Clone a narrator's voice once, then stream interactive bedtime stories.",
    description:
      "Record a 30-second sample, then have an AI agent narrate any prompt-driven story in that voice. Designed for parents who can't be home for storytime.",
    platforms: ["iOS", "Android"],
    useCases: ["Entertainment", "Education"],
    features: ["Voice Cloning", "Real-time TTS", "Streaming", "Conversational AI"],
    demoUrl: "https://storyteller.agora.io/demo",
    githubUrl: repoUrl("voice-cloned-storyteller"),
    agentMdRawUrl: rawUrl("voice-cloned-storyteller"),
    author: "Agora Devrel",
    updated: "2026-01-30",
    difficulty: "Beginner",
    agentMd: `# Voice-cloned Storyteller

A bedtime story app that uses a 30&nbsp;second voice sample to clone a
narrator and stream original stories on demand.

## Workflow

1. Record a clean 30-second sample once.
2. Pick a theme — adventure, fairy tale, sci-fi, or kid's choice.
3. The agent generates and streams the story in chunks; the cloned voice
   reads it back with natural prosody.

## Privacy

Voice samples never leave your account and can be deleted at any time. The
sample is encrypted at rest with a per-user key.
`,
  },
  {
    slug: "ai-customer-support",
    title: "AI Customer Support Line",
    tagline: "A 24/7 voice support agent with handoff to a human when needed.",
    description:
      "A voice IVR replacement that authenticates the caller, answers from your knowledge base via RAG, and escalates to a human agent on the same Agora channel when confidence drops.",
    platforms: ["Web"],
    useCases: ["Customer Support"],
    features: ["Conversational AI", "RAG", "Function Calling", "Multi-lingual", "Low Latency"],
    demoUrl: "https://support.agora.io/demo",
    githubUrl: repoUrl("ai-customer-support"),
    agentMdRawUrl: rawUrl("ai-customer-support"),
    author: "Agora Devrel",
    updated: "2026-04-20",
    difficulty: "Advanced",
    agentMd: `# AI Customer Support Line

Replace your IVR with a natural-sounding agent that answers from your docs
and hands off to humans without a transfer.

## Capabilities

- Caller authentication via voice + one-time code.
- RAG over your knowledge base, refreshed every hour.
- **Warm handoff**: the human joins the same Agora channel and sees the full
  transcript before saying hello.
- Sentiment-aware escalation.

## Knowledge base

Point the agent at any HTTPS source and it will index nightly:

\`\`\`yaml
sources:
  - https://docs.example.com/sitemap.xml
  - https://help.example.com/api.json
\`\`\`
`,
  },
  {
    slug: "language-tutor",
    title: "AI Language Tutor",
    tagline: "Conversational language practice with grammar feedback and pronunciation scoring.",
    description:
      "An AI tutor you can actually speak with. Holds open-ended conversations at your level, scores pronunciation in real time, and tracks vocabulary acquisition over sessions.",
    platforms: ["Web", "iOS", "Android"],
    useCases: ["Education"],
    features: ["Conversational AI", "Multi-lingual", "Real-time STT", "Real-time TTS", "Streaming"],
    demoUrl: "https://tutor.agora.io/demo",
    githubUrl: repoUrl("language-tutor"),
    agentMdRawUrl: rawUrl("language-tutor"),
    author: "Agora Devrel",
    updated: "2026-03-11",
    difficulty: "Intermediate",
    agentMd: `# AI Language Tutor

Practice a new language by actually speaking it.

## Why it works

- The tutor adapts to your CEFR level (A1 → C2) every few turns.
- Pronunciation is scored phoneme-by-phoneme using Agora's on-device VAD +
  a streaming alignment model.
- Mistakes are surfaced **after** you finish a thought, never mid-sentence.

## Supported languages

Spanish, French, German, Italian, Portuguese, Mandarin, Japanese, Korean,
Arabic, Hindi.

## Try it

\`\`\`bash
pnpm dev
\`\`\`

Choose your target language and difficulty, then start talking.
`,
  },
  {
    slug: "voice-accessibility",
    title: "Voice-first Accessibility Reader",
    tagline: "Turn any web page into a navigable, voice-controlled reading experience.",
    description:
      "An accessibility layer that lets users navigate, summarize, and ask questions about any web page using only their voice. Designed with screen-reader users in mind.",
    platforms: ["Web"],
    useCases: ["Accessibility"],
    features: ["Conversational AI", "Real-time STT", "Real-time TTS", "Function Calling", "RAG"],
    demoUrl: "https://reader.agora.io/demo",
    githubUrl: repoUrl("voice-accessibility"),
    agentMdRawUrl: rawUrl("voice-accessibility"),
    author: "Agora Devrel",
    updated: "2026-02-08",
    difficulty: "Beginner",
    agentMd: `# Voice-first Accessibility Reader

A browser extension that lets anyone — but especially screen-reader users —
navigate the web by voice.

## Commands

- *"Summarize this page"*
- *"Read the third paragraph"*
- *"What did the article say about pricing?"*
- *"Open the first link"*

## Designed for

- Low-vision and blind users who want a faster alternative to traditional
  screen readers.
- Drivers and other hands-busy contexts.
- Older readers who prefer audio.

## Architecture

The extension runs entirely in the user's browser and only sends the
selected text to the model — never the full page or any personal data.
`,
  },
  {
    slug: "telehealth-intake",
    title: "Telehealth Voice Intake",
    tagline: "HIPAA-aligned voice intake that captures symptoms before the doctor joins.",
    description:
      "A pre-visit voice agent that walks patients through structured symptom intake, summarizes the conversation into a SOAP note, and posts it to the EHR before the clinician joins the call.",
    platforms: ["Web", "iOS"],
    useCases: ["Healthcare"],
    features: ["Conversational AI", "RAG", "Function Calling", "Multi-lingual", "Noise Suppression"],
    demoUrl: "https://telehealth.agora.io/demo",
    githubUrl: repoUrl("telehealth-intake"),
    agentMdRawUrl: rawUrl("telehealth-intake"),
    author: "Agora Devrel",
    updated: "2026-04-25",
    difficulty: "Advanced",
    agentMd: `# Telehealth Voice Intake

A pre-visit voice agent for telehealth that runs the intake interview,
generates a SOAP note, and posts it to the EHR.

## Compliance

- All audio is processed inside the customer's VPC.
- BAA available; PHI never leaves your AWS account.
- Audit log of every model prompt and tool invocation.

## Conversation outline

1. Identity verification.
2. Chief complaint.
3. History of present illness (HPI).
4. Allergies, medications, relevant history.
5. Confirmation and clinician hand-off.

The agent yields the channel to the clinician and stays on as a silent
scribe for the rest of the visit.
`,
  },
]

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug)
}

export const allPlatforms: Platform[] = ["Web", "iOS", "Android"]

export const allUseCases: UseCase[] = [
  "Customer Support",
  "Education",
  "Healthcare",
  "Gaming",
  "Productivity",
  "Translation",
  "Entertainment",
  "Accessibility",
]

export const allFeatures: Feature[] = [
  "Conversational AI",
  "Real-time STT",
  "Real-time TTS",
  "Voice Cloning",
  "Noise Suppression",
  "Multi-lingual",
  "Function Calling",
  "RAG",
  "Streaming",
  "Low Latency",
]
