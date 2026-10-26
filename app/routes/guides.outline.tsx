import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.outline.module.css';

/**
 * "Rearrange recordings in the Outline" guide. The hero is the poster from
 * `doc/assets/outline-feature-annotated/` (copied to `public/assets/guides/`),
 * an A-B diagram of the same five recorded text blocks before and after one
 * Outline edit: Figure 1 an indent, Figure 2 a reorder. Two variants exist;
 * the page follows the site theme, resolving `system` against
 * `prefers-color-scheme` the same way `ThemeService` does. Prerender has no
 * `window`, so SSR emits the dark poster and the browser swaps it on
 * hydration. The figure captions drawn inside the poster are repeated as a
 * `figcaption` list from `copy.guides.outline.captions`, so the text is
 * readable and searchable. Prose lives in `copy.json` (`guides.outline`):
 * each section carries a heading and its paragraphs.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesOutline() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.outline;

  // Angular seeded `prefersLight` from matchMedia in the constructor and could
  // therefore pick the right figure on the very first render. React cannot:
  // the prerender has no browser, so the static HTML ships the dark figure and
  // the light one is swapped in after hydration. `siteIsLight` is the shared
  // port of that `themeChoice() === 'light' || (system && prefersLight)` rule.
  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-outline-guide>
      <article className="container prose">
            <p className={css.eyebrow}>{copy.guides.outline.eyebrow}</p>
            <h1>{copy.guides.outline.heading}</h1>
            <p>{copy.guides.outline.intro}</p>
            <figure className={css.diagram}>
              <img
                src={asset(diagramSrc)}
                alt={copy.guides.outline.diagramAlt}
                width="1600"
                height="1620"
                loading="lazy"
                decoding="async" />
              <figcaption>
                {copy.guides.outline.captions.map((cap, $index) => (
      <Fragment key={cap.label}>
                  <p><strong>{cap.label}</strong> {cap.text}</p>
                </Fragment>
      ))}
              </figcaption>
            </figure>
            {copy.guides.outline.sections.map((sec, $index) => (
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
              <Link to={locale.path(copy.guides.outline.seeAlso.path)}>{copy.guides.outline.seeAlso.label}</Link>
            </p>
          </article>
    </app-outline-guide>
  );
}
