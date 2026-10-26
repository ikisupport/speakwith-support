# Contributing

Thanks for looking. [`README.md`](README.md) covers what the site is, where the
copy lives and how to preview it; this file is the rest — the checks a change
has to pass, and the handful of things about this build that are easy to get
wrong.

## The checks

All of them read a finished build, so run `npm run build` first.

```bash
npm run check:copy      # every copy.<locale>.json still matches copy.json
npm run check:assets    # every local src/href in every prerendered page resolves
npm run check:publish   # build + stage _site + verify only static files ship
node scripts/test-resolve-route.mjs
```

`check:copy` also runs as `prebuild`, so a drifted translation fails the build
rather than the deploy. `check:publish` is the one CI runs; passing it locally
is the best signal a push will deploy cleanly.

### What `check:copy` enforces

Per `copy.<locale>.json`, against `copy.json`:

- every top-level section it carries must exist in English;
- inside a carried section the key tree must match exactly — same keys, same
  array lengths, same value types — so a template never reads `undefined`;
- values that are not prose (asset paths, ids, URLs, booleans, `badgeKind`)
  must be byte-identical to English, so a translation cannot accidentally
  retarget a screenshot or a purchase link;
- no em dash (U+2014) anywhere — the house style uses a spaced hyphen.

A section a locale omits falls back to English at runtime, which is how the
privacy policy and terms ship English-canonical everywhere.

### What `check:publish` blocks

`scripts/verify-publish-artifact.mjs` fails the deploy if the staged `_site`
holds anything beyond the static site: source files, `package.json`, source
maps, JSON, stray dotfiles, maintainer notes, a missing `.nojekyll`, or copy
and sitemap entries for a locale that is switched off. It also rejects private
paths and tooling attribution in published HTML, JS and SVG.

## Locales

`src/app/content/locales.json` lists every locale and carries an `enabled` flag
per locale whose **committed value is `false`** for everything but English. A
production build therefore ships English only: no prefixed routes, no language
switcher, no `hreflang`, no translated strings in the bundle.

To work on a locale locally, switch it on for your own build:

```bash
SPEAKWITH_LOCALES=de-DE npm start     # or `all`
```

`SPEAKWITH_LOCALES` is read from the environment, then from a git-ignored
`.env` at the repo root, so it can never reach the Actions build. Do not flip
an `enabled` flag to `true` as part of an unrelated change — that is what makes
a locale go live.

## Things that are easy to get wrong

- **`ssr: true`, not `false`.** React Router 7 reads `ssr: false` as SPA mode,
  and "prerendering" then writes the same empty shell to every path: no
  `<title>`, no meta, no page text. No server is deployed either way — the
  build just runs the server bundle once per route. The failure looks fine in a
  browser and is invisible to a crawler, which is the worst combination for a
  site whose whole value is SEO-correct static HTML.
- **`routeDiscovery: 'initial'`.** The default, `lazy`, fetches `/__manifest`
  on navigation to discover routes. Only a running React Router server answers
  that, so on a file host every client-side navigation would 404 against it.
- **No `<base>` tag, so asset paths must be made absolute at render.** Paths in
  `copy.json` are relative; `app/lib/asset.ts` resolves them. A path that
  reaches the DOM unresolved renders correct text and correct head tags while
  every image on a nested route 404s — `/guides/outline/` asks for
  `/guides/outline/assets/...`. That is exactly what `check:assets` catches.
- **One CSS Module per page, never one flat sheet.** Several class names carry
  different rules on different pages — `.eyebrow` means one thing in pricing
  and another in the guides. Merging them into the global sheet silently
  restyles pages. Only genuinely global classes (`.container`, `.button`,
  `.prose`, `.card`) belong in `src/styles.css`.
- **The theme prelude is generated.** `src/theme-tokens.css` and
  `src/theme-prepaint.js` are inlined into every page's `<head>` by
  `scripts/extract-theme-prelude.mjs` as a pre{start,build} step. Edit those
  two files, not the generated `app/generated/theme-prelude.ts`.
- **The prerender is dark.** Theme-dependent images render dark on the server
  and on React's first client render, then swap in an effect — one frame, since
  the server cannot read `localStorage`.
- **No port numbers in this repo, published copy included.** Pass `--port` to
  `npm start` rather than pinning one in `vite.config.ts` (`strictPort` still
  makes a collision fail loudly on whatever port was asked for). Where a page
  documents a service the product runs on the reader's own machine, it reads
  the port off the running service into a shell variable instead of printing
  one — see `/technical/agent-lists/`.
- **The sitemap is a build product.** `scripts/generate-sitemap.mjs` runs as
  `postbuild` and writes into `build/client/`, because which URLs it lists
  depends on which locales the build shipped. There is deliberately no
  committed copy under `public/`.

## Legacy parity tooling

This site replaced an earlier Angular implementation, and the scripts that
proved the two rendered the same thing are kept under `scripts/dev/`:

```bash
LEGACY_SITE_DIR=/path/to/angular/checkout npm run check:parity
LEGACY_SITE_DIR=/path/to/angular/checkout node scripts/dev/parity-diff.mjs --css-audit
```

They need a checkout of that implementation on disk and are not wired into the
build. `scripts/dev/ng2react.mjs` and `scripts/dev/make-page.mjs` are the
migration aids that did the first pass of the conversion; they are kept because
they document how a page was derived, not because anything runs them now.

## Commits

Conventional Commits — `type(scope): summary`, lowercase type and scope.
