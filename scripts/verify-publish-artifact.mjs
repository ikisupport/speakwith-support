#!/usr/bin/env node
// Fail if a GitHub Pages staging folder contains anything beyond the static
// site the public should receive. Run after copying build/client/* into _site.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const siteDir = resolve(ROOT, process.argv[2] ?? '_site');

const FORBIDDEN_NAMES = new Set([
  'Makefile',
  'package.json',
  'package-lock.json',
  'react-router.config.ts',
  'vite.config.ts',
  'tsconfig.json',
  'CONTRIBUTING.md',
  '.env',
  '.env.example',
  'copy.de-DE.json',
  'locales.json',
  'AGENTS.md',
  'STYLE.md',
]);

const FORBIDDEN_DIRS = new Set([
  '.git',
  '.github',
  '.react-router',
  'app',
  'build',
  'node_modules',
  'scripts',
  'src',
]);

const FORBIDDEN_EXTENSIONS = new Set(['.ts', '.mjs', '.map', '.json']);

// The only dotfile GitHub Pages needs. Both staging steps (pages.yml and the
// local `check:publish`) copy with `cp -r build/client/*`, which skips
// dotfiles at the top level but carries along any a subdirectory already holds
// — which is how `assets/.DS_Store` reached a published artifact while the
// top-level one did not. An allowlist is stricter than naming `.DS_Store`:
// `extname('.DS_Store')` is '' in Node, so the extension rule above can never
// see it, and the same hole admits `.env`, `._*` and `.vscode`.
const ALLOWED_DOTFILES = new Set(['.nojekyll']);

const DISALLOWED_ATTRIBUTION = /made\s+with\s+cursor|built\s+with\s+cursor/i;

// Identifiers that belong to the private repo, not to a published asset. The
// annotated guide SVGs carried `<!-- Maintainer note -->` blocks naming Swift
// files, internal symbols and generator script paths; this is what keeps them
// from coming back.
//
// Measured against the artifact before being armed: it matches the twelve
// annotated SVGs and nothing else in `_site` — no HTML, no JS chunk.
const PRIVATE_IDENTIFIERS = /\.swift\b|guide_design\/|\/Volumes\//i;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(siteDir, path);
    if (FORBIDDEN_DIRS.has(name)) {
      fail(`forbidden directory: ${rel}`);
    }
    const st = statSync(path);
    if (st.isDirectory()) {
      // A dot-directory is reported, not fatal, so one run names every problem.
      // Its own files are walked too: whatever is inside should be listed.
      if (name.startsWith('.')) {
        errors.push(`forbidden dot-directory: ${rel}`);
      }
      walk(path, files);
      continue;
    }
    files.push(path);
  }
  return files;
}

function fail(message) {
  console.error(`verify-publish-artifact: ${message}`);
  process.exit(1);
}

function disabledLocalePrefixes() {
  const matrix = JSON.parse(readFileSync(resolve(ROOT, 'src/app/content/locales.json'), 'utf8'));
  return matrix.locales
    .filter(l => l.code !== matrix.defaultLocale && l.enabled !== true)
    .map(l => l.prefix)
    .filter(Boolean);
}

if (!existsSync(siteDir)) {
  fail(`site folder not found: ${siteDir}`);
}

// Declared before `walk`, which reports dot-directories into it. Every rule
// below accumulates rather than exiting, so a single run names every problem
// in the artifact instead of only the first one.
const errors = [];
const files = walk(siteDir);

for (const path of files) {
  const rel = relative(siteDir, path);
  const name = basename(path);
  const ext = extname(path).toLowerCase();

  if (FORBIDDEN_NAMES.has(name)) {
    errors.push(`forbidden file: ${rel}`);
  }
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    errors.push(`forbidden extension ${ext}: ${rel}`);
  }
  if (name.startsWith('.') && !ALLOWED_DOTFILES.has(name)) {
    errors.push(`forbidden dotfile: ${rel}`);
  }
  if (ext === '.html' || ext === '.js' || ext === '.svg') {
    const text = readFileSync(path, 'utf8');
    if (DISALLOWED_ATTRIBUTION.test(text)) {
      errors.push(`disallowed tooling attribution in ${rel}`);
    }
    if (PRIVATE_IDENTIFIERS.test(text)) {
      errors.push(`private repo identifier in ${rel}`);
    }
    // SVG only. The prerender emits framework comment nodes into every page,
    // so the same rule on .html would fail the live deploy on normal output.
    // Hand-authored and generated SVGs have no such excuse.
    if (ext === '.svg' && text.includes('<!--')) {
      errors.push(`XML comment in published SVG (strip it at source): ${rel}`);
    }
  }
}

const sitemapPath = join(siteDir, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const prefix of disabledLocalePrefixes()) {
    const pattern = new RegExp(`/${prefix}/`);
    if (pattern.test(sitemap)) {
      errors.push(`sitemap lists disabled locale prefix /${prefix}/`);
    }
  }
}

const jsFiles = files.filter(p => extname(p).toLowerCase() === '.js');
const jsBlob = jsFiles.map(p => readFileSync(p, 'utf8')).join('\n');
if (jsBlob.includes('Automatisierung | SpeakWith')) {
  errors.push('disabled de-DE copy appears in published JavaScript');
}

// The dev page index (app/routes/dev.tsx) is registered only when NODE_ENV is
// not production or SPEAKWITH_DEV_PAGES=1. Checking for a /dev/ directory
// would prove nothing: those routes are absent from locales.json's matrix, so
// they never get prerendered HTML whether the gate holds or not. If the gate
// fails open the leak is the route MODULE inside a JS chunk, which is what
// these literals catch. Both are unique to those two files.
for (const literal of ['Dev pages \u00b7 SpeakWith', 'Deliberate test error from the dev page index.']) {
  if (jsBlob.includes(literal)) {
    errors.push(`dev-only page index appears in published JavaScript (${literal})`);
  }
}

if (!existsSync(join(siteDir, 'index.html'))) {
  errors.push('missing index.html');
}
if (!existsSync(join(siteDir, '.nojekyll'))) {
  errors.push('missing .nojekyll (Jekyll would strip underscored paths)');
}

if (errors.length) {
  for (const err of errors) console.error(`verify-publish-artifact: ${err}`);
  process.exit(1);
}

console.log(`verify-publish-artifact: ok (${files.length} files under ${relative(ROOT, siteDir) || '.'})`);
