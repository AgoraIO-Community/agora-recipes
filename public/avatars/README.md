# Recipe author avatars

Small original GitHub profile images are bundled locally so browsing the catalog
does not require visitors to fetch author images from GitHub. All 17 images total
about 36 KB. Profile names were checked against recipe authors and implementation
repository owners on 2026-10-19; Agora uses the official AgoraIO organization.

`content/authors.json` records each display name, profile URL, local avatar, and
original avatar URL. Image files retain their source format and pixels. New or
unavailable profiles fall back to initials; no profile is inferred from a name at
runtime. These are author identity images, separate from the recipe code license.
