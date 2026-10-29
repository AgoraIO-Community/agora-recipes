# Recipe image inventory

Updated: 2026-10-28. This inventory covers the **107 local catalog entries**,
not a separately verified production deployment.

## Progress

- **8 pre-existing image entries** in the original inventory; later replacements
  are recorded below, with original files preserved.
- **10 additional entries linked to genuine existing project PNGs**.
- **52 additional entries have fresh local UI screenshots** (3 first batch + 49
  full-inventory continuation).
- **1 additional entry uses a reviewed frame from its author's demo GIF**.
- **64 of 107 recipes currently display images; 43 have no active image**.
  The lower count is intentional: ten rejected error/setup screenshots have
  been unlisted rather than hidden, retouched or presented as successful calls.
- **40 of 66 voice-agent recipes have call/session/workspace imagery**:
  32 local call/watch captures, three author-video session frames, four retained
  author conversation images, and Muse's disconnected studio workspace.
  Nine more retain clean initial/project imagery, for **49 of 66 voice-agent
  recipes with any active image**. Neither count claims full recipe functionality.
- The clean-workaround pass added/replaced **13 clean local call captures and one
  author session frame**. The subsequent Gemini pass added three more clean calls,
  restoring one of the ten unlisted entries; nine of that batch remain unlisted.
  Original files remain preserved for provenance.
- All **86 previously remaining source repositories were inspected** via shallow
  sparse checkouts outside the catalog. The first passes were credential-free;
  the authorized call-page follow-up below uses user-supplied Agora configuration.
- New image URLs were checked for HTTP 200 and `image/png`. Eight use immutable
  GitHub commit URLs; the two Unity sources are image URLs linked by their READMEs.
- The new captures were visually reviewed; **catalog rendering and final
  owner approval remain pending**. The ten linked assets still need visual review.
  Call-page captures distinguish RTC connectivity from AI-agent/provider status;
  they do not claim that every recipe feature or provider is working.

## Gemini-key follow-up — latest pass

The user supplied Google/Gemini configuration and authorized another run. A
read-only model-list request returned HTTP 200. Three original cascading Gemini
ASR/LLM/TTS demos reached real call interfaces and received genuine agent greetings:

| Recipe | Linked clean capture |
| --- | --- |
| Gemini Voice Agents Next.js | `public/recipes/gemini-agora-voice-agents-nextjs-gemini-call.webp` |
| Gemini Voice Agents Python | `public/recipes/gemini-agora-voice-agents-python-gemini-call.webp` |
| Gemini Voice Agents Go | `public/recipes/gemini-agora-voice-agents-go-gemini-call.webp` |

All three returned HTTP 200 for token/config generation, agent start, and agent
stop. Each ran its own original source, backend and provider configuration:
Gemini 3.6 Flash LLM and Gemini 3.8 Flash TTS. Python used its declared
`agora-agents==2.11.0` dependency; Go used its declared module version and the
already verified portable toolchain. No UI or backend source changes were needed.
The accepted captures used a silent virtual microphone, collected no room audio,
and were visually reviewed for genuine greeting text and absence of failure
warnings or issue badges. No multi-turn ASR/reasoning test is claimed.

The three Gemini Live/MLLM variants also accepted and stopped sessions, but no
agent reply arrived before the deadline. A retry used an explicitly documented
OS-synthesized non-personal greeting after eight seconds of silence. It likewise
produced no agent reply. Those attempts were not accepted as new call images;
the Next.js Live thumbnail remains withheld, and the Go/Python entries retain
their clearly labeled initial model-selector images. Valid authentication and
HTTP 200 agent-start acceptance alone are not proof of a working live provider.

Agentic Video was tried through its normal upload/analyze flow with a generated
six-second test-pattern clip. Analysis did not finish within either retry deadline
(about 100 seconds, then 200 seconds), leaving the original call button disabled.
Framework HTTP 200 logs when a pending request closed were not treated as usable
analysis. No response, timestamped moments or call state was invented. Its clean
initial image remains, with an updated limitation note. Provider-side cleanup of
the two synthetic video upload attempts could not be confirmed: neither listed
file matched the exact generated-content hash and capture-time criteria, so no
unverified or unrelated provider file was deleted. No personal media was uploaded.

New hashes, pinned source revisions, dimensions, statuses and rejected attempts
are recorded in `public/recipes/gemini-clean-call-captures-2026-10-28.json`. Earlier
Google-key-missing notes below are historical; the unresolved Live issue is now
silence/no verified response, not a claim that no key was supplied.

Credentials were held only in owner-readable temporary storage and server
environments, then removed after a read-only secret/link/hash check. All voice
sessions from this pass were stopped and capture browsers/servers closed. The
images-first catalog ordering is preserved. No catalog build, tests, lint, commit
or push was run; original Go backends were compiled only to execute the demos.

