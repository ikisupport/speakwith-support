import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import TelemetryDeck from '@telemetrydeck/sdk';
// The app ID and the test-host list are shared config, not page code; the
// `localhost` entry already covers every local preview, because the port is not
// part of the hostname check.
import { TELEMETRY_DECK_APP_ID, TELEMETRY_TEST_HOSTS } from '@site/app/services/telemetry.config';

/** Payload values TelemetryDeck accepts; everything is stringified on send. */
type SignalPayload = Record<string, string>;

/** sessionStorage key holding the random per-tab visitor string. */
const SESSION_KEY = 'speakwith-td-session';

/**
 * Privacy-conscious site analytics via TelemetryDeck.
 *
 * Two jobs: page views (the CDN Web SDK only fires on a full document load,
 * which for this SPA means the entry page and nothing after it, so client-side
 * navigations are counted here instead) and named `cta.*` signals, which
 * measure intent rather than traffic.
 *
 * Two hard constraints shape it:
 *
 * - **Browser only.** Every route is prerendered through Node, and an effect
 *   never runs there, which is why this is a hook and not module-level code.
 * - **No identity.** No account, no cookie, no cross-site identifier.
 *   `clientUser` is a random per-tab string in `sessionStorage` (in-memory if
 *   unavailable), hashed by TelemetryDeck before storage, gone with the tab.
 *
 * Disabled by default: with an empty `TELEMETRY_DECK_APP_ID` nothing is
 * constructed and no request is ever made.
 */
let td: TelemetryDeck | null = null;
let previousUrl = '';
let lastPath: string | null = null;
let campaign: SignalPayload = {};

function random(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sessionUser(): string {
  try {
    const store = window.sessionStorage;
    const existing = store.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = random();
    store.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private-browsing modes can throw on sessionStorage access.
    return random();
  }
}

/** Path only — query strings and fragments are dropped from the page identity. */
function normalizePath(url: string): string {
  const path = url.split('#')[0].split('?')[0];
  return path === '' ? '/' : path;
}

function absoluteUrl(url: string): string {
  return `${window.location.origin}${normalizePath(url)}`;
}

/**
 * Campaign parameters of the URL the visitor arrived on, read once and
 * replayed on every later signal: client-side navigation drops the query
 * string, so a visit landing on `/?utm_source=newsletter` would otherwise lose
 * its attribution exactly where it matters, on the Gumroad CTA.
 */
function campaignParams(): SignalPayload {
  const params = new URLSearchParams(window.location.search);
  const payload: SignalPayload = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key);
    if (value) payload[key] = value;
  }
  // Web SDK semantics: first match of ref / source / utm_source / src wins.
  const combined =
    params.get('ref') ?? params.get('source') ?? params.get('utm_source') ?? params.get('src');
  if (combined) payload['combinedSource'] = combined;
  return payload;
}

function pageContext(url: string): SignalPayload {
  return {
    url: absoluteUrl(url),
    host: window.location.hostname,
    path: normalizePath(url),
    scheme: window.location.protocol.replace(':', ''),
    locale: window.navigator.language,
    ...campaign,
  };
}

/**
 * Report a named call-to-action click, e.g. `cta.buy_gumroad`.
 *
 * Fire-and-forget: the click proceeds normally whether or not the signal
 * lands, and a failed request is swallowed rather than surfaced to the user.
 * Safe to call during prerender, where it is a no-op.
 */
export function signal(type: string, payload: SignalPayload = {}): void {
  if (!td || typeof window === 'undefined') return;
  void td
    .signal(type, { ...pageContext(window.location.pathname), ...payload })
    .catch(() => undefined);
}

function pageView(url: string): void {
  const path = normalizePath(url);
  if (!td || path === lastPath) return;
  lastPath = path;

  const absolute = absoluteUrl(url);
  const referer = previousUrl;
  previousUrl = absolute;

  void td
    .signal('pageView', {
      ...pageContext(url),
      referer,
      'TelemetryDeck.Navigation.identifier': `${referer || 'direct'} -> ${absolute}`,
    })
    .catch(() => undefined);
}

/** Initialise once, then report a page view on every navigation. */
export function useTelemetry(): void {
  const { pathname } = useLocation();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !TELEMETRY_DECK_APP_ID) return;
    started.current = true;

    const host = window.location.hostname;
    td = new TelemetryDeck({
      appID: TELEMETRY_DECK_APP_ID,
      clientUser: sessionUser(),
      testMode: TELEMETRY_TEST_HOSTS.includes(host) || host.endsWith('.local'),
    });
    previousUrl = document.referrer;
    campaign = campaignParams();
  }, []);

  useEffect(() => {
    pageView(pathname);
  }, [pathname]);
}
