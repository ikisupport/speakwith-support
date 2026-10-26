import { Link } from 'react-router';
import s from './Footer.module.css';
import { useLocaleApi } from '../lib/locale';
import { signal } from '../lib/telemetry';

/**
 * Shared footer, carrying the locale switcher.
 *
 * The switcher is a native `<details>` disclosure whose entries are plain
 * `<a href>` links to the same page in each locale, so a crawler with
 * JavaScript off can follow them. The chevron flips while open and the control
 * stays in place (reversible disclosure). Pages that exist in English only
 * (Privacy, Terms) link every locale to the English URL and say so. The whole
 * control is omitted when the build has a single active locale.
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
          <a
            href={copy.links.newsletter}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => signal('cta.newsletter', { placement: 'footer' })}
          >
            {copy.app.footer.links.newsletter}
          </a>
          <a
            href={copy.links.x}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => signal('cta.x', { placement: 'footer' })}
          >
            {copy.app.footer.links.x}
          </a>
          <a href={copy.links.ikiSystemsHome} target="_blank" rel="noopener noreferrer">
            {copy.app.footer.links.ikiSystems}
          </a>
        </nav>
        <p>{copy.app.footer.tagline}</p>

        {locale.multilingual && (
          <details className={s.locale}>
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
          </details>
        )}

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