## Clean screenshots and working setup workarounds — preceding pass

The user **withdrew permission to show error screenshots** and requested real
setup workarounds. This section supersedes the earlier same-day inventories and
their accepted-failure-state policy. No visible warning was hidden, removed with
CSS, retouched, or avoided by capturing before a known delayed error.

### Successfully captured and linked

| Recipe | Real workaround and observed result |
| --- | --- |
| Event Observability | Used its documented Agora-managed provider mode instead of an optional OpenAI key without the SDK-required base URL. Genuine greeting and populated state/metric/turn timeline; HTTP 200 start/stop |
| Custom LLM | Ran the original bundled demo LLM and made its exact endpoint reachable; real call and greeting |
| Agent Handoff | Ran the original bundled concierge demo endpoint; real call and concierge greeting, not a fabricated persona switch |
| Content Filtering | Ran the original bundled deterministic filter-demo endpoint; real call and greeting, no filtering test staged |
| Custom Modalities | Ran the original audio-demo endpoint; actual response retains the source's own mock-audio wording |
| Dynamic Tools | Ran the original bundled smart-home service; real call and greeting, no physical device or tool mutation |
| Interruptions | Ran the original bundled demo endpoint; genuine greeting, no staged barge-in |
| RAG | Ran the original bundled knowledge-base demo endpoint; genuine greeting, no retrieval question staged |
| Tool Calling | Ran the original bundled tool-demo endpoint; genuine greeting, no note or other tool mutation |
| MCP Tools | Ran the original bundled MCP service; real call and successful MCP discovery, empty transcript retained |
| Voice RPG | Ran the original bundled game MCP service; genuine Dungeon Master greeting, no staged character/adventure/dice results |
| LangChain | Configured its original public chat endpoint; fixed SDK constructor/session argument compatibility and retained the agent ID for End-call cleanup in its temporary checkout. Genuine greeting and successful stop; original minimal styling, no error badge |
| Golang Quickstart | Downloaded and SHA-256-verified a portable official Go toolchain; compiled and ran the original real Go backend, not its fake-server. Genuine greeting and successful stop |
| MatchCast | Replaced the failed local watch image with a clean frame at 16s from this project's own author recording. Labeled recorded, not locally reproduced |

The custom services above are **the recipes' own documented bundled demo
implementations**, not newly invented mocks or substituted provider backends.
They demonstrate real RTC/agent setup without claiming production-model reasoning
or that every advertised tool/feature was exercised. Existing projects sharing a
quickstart were still launched separately and photographed separately.

Public reachability used an ephemeral Cloudflare tunnel to a path-restricted
proxy. Only the exact LLM/audio/MCP paths were exposed behind an unpredictable
route; Agora token and lifecycle endpoints were not exposed. The proxy forwarded
the original responses unchanged. No system tunnel client or Go SDK was installed:
both tools lived in the temporary capture directory and matched official archive
SHA-256 hashes. All tunnel/proxy/server/browser processes from this pass stopped.

All **13 accepted local captures** have successful agent-start and agent-stop
responses. Captures were visually reviewed, including rejection of a LangChain
candidate with a Next.js issue badge before fixing its underlying SDK errors.
The silent virtual microphone collected no personal room audio. New images are
`public/recipes/<slug>-clean-call.webp`, with MatchCast named
`public/recipes/agora-matchcast-author-clean.webp`.

Pinned revisions, file hashes, tool hashes, compatibility-fix descriptions,
capture dimensions and the recorded-video timestamp are in
`public/recipes/clean-call-workarounds-2026-10-28.json`.

### Provider failure diagnosed, not cosmetically concealed

The supplied OpenAI key successfully listed models, so earlier engine error 301
was not sufficient evidence of an invalid key. A transparent authenticated
WebSocket relay to the original GPT Live endpoint revealed the actual provider
response: **`credit_balance_exhausted`**. Delegated Reasoning and both GPT Live
clients reproduced that response; each accepted Agora session was stopped.
Changing models or relaying the connection cannot legitimately bypass billing.
Realtime Voice/Vision also remained failing after retrying an available realtime
model, so those captures were rejected rather than accepted while still loading.

The shared `Conversation-Ai-Client.gif` in four repositories had identical hashes
and was rejected as generic media, not reused as evidence of four working demos.
LangChain's captured greeting verifies session startup, not a funded downstream
OpenAI note/tool conversation. It still needs a funded provider for that behavior.

### Unlisted until an honest clean replacement exists

These ten recipe entries now have **no active thumbnail**, rather than showing
their previous configuration, connection-error or Not Joined screenshot:

- Delegated Reasoning; OpenAI GPT Live Next.js and Python: provider credits needed.
- Realtime Voice and Realtime Vision: provider startup still failing; no successful
  workaround is claimed.
