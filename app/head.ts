import type { MetaDescriptor } from 'react-router';
import {
  DEFAULT_LOCALE,
  LOCALES,
  MULTILINGUAL,
  ORIGIN,
  copyFor,
  localeDef,
  localizedPath,
} from '../src/content/copy';
import { resolveRoute } from './lib/route-resolve';

/**
 * Route-aware SEO tags: canonical URL plus Open Graph and Twitter cards.
 * Pure port of the Angular site's `SeoService`, as one function over the
 * pathname rather than a service reacting to NavigationEnd.
 *
 * It returns the COMPLETE set every time. React Router replaces a parent's
 * meta with the leaf's rather than merging them, so a partial return here
 * would silently drop whatever the root contributed.
 *
 * Localization: `<html lang>`, `og:locale`, the canonical URL and one
 * `<link rel="alternate" hreflang>` per shipped locale (plus `x-default`) are
 * derived from the matched route, so `/de/pricing/` declares itself German and
 * points at its siblings rather than at the English page.
 */
const SITE_NAME = 'SpeakWith';
const DEFAULT_DESCRIPTION =
  'SpeakWith is a local-first voice recorder for Mac that turns daily speaking into a searchable, organised daily document. Tuned for speech and dictation, not music or ambient sound. An iOS companion is on the way.';
// Shared 1200x630 social card (public/og-image.png).
const DEFAULT_IMAGE = `${ORIGIN}/og-image.png`;

/** Absolute canonical URL, with a trailing slash to match prerendered dirs. */
function canonicalUrl(pathname: string): string {
  const path = pathname.split('#')[0].split('?')[0];
  if (path === '' || path === '/') {
    return `${ORIGIN}/`;
  }
  return `${ORIGIN}${path.replace(/\/+$/, '')}/`;
}

/**
 * Absolute alternates for the page, plus `x-default`. Empty when the page is
 * not localized or when this build ships a single locale (a lone `en` +
 * `x-default` pair says nothing and would only churn the index).
 */
function alternates(page: string, localized: boolean): MetaDescriptor[] {
  if (!MULTILINGUAL || !localized) {
    return [];
  }
  const links = LOCALES.map(locale => ({
    tagName: 'link' as const,
    rel: 'alternate',
    hreflang: locale.htmlLang,
    href: `${ORIGIN}${localizedPath(page, locale)}`,
  }));
  links.push({
    tagName: 'link' as const,
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${ORIGIN}${localizedPath(page, localeDef(DEFAULT_LOCALE))}`,
  });
  return links;
}

/** The full head for `pathname`: title, description, canonical, og:*, twitter:*. */
export function headFor(pathname: string): MetaDescriptor[] {
  const { locale, page, localized, notFound, def } = resolveRoute(pathname);
  const copy = copyFor(locale.code);
  const seo = notFound
    ? (copy.seo.notFound as { title: string; description?: string })
    : (copy.seo[def!.seoKey] as { title: string; description?: string });

  const title = seo.title ?? SITE_NAME;
  const description = seo.description ?? DEFAULT_DESCRIPTION;
  const image = DEFAULT_IMAGE;
  const canonical = canonicalUrl(pathname);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: canonical },
    ...alternates(page, localized),

    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: title },
    { property: 'og:locale', content: locale.ogLocale },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image:alt', content: title },
    { name: 'twitter:image', content: image },
  ];
}
