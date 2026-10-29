import { Link, type MetaArgs } from 'react-router';
import { useState } from 'react';
import { LOCALES, ROUTE_DEFS, localizedPath } from '../../src/content/copy';
import { cx } from '../lib/cx';
import s from './dev.module.css';

/**
 * Dev-only page index. Registered by `app/routes.ts` ONLY when
 * `NODE_ENV !== 'production'` (the dev server) or `SPEAKWITH_DEV_PAGES=1` is
 * set, so it is absent from the published bundle — `verify-publish-artifact.mjs`
 * greps for the heading below to keep it that way.
 *
 * Why it exists: the root `ErrorBoundary` is reachable only by causing an
 * error, which made it the one page nobody ever looked at. Everything here is
 * a state the site can be in but that no link leads to.
 *
 * Strings are hardcoded English on purpose. This is tooling, not site copy, so
 * it does not belong in copy.json and must never reach a translator.
 */
export const meta = (_: MetaArgs) => [
  { title: 'Dev pages · SpeakWith' },
  { name: 'robots', content: 'noindex, nofollow' },
];

/** Vite's real wording for a stale lazy chunk, which `isChunkLoadError` matches. */
const CHUNK_MESSAGE =
  'Failed to fetch dynamically imported module: /assets/guides-DEADBEEF.js';

export default function DevPages() {
  // The generic and stale-chunk throws happen HERE rather than on a route of
  // their own, so the error page's Reload button lands back on a working
  // gallery instead of re-throwing into a loop.
  const [boom, setBoom] = useState<null | 'generic' | 'chunk'>(null);
  if (boom === 'generic') {
    throw new Error('Deliberate test error from the dev page index.');
  }
  if (boom === 'chunk') {
    throw new Error(CHUNK_MESSAGE);
  }

  return (
    <section className={cx('container', s.dev)}>
      <p className={s.dev__tag}>dev only</p>
      <h1>Dev pages</h1>
      <p className={s.dev__lead}>
        States the site can be in that no link leads to. This page is not in the published
        build.
      </p>

      <h2>Error page</h2>
      <p className={s.dev__note}>
        Each of these renders the root <code>ErrorBoundary</code>. The first two throw from
        this page, so <strong>Reload</strong> on the error page brings you back here. Stack
        traces appear in the collapsed details block on the dev server only.
      </p>
      <div className={s.dev__actions}>
        <button type="button" className="button button--primary" onClick={() => setBoom('generic')}>
          Generic error
        </button>
        <button type="button" className="button button--ghost" onClick={() => setBoom('chunk')}>
          Stale chunk after a deploy
        </button>
      </div>
      <ul className={s.dev__list}>
        <li>
          <Link to="/dev/boom?kind=route&status=503">503 Service Unavailable</Link> — a route
          error, thrown from a loader
        </li>
        <li>
          <Link to="/dev/boom?kind=route&status=404">404 Not Found</Link> — a route error, which
          is <em>not</em> the 404 page below
        </li>
      </ul>

      <h2>Not found</h2>
      <ul className={s.dev__list}>
        <li>
          <Link to="/404/">/404/</Link> — the prerendered document a file host serves for an
          unmatched URL
        </li>
        <li>
          <Link to="/dev/no-such-page">/dev/no-such-page</Link> — the same component reached
          through the client-side splat route
        </li>
      </ul>

      <h2>Every public route</h2>
      <p className={s.dev__note}>
        Active locales only. To switch German on for a local run, set{' '}
        <code>SPEAKWITH_LOCALES=de-DE</code> (or <code>all</code>) in the environment or in the
        git-ignored <code>.env</code> at the repo root, then restart. That is also the only way
        to see the German error copy before the locale ships.
      </p>
      {LOCALES.map(locale => (
        <div key={locale.code}>
          <h3 className={s.dev__localeHead}>
            {locale.endonym} <span className={s.dev__code}>{locale.code}</span>
          </h3>
          <ul className={s.dev__list}>
            {ROUTE_DEFS.filter(def => def.localized || !locale.prefix).map(def => {
              const href = localizedPath(def.path, locale);
              return (
                <li key={href}>
                  <Link to={href}>{href}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