- Next.js Gemini Voice Agents and Gemini MLLM: valid Google configuration needed;
  a different provider was not substituted under the Gemini recipe name.
- Gemma Voice Coach: a running local model and reachable proxy are still needed.
- Push-to-Talk: valid provider/TTS setup still needed.
- Voice Web Navigator: original voice/browser backend still needs configuration;
  its earlier controller connection-error image is no longer displayed.

Native SDK/simulator requirements, missing third-party services and unresolved
client dependencies remain blockers for the other unfilled entries. Portable Go
is now available for future runs; previous statements that Go itself is missing
are historical. Existing author assets and clean initial/project images remain
where appropriate, but are not counted as newly verified calls.

The combined private credential file was removed after a read-only secret check
of changed catalog files. All 14 new links matched their recorded image hashes,
and all ten rejected paths were confirmed absent from active metadata. No catalog
production build, tests, lint, commit or push was run. The Go backend was compiled
only because running that original demo required it. The earlier Meeting Copilot
remote-cleanup exception remains separately documented and is not claimed fixed.
The existing local catalog was also opened in a separate browser session: the
Event Observability search result loaded the new clean image successfully and
was visually checked. This is a representative rendering check, not approval of
every catalog card. The user-owned catalog server was left running and untouched.

## Previous voice-agent pass — historical, before clean-only requirement

Scope is the **66** immediate recipe directories whose metadata contains the
`voice-ai` tag. The new pass adds **18 local call/workspace captures** and replaces
two cover images with genuine in-session frames from their own existing author
videos. Event Observability and LangChain gain their first catalog images,
increasing total image coverage from 71 to 73. No recommendation flags changed.

Provenance: `public/recipes/voice-catalog-call-captures-2026-10-28.json` records
source revisions, full-frame dimensions, hashes, real HTTP outcomes and the two
video timestamps. Every local capture belongs to that project; shared appearance
in several recipes comes from their original common quickstart, not image reuse.
No source UI, React state, API response or transcript was modified to force a call.

The capture browser used a silent virtual microphone. The two camera-enabled
recipes display Chromium's unmistakably synthetic test pattern, not a personal
camera or proof of image understanding. Source overflow, minimal styling, empty
transcripts, HTTP failures and engine error 301 remain visible. A real greeting
does not verify memory recall, instruction updates, translation, speaker isolation,
webhook delivery, tool use, or music control.

**Cleanup exception — action needed:** Meeting Copilot accepted an AI invitation
in capture room `meet-abde251379`. The participant-leave request returned HTTP
202, but remote agent shutdown was not confirmed before the original temporary
backend stopped. Recovery via the SDK's room-filtered agent list returned HTTP
401 (`Invalid authentication type`); App Certificate auth cannot perform that
list operation. **Check Agora Console and stop any remaining agent for that exact
capture room.** No unrelated agent was stopped, and this is not represented as
successful cleanup. Its thumbnail shows the real room and invited Copilot tile,
not proof of a successful GPT Live response. Captions remained off.

The other **15 accepted agent starts** in this batch each have a corresponding
HTTP 200 stop response. Event Observability and LangChain agent starts failed
(HTTP 400/500) and produced no confirmed agent session. Temporary browser and
server processes were closed; the private credential file was removed. A
read-only check found no supplied credential values in changed catalog files or
other top-level temporary logs/records, and all 20 new image links/hashes matched.
No tests, lint, production builds, commits or pushes were run.

### Complete 66-project checklist

**Local call** means an original call/watch interface, not necessarily a working
provider conversation. **Author session** is existing public project imagery,
not a new local reproduction. **Blocked** distinguishes source/config/tooling
barriers from the projects actually launched; it does not claim every blocked
native app or service was executed.

