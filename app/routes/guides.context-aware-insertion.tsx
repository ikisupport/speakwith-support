import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.context-aware-insertion.module.css';

/**
 * "How typed-in words find their spacing" guide. The hero is the poster from
 * `guide_design/context_aware_insertion/` (copied to `public/assets/guides/`):
 * Figure A shows the two characters `DictationSpacing.edges` reads around the
 * cursor and the spacing each of four contexts gets; Figure B shows the same
 * two phrases landing in a legible, an opaque, a silent, and a trimming
 * field. Two variants exist; the page follows the site theme, resolving
 * `system` against `prefers-color-scheme` the same way `ThemeService` does.
 * Prerender has no `window`, so SSR emits the dark poster and the browser
 * swaps it on hydration. The figure captions drawn inside the poster are
 * repeated as a `figcaption` list from
 * `copy.guides.contextAwareInsertion.captions`, so the text is readable and
 * searchable. Prose lives in `copy.json` (`guides.contextAwareInsertion`):
 * each section carries a heading and its paragraphs.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesContextAwareInsertion() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.contextAwareInsertion;

  // Angular seeded `prefersLight` from matchMedia in the constructor and could
  // therefore pick the right figure on the very first render. React cannot:
  // the prerender has no browser, so the static HTML ships the dark figure and
  // the light one is swapped in after hydration. `siteIsLight` is the shared
  // port of that `themeChoice() === 'light' || (system && prefersLight)` rule.
  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-context-aware-insertion-guide>
      <article className="container prose">
            <p className={css.eyebrow}>{copy.guides.contextAwareInsertion.eyebrow}</p>
            <h1>{copy.guides.contextAwareInsertion.heading}</h1>
            <p>{copy.guides.contextAwareInsertion.intro}</p>
            <figure className={css.diagram}>
              <img
                src={asset(diagramSrc)}
                alt={copy.guides.contextAwareInsertion.diagramAlt}
                width="1600"
                height="1500"
                loading="lazy"
                decoding="async" />
              <figcaption>
                {copy.guides.contextAwareInsertion.captions.map((cap, $index) => (
      <Fragment key={cap.label}>
                  <p><strong>{cap.label}</strong> {cap.text}</p>
                </Fragment>
      ))}
              </figcaption>
            </figure>
            {copy.guides.contextAwareInsertion.sections.map((sec, $index) => (
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
              <Link to={locale.path(copy.guides.contextAwareInsertion.seeAlso.path)}>{copy.guides.contextAwareInsertion.seeAlso.label}</Link>
            </p>
          </article>
    </app-context-aware-insertion-guide>
  );
}
