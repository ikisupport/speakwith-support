import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import TelemetryDeck from '@telemetrydeck/sdk';
import { TELEMETRY_DECK_APP_ID, TELEMETRY_TEST_HOSTS } from './telemetry.config';

/** Payload values TelemetryDeck accepts; everything is stringified on send. */
type SignalPayload = Record<string, string>;

/**
 * Privacy-conscious site analytics via TelemetryDeck.
 *
 * Two jobs:
 *
 * 1. **Page views.** The CDN Web SDK only fires on a full document load, which
 *    for this SPA means the prerendered entry page and nothing after it. This
 *    service instead mirrors `SeoService`'s `NavigationEnd` subscription so
 *    client-side `routerLink` navigations are counted too. Payload keys match
 *    the Web SDK's (`url`/`host`/`path`/`scheme`/`referer`/`combinedSource`/
 *    `utm_*`) so the dashboard's Website layout works unchanged.
 * 2. **Named CTA signals.** Page views measure traffic; `cta.*` signals measure
 *    intent (pricing, Gumroad buy/trial, newsletter). Purchases themselves are
 *    counted in Gumroad, which stays the source of truth for conversions.
 *
 * Two hard constraints shape the implementation:
 *
 * - **Browser only.** Production builds prerender every route through Node
 *   (`angular.json` `prerender: true`), and this subscription runs there just
 *   as `SeoService`'s does. Every entry point returns early unless
 *   `isPlatformBrowser`, so a build never emits signals.
 * - **No identity.** There is no account, no cookie, and no cross-site
 *   identifier. `clientUser` is a random per-tab string held in `sessionStorage`
 *   (in-memory if that is unavailable), which TelemetryDeck hashes before
 *   storing. It disappears when the tab closes.
 *
 * Disabled by default: with an empty `TELEMETRY_DECK_APP_ID` nothing is
 * constructed and no request is ever made.
 */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  /** sessionStorage key holding the random per-tab visitor string. */
  private static readonly SESSION_KEY = 'speakwith-td-session';

  private readonly isBrowser: boolean;
  private td: TelemetryDeck | null = null;

  /** Absolute URL of the previous page view, used as the SPA referrer. */
  private previousUrl = '';
  /** Last reported path, so the bootstrap page view is never counted twice. */
  private lastPath: string | null = null;
  /** Campaign parameters of the entry URL, captured once at init. */
  private campaign: SignalPayload = {};

  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Begin reporting page views. Called once from the app shell. */
  init(): void {
    if (!this.isBrowser || !TELEMETRY_DECK_APP_ID) {
      return;
    }

    const host = this.doc.defaultView?.location.hostname ?? '';
    this.td = new TelemetryDeck({
      appID: TELEMETRY_DECK_APP_ID,
      clientUser: this.sessionUser(),
      testMode: TELEMETRY_TEST_HOSTS.includes(host) || host.endsWith('.local'),
    });

    this.previousUrl = this.doc.referrer;
    this.campaign = this.campaignParams();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.pageView(e.urlAfterRedirects));

    // Cover the route already active at bootstrap. `withEnabledBlockingInitialNavigation()`
    // makes it ambiguous whether the first NavigationEnd beats this subscription;
    // `lastPath` makes the answer irrelevant instead of double-counting the load.
    this.pageView(this.router.url);
  }

  /**
   * Report a named call-to-action click, e.g. `cta.buy_gumroad`.
   *
   * Fire-and-forget: the click proceeds normally whether or not the signal
   * lands, and a failed request is swallowed rather than surfaced to the user.
   */
  signal(type: string, payload: SignalPayload = {}): void {
    if (!this.td) {
      return;
    }

    void this.td
      .signal(type, { ...this.pageContext(), ...payload })
      .catch(() => undefined);
  }

  private pageView(url: string): void {
    const path = this.normalizePath(url);
    if (!this.td || path === this.lastPath) {
      return;
    }
    this.lastPath = path;

    const absolute = this.absoluteUrl(url);
    const referer = this.previousUrl;
    this.previousUrl = absolute;

    void this.td
      .signal('pageView', {
        ...this.pageContext(url),
        referer,
        'TelemetryDeck.Navigation.identifier': `${referer || 'direct'} -> ${absolute}`,
      })
      .catch(() => undefined);
  }

  /**
   * Location fields shared by every signal, matching the Web SDK's key names,
   * plus the campaign parameters captured at init.
   */
  private pageContext(url: string = this.router.url): SignalPayload {
    const view = this.doc.defaultView;
    return {
      url: this.absoluteUrl(url),
      host: view?.location.hostname ?? '',
      path: this.normalizePath(url),
      scheme: (view?.location.protocol ?? 'https:').replace(':', ''),
      locale: view?.navigator.language ?? '',
      ...this.campaign,
    };
  }

  /**
   * Campaign parameters of the URL the visitor arrived on.
   *
   * Read once at init and replayed on every later signal, because Angular's
   * router drops the query string on client-side navigation unless each link
   * opts into `queryParamsHandling`. Without this snapshot a visit that lands on
   * `/?utm_source=newsletter` and clicks through to `/pricing` would lose its
   * attribution exactly where it matters — on the Gumroad CTA.
   *
   * The server-side derivation is no help either: `url` carries no query string
   * (page identity is path-only), so these explicit keys are the only path by
   * which campaign data reaches the dashboard.
   */
  private campaignParams(): SignalPayload {
    const params = new URLSearchParams(this.doc.defaultView?.location.search ?? '');
    const payload: SignalPayload = {};

    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = params.get(key);
      if (value) {
        payload[key] = value;
      }
    }

    // Web SDK semantics: first match of ref / source / utm_source / src wins.
    const combined =
      params.get('ref') ?? params.get('source') ?? params.get('utm_source') ?? params.get('src');
    if (combined) {
      payload['combinedSource'] = combined;
    }

    return payload;
  }

  /** Path only — query strings and fragments are dropped from the page identity. */
  private normalizePath(url: string): string {
    const path = url.split('#')[0].split('?')[0];
    return path === '' ? '/' : path;
  }

  private absoluteUrl(url: string): string {
    const origin = this.doc.defaultView?.location.origin ?? '';
    return `${origin}${this.normalizePath(url)}`;
  }

  /**
   * Random per-tab identifier. Not a cookie, not shared across sites, and gone
   * when the tab closes; TelemetryDeck hashes it before it is stored.
   */
  private sessionUser(): string {
    const random = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      const store = this.doc.defaultView?.sessionStorage;
      if (!store) {
        return random();
      }
      const existing = store.getItem(TelemetryService.SESSION_KEY);
      if (existing) {
        return existing;
      }
      const fresh = random();
      store.setItem(TelemetryService.SESSION_KEY, fresh);
      return fresh;
    } catch {
      // Private-browsing modes can throw on sessionStorage access.
      return random();
    }
  }
}