| Recipe slug | Image status / remaining blocker |
| --- | --- |
| agent-delegation | Local call, prior OpenAI pass; no greeting, engine error 301 |
| agent-handoff | Blocked: original agent construction requires a public custom-LLM endpoint; no replacement endpoint invented |
| agora-breath-companion | New local guided-session call and greeting |
| agora-gemini-mllm-go | Blocked: Go runtime and Google key unavailable |
| agora-gemini-mllm-nextjs | Local call, prior pass; genuine missing-provider warning |
| agora-gemini-mllm-python | Blocked: original backend requires Google configuration |
| agora-gemma-voice-coach | Blocked: original dashboard launched, but local Gemma/LM Studio and public model proxy are unavailable; setup image retained |
| agora-matchcast | Local watch UI, prior pass; genuine backend failure |
| agora-meeting-copilot | New local meeting/Copilot invite UI; no response verified; remote cleanup exception above |
| agora-podcasts | New author-session frame at 52s; local generation still requires Gemini credentials |
| agora-rotary-dial-phone | Blocked: original call requires Fish Audio credentials; phone setup image retained |
| agora-voice-web-navigator | Blocked: original controller backend/provider/browser-automation setup unavailable; disconnected controller retained |
| android-autopilot-voice-agent | Blocked: Android SDK/emulator unavailable |
| android-quickstart | Blocked: Android SDK/emulator unavailable |
| aria-coteacher | Blocked: real Supabase classroom/session configuration unavailable |
| aria-voice-sales-agent | Existing author live-call screenshot retained |
| athena | Local quickstart call, prior pass; extension highlighting unverified |
| bhaasha-agora | Existing author live-conversation image retained |
| content-filter | Blocked: original backend requires a public custom-LLM endpoint |
| cross-session-memory | New local call and greeting; recall not exercised |
| custom-llm | Blocked: original backend requires a public custom-LLM endpoint |
| custom-modalities | Blocked: original backend requires a public audio-model endpoint |
| daily-mandir-ai | New local Bhagavad Gita call and genuine greeting; Sarvam mode untested |
| dynamic-instructions | New local call and greeting; instruction changes untested |
| dynamic-tools | Blocked: original smart-home custom-LLM endpoint unavailable |
| echo-panel-voice-ai | Blocked: Android SDK/emulator unavailable |
| event-observability | New local call UI; genuine HTTP 400 agent failure and empty event timeline |
| filler-words | New local call; start/stop accepted, transcript empty; filler behavior unverified |
| flutter-quickstart | Existing author conversation image retained; Flutter tooling unavailable locally |
| gemini-agora-agentic-video-nextjs | Blocked: Google key and actual analyzed clip required before original call control enables |
| gemini-agora-voice-agents-go | Blocked: Go runtime and Google key unavailable |
| gemini-agora-voice-agents-nextjs | Local call, prior pass; genuine missing-provider warning |
| gemini-agora-voice-agents-python | Blocked: Google configuration required by original backend |
| golang-quickstart | Blocked: Go runtime unavailable; no alternate backend substituted |
| interruptions | Blocked: original backend requires a public custom-LLM endpoint |
| jev-vad | Local call, prior pass; TypeSafe judgments unverified |
| kaun-katega-taarpati | Blocked: original public game backend, Sarvam and REST/provider configuration unavailable; no staged players/game |
| labspark-ai | Blocked: original tutor requires Gemini and backend/account setup; landing image retained |
| mcp-tools | Blocked: original agent construction requires a real public MCP endpoint |
| moodlens-voice-journal | Blocked: Android SDK/emulator unavailable |
| muse-ai | Prior disconnected studio/conversation workspace retained; not a live call |
| nextjs-quickstart | New local call and genuine greeting |
| openai-gpt-live-go | Blocked: Go runtime unavailable despite authorized OpenAI configuration |
| openai-gpt-live-nextjs | Local call, prior OpenAI pass; no greeting verified |
| openai-gpt-live-python | Local call, prior OpenAI pass; no greeting verified |
| pause-with-agora | Existing author active-session image retained |
| pillion | Existing author ride screen retained, not counted as an in-call image; Android tooling unavailable |
| push-to-talk | Blocked: original setup requires a configured TTS provider/voice in addition to Agora and LLM configuration |
| python-quickstart | New original Python backend call and genuine greeting |
| rag | Blocked: original knowledge-base custom-LLM endpoint unavailable |
| realtime-translator | New local call and greeting; translated user speech not exercised |
| realtime-vision | New local OpenAI-configured call, synthetic camera pattern and empty transcript; provider response unverified |
| realtime-voice | New local OpenAI-configured call; engine error 301, no greeting |
| recipe-agent-langchain | New original minimal call page; connected transport, agent-start HTTP 500, no tools demonstrated |
| rn-quickstart | Blocked: required native simulator/SDK unavailable |
| speaker-lock | New local call and greeting; speaker isolation untested |
| swiftui-quickstart | Blocked: Xcode simulator unavailable |
| thymia-biomarkers | Blocked: original client dependency resolution for `@agora/agent-ui-kit` failed; service configuration also required |
| tool-calling | Blocked: original public custom-LLM endpoint unavailable |
| trak-voice-ai | New original web-quickstart call and greeting; Electron/music integration untested |
| vision | New local call and greeting with synthetic camera pattern; image understanding untested |
| voice-rpg | Blocked: original agent requires a real public MCP endpoint; no adventure fabricated |
| watchwise-ai | New local voice drawer and greeting; missing TMDB key leaves catalog empty |
| webhooks | New local call and greeting; notification endpoint unconfigured, event panel empty |
| wellness-coach | Blocked: original client dependency resolution for `@agora/agent-ui-kit` failed; service configuration also required |
| worldcupvoice | New author-session frame at 16s; local live ingest/commentator backend not reproduced |

