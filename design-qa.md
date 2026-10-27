# Recipes design verification

DESIGN.md defines the current visual and interaction rules. Check the running
site after changes to shared components, theme tokens, or layout.

- Review the catalog, search results, filter sheet, recipe overview, reader,
  navigation, and footer in dark and light.
- Cover 320px and 390px phones, tablet widths, and the desktop layout. Phone
  browsing stays in two columns without document-level horizontal overflow.
- Compare component and descendant bounds before, during, and after hover.
  Cards, previews, links, labels, and icons retain their position and size.
  The video caption may extend its glass backing while its play icon stays fixed.
- Verify the two-second mouse dwell, muted inline preview, early-leave and
  unmount cancellation, blocked playback recovery, and explicit touch playback.
- Exercise keyboard focus, selection, multi-select filters, sorting, empty
  recovery, copy success and failure, and disclosure state changes.
- Verify full refraction on floating surfaces, readable opaque form and reading
  planes, reduced-motion behavior, and solid transparency fallbacks.
- Check outside dismissal, Escape, focus return, and media unmount on close.
- Run lint, independent TypeScript checking, relevant tests, and the build.
  Keep generated recipe-document churn out of the change.

Review captures and temporary diagnostics stay outside application assets.
Browser emulation does not establish physical-device or live voice/camera
session coverage; record those separately when exercised.
