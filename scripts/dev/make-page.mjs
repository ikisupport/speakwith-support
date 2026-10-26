#!/usr/bin/env node
// Assemble a React page module + its CSS module from an Angular component,
// using ng2react.mjs for the template and style blocks.
//
// Writes app/routes/<name>.tsx and app/routes/<name>.module.css. The result is
// reviewed and finished by hand — this only removes the retyping. Anything it
// cannot do mechanically is reported on stderr as a TODO rather than guessed
// at, so a page that needs real work says so instead of looking finished.
//
//   node scripts/dev/make-page.mjs <component.ts> <route-name>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../lib/site-content.mjs';

const [componentPath, routeName] = process.argv.slice(2);
if (!componentPath || !routeName) {
  console.error('usage: make-page.mjs <component.ts> <route-name>');
  process.exit(1);
}

const src = readFileSync(componentPath, 'utf8');
const out = execFileSync(
  process.execPath,
  [resolve(REPO_ROOT, 'scripts/dev/ng2react.mjs'), componentPath],
  { encoding: 'utf8' },
);

const css = out.split('/* ===== JSX ===== */')[0].replace('/* ===== CSS ===== */', '').trim();
const jsxRaw = out.split('/* ===== JSX ===== */')[1];
const jsx = jsxRaw.split('/* ===== module classes:')[0].trim();

const selector = (src.match(/selector:\s*'([^']+)'/) ?? [])[1] ?? `app-${routeName}`;
const docComment = (src.match(/\/\*\*[\s\S]*?\*\/\s*@Component/) ?? [''])[0]
  .replace(/\s*@Component$/, '')
  .trim();

/* ---------- what the page needs ---------- */
const needsLocale = /\bcopy\./.test(jsx) || /locale\.path\(/.test(jsx);
const needsTelemetry = /telemetry\.signal\(/.test(jsx);
const needsFragment = /<Fragment\b/.test(jsx);
const needsLink = /<Link\b/.test(jsx);
const needsCx = /\bcx\(/.test(jsx);
const needsStyles = /\bcss[.[]/.test(jsx);
const needsAsset = false; // set by hand where copy.json paths are rendered

/* ---------- members the converter cannot carry over ---------- */
const classBody = src.slice(src.indexOf('export class'));
const members = [...classBody.matchAll(/^\s{2}(?:protected|private|public|readonly)[^\n]*/gm)]
  .map(m => m[0].trim())
  .filter(m => !m.startsWith('protected get copy()') && !m.includes('locale.copy()'));

const body = jsx
  .replace(/telemetry\.signal\(/g, 'signal(')
  .split('\n')
  .map(line => (line.trim() ? `      ${line}` : ''))
  .join('\n');

const imports = [];
if (needsFragment) imports.push(`import { Fragment } from 'react';`);
imports.push(
  needsLink
    ? `import { Link, type MetaArgs } from 'react-router';`
    : `import type { MetaArgs } from 'react-router';`,
);
imports.push(`import { headFor } from '../head';`);
if (needsLocale) imports.push(`import { useLocaleApi } from '../lib/locale';`);
if (needsTelemetry) imports.push(`import { signal } from '../lib/telemetry';`);
if (needsCx) imports.push(`import { cx } from '../lib/cx';`);
if (needsAsset) imports.push(`import { asset } from '../lib/asset';`);
if (needsStyles) imports.push(`import css from './${routeName}.module.css';`);

const componentName = routeName
  .replace(/[._-]([a-z])/g, (_, c) => c.toUpperCase())
  .replace(/^[a-z]/, c => c.toUpperCase())
  .replace(/[^A-Za-z0-9]/g, '');

const tsx = `${imports.join('\n')}

${docComment}
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function ${componentName}() {
${needsLocale ? '  const locale = useLocaleApi();\n  const { copy } = locale;\n' : ''}
  return (
    <${selector}>
${body}
    </${selector}>
  );
}
`;

writeFileSync(resolve(REPO_ROOT, `app/routes/${routeName}.tsx`), tsx);
if (css) {
  writeFileSync(
    resolve(REPO_ROOT, `app/routes/${routeName}.module.css`),
    `/* From ${componentPath.split('/').pop()}'s \`styles\` block. */\n${css}\n`,
  );
}

console.log(`wrote app/routes/${routeName}.tsx${css ? ` + ${routeName}.module.css` : ''}`);
if (members.length) {
  console.error(`  TODO ${routeName}: ${members.length} class member(s) need hand-porting:`);
  for (const m of members) console.error(`    ${m.slice(0, 110)}`);
}
