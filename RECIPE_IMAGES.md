# Recipe image inventory

Updated: 2026-10-27. This inventory covers the **107 local catalog entries**,
not a separately verified production deployment.

## Progress

- **8 pre-existing image entries**: left unchanged.
- **10 additional entries linked to genuine existing project PNGs**.
- **52 additional entries have fresh local UI screenshots** (3 first batch + 49
  full-inventory continuation).
- **1 additional entry uses a reviewed frame from its author's demo GIF**.
- **71 of 107 recipes now have catalog images; 36 remain without an acceptable image**.
- All **86 previously remaining source repositories were inspected** via shallow
  sparse checkouts outside the catalog. Browser clients were attempted without
  credentials; no connected voice sessions were attempted.
- New image URLs were checked for HTTP 200 and `image/png`. Eight use immutable
  GitHub commit URLs; the two Unity sources are image URLs linked by their READMEs.
- The new captures were visually reviewed; **catalog rendering and final
  owner approval remain pending**. The ten linked assets still need visual review.
  No image is claimed to depict a locally verified working voice session.

## Execution access

The initial inventory pass had no terminal or browser execution. On continuation,
shell access worked: Node v26.5.0, npm 11.17.0, agent-browser 0.38.2, and cached
Chromium were already installed. No agent-browser or Chromium install was needed.
The first three browser candidates were captured without credentials, followed by
a full-inventory source inspection and browser capture pass. Native tool discovery
found only Command Line Tools: `xcrun simctl` is unavailable, and Android SDK,
Flutter, .NET, Rust and Unity tools were not found. No large SDKs or simulators
were installed. Do not invent tokens, mock successful conversations, or alter
project UIs for captures.

The site already uses unoptimized Next images, which supports the new HTTPS
image URLs without adding remote-loader configuration. The new records have
`recommended: false`, so screenshot availability does not promote them into the
curated recommendation order. `thumbnailFit: "contain"` preserves portrait
and editor screenshots instead of cropping away their UI. Original image
records and their rendering defaults are unchanged.

## Fresh credential-free captures — 2026-10-27

| Recipe slug | Source revision | Captured state | Asset |
| --- | --- | --- | --- |
| agora-breath-companion | `66a781859b745f4ff9b9c19a81b47cf8020c5771` | Landing page, mood choices and breathing goals; no voice session | `public/recipes/agora-breath-companion.webp` |
| daily-mandir-ai | `0a541fbff286d8eee30cb071b4e913e914a7144e` | Initial Guruji landing page and selectors; no conversation | `public/recipes/daily-mandir-ai.webp` |
| nextjs-quickstart | `24374411cdd809701e2a39466f4f97d52e23f173` | Start Conversation screen; button not clicked | `public/recipes/nextjs-quickstart.webp` |

Each asset has a `.webp.json` provenance sidecar with repository, exact revision,
capture URL, dimensions, SHA-256 hashes, and capture limitations. All three have
`recommended: false` and `thumbnailFit: "contain"`; no existing entry was replaced.
Source checkouts and original PNG captures are under
`/private/var/folders/2x/qsnxntb95wxdznnm2fncfzxc0000gp/T/opencode/recipe-ui-captures/`.

Package scripts, Next/PostCSS configuration, environment examples, and credential
access points were inspected before execution. Dependencies were installed with
`npm install --ignore-scripts --package-lock=false --no-audit --no-fund` only in
the temporary checkouts. Servers used an allowlisted environment and checkout-local
HOME, no env files or provider keys, and loopback-only ports 4311–4313. No private
browser profile, microphone permission, mock API responses, or UI modifications
were used. Lossless WebP conversion used the source project's installed Sharp;
no resizing or cropping was applied. The native Next.js development indicator
remains visible. These are development landing-state captures, not production or
connected-session verification.

Breath Companion's visible images and fonts loaded successfully. Daily Mandir's
Guruji artwork loaded, but waiting for every external book cover timed out; some
below-viewport covers were still unloaded. Only its reviewed initial viewport was
captured. Its greeting is original static UI text, not an agent reply.
NextJS Quickstart's fonts loaded before the final capture. Owner approval and
in-catalog rendering checks remain pending.

