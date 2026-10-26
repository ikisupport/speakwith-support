#!/usr/bin/env node
// Truth table for resolveRoute(). Not a framework test — a plain assertion
// script, because this one pure function stands in for everything Angular
// attached as per-route `data` and every head tag depends on it.
import { routeEntries, activeMatrix } from './lib/route-matrix.mjs';

const matrix = await activeMatrix();
const entries = await routeEntries(matrix);
const known = new Set(entries.map(e => e.url));

// Mirror of app/lib/route-resolve.ts, which cannot be imported from a plain
// .mjs (it is TypeScript and pulls in the aliased copy.json). This checks the
// RULES against the generated matrix; the real function is checked end to end
// by parity-diff.mjs, where every page's <html lang> and canonical URL come
// out of it and are compared against the Angular build.
const PREFIXED = matrix.locales.filter(l => l.prefix);
function resolveRoute(pathname) {
  const segs = pathname.split('#')[0].split('?')[0].split('/').filter(Boolean);
  const prefixed = segs.length ? PREFIXED.find(l => l.prefix === segs[0]) : undefined;
  const locale = prefixed ?? matrix.locales.find(l => l.code === matrix.defaultLocale);
  const rest = prefixed ? segs.slice(1) : segs;
  const page = rest.join('/');
  if (page === '404') return { locale: matrix.defaultLocale, page: '404', notFound: true };
  const def = matrix.routes.find(r => r.path === page);
  if (!def || (!def.localized && prefixed)) return { locale: locale.code, page, notFound: true };
  return { locale: locale.code, page, notFound: false };
}

const cases = [
  ['/',               { locale: 'en', page: '',        notFound: false }],
  ['/pricing',        { locale: 'en', page: 'pricing', notFound: false }],
  ['/pricing/',       { locale: 'en', page: 'pricing', notFound: false }],
  ['/pricing/?a=1#x', { locale: 'en', page: 'pricing', notFound: false }],
  ['/privacy/',       { locale: 'en', page: 'privacy', notFound: false }],
  ['/404/',           { locale: 'en', page: '404',     notFound: true  }],
  ['/nope/',          { locale: 'en', page: 'nope',    notFound: true  }],
  ['/guides/outline/',{ locale: 'en', page: 'guides/outline', notFound: false }],
];
// Only meaningful when de-DE is switched on; skipped otherwise rather than
// asserted wrongly.
if (PREFIXED.some(l => l.prefix === 'de')) {
  cases.push(['/de/pricing/', { locale: 'de-DE', page: 'pricing', notFound: false }]);
  cases.push(['/de/privacy/', { locale: 'de-DE', page: 'privacy', notFound: true }]);
}

let failed = 0;
for (const [input, want] of cases) {
  const got = resolveRoute(input);
  const ok = got.locale === want.locale && got.page === want.page && got.notFound === want.notFound;
  if (!ok) failed++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${input.padEnd(20)} -> locale=${got.locale} page=${JSON.stringify(got.page)} notFound=${got.notFound}`,
  );
}

// Every prerendered URL must resolve to a real route.
for (const url of known) {
  if (resolveRoute(url).notFound) {
    console.log(`  FAIL prerendered ${url} resolves to notFound`);
    failed++;
  }
}

console.log(failed ? `resolve-route: ${failed} failure(s)` : `resolve-route: ok (${cases.length} cases + ${known.size} prerendered URLs)`);
process.exit(failed ? 1 : 0);
