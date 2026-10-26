import { Link } from 'react-router';
import s from './Navbar.module.css';
import { useLocaleApi } from '../lib/locale';
import { useTheme, type ThemeChoice } from '../lib/theme';

/**
 * Top navigation bar: SpeakWith wordmark, primary links, and a system-aware
 * light/dark theme selector. Shown on every page via the root shell.
 */
export function Navbar() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { themeChoice, setTheme } = useTheme();

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
      </div>
    </header>
  );
}