## Full-inventory continuation — 2026-10-27

Added **49 more fresh credential-free UI captures** plus **one existing visionOS
demo GIF frame**. Source revisions, SHA-256 hashes, capture ports, dimensions,
and shared capture notes are saved in `public/recipes/captures-2026-10-27.json`.
Repository URLs are in each recipe's metadata and `content/showcase.json`.
Every new image remains non-recommended and uses `thumbnailFit: "contain"`.

All 86 remaining repositories were shallow/sparse-cloned into the same approved
temporary workspace. Of these, 57 had browser candidates: 54 rendered enough to
produce review captures; one had an unavailable npm package version and two had
an unresolved UI-kit module. Five review captures were withheld for blank scenes,
poor contrast, an error-only page, or a mismatched recipe label. This leaves
**8 browser blockers and 28 native/hardware/asset blockers**, detailed below.

Scripts and executable framework configuration were inspected before starting
frontends directly, without root setup scripts, backend installation, or live
agent actions. Matching dependency manifests shared temporary node_modules
installations. Dependency install scripts stayed disabled; legacy peer mode was
used after npm's workspace-protocol error, matching existing source npm config.
No package versions or source UIs were changed to make a capture succeed.

Real-Time Transcription and Web Spatial Audio contained tracked env files. Their
runtime copies omitted those files entirely; no embedded credentials were loaded
or copied into the catalog. Static demos also used a browser domain allowlist
that blocks Agora session connections. No form submission, microphone permission,
fabricated response, live room, private profile, or local private credentials were
used. Capture servers and named browser sessions were closed after each attempt.
Some examples have old dependencies; they were used only as temporary local
capture sources, not deployed or treated as production-safe applications.

Capture caveats are also visible in image alt text and demo notes:

- **Filler Words** shows disabled controls and a backend-settings error.
- **Push-to-Talk** shows its real Configuration Required screen, not a voice UI.
- **WatchWise** has empty movie rails without TMDB configuration.
- **Gemma Voice Coach**, **MatchCast**, **Webhooks**, and **Navigator** show their
  unconfigured, standby, empty-event, or disconnected initial states.
- **Athena** and **Trak** show their repository quickstarts, not an active browser
  extension or connected music player.
- **visionOS RTC Quickstart** uses the author's pinned GIF at 2 seconds, extracted
  with installed FFmpeg. It is not a newly run native app.
- Several repositories intentionally share identical starter screens. Each was
  independently launched; identical image hashes are not fabricated sessions.

The 36 unresolved entries are not silently covered with placeholders. Native
launches need the appropriate toolchain/device or an authentic author asset.
Browser blockers need source fixes or a configured backend; none were modified
or supplied fake credentials during image work.

## Existing assets linked in this batch

Exact source URLs and descriptive alt text are in `content/showcase.json`.

| Recipe slug | Source asset | Remaining work |
| --- | --- | --- |
| agora-flutter-rtc-quickstart | Repository `screenshot-1.png`, commit `ced9b58f` | Visual approval, local vendoring, optional WebP conversion |
| agora-ios-guide | Guide `0-end-goal.png`, commit `774be861` | Visual approval, local vendoring, optional WebP conversion |
| bhaasha-agora | `art/live-conversation.png`, commit `ecd923c5` | Visual approval, local vendoring, optional WebP conversion |
| csharp-rtc-quickstart | API example `snapshot.png`, commit `9b3e61e6` | Visual approval, local vendoring, optional WebP conversion |
| flutter-quickstart | `art/demo-screenshot-1.png`, commit `f094945d` | Visual approval, local vendoring, optional WebP conversion |
| pause-with-agora | README's active-session screenshot, commit `70571d05` | Visual approval, local vendoring, optional WebP conversion |
| pillion | `docs/screenshots/ride-dark.png`, commit `2bdac861` | Visual approval, local vendoring, optional WebP conversion |
| unity-virtual-camera-demos | README's SampleMinScene screenshot on GitHub user-images | Visual approval, local vendoring, optional WebP conversion |
| unity-virtual-camera-prefab | README's Unity editor scene-hierarchy image on Medium CDN | Visual approval as an **editor setup image**, not a running call; local vendoring |
| ios-live-shopping-reference-app | `media/ss_customer_storefront.png`, commit `b3475100` | Visual approval, local vendoring, optional WebP conversion |

