# Brand assets

Logo and preview images for the Achondroplasia Guide. This folder is not part of the
built site; the copies the site serves live in `public/`.

| File | Use |
|------|-----|
| `logo.svg` | Vector master. Same drawing as `public/favicon.svg`. |
| `logo-square-{512,1024,2048}.png` | Avatars (GitHub org, Slack, social profiles). Full-bleed square; the platform rounds the corners. |
| `logo-rounded-{512,1024,2048}.png` | Rounded tile on a transparent background, for slides, docs and READMEs. |
| `social-preview-1200x630.jpg` | Link previews and the GitHub repo social preview. Same as `public/og-image.jpg`. |

## Colours

The "Lagoon & Marigold" palette. Site tokens are in `src/styles/global.css`.

| Name | Light | Dark |
|------|-------|------|
| Teal (brand) | `#007585` | `#3fcfd9` |
| Deep teal | `#005866` | `#86e6ec` |
| Marigold (accent fill) | `#f6b400` | `#ffc83d` |
| Ink (headings) | `#0b2e38` | `#f2fafb` |
| Background | `#f7fbfb` | `#0a171c` |

If you change the logo, edit `logo.svg` and `public/favicon.svg` together, then
re-export the PNGs, `public/apple-touch-icon.png` (180×180, square) and the
social preview from `public/og-image.svg`.
