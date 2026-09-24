import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { DEFAULT_LOCALE, LOCALES, LocaleDef, ROUTE_DEFS, copyFor } from './content/copy';

/**
 * Route table, generated per locale from `content/locales.json`.
 *
 * English stays unprefixed (`/pricing/`) so existing inbound links and the
 * sitemap keep working; every other locale is mounted under its prefix
 * (`/de/pricing/`). Pages flagged `localized: false` (Privacy, Terms) are
 * registered for the default locale only; the locale switcher and the
 * footer/nav links resolve them to their English URL.
 *
 * Every page route carries `data.locale`, `data.page` and `data.localized`,
 * which `LocaleService` reads to pick the copy, and `SeoService` reads to emit
 * `<html lang>`, `hreflang` alternates and a locale-correct canonical. Titles
 * and descriptions come from the locale's `copy.seo`, so a translated file
 * localizes the `<title>` and meta description as well.
 *
 * Prerender discovers the tree from this config, so no route list needs to be
 * maintained in `angular.json`.
 */
function pageRoutes(locale: LocaleDef): Routes {
  const copy = copyFor(locale.code);
  const isDefault = locale.code === DEFAULT_LOCALE;

  const meta = (path: string) => {
    const def = ROUTE_DEFS.find(r => r.path === path)!;
    const seo = copy.seo[def.seoKey] as { title: string; description?: string };
    return {
      title: seo.title,
      data: {
        description: seo.description,
        locale: locale.code,
        page: def.path,
        localized: def.localized,
      },
    };
  };

  const routes: Routes = [
    { path: '', component: HomeComponent, ...meta('') },
    {
      path: 'pricing',
      loadComponent: () =>
        import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
      ...meta('pricing'),
    },
    {
      path: 'automation',
      loadComponent: () =>
        import('./pages/automation/automation.component').then(m => m.AutomationComponent),
      ...meta('automation'),
    },
    {
      path: 'guides',
      loadComponent: () =>
        import('./pages/guides/guides-index.component').then(m => m.GuidesIndexComponent),
      ...meta('guides'),
    },
    {
      path: 'guides/recorder-badge',
      loadComponent: () =>
        import('./pages/guides/recorder-badge-guide.component').then(m => m.RecorderBadgeGuideComponent),
      ...meta('guides/recorder-badge'),
    },
    {
      path: 'guides/live-transcript-corrections',
      loadComponent: () =>
        import('./pages/guides/live-transcript-corrections-guide.component').then(
          m => m.LiveTranscriptCorrectionsGuideComponent,
        ),
      ...meta('guides/live-transcript-corrections'),
    },
  ];

  if (isDefault) {
    routes.push(
      { path: 'privacy', component: PrivacyComponent, ...meta('privacy') },
      { path: 'terms', component: TermsComponent, ...meta('terms') },
    );
  }

  return routes;
}

const defaultLocale = LOCALES.find(l => l.code === DEFAULT_LOCALE)!;
const notFoundTitle = copyFor(DEFAULT_LOCALE).seo.notFound.title;

export const routes: Routes = [
  ...pageRoutes(defaultLocale),
  ...LOCALES.filter(l => l.prefix).map(locale => ({
    path: locale.prefix,
    children: pageRoutes(locale),
  })),
  { path: '404', component: NotFoundComponent, title: notFoundTitle },
  { path: '**', component: NotFoundComponent, title: notFoundTitle },
];