An optional dependency-free helper is included:

```sh
node scripts/vendor-recipe-images.mjs
```

It downloads only these ten images, verifies PNG signatures, preserves existing
files, writes source/dimensions/SHA-256 sidecars, and switches their thumbnail
paths to local assets. **It has not been run in this session.** It does not
resize, crop, fabricate images, or claim visual approval. After running it,
update the statuses here; review images before deciding on any WebP conversion.

## Status key

- **Existing**: image entry predates this work; not re-approved in this batch.
- **Linked**: genuine existing PNG linked; visual review/local vendoring pending.
- **Captured**: credential-free local initial UI captured and visually reviewed;
  provenance saved; live session, catalog rendering, and owner approval unverified.
- **Source frame**: visually reviewed frame extracted from a pinned author demo;
  not a fresh local app session.
- **Browser blocked**: an actual install/render/quality blocker was observed;
  no acceptable image was added.
- **Toolchain blocked**: source inspected, but required native tooling is absent;
  native launch was not attempted.
- **Browser pending**: try credential-free local UI first; no launch attempted.
- **Native pending**: inspect local toolchains/simulators and attempt setup UI;
  live sessions may need credentials or physical devices.
- **Hardware pending**: physical hardware/device provisioning is part of the
  demonstrated experience; seek authentic author assets as an alternative.
- **Asset follow-up**: a particular source/access limitation is described.

Source repositories and exact recipe paths are always recorded in
`content/recipes/<slug>/recipe.json`. Provider notes below describe live features,
not a conclusion that the initial UI cannot run without keys.

## Complete per-recipe tracker