The 33 remaining entries keep their prior image or no-image state. They are not
silently filled with screenshots from other projects. Existing author screenshots
and old landing assets remain available under their original filenames.

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

## In-call screenshot follow-up — 2026-10-27

The requested improvement is **conversation/call experience images rather than
landing screens**. This is separate from image coverage: 71 recipes still have
image entries and 36 remain without one. Existing landing images stay in place
unless a better genuine capture is available.

Reviewed the source flows of all **47 voice-ai-tagged recipes with images from
the local capture batches**. The original temporary source checkouts were no
longer present, so fresh shallow/sparse checkouts were made under
`/private/var/folders/2x/qsnxntb95wxdznnm2fncfzxc0000gp/T/opencode/recipe-call-captures/`.
No committed catalog assets were deleted or overwritten.

### Replacement captured

- **Muse AI**: opened the unmodified app and clicked **Launch Studio**, exposing
  its recording workspace and producer conversation panel without starting a
  call. The catalog now uses `public/recipes/muse-ai-studio.webp`, with revision,
  hash, navigation, and state notes in its `.webp.json` sidecar. The old
  `muse-ai.webp` landing image is preserved.
- This is **disconnected studio UI, not a live in-call screenshot**. Its welcome
  message, example song, lyrics and instrument defaults are supplied by the
  original source. Demo Mode, Voice, recording, camera, playback, typed prompts
  and message submission were not used. No transcript or connection was faked.

### Why the other landing images cannot simply be clicked through

**40 source flows gate the real conversation component behind session setup**:

- Root/quickstart clients: `agent-delegation`, `agora-breath-companion`,
  `agora-gemini-mllm-nextjs`, `agora-gemma-voice-coach`, `athena`,
  `daily-mandir-ai`, `gemini-agora-agentic-video-nextjs`,
  `gemini-agora-voice-agents-nextjs`, `nextjs-quickstart`,
  `openai-gpt-live-nextjs`, `trak-voice-ai`, and `watchwise-ai`.
- Web/client projects: `agent-handoff`, `agora-gemini-mllm-go`,
  `agora-gemini-mllm-python`, `content-filter`, `cross-session-memory`,
  `custom-llm`, `custom-modalities`, `dynamic-instructions`, `dynamic-tools`,
  `filler-words`, `gemini-agora-voice-agents-go`,
  `gemini-agora-voice-agents-python`, `golang-quickstart`, `interruptions`,
  `jev-vad`, `mcp-tools`, `openai-gpt-live-go`, `openai-gpt-live-python`,
  `python-quickstart`, `rag`, `realtime-translator`, `realtime-vision`,
  `realtime-voice`, `speaker-lock`, `tool-calling`, `vision`, `voice-rpg`,
  and `webhooks`.

These sources obtain real token/config data, invite an agent and perform RTM
login before mounting the conversation UI. Some tolerate an agent-invite failure,
but they still need a real authenticated browser session. For example:

| Source | Gate |
| --- | --- |
| NextJS Quickstart `components/LandingPage.tsx` | Token fetch at line 80, RTM login at 123, conversation enabled at 133, gated render at 227 |
| Agent Handoff `web/src/components/LandingPage.tsx` | `getConfig` at 108, RTM login at 124, conversation enabled at 140, gated render at 213 |
| Breath Companion session component | Token fetch at 83, RTM login at 121, conversation enabled at 129; `/session` alone is still pre-call |
| Daily Mandir `components/LandingPage.tsx` | Token fetch at 346, RTM login at 396, session data set at 403 |
| WatchWise `components/LandingPage.tsx` | Token fetch at 561, RTM login at 597; drawer without session data renders only its setup card at 996 |

Source revisions match the existing capture provenance records. Detailed
file/line review results are retained in the temporary
`voice-call-source-review.json`. No React state forcing, token fabrication,
mocked API responses, or direct artificial mounting of a call component was used.

The six other specialized flows were also inspected:

| Recipe | Remaining requirement or limitation |
| --- | --- |
| Aria Co-Teacher | Real classroom participant/session records in Supabase, then configured Agora meeting/agent services; a made-up room URL is not a real call |
| LabSpark AI | Real voice path needs Firebase authentication and its configured backend relay/providers; the public voice preview uses scripted replies and fixed metrics, so it was not activated as a live-call substitute |
| Push-to-Talk | Original component returns Configuration Required before rendering the usable voice screen when environment setup is missing |
| Kaun Katega Taarpati | A local room can exist without credentials, but a lobby is not a working voice game; connected gameplay needs configured providers and players |
| Agora MatchCast | Standby dashboard is already captured; populated media/transcript state needs an actual configured stream/session |
| Agora Voice Web Navigator | Disconnected controller is already captured; a real controlled-browser/voice session needs its backend and provider configuration |

