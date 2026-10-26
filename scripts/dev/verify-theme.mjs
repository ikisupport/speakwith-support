// Verify 12: the settled hero asset and the hydration console, at a forced
// colour scheme.
//
// Playwright is deliberately NOT a dependency of this site — it would be the
// heaviest thing in the tree, for a check that runs by hand. Install it
// somewhere scratch and point this at a served build:
//
//   npm i playwright@1.61.0        # 1.61 matches the chromium already cached
//   (cd build/client && python3 -m http.server 8098)
//   node scripts/dev/verify-theme.mjs <base-url>
//
// Serve the BUILD, not the dev server: the dev server does not prerender, so
// it cannot show a hydration mismatch against prerendered HTML.
//
// `npx playwright screenshot` cannot do this job: the question is not what the
// page looks like but what `img.currentSrc` settles to after hydration and
// whether React logged a hydration mismatch, and a screenshot reports neither.
// The operator's own browser is also not evidence here — Dark Reader repaints
// pages in the Chrome the automation extension drives — so the scheme is
// forced per context instead.
import { chromium } from 'playwright';

const BASE = process.argv[2];
if (!BASE) {
  console.error('usage: verify-theme.mjs <base-url>   # e.g. the URL `npm start` printed');
  process.exit(1);
}
const browser = await chromium.launch();
let failures = 0;

for (const colorScheme of ['dark', 'light']) {
  const context = await browser.newContext({ colorScheme });
  const page = await context.newPage();

  const consoleLines = [];
  const failed = [];
  page.on('console', m => consoleLines.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', e => consoleLines.push(`pageerror: ${e.message}`));
  page.on('requestfailed', r => {
    // A <video preload="metadata"> fetch is aborted by the browser on
    // teardown or when it has the moov atom it wanted. That abort is not a
    // broken reference — check-asset-refs.mjs already proves every src
    // resolves — so it is not counted as a failure.
    if (r.failure()?.errorText === 'net::ERR_ABORTED' && /\.(mp4|webm|mov)/.test(r.url())) return;
    failed.push(`${r.url()} (${r.failure()?.errorText})`);
  });
  page.on('response', r => { if (r.status() >= 400) failed.push(`${r.url()} -> ${r.status()}`); });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  // The hero figure, not the navbar wordmark: the first <img> on the page is
  // the brand icon.
  const hero = await page.evaluate(() => {
    const img = [...document.querySelectorAll('img')].find(i =>
      /canonical_screenshots\/hero/.test(i.getAttribute('src') ?? ''),
    );
    return { src: img?.getAttribute('src') ?? null, currentSrc: img?.currentSrc ?? null };
  });
  const dataTheme = await page.getAttribute('html', 'data-theme');

  const hydration = consoleLines.filter(l =>
    /hydrat|did not match|server rendered|server html/i.test(l),
  );

  const wantLight = colorScheme === 'light';
  const themeOk = dataTheme === (wantLight ? 'light' : 'dark');
  const assetOk = wantLight
    ? /hero-light/.test(hero.src ?? '')
    : /hero\.png/.test(hero.src ?? '');

  console.log(`\n── colorScheme=${colorScheme}`);
  console.log(`   html[data-theme] = ${dataTheme}  ${themeOk ? 'ok' : 'FAIL'}`);
  console.log(`   settled hero src = ${hero.src}  ${assetOk ? 'ok' : 'FAIL'}`);
  console.log(`   hydration warnings: ${hydration.length ? 'FAIL' : 'none'}`);
  for (const h of hydration) console.log(`     ${h}`);
  console.log(`   failed requests: ${failed.length ? 'FAIL' : 'none'}`);
  for (const f of failed.slice(0, 8)) console.log(`     ${f}`);

  if (!themeOk || !assetOk || hydration.length || failed.length) failures++;

  // Client-side navigation: the check that routeDiscovery:'initial' really
  // means no /__manifest fetch against a host that has no such endpoint.
  failed.length = 0;
  await page.click('a[href="/pricing/"]');
  await page.waitForURL('**/pricing/');
  await page.waitForLoadState('networkidle');
  const manifest = failed.filter(f => f.includes('__manifest'));
  console.log(`   after SPA nav to /pricing/: ${failed.length} failed request(s), ${manifest.length} manifest`);
  for (const f of failed.slice(0, 5)) console.log(`     ${f}`);
  if (failed.length) failures++;

  await context.close();
}

await browser.close();
console.log(failures ? `\nverify-theme: ${failures} failure(s)` : '\nverify-theme: all checks passed');
process.exit(failures ? 1 : 0);