| Recipe slug | Status | Next action / known dependency |
| --- | --- | --- |
| ag-iot-ios-app | Toolchain blocked | Xcode/iOS simulator absent; paired IoT provisioning for a working session |
| agent-delegation | Captured | Repository initial Start Conversation screen; no delegation session |
| agent-handoff | Captured | Travel Concierge initial screen; no handoff session |
| agora-aigc-demo | Captured | Nested web client's settings UI; channel empty, no conversation |
| agora-arena | Existing | Preserve existing screenshot and provenance |
| agora-breath-companion | Captured | Credential-free landing page; local lossless WebP and revision sidecar; no voice session |
| agora-channel-management | Captured | Initial privilege and channel forms; no queries or mutations submitted |
| agora-drawguess | Existing | Preserve existing cover; do not claim a freshly captured game |
| agora-flutter-rtc-quickstart | Linked | Existing repository screenshot |
| agora-gemini-mllm-go | Captured | Web client model selector; Go backend and live session unverified |
| agora-gemini-mllm-nextjs | Captured | Initial Gemini model selector; no live session |
| agora-gemini-mllm-python | Captured | Web client model selector; Python backend and live session unverified |
| agora-gemma-voice-coach | Captured | Unconfigured dashboard; no Agora App ID or local model check |
| agora-humming-service-example | Toolchain blocked | Android SDK/emulator absent; AAR SDK/configuration for live features |
| agora-ios-guide | Linked | Existing guide screenshot |
| agora-matchcast | Captured | Local standby dashboard; no media stream or captions |
| agora-meeting-copilot | Existing | Preserve existing image |
| agora-podcasts | Existing | Preserve existing image |
| agora-python-rtc-quickstart | Toolchain blocked | Native RTC SDK and visual demo compatibility unresolved; no console screenshot substituted |
| agora-rn-rtc-quickstart | Toolchain blocked | Neither iOS simulator nor Android SDK available for React Native |
| agora-rotary-dial-phone | Existing | Preserve existing image |
| agora-rtc-signaling | Browser blocked | `56c2af4a`: npm ETARGET, `agora-rtm-sdk@2.2.0.1` unavailable; no version substitution |
| agora-spatial-voice-chat-tutorial | Toolchain blocked | Unity unavailable; authentic tutorial author capture remains an alternative |
| agora-stt | Captured | Empty initial transcription/translation UI; no media or transcription |
| agora-voice-web-navigator | Captured | Disconnected controller UI; no browser commands or voice session |
| aigc-service-example-rtc | Toolchain blocked | Android SDK/emulator absent; nested Android project requires SDK configuration |
| android-autopilot-voice-agent | Asset follow-up | README recording returned HTTP 403; Android + Python/tunnel for fresh connected capture |
| android-iot-video-calling-app | Toolchain blocked | Android SDK/emulator absent; paired device needed for working IoT video |
| android-quickstart | Toolchain blocked | Android SDK/emulator absent; backend/Agora needed for connected sessions |
| android-transcription-widget | Toolchain blocked | Android SDK/emulator absent; configured server needed for transcription |
| aria-coteacher | Captured | Credential-free landing page; no classroom created or joined |
| aria-voice-sales-agent | Existing | Preserve existing image |
| athena | Captured | Repository quickstart only; active extension not captured |
| babylonjs-rtc-demo | Browser blocked | `57692794`: initial controls rendered but no 3D scene; blank scene withheld |
| bhaasha-agora | Linked | Existing conversation screenshot |
| cloud-gaming-rtc-example | Asset follow-up | Nested Android README contains host/viewer images, but checked attachments returned 403 |
| content-filter | Captured | Recipe-specific initial screen; no filtering session |
| cross-session-memory | Captured | Initial Memory screen; optional name blank |
| csharp-rtc-quickstart | Linked | Existing API example screenshot |
| custom-llm | Captured | Initial Custom LLM screen; no custom endpoint connected |
| custom-modalities | Captured | Initial Custom LLM-TTS screen; no custom endpoint connected |
| daily-mandir-ai | Captured | Credential-free Guruji landing viewport; below-viewport book covers partly unloaded; no conversation |
| dynamic-instructions | Captured | Initial Instructions screen; no prompt update or session |
| dynamic-tools | Captured | Initial Smart Home screen; no devices or tool calls |
| echo-panel-voice-ai | Toolchain blocked | Android SDK/emulator absent; Python backend/OpenAI/Agora needed for live features |
| esp32-iot-callkit-demo | Hardware pending | ESP32-S3 board, mobile companion, and device/Agora provisioning |
| esp32-iot-device-demo | Hardware pending | ESP32-S3 Korvo hardware and mobile companion; source README has no UI screenshot |
| event-observability | Browser blocked | `8b588480`: source landing page says Translator Recipe; withheld to avoid mislabeling |
| filler-words | Captured | Disabled initial controls and backend-settings error; explicitly labeled unconfigured |
| flutter-call-subtitles | Toolchain blocked | Flutter and native simulators absent; source inspected, no native launch |
| flutter-quickstart | Linked | Existing Flutter conversation screenshot |
| gemini-agora-agentic-video-nextjs | Captured | Empty video upload/record UI; no media permission or analysis |
| gemini-agora-voice-agents-go | Captured | Web client voice selector; no Go backend or session verification |
| gemini-agora-voice-agents-nextjs | Captured | Initial voice selector; no session |
| gemini-agora-voice-agents-python | Captured | Web client voice selector; no Python backend or session verification |
| golang-quickstart | Captured | Web client initial screen; no Go backend or session verification |
| group-video-chat | Browser blocked | `614e08a4`: join form rendered with near-white text on white; withheld for legibility |
| hello-agora-vision | Asset follow-up | Checked README simulator image returned 404; no alternate image found in source tree |
| interruptions | Captured | Initial Interruptions recipe screen; behavior not tested |
| ios-iot-callkit-app | Toolchain blocked | Xcode/iOS simulator absent; IoT/CallKit provisioning needed for working calls |
| ios-live-shopping-reference-app | Linked | Existing customer storefront screenshot |
| ios-lyrics-view-rtc-media | Toolchain blocked | Xcode/iOS simulator absent; timing diagram is not an app screenshot |
| ios-transcription-widget | Toolchain blocked | Xcode/iOS simulator absent; actual transcripts require services |
| iot-callkit-device-demo | Hardware pending | Device build and activation/node credentials; author screenshot may be needed |
| jev-vad | Captured | Initial Jev VAD screen; no microphone or turn-detection session |
| kaun-katega-taarpati | Captured | Initial room screen; no game room created or joined |
| labspark-ai | Captured | Landing page; no account or tutor session |
| live-video-react-app | Existing | Preserve existing image |
| mcc-external-service-example | Toolchain blocked | Neither iOS simulator nor Android SDK available; MCC/SDK configuration also needed |
| mcp-tools | Captured | Initial MCP screen with agent mode choices; no tool calls |
| mediaio-camera | Toolchain blocked | Android SDK/emulator absent; no author UI screenshot identified |
| moodlens-voice-journal | Toolchain blocked | Android SDK/emulator absent; no author UI screenshot identified |
| muse-ai | Captured | Genuine locally rendered landing page; no studio or music session |
| nextjs-quickstart | Captured | Credential-free Start Conversation screen; local WebP and revision sidecar; no conversation |
| openai-gpt-live-go | Captured | Web client initial screen; no Go backend or session verification |
| openai-gpt-live-nextjs | Captured | Initial Start Conversation screen; no session |
| openai-gpt-live-python | Captured | Web client initial screen; no Python backend or session verification |
| pause-with-agora | Linked | Existing active-session extension screenshot |
| pillion | Linked | Existing Android ride screen |
| push-to-talk | Captured | Real Configuration Required screen; not a configured voice UI |
| python-quickstart | Captured | Web client initial screen; no Python backend or session verification |
| rag | Captured | Initial RAG screen; no retrieval or conversation |
| real-time-transcription-demo | Captured | Actual initial channel/name form; tracked env files omitted |
| realtime-translator | Captured | Initial Translator screen; no translation session |
| realtime-vision | Captured | Initial Realtime Vision screen; no camera or session |
| realtime-voice | Captured | Initial Realtime screen; no session |
| recipe-agent-langchain | Browser blocked | `bae3dfa1`: initial page fails parsing an Internal Server Error as JSON; backend required, error-only capture withheld |
| rn-quickstart | Toolchain blocked | React Native has no available iOS simulator or Android SDK |
| rtc-custom-camera | Toolchain blocked | iOS project requires missing Xcode/simulator; no author screenshot identified |
| rust-rtc-quickstart | Toolchain blocked | Rust/native SDK unavailable; terminal-oriented sample needs a truthful preview type |
| speaker-lock | Captured | Initial Speaker Lock screen; no microphone or session |
| swiftui-quickstart | Toolchain blocked | Xcode/iOS simulator absent; backend/device configuration also needed |
| thymia-biomarkers | Browser blocked | `873c5323`: documented avatar client with Thymia flag fails resolving `@agora/agent-ui-kit`; no generic substitute |
| tool-calling | Captured | Initial Tool Calling screen; no tool calls or session |
| trak-voice-ai | Captured | Repository voice quickstart only; not connected music playback |
| unity-spatial-audio-spaces | Asset follow-up | README's S3 player-field screenshot returns regional redirect, then 403 at canonical endpoint |
| unity-virtual-camera-demos | Linked | Existing sample scene screenshot |
| unity-virtual-camera-prefab | Linked | Existing Unity editor setup screenshot, explicitly labeled as such |
| vision | Captured | Initial Vision screen; no camera permission or session |
| visionos-rtc-quickstart | Source frame | Pinned author GIF at 2 seconds, reviewed; not a locally run native app |
| voice-rpg | Captured | Initial RPG Gaming screen; no adventure or session |
| watchwise-ai | Captured | Initial UI with empty TMDB rails; no key or conversation |
| web-spatial-audio-demo | Captured | Initial App ID setup dialog; tracked env files omitted, no session |
| webhooks | Captured | Initial UI and empty event panel; no live webhook flow |
| webxr-rtc-demo | Browser blocked | `b7ab8b7d`: broadcaster controls rendered but XR scene remained blank; withheld |
| wellness-coach | Browser blocked | `873c5323`: documented avatar client fails resolving `@agora/agent-ui-kit`; no generic substitute |
| worldcupvoice | Existing | Preserve existing image |