**No genuine connected in-call screenshots were captured in this follow-up.**
To replace the authenticated clients' thumbnails, configure approved demo
credentials locally and explicitly authorize starting provider sessions (which
may incur charges). Use a dedicated demo account and non-personal test content;
never paste secrets into chat or expose them in screenshots. Authentic author
in-call recordings/screenshots are an alternative when available and clearly
attributed. Existing in-call author assets were not downgraded.

Only Muse's temporary dependencies were installed for the new capture. No private
env files, saved profile, microphone or camera permission was used. No tests,
lint, builds, commits or pushes were run.

## Requested demo Start/Join attempts — 2026-10-28

The user clarified the exact **18 recipe cards** below and requested starting the
apps normally rather than substituting landing screenshots or discussing source
gates alone. Their original browser UIs were launched locally and their normal
controls were exercised wherever enabled. No additional Muse changes were made.

**Result: no usable connected in-call image was obtained.** The existing catalog
thumbnails were retained; error screens were not promoted into recipe previews.

| Requested recipes | Observed result after normal interaction |
| --- | --- |
| Delegated Reasoning; Gemini Agora Voice Agents for Next.js; Gemini MLLM Voice Agent for Next.js; OpenAI GPT Live with Next.js; Athena | Clicked Start Conversation. Each displayed `Failed to start conversation. Please try again.` Their local `/api/generate-agora-token` endpoint returned HTTP 500. Token routes require real Agora App ID/certificate configuration. |
| Jev VAD; Gemini Agora Voice Agents for Go and Python; Gemini MLLM Voice Agent for Go and Python; OpenAI GPT Live with Go and Python | Clicked Start Conversation. Each displayed `Failed to start conversation. Please try again.` The frontend requested `/api/get_config`, which returned HTTP 404 because its backend/proxy configuration was not running/configured. These were frontend launches, not fully configured backend sessions. |
| Aria Co-Teacher | Opened Create Classroom, entered non-personal demo lesson details, and submitted Create Class. The original UI displayed `NEXT_PUBLIC_SUPABASE_URL is required`; `/api/session/create` returned HTTP 500. No classroom was created. |
| Gemini Agora Agentic Video for Next.js | Opened the original video/voice UI. Talk to this video is disabled until an actual clip is analyzed. The source includes no bundled video sample; no personal video, camera recording, fabricated analysis or fake clip was supplied. |
| Agora MatchCast | Clicked Watch Live and waited for joining to settle. The UI displayed `Agora credentials are not set` and Try Again; token generation returned HTTP 500. No live feed or captions appeared. |
| Babylon.js RTC Demo | Launched its original HTML/JS app. The canvas remained blank and microphone/camera/call controls were disabled; no usable scene or call could be captured. |
| EchoPanel Voice AI; Android AutoPilot Voice Action Agent | Native launch remained blocked: Android SDK/emulator unavailable. No native app or simulated call was fabricated. |

There were **16 browser launches**, with **14 Start/Watch/Create flows exercised**;
the Agentic Video and Babylon controls were disabled. The two Android apps were
not launched. This distinguishes actual browser interaction from source-only
review, and distinguishes an unconfigured backend from an app defect.

Temporary source/dependency installs, before/after accessibility snapshots,
after-action PNGs, and server logs are retained under the approved
`recipe-call-captures` workspace described above. Results are in
`requested-demo-start-results.json`; screenshot names end in `-after-start.png`.
These are diagnostic failure/setup captures, not successful-call evidence.

All servers were loopback-only and used a clean, credential-free environment.
Dependency installation scripts were disabled; source UIs, package versions,
React state and API responses were not altered. No private credentials or saved
profile were reused. No microphone/camera permission, fabricated transcript,
tests, lint, production builds, commits or pushes were used. Named browser
sessions and capture servers were closed after each attempt.

## Authorized Agora call-page replacements — 2026-10-28

The user supplied Agora configuration and explicitly requested **the actual call
page even when the project or agent is not working**. Seven targeted thumbnails
were replaced with real call/watch-page images. The old landing assets were
preserved. No source UI, React state, API response, transcript or token was faked.

Pinned source revisions, dimensions, SHA-256 hashes and observed session states
are in `public/recipes/call-captures-2026-10-28.json`. The new files are named
`public/recipes/<slug>-call.webp`; image notes and alt text identify degraded
states instead of claiming successful provider conversations.

