# Agora website hero renderer

Source: `agora-website-2026`, commit
`1f8f4f1e8d2601dffe42ba51b280815014446ad8`.

The rendering modules are copied from
`src/features/homepage-2026/components/`, the carousel from
`src/features/homepage-2026/hero-carousel.ts`, and the sphere utilities from
`src/lib/particle-sphere.ts`. Recipes ships these files itself; the deployed
catalog does not import another checkout or depend on localhost.

Keep the source geometry, shaders, density, easing, and renderer-selection
policy in sync when updating. The runtime dependency is pinned to the source
website's installed `shaders@4.0.0`.

Recipes integration changes are limited to relocated sphere imports,
element-scoped palette lookup, and a pause prop for the accessible playback
control. The wrapper in `components/hero-field.tsx` supplies the original
autoplay intents with idle phase and zero live-session amplitude/exit progress.
The source QA clock and renderer switches remain available for parity checks.

For a fixed-formation Recipes capture, combine `heroClock=6` with
`heroIntent=audio|video|conversation` and `heroRenderer=webgpu|canvas`.
`heroIntent` is only honored when the source QA clock is present; regular visits
always use the source autoplay cycle. The source `heroAudit=particles` GPU
readback seam is preserved for numerical sphere-target comparisons.
