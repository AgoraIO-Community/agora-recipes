# Topic artwork and membership sources

The Topic directory uses themed artwork. Recipe media remains an author's real screenshot or recording. Topic illustration does not certify event participation; membership is a separate, explicitly reviewed list.

## Artwork

| Topic | Local asset | Origin |
| --- | --- | --- |
| Voice AI in practice | `public/topics/voice-ai-in-practice.jpg` | Original #VoiceAI illustration generated with the built-in imagegen tool on 2026-10-29. |
| Voice AI starter kit | `public/topics/voice-ai-starter-kit.jpg` | Original #StartHere illustration generated with the built-in imagegen tool on 2026-10-29. |
| iRTE2026 | `public/topics/irte2026.jpg` | Adapted from the [official conference poster](https://www.shengwang.cn/rteconf/rte-2026/home/hero-kv-poster.jpg) using built-in imagegen. Only the Chinese subtitle and venue callout were removed. The date, wordmarks, and pixel-globe identity remain. This is an adapted cover, not an unedited organizer file. |
| Voice AI Hackathon 2026 | `public/topics/voice-ai-hackathon-2026.jpg` | [Organizer's original event poster](https://aimobilecoders.com/storage/hackathons/c1185b84-944c-4184-8126-d43f04a7f062.png), converted to JPEG. Registration has ended; current status remains visible on the card and detail page. |

Generated source PNGs remain in the local image-generation archive. The application consumes committed JPEGs; no generation service is called at runtime. Cover text uses short English hashtags, while the HTML title, summary, status, and alt text follow the selected locale. These labels do not create technical tags or change membership.

## iRTE2026 membership

- `dumpling-booth`: owner-confirmed in PR #77's original scope.
- `agora-drawguess`, `agora-arena`, and `agora-rotary-dial-phone`: owner-confirmed conference demos on 2026-10-29. Existing projects and author credit remain unchanged.
- `m5-sticks3-voice-agent`: the [author README](https://github.com/Ocean-lhy/RTE2026-StickS3-Demo/blob/main/README.md) explicitly identifies the project as part of RTE2026 Workshop; original catalog contribution is #75.

## Hackathon membership audit

- `pillion` is in the catalog. The author attributes it to the Agora Voice AI Hackathon 2026 / AI Mobile Coders and reports first place. Keep the credit explicitly author-reported.
- DashLens is another confirmed author submission: [PR #66](https://github.com/AgoraIO-Community/agora-recipes/pull/66), with [third-place attribution in its guide](https://github.com/shubhh00/DashLens/blob/main/docs/ai/RECIPE.md). At this review it remains open and outside the catalog. The owner chose to wait for #66 to merge before adding it to this Topic. Do not add a nonexistent member or silently absorb its pending contribution into #77.
- The catalog's other generic hackathon mentions do not establish membership in this specific edition. Aria Co-Teacher cites EchoSphere; no relationship to the AI Mobile Coders edition is established. Do not infer participation from shared technologies or words such as “hackathon.”

## Generation and edit prompts

The built-in imagegen tool was used, not the CLI fallback.

### practice

```text
Use case: stylized-concept. Create one finished landscape 16:9 Topic cover for Agora Recipes. This is a curated developer theme, not a recipe screenshot or a real event poster. Design a confident premium pixel-art editorial poster on a near-black charcoal background. A large highly legible clean pixel-type hashtag '#VoiceAI' sits in the upper left, with generous breathing room. Lower/right: a carefully composed small group of pixel-art physical objects suggesting voice applications: a telephone handset, a game controller, a microphone, and two conversational speech bubbles. Use purposeful broad pixel blocks and crisp silhouettes, Agora cyan, muted violet and a little warm white; restrained color rather than neon bloom. A strong simple composition that remains recognizable as a 150px-wide thumbnail. All important content within the central 85% so a 16:9 crop is safe. Exact text only: '#VoiceAI'. No extra copy, small labels, interface frames, UI screenshots, buttons, watermarks, corporate logos, fake metrics, glowing gradients or glossy 3D. Opaque background.
```

### starter

```text
Use case: stylized-concept. Create one finished landscape 16:9 Topic cover for Agora Recipes, a curated theme for building a first voice agent. It belongs to a family of premium editorial pixel-art developer posters. Warm off-white background with deep charcoal pixel outlines and Agora cyan, muted violet accents. Large highly legible clean pixel-type hashtag '#StartHere' in the upper left, generous breathing room. Lower/right: an appealing, precise pixel-art build kit: a compact laptop, a microphone and a small speaker connected by one clearly visible cable, with a single small speech bubble appearing over the microphone. A few substantial objects, a coherent still life, not a network diagram. Intent: 'build and try your first voice app'. Crisp broad pixels and confident composition; readable as a 150px-wide thumbnail. All important content in the central 85% with safe 16:9 margins. Exact text only: '#StartHere'. No code snippets, tiny labels, interface frames, app screenshots, buttons, watermarks, corporate logos, fake claims, gradients or glossy 3D. Opaque background.
```

### irte

```text
Edit the provided official iRTE2026 conference poster. Preserve the original black background, pixelated violet globe, huge colorful iRTE lettering, little pixel icons, date 10.23–24, and all original art geometry, colors and pixel typography. Remove the Chinese phrase '实时智能大会' and its preceding slash after the smaller 'iRTE2026' wordmark, leaving 'iRTE2026' intact. Remove the entire venue callout: the English '>Location' label, its underline, and the black-backed Chinese venue text '北京悠唐皇冠假日酒店'. Seamlessly reconstruct any globe/background pixels behind that venue callout. Keep the '>Time' callout, the date, the English LIVE text, and both iRTE wordmarks. Do not add replacement text, logos, hashtags, new shapes, or redesign the event artwork. Retain the 16:9 landscape composition. The only semantic change is removal of the Chinese subtitle and location callout.
```