| Recipe | Captured state |
| --- | --- |
| Delegated Reasoning | Real RTC call interface, transcript rail and microphone controls; original agent-invite failure warning because the OpenAI key is missing |
| Gemini Agora Voice Agents for Next.js | Real RTC call interface; original Gemini agent-not-joined warning and empty transcript, Google key missing |
| Gemini MLLM Voice Agent for Next.js | Real RTC call interface; original Gemini agent-not-joined warning and empty transcript, Google key missing |
| OpenAI GPT Live with Next.js | Real RTC call interface; original agent-not-joined warning and empty transcript, OpenAI key missing |
| Athena | Real repository quickstart call, agent greeting and visualizer; not the extension's highlighting workflow |
| Jev VAD | Real call with the VAD panel, controls and empty transcript; managed agent start succeeded, but TypeSafe judgments were not exercised |
| Agora MatchCast | Watch interface after real token generation and Watch Live; separate backend request failed with HTTP 502 and the UI retained its fetch-failed message |

The official Next.js quickstart was also run as an environment baseline, using
its original dev script. Its real call UI showed RTC connected, an actual agent
greeting and pipeline timing. That diagnostic baseline image was not copied
across unrelated recipes or substituted for their own interfaces. `pnpm dev`
stopped on ignored optional dependency build scripts; those scripts remained
unapproved, and the unchanged repository dev script was started with `npm run dev`.

The original Jev Python backend was installed in a temporary virtual environment
from its declared requirements and started locally; its frontend used the
documented backend URL setting. No backend implementation or provider config
was substituted. The four missing-provider call pages returned successful token
generation but failed agent invitation, while the browser still joined RTC.
Athena and Jev both returned HTTP 200 for agent start and subsequent stop.

The capture browser used **a silent virtual microphone**, not personal room
audio. Screenshots contain only the apps' genuine state and actual agent output;
no typed messages, staged conversation, fabricated participant, or mock API
response was supplied. All seven images were visually reviewed and converted
losslessly to WebP without crop/resize. Recommendation flags remain unchanged.

The other **11 specifically requested recipes remain on their prior image/status**:

- The Go/Python Gemini, Gemini MLLM and OpenAI variants (6): their backend startup
  or agent construction still requires the missing provider key; Go is also not
  available on PATH. No fake provider key or alternate recipe backend was used
  to force a call screen.
- Aria Co-Teacher: Supabase URL/keys/schema are still missing, so no legitimate
  classroom/participant records exist for its call page.
- Agentic Video: the original call control remains disabled without a real
  analyzed clip and Google configuration.
- EchoPanel and Android AutoPilot (2): Android SDK/emulator remains unavailable.
- Babylon.js RTC Demo: original scene still does not render; its source also has
  an empty App ID and a token-generation TODO. No new token server or UI rewrite
  was invented for the screenshot task.

Credentials were held only in owner-readable temporary configuration outside the
catalog and injected into temporary server processes. They were not added to
project metadata, screenshots, provenance, source files, commits or pushes. The
exposed App Certificate should be rotated. Capture processes and named browser
sessions were closed. The temporary credential JSON and quickstart `.env.local`
were removed after confirming supplied credential values were absent from changed
catalog files and the seven image links/hashes matched their provenance.
No tests, lint, production builds or standalone security audits were run.

## OpenAI-configured call-page follow-up — 2026-10-28

The user authorized an OpenAI key for the requested demos. It was combined with
the previously authorized Agora configuration only inside temporary server
processes; no values were placed in catalog source, metadata or screenshots.

Three original apps were run and captured through their normal Start Conversation
flow:

| Recipe | New asset | Observed result |
| --- | --- | --- |
| Delegated Reasoning | `public/recipes/agent-delegation-openai-call.webp` | RTC connected and agent-start HTTP 200, but the actual call UI reported engine error 301, showed Not Joined and received no greeting before capture |
| OpenAI GPT Live with Next.js | `public/recipes/openai-gpt-live-nextjs-openai-call.webp` | RTC connected and agent-start HTTP 200; original call UI showed Not Joined and an empty transcript, without an agent greeting before capture |
| OpenAI GPT Live with Python | `public/recipes/openai-gpt-live-python-openai-call.webp` | Original Python backend returned successful config/start requests; RTC connected, but original UI showed Not Joined and an empty transcript, without a greeting before capture |

These are actual call-page screenshots, **not verified working GPT Live or
delegated-reasoning conversations**. Agora accepting a start request does not
prove the downstream provider/model is functioning. Error 301 was observed but
its cause was not diagnosed; no claim is made that the supplied key was invalid
or that any specific model permission caused it.

The earlier missing-OpenAI-key notes are historical and superseded for these
three entries. Each new run returned HTTP 200 for its subsequent agent stop.
The Python backend used its declared SDK pin (`agora-agents==2.8.1`), a temporary
virtual environment and the frontend's original backend URL setting. No fake key,
alternate backend, modified source model, forced React state or mock response was
used. A silent virtual microphone supplied no personal or staged user speech.

