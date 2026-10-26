import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.status-monitor.module.css';

/**
 * "The floating status monitor" guide. The hero is the poster from
 * `doc/assets/status-monitor-annotated/` (copied to `public/assets/guides/`),
 * shipped as SVG so the pill and callouts stay crisp at any width. Two
 * variants exist; the page follows the site theme, resolving `system` against
 * `prefers-color-scheme` the same way `ThemeService` does. Prerender has no
 * `window`, so SSR emits the dark poster and the browser swaps it on
 * hydration. Prose lives in `copy.json` (`guides.statusMonitor`).
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesStatusMonitor() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.statusMonitor;

  // Angular seeded `prefersLight` from matchMedia in the constructor and could
  // therefore pick the right figure on the very first render. React cannot:
  // the prerender has no browser, so the static HTML ships the dark figure and
  // the light one is swapped in after hydration. `siteIsLight` is the shared
  // port of that `themeChoice() === 'light' || (system && prefersLight)` rule.
  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-status-monitor-guide>
      <article className="container prose">
            <p className={css.eyebrow}>{copy.guides.statusMonitor.eyebrow}</p>
            <h1>{copy.guides.statusMonitor.heading}</h1>
            <p>{copy.guides.statusMonitor.intro}</p>
            <figure className={css.diagram}>
              <img
                src={asset(diagramSrc)}
                alt={copy.guides.statusMonitor.diagramAlt}
                width="1600"
                height="1220"
                loading="lazy"
                decoding="async" />
            </figure>
            {copy.guides.statusMonitor.sections.map((sec, $index) => (
      <Fragment key={sec.heading}>
              <h2>{sec.heading}</h2>
              {sec.paragraphs.map((para, $index) => (
      <Fragment key={$index}>
                <p>{para.text}</p>
              </Fragment>
      ))}
            </Fragment>
      ))}
            <p className={css['see-also']}>
              <Link to={locale.path(copy.guides.statusMonitor.seeAlso.path)}>{copy.guides.statusMonitor.seeAlso.label}</Link>
            </p>
          </article>
    </app-status-monitor-guide>
  );
}
