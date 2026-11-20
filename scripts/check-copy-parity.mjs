#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

// Fail the build when a copy.<locale>.json drifts from copy.json.
//
// Rules, per locale file:
//   * every top-level section it carries must exist in copy.json;
//   * within a carried section the key tree must match exactly (same keys,
//     same array lengths, same value types) so templates never hit undefined;
//   * non-copy values (asset paths, ids, URLs, booleans, badgeKind) must be
//     byte-identical to English, so a translator cannot accidentally retarget
//     a screenshot or a Gumroad link;
//   * src and srcLight may instead name a locale frame: the English path with
//     the locale's primary language tag inserted before `-light` or before the
//     extension (`photo.png` → `photo-de.png`, `photo-light.png` →
//     `photo-de-light.png`). The query string stays the English one, and the
//     file has to exist under public/. Anything else still fails.
//   * no em dash (U+2014) anywhere, per the house style.
// Sections a locale omits fall back to English at runtime (copy.ts), which is
// how the legal pages ship English-canonical.
// Every locale file is checked regardless of its `enabled` flag, so a parked
// draft cannot rot while it waits behind the feature flag.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONTENT_DIR, PUBLIC_DIR, assertSupportSite } from './lib/site-content.mjs';

assertSupportSite();
const dir = CONTENT_DIR;
const en = JSON.parse(readFileSync(resolve(dir, 'copy.json'), 'utf8'));
const matrix = JSON.parse(readFileSync(resolve(dir, 'locales.json'), 'utf8'));

// Leaf keys whose values are not prose and must stay identical to English.
const PINNED_KEYS = new Set([
  'id', 'src', 'srcLight', 'videoSrc', 'videoWebmSrc', 'loopSrc', 'loopWebmSrc', 'posterSrc', 'heroImageDark', 'heroImageLight', 'isHtml', 'wide', 'badgeKind',
  'ctaUrl', 'ctaSecondaryUrl', 'ctaTertiaryUrl', 'diagramDark', 'diagramLight',
  'figureDark', 'figureLight', 'figureWidth', 'figureHeight', 'path', 'morePath', 'moreUrl',
]);
const PINNED_SECTIONS = new Set(['links']);
// Screenshot leaves a locale may retarget, and only onto its own language frame.
const LOCALIZED_ASSET_KEYS = new Set(['src', 'srcLight']);

const problems = [];

function primaryLanguage(code) {
  const tag = code.split('-')[0].toLowerCase();
  return /^[a-z]{2,3}$/.test(tag) ? tag : null;
}

// English `assets/a/photo.png?v=1` → `assets/a/photo-de.png?v=1`.
// A `-light` twin keeps light at the end: `photo-light.png` → `photo-de-light.png`.
function localizedAsset(enValue, lang) {
  if (typeof enValue !== 'string' || !lang) return null;
  const q = enValue.indexOf('?');
  const path = q === -1 ? enValue : enValue.slice(0, q);
  const query = q === -1 ? '' : enValue.slice(q);
  if (!path || path.startsWith('/') || path.split('/').includes('..')) return null;
  const slash = path.lastIndexOf('/');
  const dir = slash === -1 ? '' : path.slice(0, slash + 1);
  const file = slash === -1 ? path : path.slice(slash + 1);
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return null;
  const stem = file.slice(0, dot);
  const ext = file.slice(dot);
  if (!/^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(stem) || !/^\.[A-Za-z0-9]+$/.test(ext)) return null;
  const localizedStem = stem.endsWith('-light')
    ? `${stem.slice(0, -'-light'.length)}-${lang}-light`
    : `${stem}-${lang}`;
  return `${dir}${localizedStem}${ext}${query}`;
}

function publicFileExists(assetRef) {
  if (typeof assetRef !== 'string') return false;
  const q = assetRef.indexOf('?');
  const rel = q === -1 ? assetRef : assetRef.slice(0, q);
  if (!rel || rel.startsWith('/') || rel.split('/').includes('..')) return false;
  return existsSync(resolve(PUBLIC_DIR, rel));
}

function walk(section, enNode, locNode, path, lang) {
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
    enNode.forEach((item, i) => walk(section, item, locNode[i], `${path}[${i}]`, lang));
    return;
  }
  if (enType === 'object') {
    for (const key of Object.keys(enNode)) {
      if (!(key in locNode)) {
        problems.push(`${path}.${key}: missing`);
        continue;
      }
      walk(section, enNode[key], locNode[key], `${path}.${key}`, lang);
    }
    for (const key of Object.keys(locNode)) {
      if (!(key in enNode)) problems.push(`${path}.${key}: not in copy.json`);
    }
    return;
  }
  const leaf = path.split('.').pop().replace(/\[\d+\]$/, '');
  if ((PINNED_KEYS.has(leaf) || PINNED_SECTIONS.has(section)) && enNode !== locNode) {
    const expected = LOCALIZED_ASSET_KEYS.has(leaf) ? localizedAsset(enNode, lang) : null;
    if (expected && locNode === expected && publicFileExists(locNode)) {
      // Locale frame of the English asset. Query string stays pinned.
    } else if (expected && locNode === expected) {
      problems.push(`${path}: localized frame is not in public/ (${JSON.stringify(locNode)})`);
    } else {
      problems.push(`${path}: must equal the English value (${JSON.stringify(enNode)})`);
    }
  }
  if (typeof locNode === 'string' && locNode.includes('—')) {
    problems.push(`${path}: contains an em dash (see CONTRIBUTING.md)`);
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
    walk(section, en[section], loc[section], `${file}:${section}`, primaryLanguage(code));
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
