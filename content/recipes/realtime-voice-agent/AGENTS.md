# Real-time Voice Agent

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

```
 ┌───────────┐    Agora RTC    ┌──────────────┐    WebSocket    ┌──────────┐
 │  Browser  │  ◀──────────▶  │ Agent Worker │  ◀──────────▶  │  OpenAI  │
 └───────────┘                 └──────────────┘                 └──────────┘
```

## Prerequisites

- Node.js 20+
- An Agora project (App ID + App Certificate)
- An OpenAI API key with access to `gpt-realtime`

## Quick start

```bash
git clone https://github.com/AgoraIO-Community/voice-ai-recipes
cd voice-ai-recipes/realtime-voice-agent
pnpm install
cp .env.example .env.local
pnpm dev
```

## Configuration

| Variable | Description |
| --- | --- |
| `AGORA_APP_ID` | Your Agora project ID |
| `AGORA_APP_CERTIFICATE` | Used to mint short-lived RTC tokens |
| `OPENAI_API_KEY` | OpenAI key with Realtime access |
| `AGENT_VOICE` | Voice preset, e.g. `alloy`, `verse` |

## How it works

1. The browser joins an Agora channel and publishes a single audio track.
2. The agent worker subscribes to the channel and pipes raw PCM frames into
   OpenAI's Realtime WebSocket.
3. Tokens stream back and are converted to 24&nbsp;kHz audio that the worker
   publishes back into the channel.
4. Agora's network handles jitter, packet loss, and global routing.

## Customization

- Swap the system prompt in `agent/prompt.ts`.
- Add tools via `agent/tools/*.ts`; the agent forwards them to the model with
  function calling.
- Replace OpenAI with a Realtime-compatible provider by implementing the
  `AgentBridge` interface.

## Production checklist

- [ ] Mint RTC tokens server-side, never embed certificates in the client.
- [ ] Enable Agora AI Noise Suppression on the publishing track.
- [ ] Set a hard cap on session duration to prevent runaway costs.
- [ ] Stream conversation transcripts to your analytics pipeline.
