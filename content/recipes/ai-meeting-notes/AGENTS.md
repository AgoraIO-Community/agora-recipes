# AI Meeting Notes

A silent meeting participant that captures every speaker, transcribes them
live, and produces structured notes after the call.

## Highlights

- **Speaker diarization** powered by Agora's per-uid audio streams.
- **Streaming transcription** with sub-second partials.
- **Action item extraction** using a small local LLM.
- Output as Markdown, JSON, or directly to Notion.

## Run it

```bash
pnpm install
pnpm dev
```

Join the demo channel and start talking. The bot appears as
`Notes Bot` in the participant list.

## Architecture

The bot is a headless web client built on the **Agora Web SDK NG**. Each
remote audio track is piped into a streaming STT provider; partials are
broadcast back to the channel as a data stream so clients can render them.
