import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LocaleService } from './locale.service';

/**
 * Route-aware SEO tags: canonical URL plus Open Graph and Twitter cards.
 *
 * Reads the active route's resolved `title` and `data.description` on every
 * navigation and writes the matching `<link rel="canonical">`, `og:*`, and
 * `twitter:*` tags. Because this runs during server-side rendering, every
 * prerendered page ships these tags in its static HTML; the same updates also
 * apply live in the browser as the user navigates between routes.
 *
 * Per-route copy lives in each locale's `copy.seo` and is attached to the
 * route by the factory in `app.routes.ts` (`title` + `data.description`); only
 * the constant site-wide values live here.
 *
 * Localization: `<html lang>`, `og:locale`, the canonical URL and one
 * `<link rel="alternate" hreflang>` per shipped locale (plus `x-default`) are
 * derived from `LocaleService`, so `/de/pricing/` declares itself German and
 * points at its siblings rather than at the English page.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private static readonly ORIGIN = 'https://speakwith.ikisystems.com';
  private static readonly SITE_NAME = 'SpeakWith';
  private static readonly DEFAULT_DESCRIPTION =
    'SpeakWith is a local-first voice recorder for Mac and iOS that turns daily speaking into a searchable, organised daily document. Tuned for speech and dictation, not music or ambient sound.';
  // Shared 1200x630 social card (public/og-image.png).
  private static readonly DEFAULT_IMAGE = `${SeoService.ORIGIN}/og-image.png`;

  constructor(
    private readonly router: Router,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly doc: Document,
    private readonly locale: LocaleService,
  ) {}

  /** Begin reacting to route changes. Called once from the app shell. */
  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.update(e.urlAfterRedirects));

    // Cover the route already active at bootstrap: with blocking initial
    // navigation the first NavigationEnd can fire before this subscription,
    // and each prerendered page boots straight onto its route.
    this.update(this.router.url);
  }

  private update(url: string): void {
    const snapshot = this.deepestSnapshot();
    const title = snapshot.title ?? SeoService.SITE_NAME;
    const description = (snapshot.data['description'] as string | undefined) ?? SeoService.DEFAULT_DESCRIPTION;
    const image = (snapshot.data['ogImage'] as string | undefined) ?? SeoService.DEFAULT_IMAGE;
    const ogType = (snapshot.data['ogType'] as string | undefined) ?? 'website';
    const canonical = this.canonicalUrl(url);
    const locale = this.locale.locale();

    this.doc.documentElement.setAttribute('lang', locale.htmlLang);
    this.meta.updateTag({ name: 'description', content: description });
    this.setCanonical(canonical);
    this.setAlternates();

    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:site_name', content: SeoService.SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: title });
    this.meta.updateTag({ property: 'og:locale', content: locale.ogLocale });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image:alt', content: title });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private deepestSnapshot(): ActivatedRouteSnapshot {
    let snapshot = this.router.routerState.snapshot.root;
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }
    return snapshot;
  }

  /** Absolute canonical URL, with a trailing slash to match prerendered dirs. */
  private canonicalUrl(url: string): string {
    const path = url.split('#')[0].split('?')[0];
    if (path === '' || path === '/') {
      return `${SeoService.ORIGIN}/`;
    }
    return `${SeoService.ORIGIN}${path.replace(/\/+$/, '')}/`;
  }

  /**
   * Replace the `hreflang` alternates with the current page's set. Removing
   * and re-adding keeps the list exact when navigating from a localized page
   * to an English-only one, where the set is empty.
   */
  private setAlternates(): void {
    this.doc.head
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach(link => link.remove());
    for (const alt of this.locale.alternates()) {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', alt.hreflang);
      link.setAttribute('href', alt.href);
      this.doc.head.appendChild(link);
    }
  }

  private setCanonical(href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
