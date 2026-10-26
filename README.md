# SpeakWith support website

The official help site for [SpeakWith](https://speakwith.ikisystems.com) — a
local-first voice recorder for Mac that turns daily speaking into a searchable,
organised daily document. This repo holds the whole site: the guides, the
pricing page, the privacy policy and the terms.

**Live site:** <https://speakwith.ikisystems.com>

It is a static site. Every route is prerendered to plain HTML at build time by
React Router, and GitHub Pages serves the result. No server runs in production,
there is no database, and the site sets no cookie.

## Editing copy and assets

Nearly every word on the site lives in one file.

| What | Where |
| --- | --- |
| All user-visible copy | `src/app/content/copy.json` |
| Translations (see below) | `src/app/content/copy.<locale>.json` |
| Which locales exist, and which ship | `src/app/content/locales.json` |
| Screenshots, videos, guide diagrams | `public/assets/` |
| Favicons, the social preview image, `robots.txt` | `public/` |
| The custom domain | `public/CNAME` |
| Global stylesheet | `src/styles.css` |
| Colour palette (light and dark) | `src/theme-tokens.css` |

A copy change is usually a one-line edit to `copy.json` — the pages read their
text from it by key and no component has English baked in. Image paths in
`copy.json` are relative to `public/`, so `assets/screenshots/outline.png`
means `public/assets/screenshots/outline.png`.

**English is what ships today.** `copy.de-DE.json` is in the repo for a future
launch, and every non-English locale is switched off in `locales.json`, so a
production build emits no `/de/` routes and bundles no German. Translators can
work on a locale and preview it locally without that changing.

## Project layout

| Path | What it is |
| --- | --- |
| `app/routes/` | One module per page, plus its CSS Module |
| `app/components/` | The navbar and footer, shared by every page |
| `app/root.tsx` | The document shell: `<head>`, navbar, footer |
| `app/lib/` | Theme, locale routing, asset paths, analytics |
| `src/content/copy.ts` | Resolves a key to a string for the current locale |
| `scripts/` | Build steps and the checks that gate a deploy |
| `.github/workflows/pages.yml` | The deploy |

## Local preview

Node 22 or newer.

```bash
npm ci
npm start
```

Open the URL it prints. Edits to copy, styles and page code are picked up
live. `npm start -- --port <n>` serves on a port of your choosing.

To preview a locale that is not yet live:

```bash
SPEAKWITH_LOCALES=de-DE npm start
```

## Build

```bash
npm run build
```

This prerenders every route to `build/client/<route>/index.html`, which is
exactly what gets published. `npm run typecheck` type-checks without building.

## Deploy

Pushing `main` deploys. The GitHub Actions workflow builds the site, stages it
into `_site`, verifies that nothing but static site files are about to go out,
and publishes to the `gh-pages` branch, which serves
<https://speakwith.ikisystems.com>.

To run that same sequence locally before pushing:

```bash
npm run check:publish
```

It fails if the staged artifact contains anything the public should not receive
— source, `package.json`, source maps, or copy for a locale that is switched
off.

## Contributing

Bug reports and copy corrections are welcome as issues. If you are changing the
site, [`CONTRIBUTING.md`](CONTRIBUTING.md) covers the checks a change has to
pass and the few things about this build that are easy to get wrong.
