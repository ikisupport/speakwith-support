import { useLocation } from 'react-router';
import {
  DEFAULT_LOCALE,
  LOCALES,
  MULTILINGUAL,
  type Copy,
  type LocaleDef,
  copyFor,
  localeDef,
  localizedPath,
} from '../../src/content/copy';
import { resolveRoute } from './route-resolve';

/** One entry in the footer locale switcher. */
export interface SwitcherLink {
  locale: LocaleDef;
  /** Site-relative URL of the current page in that locale (English URL if the page is not localized). */
  href: string;
  current: boolean;
}

/**
 * Active locale, resolved copy, and locale-aware link helpers. Port of the
 * Angular site's `LocaleService`.
 *
 * Angular read the locale from the deepest active route's `data.locale`.
 * Framework routes carry no such data, so the locale is derived from the
 * pathname by `resolveRoute`, which is pure and gives the same answer during
 * prerender and in the browser.
 */
export interface LocaleApi {
  locale: LocaleDef;
  copy: Copy;
  /** Route path of the current page relative to the locale prefix ('' = home). */
  page: string;
  /** False on English-only pages (legal carve-out) and on the 404 page. */
  pageIsLocalized: boolean;
  /** True when more than one locale is active for this build; gates the switcher. */
  multilingual: boolean;
  /** Site-relative link to `routePath` (e.g. `'pricing'`, `''`) in the active locale. */
  path: (routePath: string) => string;
  switcherLinks: SwitcherLink[];
}

export function useLocaleApi(): LocaleApi {
  const { pathname } = useLocation();
  const { locale, page, localized, notFound } = resolveRoute(pathname);
  const copy = copyFor(locale.code);

  const switcherLinks: SwitcherLink[] = [...LOCALES]
    .sort((a, b) => a.endonym.localeCompare(b.endonym))
    .map(l => ({ locale: l, href: localizedPath(page, l), current: l.code === locale.code }));

  return {
    locale,
    copy,
    page,
    // The 404 page is not a localized page, the same as in Angular, where the
    // route carries no `data.localized` and the getter defaults to false.
    pageIsLocalized: localized && !notFound,
    multilingual: MULTILINGUAL,
    path: (routePath: string) => localizedPath(routePath, locale),
    switcherLinks,
  };
}

export { DEFAULT_LOCALE, localeDef };
