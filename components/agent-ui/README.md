# Adopted Agora Glass components

Source: [`shczhen/agent-ui`](https://github.com/shczhen/agent-ui/tree/9ca9d39be0037adf34a8984b1ab3a8383df0477c), supplied by the user through `agora-family-standalone.html`.

- `glass-surface.tsx`: original refraction geometry, RGB displacement, foreground separation, resize observation, pointer light, and material boundaries.
- `button.tsx`, `input.tsx`, `control-light.ts`: source controls. The Radix Slot import uses this host's existing `@radix-ui/react-slot` package; no replacement registry or new runtime dependency.
- `agent-ui.css`: source tokens, selected button/input/material recipes, Crystal/Obsidian theme. Root theme selectors are scoped to `.agent-ui`; host styles adapt the catalog canvas to Website 2026 in both themes. The search input shares one Glass plane; topic and sort controls use restrained neutral states.
- No Persona, simulated conversation, microphone controls, or demo runtime was added to this catalog.

Website foundation was checked against `AgoraIO/agora-website-2026` main commit `902c4424d1243545366630d14bc3d9a28b1170b6`: warm light surface, neutral black dark layers, blue signals, MiSans, and 4px spacing. The supplied HTML's foundation reference is `bb14f8acc154b9dce52ef79702b9e091fbb1780a`.

## MiSans attribution

MiSans is by Xiaomi. This application uses the official, unmodified Latin WOFF2 slices for weights 400 and 600 (about 114 KB total), rather than the full 10 MB CJK font bundle. Other scripts retain the host's sans-serif fallback.

- Official CSS source: https://font.sec.miui.com/font/css?family=MiSans:400,600:Latin&display=swap
- Official download and terms: https://hyperos.mi.com/font/en/download/
- Font agreement: https://hyperos.mi.com/font-download/MiSans字体知识产权许可协议.pdf

The font slices are bundled as application typography under `public/font/misans/`; they have not been subsetted or modified here. The application footer includes attribution. `fonts.css` preserves the official unicode ranges.

Liquid backdrop filtering uses the source SVG filter in Chromium. WebKit uses the source frosted fallback. Reduced transparency, forced colors, and unsupported backdrop filters retain a readable solid surface. Native Radix focus and video playback behavior belong to the host application.
