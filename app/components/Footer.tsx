/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

import { Link } from 'react-router';
import s from './Footer.module.css';
import { useLocaleApi } from '../lib/locale';

/**
 * Shared footer: the secondary link row, the tagline, the build credits and the
 * copyright line.
 *
 * The locale switcher used to live here. It now sits in the sticky header
 * beside the appearance menu (`Navbar.tsx`), and there is exactly one of it —
 * a second copy here would double the crawlable alternates for every page.
 */
export function Footer() {
  const locale = useLocaleApi();
  const { copy } = locale;

  const copyright = copy.app.footer.copyrightHtml
    .replace('{{year}}', String(new Date().getFullYear()))
    .replace('{{ikiSystemsHome}}', copy.links.ikiSystemsHome);

  return (
    <footer className={s.footer}>
      <div className={`container ${s.footer__inner}`}>
        <nav className={s.footer__links} aria-label="Footer">
          <Link to={locale.path('')}>{copy.app.footer.links.home}</Link>
          <Link to={locale.path('automation')}>{copy.app.footer.links.automation}</Link>
          <Link to={locale.path('guides')}>{copy.app.footer.links.guides}</Link>
          <Link to={locale.path('privacy')}>{copy.app.footer.links.privacy}</Link>
          <Link to={locale.path('terms')}>{copy.app.footer.links.terms}</Link>
          <a href={copy.links.supportContactUrl} target="_blank" rel="noopener noreferrer">
            {copy.app.footer.links.contact}
          </a>
        </nav>
        <p>{copy.app.footer.tagline}</p>

        <p className={s.footer__credits}>
          <span className={s['footer__credits-label']}>{copy.app.footer.builtOn.label}</span>
          {copy.app.footer.builtOn.components}
        </p>
        <p className={s.footer__credits}>
          <span className={s['footer__credits-label']}>{copy.app.footer.builtOn.researchLabel}</span>
          <a href={copy.app.footer.builtOn.ctaUrl} target="_blank" rel="noopener noreferrer">
            {copy.app.footer.builtOn.citation}
          </a>
        </p>
        <p className={s.footer__fine} dangerouslySetInnerHTML={{ __html: copyright }} />
      </div>
    </footer>
  );
}
