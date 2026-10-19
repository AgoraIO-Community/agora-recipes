# Agora website hero renderer

Source: `agora-website-2026`, commit
`1f8f4f1e8d2601dffe42ba51b280815014446ad8`.

The rendering modules are copied from
`src/features/homepage-2026/components/`, the carousel from
`src/features/homepage-2026/hero-carousel.ts`, and the sphere utilities from
`src/lib/particle-sphere.ts`. Recipes ships these files itself; the deployed
catalog does not import another checkout or depend on localhost.

Keep the source formation geometry, easing, and renderer-selection policy in
sync when updating. The runtime dependency is pinned to the source
website's installed `shaders@4.0.0`.

Recipes integration includes relocated sphere imports, element-scoped palette
lookup, and a retained renderer pause prop. The Recipes wrapper autoplays without
visible playback controls or legacy stored motion overrides, and supplies the original
autoplay intents with idle phase and zero live-session amplitude/exit progress.
The source QA clock and renderer switches remain available for parity checks.

## Recipes-specific owner requirements

- Both renderers use their host's width and height, not the browser viewport.
  Pointer coordinates are local to the host and inactive outside it. The
  source's particle budget is scaled by the intro height without adaptive
  per-frame changes or reseeding on resize.
- `lightThemeRendering` in `hero-field-light.ts` owns the shared light opacity
  and atmospheric exposure used by Canvas and WGSL. Light Voice uses the
  classic shafts; it must not suppress them while dark-only curtains are off.
- The hero uses 45% of the usable viewport below the navigation, followed
  immediately by the recipe directory. Render into that host size; do not
  restore full-viewport geometry, fixed 325px sizing, hero mode tabs, or a tall
  mobile band.
- Appearance follows the device preference automatically. Never restore a
  light/dark/system selector or let legacy stored choices override the device.

For a fixed-formation Recipes capture, combine `heroClock=6` with
`heroIntent=audio|video|conversation` and `heroRenderer=webgpu|canvas`.
`heroIntent` is only honored when the source QA clock is present; regular visits
always use the source autoplay cycle. The source `heroAudit=particles` GPU
readback seam is preserved for numerical sphere-target comparisons.
