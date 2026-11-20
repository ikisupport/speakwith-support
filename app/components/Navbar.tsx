/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import s from './Navbar.module.css';
import { useLocaleApi } from '../lib/locale';
import { useTheme, type ThemeChoice } from '../lib/theme';

/**
 * Top navigation bar: SpeakWith wordmark, primary links, and the two controls —
 * a system-aware light/dark theme selector and the locale switcher. Shown on
 * every page via the root shell.
 *
 * The locale switcher is a native `<details>` disclosure whose entries are
 * plain `<a href>` links to the same page in each locale, so a crawler with
 * JavaScript off can follow them. The chevron flips while open and the control
 * stays in place (reversible disclosure). Pages that exist in English only
 * (Privacy, Terms, Contact) link every locale to the English URL and say so.
 * The whole control is omitted when the build has a single active locale.
 */
export function Navbar() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { themeChoice, setTheme } = useTheme();

  /**
   * Close the locale panel after a client-side navigation.
   *
   * The navbar outlives a route change and React does not own a `<details>`
   * element's `open` attribute, so a panel left open by a stray click would
   * hang over the next page. Switching locale is a real navigation (plain
   * `<a href>`) and remounts everything, so this only covers the in-app links.
   */
  const localeDetails = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    localeDetails.current?.removeAttribute('open');
  }, [locale.page, locale.locale.code]);

  /**
   * Port of Angular's `routerLinkActive`, computed from the matched route
   * rather than taken from React Router's `NavLink`.
   *
   * NavLink was tried first and is wrong here. These links are built by
   * `locale.path()`, which returns a TRAILING-SLASH URL ('/pricing/') to match
   * the prerendered directories, and against that NavLink marks a descendant
   * active ('/guides/outline/' lights Guides) while failing the exact case:
   * /pricing/, /guides/, /privacy/ and /terms/ each rendered with no active
   * link at all, where Angular marks one. The navbar sits outside <main>, so
   * the text parity gate could not see it.
   *
   * `page` is the route path relative to the locale prefix, so this also
   * behaves under /de/ without special-casing.
   */
  const isActive = (routePath: string): boolean =>
    routePath === ''
      ? locale.page === ''
      : locale.page === routePath || locale.page.startsWith(`${routePath}/`);

  // `css.active`, not the bare string 'active': a CSS Module hashes the class
  // in Navbar.module.css, so a literal would never match the rule.
  const linkProps = (routePath: string) =>
    isActive(routePath)
      ? { className: s.active, 'aria-current': 'page' as const }
      : {};

  return (
    <header className={s.nav}>
      <div className={`container ${s.nav__inner}`}>
        <Link className={s.wordmark} to={locale.path('')} aria-label="SpeakWith home">
          <img
            className={s.wordmark__icon}
            src="/brand-icon.svg"
            alt=""
            aria-hidden="true"
            width={44}
            height={44}
          />
          {copy.nav.wordmark}
        </Link>

        <nav className={s.nav__links} aria-label="Primary">
          <Link to={locale.path('')} {...linkProps('')}>
            {copy.nav.links.home}
          </Link>
          <Link to={locale.path('guides')} {...linkProps('guides')}>
            {copy.nav.links.guides}
          </Link>
          <Link to={locale.path('privacy')} {...linkProps('privacy')}>
            {copy.nav.links.privacy}
          </Link>
          <Link to={locale.path('terms')} {...linkProps('terms')}>
            {copy.nav.links.terms}
          </Link>
          <Link to={locale.path('pricing')} {...linkProps('pricing')}>
            {copy.nav.links.pricing}
          </Link>
        </nav>

        {/* One group, so a wrap cannot separate the appearance menu from the
            language control. The bar justifies to the end, so this pair stays
            on the right when the German labels push it onto its own line. */}
        <div className={s.nav__controls}>
          <label className={s.theme}>
            <span className="visually-hidden">{copy.nav.theme.label}</span>
            <select
              value={themeChoice}
              onChange={e => setTheme(e.target.value as ThemeChoice)}
              aria-label={copy.nav.theme.label}
            >
              <option value="system">{copy.nav.theme.system}</option>
              <option value="light">{copy.nav.theme.light}</option>
              <option value="dark">{copy.nav.theme.dark}</option>
            </select>
          </label>

          {locale.multilingual && (
            <details className={s.locale} ref={localeDetails}>
              <summary className={s.locale__summary}>
                <svg
                  className={s.locale__globe}
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M2 12h20M4.5 7h15M4.5 17h15" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <span className="visually-hidden">{copy.app.localeSwitcher.label}:</span>
                <span className={s.locale__current} lang={locale.locale.htmlLang}>
                  {locale.locale.endonym}
                </span>
                <svg
                  className={s.locale__chevron}
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M3.5 6l4.5 4.5L12.5 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              {/* The list and the English-only note share one absolutely
                  positioned panel: leaving either in normal flow would make the
                  sticky bar taller as the control opens. */}
              <div className={s.locale__panel}>
                <ul className={s.locale__list} aria-label={copy.app.localeSwitcher.label}>
                  {locale.switcherLinks.map(link => (
                    <li key={link.locale.code}>
                      <a
                        href={link.href}
                        lang={link.locale.htmlLang}
                        hrefLang={link.locale.htmlLang}
                        aria-current={link.current ? 'true' : undefined}
                        className={link.current ? s['locale__link--current'] : undefined}
                      >
                        {link.locale.endonym}
                      </a>
                    </li>
                  ))}
                </ul>
                {!locale.pageIsLocalized && <p className={s.locale__note}>{copy.app.localeSwitcher.legalNote}</p>}
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
