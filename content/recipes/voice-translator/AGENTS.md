# Live Voice Translator

Real-time speech translation between two participants.

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
2. Speak normally. The agent publishes a translated audio track on a
   secondary uid.
3. Mute the original on the receiving side or use spatial audio to place it
   behind the listener.

## Implementation notes

- Translation is done via streaming with a 200&nbsp;ms VAD tail.
- Voice is preserved per-speaker using a lightweight cloning step (opt-in).
