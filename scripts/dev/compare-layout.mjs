// Maintainer-only, and historical: compare this build against the legacy
// Angular PRODUCTION BUILD, every route, both colour schemes. See the legacy
// parity section of CONTRIBUTING.md; LEGACY_SITE_DIR names that checkout.
//
// Against the production build, never a dev server: `ng serve` ran with SSR
// and prerender off, so it was not the artifact that shipped.
//
// Serve BOTH builds with a THREADED server. python3's default
// `http.server` is single-threaded and drops concurrent connections, which
// shows up as ERR_CONNECTION_RESET on a stylesheet and then as a bogus height
// difference on whichever route lost the race:
//
//   python3 -c 'import sys,functools;from http.server import *;
//     ThreadingHTTPServer(("127.0.0.1",int(sys.argv[1])),
//       functools.partial(SimpleHTTPRequestHandler,directory=sys.argv[2])).serve_forever()' \
//     <port-a> $LEGACY_SITE_DIR/dist/speakwith-support/browser
//
//   node scripts/dev/compare-layout.mjs http://localhost:<port-a> http://localhost:<port-b>
//
// Checks per route per scheme:
//   * document height within tolerance (a CSS rule that silently failed to
//     apply moves it, which neither text nor head parity can see);
//   * no hydration warning in the console (the whole suite, not just home);
//   * no failed request.
import { chromium } from 'playwright';

const [ANGULAR, REACT] = process.argv.slice(2);
const ROUTES = [
  '/', '/pricing/', '/automation/', '/guides/', '/guides/recorder-badge/',
  '/guides/live-transcript-corrections/', '/guides/status-monitor/',
  '/guides/send-to-agent/', '/guides/outline/', '/guides/context-aware-insertion/',
  '/technical/agent-lists/', '/privacy/', '/terms/', '/404/',
];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 844 },
];
const TOLERANCE = 0.02;

const browser = await chromium.launch();
let failures = 0;

async function measure(context, base, route) {
  const page = await context.newPage();
  const warnings = [];
  const failed = [];
  page.on('console', m => {
    if (/hydrat|did not match|server rendered|server html/i.test(m.text())) warnings.push(m.text());
  });
  page.on('pageerror', e => warnings.push(`pageerror: ${e.message}`));
  page.on('requestfailed', r => {
    if (r.failure()?.errorText === 'net::ERR_ABORTED' && /\.(mp4|webm|mov)/.test(r.url())) return;
    failed.push(`${r.url()} (${r.failure()?.errorText})`);
  });
  page.on('response', r => { if (r.status() >= 400) failed.push(`${r.url()} -> ${r.status()}`); });

  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250); // let the post-hydration theme swap settle
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.close();
  return { height, width, warnings, failed };
}

for (const scheme of ['dark', 'light']) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      colorScheme: scheme,
      viewport: { width: vp.width, height: vp.height },
    });
    console.log(`\n── ${scheme} / ${vp.name} (${vp.width}x${vp.height})`);
    for (const route of ROUTES) {
      const a = await measure(context, ANGULAR, route);
      const r = await measure(context, REACT, route);
      const delta = Math.abs(a.height - r.height);
      const rel = a.height ? delta / a.height : 0;
      const heightOk = rel <= TOLERANCE;
      const overflow = r.width > vp.width + 1;
      const ok = heightOk && !r.warnings.length && !r.failed.length && !overflow;
      if (!ok) failures++;
      console.log(
        `   ${ok ? 'ok  ' : 'FAIL'} ${route.padEnd(40)} ` +
          `ng ${String(a.height).padStart(6)}  react ${String(r.height).padStart(6)}  ` +
          `Δ${(rel * 100).toFixed(1)}%` +
          (r.warnings.length ? `  HYDRATION(${r.warnings.length})` : '') +
          (r.failed.length ? `  REQ(${r.failed.length})` : '') +
          (overflow ? `  H-OVERFLOW ${r.width}px` : ''),
      );
      for (const w of r.warnings.slice(0, 2)) console.log(`        ${w.slice(0, 160)}`);
      for (const f of r.failed.slice(0, 3)) console.log(`        ${f}`);
    }
    await context.close();
  }
}

await browser.close();
console.log(failures ? `\ncompare-layout: ${failures} failure(s)` : `\ncompare-layout: all routes within ${TOLERANCE * 100}% at both schemes and both widths`);
process.exit(failures ? 1 : 0);
