import EN from './copy.json';
import { ACTIVE_MATRIX, ACTIVE_TRANSLATIONS } from './locales.active';

/**
 * Locale-aware copy resolver.
 *
 * `copy.json` stays the English source of truth and defines the schema. Each
 * `copy.<locale>.json` carries a subset of the top-level sections in the same
 * key shape; any section it omits (today: `privacy` and `terms`, which ship
 * English-canonical everywhere) falls back to English. Section key parity is
 * enforced at build time by `scripts/check-copy-parity.mjs`.
 *
 * Components never import the raw JSON: they read `LocaleService.copy()`,
 * which resolves through `copyFor()` from the active route's `data.locale`.
 *
 * Feature flags: only locales active for this build are imported here, via the
 * generated `locales.active.ts` (see `scripts/resolve-locales.mjs`). A locale
 * whose committed `enabled` flag is false and that is not switched on locally
 * through `SPEAKWITH_LOCALES` has no routes and contributes no strings.
 */
export type Copy = typeof EN;
export type CopySection = keyof Copy;

export interface LocaleDef {
  /** BCP 47 tag used in route data and copy file names, e.g. `de-DE`. */
  code: string;
  /** URL segment; empty string for the unprefixed canonical English site. */
  prefix: string;
  /** Value for `<html lang>` and `hreflang`. */
  htmlLang: string;
  /** Value for `og:locale`. */
  ogLocale: string;
  /** Native-language name shown in the switcher. */
  endonym: string;
}

export interface RouteDef {
  /** Router path segment relative to the locale prefix ('' = home). */
  path: string;
  /** Key into `copy.seo` for the route's title + description. */
  seoKey: keyof Copy['seo'];
  /** False for pages that exist in English only (legal carve-out). */
  localized: boolean;
  /** Sitemap priority; kept as a string so the generator emits it verbatim. */
  priority: string;
}

export const ORIGIN: string = ACTIVE_MATRIX.origin;
export const DEFAULT_LOCALE: string = ACTIVE_MATRIX.defaultLocale;
/** Locales active for this build only (default locale first, always present). */
export const LOCALES: readonly LocaleDef[] = ACTIVE_MATRIX.locales as readonly LocaleDef[];
export const ROUTE_DEFS: readonly RouteDef[] = ACTIVE_MATRIX.routes as readonly RouteDef[];

const TRANSLATIONS = ACTIVE_TRANSLATIONS as Record<string, Partial<Copy>>;

const RESOLVED = new Map<string, Copy>();

/** Full copy object for `locale`; unknown or default locale returns English. */
export function copyFor(locale: string | undefined): Copy {
  const code = locale ?? DEFAULT_LOCALE;
  const cached = RESOLVED.get(code);
  if (cached) {
    return cached;
  }
  const overlay = TRANSLATIONS[code];
  const resolved: Copy = overlay ? ({ ...EN, ...overlay } as Copy) : EN;
  RESOLVED.set(code, resolved);
  return resolved;
}

export function localeDef(code: string | undefined): LocaleDef {
  return LOCALES.find(l => l.code === code) ?? LOCALES.find(l => l.code === DEFAULT_LOCALE)!;
}

/**
 * Site-relative URL (leading slash, trailing slash) for `routePath` in
 * `locale`. A page that is not localized resolves to its English URL so the
 * switcher never links into a 404.
 */
export function localizedPath(routePath: string, locale: LocaleDef): string {
  const def = ROUTE_DEFS.find(r => r.path === routePath);
  const prefix = def && !def.localized ? '' : locale.prefix;
  const segments = [prefix, routePath].filter(Boolean);
  return segments.length ? `/${segments.join('/')}/` : '/';
}
