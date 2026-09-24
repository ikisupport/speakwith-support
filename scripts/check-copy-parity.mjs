#!/usr/bin/env node
// Fail the build when a copy.<locale>.json drifts from copy.json.
//
// Rules, per locale file:
//   * every top-level section it carries must exist in copy.json;
//   * within a carried section the key tree must match exactly (same keys,
//     same array lengths, same value types) so templates never hit undefined;
//   * non-copy values (asset paths, ids, URLs, booleans, badgeKind) must be
//     byte-identical to English, so a translator cannot accidentally retarget
//     a screenshot or a Gumroad link;
//   * no em dash (U+2014) anywhere, per STYLE.md.
// Sections a locale omits fall back to English at runtime (copy.ts), which is
// how the legal pages ship English-canonical.
// Every locale file is checked regardless of its `enabled` flag, so a parked
// draft cannot rot while it waits behind the feature flag.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(here, '../src/app/content');
const en = JSON.parse(readFileSync(resolve(dir, 'copy.json'), 'utf8'));
const matrix = JSON.parse(readFileSync(resolve(dir, 'locales.json'), 'utf8'));

// Leaf keys whose values are not prose and must stay identical to English.
const PINNED_KEYS = new Set([
  'id', 'src', 'videoSrc', 'posterSrc', 'heroImage', 'isHtml', 'wide', 'badgeKind',
  'ctaUrl', 'ctaSecondaryUrl', 'ctaTertiaryUrl',
]);
const PINNED_SECTIONS = new Set(['links']);

const problems = [];

function walk(section, enNode, locNode, path) {
  const enType = Array.isArray(enNode) ? 'array' : typeof enNode;
  const locType = Array.isArray(locNode) ? 'array' : typeof locNode;
  if (enType !== locType) {
    problems.push(`${path}: type ${locType}, expected ${enType}`);
    return;
  }
  if (enType === 'array') {
    if (enNode.length !== locNode.length) {
      problems.push(`${path}: ${locNode.length} items, expected ${enNode.length}`);
      return;
    }
    enNode.forEach((item, i) => walk(section, item, locNode[i], `${path}[${i}]`));
    return;
  }
  if (enType === 'object') {
    for (const key of Object.keys(enNode)) {
      if (!(key in locNode)) {
        problems.push(`${path}.${key}: missing`);
        continue;
      }
      walk(section, enNode[key], locNode[key], `${path}.${key}`);
    }
    for (const key of Object.keys(locNode)) {
      if (!(key in enNode)) problems.push(`${path}.${key}: not in copy.json`);
    }
    return;
  }
  const leaf = path.split('.').pop().replace(/\[\d+\]$/, '');
  if ((PINNED_KEYS.has(leaf) || PINNED_SECTIONS.has(section)) && enNode !== locNode) {
    problems.push(`${path}: must equal the English value (${JSON.stringify(enNode)})`);
  }
  if (typeof locNode === 'string' && locNode.includes('—')) {
    problems.push(`${path}: contains an em dash (see STYLE.md)`);
  }
}

const files = readdirSync(dir).filter(f => /^copy\.[A-Za-z-]+\.json$/.test(f));
const shipped = new Set(matrix.locales.map(l => l.code));
for (const file of files) {
  const code = file.slice('copy.'.length, -'.json'.length);
  if (!shipped.has(code)) {
    problems.push(`${file}: locale "${code}" is not listed in locales.json`);
  }
  const loc = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
  for (const section of Object.keys(loc)) {
    if (section.startsWith('$')) continue;
    if (!(section in en)) {
      problems.push(`${file}: section "${section}" not in copy.json`);
      continue;
    }
    walk(section, en[section], loc[section], `${file}:${section}`);
  }
}
for (const locale of matrix.locales) {
  if (locale.code !== matrix.defaultLocale && !files.includes(`copy.${locale.code}.json`)) {
    problems.push(`locales.json lists "${locale.code}" but copy.${locale.code}.json is missing`);
  }
}

if (problems.length) {
  console.error(`copy parity: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`copy parity: ${files.length} locale file(s) match copy.json`);