## Remaining capture procedure

Source revisions inspected for the 28 unresolved native/hardware/asset entries:

| Recipe slug | Inspected revision |
| --- | --- |
| ag-iot-ios-app | `137b56ec84fd2649948ae612b04e8a98346ab14a` |
| agora-humming-service-example | `403a530f55385811a9977ee4176d829a582af5a8` |
| agora-python-rtc-quickstart | `3eaedd9696af1e19d54e5246bfc10ca94db43543` |
| agora-rn-rtc-quickstart | `eb32bd7933cf6b5c9364e7367501497ac71c4f97` |
| agora-spatial-voice-chat-tutorial | `865170b24a6dfcaf583a10dd67e2775e8c3f32d6` |
| aigc-service-example-rtc | `c8c8606d765f704eacbaf4bec023454b6c54150f` |
| android-autopilot-voice-agent | `dfe98d8d10480ab859a86ffa8212460af3e72bc2` |
| android-iot-video-calling-app | `5af061c0354beab93e2f83fb7ad4a1fabed86bf8` |
| android-quickstart | `7bfb2c55e78769835a1369bbb6c4505ebfc98d13` |
| android-transcription-widget | `8da05c875c41427b2bfbbc96068b6d0f50900959` |
| cloud-gaming-rtc-example | `7fb7cd03d73b872a5696d2b5bc09bf9c8ac3128f` |
| echo-panel-voice-ai | `fc09c3074a4385fe81a77ae4ea3f3d2d73ce8609` |
| esp32-iot-callkit-demo | `efdbf2d2b8e2bbc426673dcde120bac49582ef3a` |
| esp32-iot-device-demo | `e309e6dcd0b3dc8ae4f35272c97aa853f308c6c8` |
| flutter-call-subtitles | `8947f14bcb53e10a12aa003f75cc70a923d18ff2` |
| hello-agora-vision | `ebab69574cf4b341c494ce040a7318244c6ef77a` |
| ios-iot-callkit-app | `129b4e021f3ecbe4a6ff7f27a2024581e6a2270a` |
| ios-lyrics-view-rtc-media | `61d7eb544cb3149cb93741d8abafe452b09223ae` |
| ios-transcription-widget | `2b7d69aff59eea7c37dc9ddadb8c1cee54f030bb` |
| iot-callkit-device-demo | `5e1058c6fc50c41aa8d536e57cd974bb51993836` |
| mcc-external-service-example | `3116c79e9217bc9b5ead81c1e4a70fac7ebceca0` |
| mediaio-camera | `5b1f36d58d001337053754433e126f55d5a27f7b` |
| moodlens-voice-journal | `33f7a19237a0155e75ecda84acdc0c0808560fa6` |
| rn-quickstart | `30c884681eb46e60bc63400dfac5dea7a47b03a4` |
| rtc-custom-camera | `f6293b0da6f8b3e3564afc586c720faead8956ad` |
| rust-rtc-quickstart | `0948e42f8a6ebbe2d698bf680bd2f96d4ee3c915` |
| swiftui-quickstart | `5c9bbc728a575b12d6e4fef53fe514008d25ec44` |
| unity-spatial-audio-spaces | `e9de7061c199cddbd2f5fd8c68ac98d89c0e1b10` |

1. With terminal access, inspect `xcrun simctl list devices available`, Android
   emulator/SDK availability, and installed runtimes. Do not install simulators
   or download large SDKs without a focused need.
2. Clone browser candidates outside this catalog into the approved temporary
   workspace. Inspect package scripts and environment examples before installing
   or starting untrusted project code. Never reuse private local credentials.
3. Try a documented credential-free landing/preview state. If the UI cannot start,
   record the actual error, required key/toolchain, and attempted revision.
4. Capture the real UI with no fabricated successful session, personal data, or
   visible secrets. Keep empty/setup states clearly described as such.
5. Review legibility and crop; retain original aspect ratios for phone/editor
   captures. Save local optimized assets with source URL/revision and capture
   notes, then update only the corresponding image metadata and this tracker.
6. Re-check attachment URLs in a browser before declaring an image permanently
   unavailable. HTTP failures above are observations from this session, not proof
   that a repository is private or deleted.

No commits or pushes were made. 52 fresh local initial UIs have now been captured
across the continuation batches. Native tool discovery was performed, but no
native simulator was available. No catalog build, lint, tests, security audit,
production build, or existing image-vendoring helper execution was run.
