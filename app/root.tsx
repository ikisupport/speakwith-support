import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  type LinksFunction,
} from 'react-router';
import { useEffect } from 'react';
import { THEME_PREPAINT_JS, THEME_TOKENS_CSS } from './generated/theme-prelude';
import { resolveRoute } from './lib/route-resolve';
import { ThemeProvider } from './lib/theme';
import { useTelemetry } from './lib/telemetry';
import { isChunkLoadError, useChunkErrorRecovery } from './lib/chunk-recovery';
import { useLocaleApi } from './lib/locale';
import { cx } from './lib/cx';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import '@site/styles.css';
import shell from './root.module.css';
import err from './root-error.module.css';

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=20260925b' },
  { rel: 'icon', type: 'image/png', href: '/favicon-32.png?v=20260925b', sizes: '32x32' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png?v=20260925b' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { locale } = resolveRoute(pathname);

  return (
    // suppressHydrationWarning: the pre-paint script below sets `data-theme` on
    // this element before React ever runs, so the server HTML and the live DOM
    // differ by that attribute by design. Without it React logs a hydration
    // mismatch on every page, which would drown the real mismatches the
    // Playwright gate is watching for.
    <html lang={locale.htmlLang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#131418" id="meta-theme-color" />
        {/* Theme tokens are inlined (not in styles.css) so they apply on the very
            first paint, before the deferred stylesheet loads. This is what prevents
            the light-background flash on dark systems. Authored in
            src/theme-tokens.css and src/theme-prepaint.js; see
            scripts/extract-theme-prelude.mjs. */}
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: THEME_TOKENS_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_PREPAINT_JS }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Application shell: sticky navbar, routed page content, shared footer.
 *
 * Angular put SEO and telemetry init in the shell constructor; here the head
 * is a pure `meta` export per route (app/head.ts) and telemetry is an effect,
 * because neither may run during prerender.
 */
export default function App() {
  useTelemetry();
  useChunkErrorRecovery();
  useHashScroll();

  return (
    <ThemeProvider>
      <app-root className={shell.shell}>
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </app-root>
    </ThemeProvider>
  );
}

/**
 * Scroll to `#id` after a navigation that carries a hash.
 *
 * Replaces Angular's `withInMemoryScrolling({ anchorScrolling: 'enabled' })`.
 * `<ScrollRestoration>` covers position restoration but not anchor scrolling,
 * and the hero's `#moments` / `#type-into-app` buttons depend on it.
 */
function useHashScroll() {
  const { hash, key } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) {
      el.scrollIntoView();
    }
  }, [hash, key]);
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    // The boundary replaces `App`, so `ThemeProvider` is mounted here too.
    // Without it React's re-render drops the `data-theme` attribute the
    // pre-paint script set, `:root`'s light default takes over, and a visitor
    // on a dark system gets a light page whose meta-theme-color still says
    // dark. (Measured: data-theme=null, body #faf7f0 under colorScheme=dark.)
    // Navbar and Footer stay out on purpose: if one of those is what threw,
    // rendering it again re-throws and React Router drops to its own bare
    // fallback instead of this page.
    <ThemeProvider>
      <ErrorPage error={error} />
    </ThemeProvider>
  );
}

function ErrorPage({ error }: { error: unknown }) {
  // `useLocaleApi` needs only `useLocation()`, and `Layout` wraps the
  // boundary, so router context — and with it a locale-correct home link — is
  // available here. A bare href="/" would throw a `/de/…` visitor to English.
  const locale = useLocaleApi();
  const t = locale.copy.error;
  const routeError = isRouteErrorResponse(error) ? error : null;
  const staleChunk = isChunkLoadError(error);

  // A route error names its own status; everything else gets the generic line.
  const heading = routeError ? `${routeError.status} ${routeError.statusText}` : t.heading;
  const lead = staleChunk ? t.leadStaleChunk : routeError ? t.leadRequest : t.lead;

  return (
    <main>
      <section className={cx('container', err.err)}>
        <p className={err.err__mark} aria-hidden="true">
          &#9888;
        </p>
        <h1>{heading}</h1>
        <p className={err.err__lead}>{lead}</p>
        <div className={err.err__actions}>
          {/* A button, not an automatic reload: the loop guard that makes
              `useChunkErrorRecovery` safe is private to that hook, and an
              unguarded reload here would spin forever when a chunk is
              genuinely gone. */}
          <button
            type="button"
            className="button button--primary"
            onClick={() => location.reload()}
          >
            {t.reload}
          </button>
          <Link className="button button--ghost" to={locale.path('')}>
            {t.home}
          </Link>
        </div>
        {import.meta.env.DEV && (
          <details className={err.err__details}>
            <summary>Technical details (development build only)</summary>
            <pre className={err.err__trace}>
              {error instanceof Error
                ? `${error.message}\n\n${error.stack ?? '(no stack)'}`
                : String(error)}
            </pre>
          </details>
        )}
      </section>
    </main>
  );
}
