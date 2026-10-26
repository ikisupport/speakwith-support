#!/usr/bin/env node
// Route-by-route parity between this build and the legacy Angular build.
//
// Maintainer-only, and historical: the Angular implementation this site
// replaced is no longer in this repo, so the gate only runs where a checkout
// of it is still on disk. LEGACY_SITE_DIR names that checkout (default
// ../support_website). Not wired into prebuild — see CONTRIBUTING.md.
//
// Compares, per prerendered route:
//   * <html lang>, <title>, meta description, canonical, every og:* and
//     twitter:*, and every hreflang alternate;
//   * the visible text of <main>, with markup stripped and whitespace
//     collapsed.
//
// Both sides are read from already-built output. This script never builds the
// legacy site, because `ng build` runs that tree's prebuild, which rewrites
// its git-ignored locales.active.ts and public/sitemap.xml. Build it out of
// tree to get a baseline; because both files are git-ignored, a `git status`
// check would show nothing if you did not.
//
//   --angular <dir>   legacy Angular build to compare against
//                     (default $LEGACY_SITE_DIR/dist/speakwith-support/browser)
//   --react <dir>     React build (default build/client)
//   --head-only       skip the <main> text comparison
//   --route <path>    only this route, e.g. --route /pricing/
//   --css-audit       instead of comparing, report class names defined by more
//                     than one Angular component with differing rules
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { REPO_ROOT } from '../lib/site-content.mjs';
import { routeEntries } from '../lib/route-matrix.mjs';
import {
  activeNavLinks,
  firstDifference,
  footerText,
  headTags,
  headerText,
  mainText,
} from '../lib/html-compare.mjs';

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const has = name => argv.includes(name);

/** The legacy Angular checkout, if one is still on disk. Never required to build. */
const legacyRaw = process.env['LEGACY_SITE_DIR'] ?? '../support_website';
const LEGACY_SITE_DIR = isAbsolute(legacyRaw) ? legacyRaw : resolve(REPO_ROOT, legacyRaw);

function requireLegacyCheckout(what) {
  if (existsSync(LEGACY_SITE_DIR)) return;
  console.error(`parity-diff: no legacy Angular checkout at ${LEGACY_SITE_DIR}`);
  console.error(`  ${what} compares against the implementation this site replaced, which is`);
  console.error('  not in this repo. Point LEGACY_SITE_DIR at a checkout of it, or skip this gate.');
  process.exit(1);
}

const angularDir = resolve(
  REPO_ROOT,
  flag('--angular', resolve(LEGACY_SITE_DIR, 'dist/speakwith-support/browser')),
);
const reactDir = resolve(REPO_ROOT, flag('--react', 'build/client'));
const only = flag('--route', null);

if (has('--css-audit')) {
  requireLegacyCheckout('--css-audit');
  await cssAudit();
  process.exit(0);
}

requireLegacyCheckout('parity-diff');

for (const [label, dir] of [['angular', angularDir], ['react', reactDir]]) {
  if (!existsSync(dir)) {
    console.error(`parity-diff: no ${label} build at ${dir}`);
    console.error(
      label === 'angular'
        ? '  Build it OUT OF TREE first — see the header comment. A plain `npm run build`\n' +
          '  in that checkout rewrites git-ignored files without showing up in `git status`.'
        : '  Run `npm run build` first.',
    );
    process.exit(1);
  }
}

const entries = await routeEntries();
const routes = [...entries.map(e => e.url), '/404/'].filter(u => !only || u === only);

let differences = 0;
let compared = 0;

for (const url of routes) {
  const rel = `${url.replace(/^\//, '')}index.html`;
  const aPath = resolve(angularDir, rel);
  const rPath = resolve(reactDir, rel);

  if (!existsSync(aPath) || !existsSync(rPath)) {
    console.log(`✗ ${url}`);
    if (!existsSync(aPath)) console.log(`    missing in angular: ${aPath}`);
    if (!existsSync(rPath)) console.log(`    missing in react:   ${rPath}`);
    differences++;
    continue;
  }

  const aHtml = readFileSync(aPath, 'utf8');
  const rHtml = readFileSync(rPath, 'utf8');
  const aHead = headTags(aHtml);
  const rHead = headTags(rHtml);
  const problems = [];

  for (const key of new Set([...Object.keys(aHead), ...Object.keys(rHead)])) {
    if (aHead[key] !== rHead[key]) {
      problems.push(`${key}\n      angular: ${JSON.stringify(aHead[key])}\n      react:   ${JSON.stringify(rHead[key])}`);
    }
  }

  if (!has('--head-only')) {
    for (const [label, read] of [
      ['<main>', mainText],
      ['<header>', headerText],
      ['<footer>', footerText],
    ]) {
      const aText = read(aHtml);
      const rText = read(rHtml);
      if (aText !== rText) {
        const d = firstDifference(aText, rText);
        problems.push(
          `${label} text diverges at char ${d.index} (angular ${aText.length} chars, react ${rText.length})\n` +
            `      angular: …${d.angular}…\n` +
            `      react:   …${d.react}…`,
        );
      }
    }

    // Styling, not text: the current page's nav link. Compared by link text,
    // because the two frameworks' class names differ by construction.
    const aNav = activeNavLinks(aHtml).join(',');
    const rNav = activeNavLinks(rHtml).join(',');
    if (aNav !== rNav) {
      problems.push(`active nav link\n      angular: ${aNav || '(none)'}\n      react:   ${rNav || '(none)'}`);
    }
  }

  compared++;
  if (problems.length) {
    differences += problems.length;
    console.log(`✗ ${url}`);
    for (const p of problems) console.log(`    ${p}`);
  } else {
    console.log(`✓ ${url}`);
  }
}

