import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { routeEntries } from '../scripts/lib/route-matrix.mjs';

/**
 * Route table, generated per locale from src/app/content/locales.json.
 *
 * English stays unprefixed (`/pricing/`) so existing inbound links and the
 * sitemap keep working; every other locale is mounted under its prefix
 * (`/de/pricing/`). Pages flagged `localized: false` (Privacy, Terms) are
 * registered for the default locale only; the locale switcher and the
 * footer/nav links resolve them to their English URL.
 *
 * The same matrix feeds `react-router.config.ts`'s prerender list and the
 * sitemap, so the set of URLs that exist cannot drift between them.
 *
 * One module serves every locale of a page, so each registration needs an
 * explicit unique id — React Router derives ids from the file path, which
 * would collide the moment the same file is mounted twice.
 */
const MODULES: Record<string, string> = {
  '': 'routes/home.tsx',
  pricing: 'routes/pricing.tsx',
  automation: 'routes/automation.tsx',
  guides: 'routes/guides._index.tsx',
  'guides/recorder-badge': 'routes/guides.recorder-badge.tsx',
  'guides/status-monitor': 'routes/guides.status-monitor.tsx',
  'guides/live-transcript-corrections': 'routes/guides.live-transcript-corrections.tsx',
  'guides/send-to-agent': 'routes/guides.send-to-agent.tsx',
  'guides/outline': 'routes/guides.outline.tsx',
  'guides/context-aware-insertion': 'routes/guides.context-aware-insertion.tsx',
  'technical/agent-lists': 'routes/technical.agent-lists.tsx',
  privacy: 'routes/privacy.tsx',
  terms: 'routes/terms.tsx',
};

export default (async () => {
  const entries = await routeEntries();
  const routes: RouteConfig = [];

  for (const entry of entries) {
    const module = MODULES[entry.routePath];
    if (!module) {
      throw new Error(`no route module mapped for "${entry.routePath}" (from locales.json)`);
    }
    // entry.url is '/', '/pricing/', '/de/pricing/'; React Router wants the
    // path without the surrounding slashes.
    const path = entry.url.replace(/^\/|\/$/g, '');
    const id = `${entry.locale.code}/${entry.routePath || 'home'}`;

    routes.push(path === '' ? index(module, { id }) : route(path, module, { id }));
  }

  // Prerendered to /404/index.html, which the publish step also copies to
  // /404.html — the file GitHub Pages serves for an unmatched URL.
  routes.push(route('404', 'routes/not-found.tsx', { id: 'not-found' }));
  // Client-side fallback for a URL that matches nothing.
  routes.push(route('*', 'routes/not-found.tsx', { id: 'not-found-splat' }));

  return routes;
})() satisfies Promise<RouteConfig>;
