#!/usr/bin/env node
// Fail if a GitHub Pages staging folder contains anything beyond the static
// site the public should receive. Run after copying dist/.../browser/* into _site.
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
  'angular.json',
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
  'generate',
  'node_modules',
  'scripts',
  'src',
  'dist',
]);

const FORBIDDEN_EXTENSIONS = new Set(['.ts', '.mjs', '.map', '.json']);

const DISALLOWED_ATTRIBUTION =
  /made[[:space:]]+with[[:space:]]+cursor|built[[:space:]]+with[[:space:]]+cursor/i;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(siteDir, path);
    if (FORBIDDEN_DIRS.has(name)) {
      fail(`forbidden directory: ${rel}`);
    }
    const st = statSync(path);
    if (st.isDirectory()) {
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

const files = walk(siteDir);
const errors = [];

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
  if (ext === '.html' || ext === '.js') {
    const text = readFileSync(path, 'utf8');
    if (DISALLOWED_ATTRIBUTION.test(text)) {
      errors.push(`disallowed tooling attribution in ${rel}`);
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