console.log(
  differences === 0
    ? `\nparity-diff: 0 differences across ${compared} route(s)`
    : `\nparity-diff: ${differences} difference(s) across ${compared} route(s)`,
);
process.exit(differences === 0 ? 0 : 1);

/**
 * Report class names that more than one Angular component defines with
 * DIFFERENT rules.
 *
 * Angular's emulated view encapsulation makes such a collision invisible:
 * each component's rules only ever reach its own elements. Flattening those
 * blocks into one global sheet would silently restyle pages, so this is the
 * audit that says which names must stay separated. It is also why this port
 * uses a CSS Module per page rather than one sheet.
 */
async function cssAudit() {
  const pagesDir = resolve(LEGACY_SITE_DIR, 'src/app');
  const files = [];
  (function walk(dir) {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, name.name);
      if (name.isDirectory()) walk(path);
      else if (name.name.endsWith('.component.ts')) files.push(path);
    }
  })(pagesDir);

  // class name -> [{ component, body }]
  const defs = new Map();
  let elementSelectors = 0;

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const block = src.match(/styles:\s*\[`([\s\S]*?)`\]/);
    if (!block) continue;
    const css = block[1];
    const component = file.split('/').slice(-1)[0];

    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = m[1].trim();
      const body = m[2].replace(/\s+/g, ' ').trim();
      if (!selector || selector.startsWith('@')) continue;

      for (const cls of selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
        if (!defs.has(cls[1])) defs.set(cls[1], []);
        defs.get(cls[1]).push({ component, selector, body });
      }
      // A selector with no class anywhere in it is a bare element rule; in a
      // module those go global and leak across pages.
      if (!selector.includes('.') && !selector.startsWith(':')) {
        elementSelectors++;
      }
    }
  }

  let collisions = 0;
  for (const [cls, uses] of [...defs].sort()) {
    const components = new Set(uses.map(u => u.component));
    if (components.size < 2) continue;
    const bodies = new Set(uses.map(u => `${u.selector}|${u.body}`));
    if (bodies.size < 2) continue;
    collisions++;
    console.log(`! .${cls} — defined in ${components.size} components with differing rules`);
    for (const u of uses) console.log(`    ${u.component.padEnd(44)} ${u.selector} { ${u.body.slice(0, 70)} }`);
  }

  console.log(
    `\ncss-audit: ${defs.size} class names across ${files.length} components; ` +
      `${collisions} defined in more than one component with differing rules; ` +
      `${elementSelectors} bare element rule(s) needing an anchor in a module.`,
  );

  // Those collisions are facts about the Angular source, not defects — view
  // encapsulation kept them apart and they are allowed to differ. What has to
  // be true HERE is that the React split still keeps them apart: each name
  // must live in a per-page CSS Module, which hashes it, and never in the one
  // global sheet, which would merge them.
  const reactModules = readdirSync(resolve(REPO_ROOT, 'app/routes'))
    .filter(f => f.endsWith('.module.css'))
    .concat(
      readdirSync(resolve(REPO_ROOT, 'app/components'))
        .filter(f => f.endsWith('.module.css'))
        .map(f => `../components/${f}`),
    );
  const globalSheet = readFileSync(resolve(REPO_ROOT, 'src/styles.css'), 'utf8');

  let unprotected = 0;
  for (const [cls, uses] of defs) {
    if (new Set(uses.map(u => u.component)).size < 2) continue;
    if (new Set(uses.map(u => `${u.selector}|${u.body}`)).size < 2) continue;

    const owners = reactModules.filter(f =>
      new RegExp(`\\.${cls.replace(/[-]/g, '\\-')}\\b`).test(
        readFileSync(resolve(REPO_ROOT, 'app/routes', f), 'utf8'),
      ),
    );
    // Only an UNSCOPED definition in the global sheet would merge the two.
    // styles.css defines `.eyebrow` solely as `app-home .eyebrow`, which
    // applies inside the home page's host element and nowhere else — that is
    // the home page keeping its own variant, not a leak onto the guides.
    const inGlobal = [...globalSheet.matchAll(/([^{}]+)\{/g)].some(m =>
      m[1]
        .split(',')
        .map(x => x.trim())
        .some(
          sel =>
            new RegExp(`\\.${cls.replace(/[-]/g, '\\-')}\\b`).test(sel) &&
            !/\bapp-[a-z-]+\b/.test(sel),
        ),
    );
    const ok = owners.length >= 1 && !inGlobal;
    if (!ok) unprotected++;
    console.log(
      `  ${ok ? 'kept apart' : 'AT RISK   '} .${cls}: ${owners.length} React module(s)` +
        `${inGlobal ? ', ALSO IN THE GLOBAL SHEET' : ''}`,
    );
  }
  console.log(
    unprotected === 0
      ? `css-audit: every colliding name is module-scoped on the React side; none merged.`
      : `css-audit: ${unprotected} colliding name(s) are NOT protected on the React side.`,
  );
  if (unprotected) process.exitCode = 1;
}
