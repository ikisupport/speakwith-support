import { Injectable, computed, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  Copy,
  DEFAULT_LOCALE,
  LOCALES,
  LocaleDef,
  ORIGIN,
  copyFor,
  localeDef,
  localizedPath,
} from '../content/copy';

/** One entry in the footer locale switcher. */
export interface SwitcherLink {
  locale: LocaleDef;
  /** Site-relative URL of the current page in that locale (English URL if the page is not localized). */
  href: string;
  current: boolean;
}

/** One `<link rel="alternate" hreflang>` candidate for the current page. */
export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * Active locale, resolved copy, and locale-aware link helpers.
 *
 * The locale is whatever the deepest active route declares in `data.locale`
 * (set by the route factory in `app.routes.ts`). Initial navigation is
 * blocking, so the value is correct before the shell renders, both under
 * prerender and in the browser; later client-side navigations update it via
 * `NavigationEnd`.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly routeState = signal<{ locale: string; page: string; localized: boolean }>({
    locale: DEFAULT_LOCALE,
    page: '',
    localized: true,
  });

  readonly locale = computed<LocaleDef>(() => localeDef(this.routeState().locale));
  readonly copy = computed<Copy>(() => copyFor(this.routeState().locale));
  /** Router path of the current page relative to the locale prefix ('' = home). */
  readonly page = computed(() => this.routeState().page);
  /** False on English-only pages (legal carve-out) and on the 404 page. */
  readonly pageIsLocalized = computed(() => this.routeState().localized);

  readonly switcherLinks = computed<SwitcherLink[]>(() => {
    const current = this.locale();
    const page = this.page();
    return [...LOCALES]
      .sort((a, b) => a.endonym.localeCompare(b.endonym))
      .map(locale => ({ locale, href: localizedPath(page, locale), current: locale.code === current.code }));
  });

  /** True when more than one locale is active for this build; gates the switcher and hreflang. */
  readonly multilingual = LOCALES.length > 1;

  /**
   * Absolute alternates for the current page, plus `x-default`. Empty when the
   * page is not localized or when this build ships a single locale (a lone
   * `en` + `x-default` pair says nothing and would only churn the index).
   */
  readonly alternates = computed<Alternate[]>(() => {
    if (!this.multilingual || !this.pageIsLocalized()) {
      return [];
    }
    const page = this.page();
    const links = LOCALES.map(locale => ({
      hreflang: locale.htmlLang,
      href: `${ORIGIN}${localizedPath(page, locale)}`,
    }));
    links.push({ hreflang: 'x-default', href: `${ORIGIN}${localizedPath(page, localeDef(DEFAULT_LOCALE))}` });
    return links;
  });

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.readRoute());
    this.readRoute();
  }

  /** Site-relative link to `routePath` (e.g. `'pricing'`, `''`) in the active locale. */
  path(routePath: string): string {
    return localizedPath(routePath, this.locale());
  }

  private readRoute(): void {
    let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }
    const data = snapshot.data;
    this.routeState.set({
      locale: (data['locale'] as string | undefined) ?? DEFAULT_LOCALE,
      page: (data['page'] as string | undefined) ?? '',
      localized: (data['localized'] as boolean | undefined) ?? false,
    });
  }
}