All three PNGs were visually reviewed and converted losslessly without cropping
or resizing. The original error indicators and empty transcript states remain;
Delegated Reasoning's source diagnostics popup is partially outside the viewport,
and no CSS fix or retouching was used to disguise that source behavior.
Source revisions, hashes, dimensions and observed statuses are saved in
`public/recipes/openai-call-captures-2026-10-28.json`. Earlier landing and
Agora-only call images are preserved under their prior filenames.

This refreshes two existing call images and replaces the Python landing image,
bringing the explicitly requested set to **8 of 18 call/watch-page images**.
Overall catalog image coverage remains **71 of 107**. The **10 remaining targeted
recipes** are:

- OpenAI GPT Live Go: OpenAI configuration is now supplied, but Go is not installed;
  Docker/Podman are also unavailable. No system runtime was silently installed.
- Gemini Voice Agents Go/Python and Gemini MLLM Go/Python (4): Google key still
  missing; Go tooling is also missing for the Go variants.
- Aria Co-Teacher: real Supabase classroom/session configuration still missing.
- Agentic Video: Google configuration and an actual analyzed clip still needed.
- EchoPanel and Android AutoPilot (2): Android SDK/emulator unavailable.
- Babylon.js RTC: original scene rendering/token integration still unresolved.

The capture servers and browser sessions were closed, all three agent stops
succeeded, and the temporary combined credential file was removed after a
read-only check for supplied values in changed project files. No tests, lint,
production builds, commits or pushes were run. Keys exposed in chat should be
rotated and future credentials kept in a local private environment file.

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
- **Call page**: original call/watch UI reached with authorized Agora configuration;
  transport connectivity and agent/provider failures are described separately.
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
| agent-delegation | Call page | OpenAI-configured RTC call UI; start accepted but engine error 301 and no greeting; delegation unverified |
| agent-handoff | Captured | Travel Concierge initial screen; no handoff session |
| agora-aigc-demo | Captured | Nested web client's settings UI; channel empty, no conversation |
| agora-arena | Existing | Preserve existing screenshot and provenance |
| agora-breath-companion | Captured | Credential-free landing page; local lossless WebP and revision sidecar; no voice session |
| agora-channel-management | Captured | Initial privilege and channel forms; no queries or mutations submitted |
| agora-drawguess | Existing | Preserve existing cover; do not claim a freshly captured game |
| agora-flutter-rtc-quickstart | Linked | Existing repository screenshot |
| agora-gemini-mllm-go | Captured | Web client model selector; Go backend and live session unverified |
| agora-gemini-mllm-nextjs | Call page | Real RTC UI with original agent failure warning; Google key missing |
| agora-gemini-mllm-python | Captured | Web client model selector; Python backend and live session unverified |
| agora-gemma-voice-coach | Captured | Unconfigured dashboard; no Agora App ID or local model check |
| agora-humming-service-example | Toolchain blocked | Android SDK/emulator absent; AAR SDK/configuration for live features |
| agora-ios-guide | Linked | Existing guide screenshot |
| agora-matchcast | Call page | Watch interface after authenticated attempt; separate backend fetch failed, no feed/captions |
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
| athena | Call page | Real quickstart call and agent greeting; extension highlighting workflow unverified |
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
| gemini-agora-voice-agents-nextjs | Call page | Real RTC UI with original agent failure warning; Google key missing |
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
| jev-vad | Call page | Real RTC call with VAD panel; managed agent started/stopped; TypeSafe judgments unverified |
| kaun-katega-taarpati | Captured | Initial room screen; no game room created or joined |
| labspark-ai | Captured | Landing page; no account or tutor session |
| live-video-react-app | Existing | Preserve existing image |
| mcc-external-service-example | Toolchain blocked | Neither iOS simulator nor Android SDK available; MCC/SDK configuration also needed |
| mcp-tools | Captured | Initial MCP screen with agent mode choices; no tool calls |
| mediaio-camera | Toolchain blocked | Android SDK/emulator absent; no author UI screenshot identified |
| moodlens-voice-journal | Toolchain blocked | Android SDK/emulator absent; no author UI screenshot identified |
| muse-ai | Captured | Studio workspace and producer conversation panel; disconnected, original welcome text, not a live call; landing asset preserved |
| nextjs-quickstart | Captured | Credential-free Start Conversation screen; local WebP and revision sidecar; no conversation |
| openai-gpt-live-go | Captured | Web client initial screen; no Go backend or session verification |
| openai-gpt-live-nextjs | Call page | OpenAI-configured RTC call UI; start accepted but no greeting, Not Joined at capture |
| openai-gpt-live-python | Call page | Original Python backend and RTC call running; start accepted but no greeting, Not Joined at capture |
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
