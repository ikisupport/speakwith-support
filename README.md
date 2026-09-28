# SpeakWith support website

Static marketing and support site for [SpeakWith](https://speakwith.ikisystems.com), built with Angular and published to GitHub Pages.

## Local preview

```bash
npm ci
npm start
```

Open http://localhost:4200 (or pass `--port` if 4200 is taken).

## Production build

```bash
npm run build -- --base-href /
```

Output: `dist/speakwith-support/browser/`

## Publish check

Simulates the CI staging step and verifies only static site files would deploy:

```bash
npm run check:publish
```

## What deploys

GitHub Actions copies **only** `dist/speakwith-support/browser/*` to `gh-pages`. Source, scripts, `package.json`, Makefile, and local env files never reach the live site. See `AGENTS.md` for the full boundary.
