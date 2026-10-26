import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.live-transcript-corrections.module.css';

/**
 * "Reading live transcript corrections" guide: the in-line word paint (typed,
 * dictated-in, deleted) and the trailing badges (Special Terms rewrite, term
 * spotter, second pass) on a settled live-dictation row.
 * Same shell as the recorder-badge guide: an annotated SVG poster in dark and
 * light variants that follows the site theme (SSR emits dark, the browser swaps
 * on hydration), prose from `copy.json` (`guides.liveTranscriptCorrections`).
 *
 * The symbol tables are authored as `isHtml` paragraphs and injected with
 * `[innerHTML]`, which bypasses emulated encapsulation, so the table rules are
 * global and namespaced under `.corr-html` (the automation page does the same
 * under `.prose__html`).
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesLiveTranscriptCorrections() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.liveTranscriptCorrections;

  // Angular seeded `prefersLight` from matchMedia in the constructor and could
  // therefore pick the right figure on the very first render. React cannot:
  // the prerender has no browser, so the static HTML ships the dark figure and
  // the light one is swapped in after hydration. `siteIsLight` is the shared
  // port of that `themeChoice() === 'light' || (system && prefersLight)` rule.
  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-live-transcript-corrections-guide>
      <article className="container prose corr">
            <p className={css.corr__eyebrow}>{guide.eyebrow}</p>
            <h1>{guide.heading}</h1>
            <p>{guide.intro}</p>
            <figure className={css.corr__diagram}>
              <img
                src={asset(diagramSrc)}
                alt={guide.diagramAlt}
                width="1800"
                height="1240"
                loading="lazy"
                decoding="async" />
            </figure>
            {guide.sections.map((sec, $index) => (
      <Fragment key={sec.heading}>
              <h2>{sec.heading}</h2>
              {sec.paragraphs.map((para, $index) => (
      <Fragment key={$index}>
                {para.isHtml ? (<>
                  <div className={css['corr-html']} dangerouslySetInnerHTML={{ __html: para.text }}></div>
                </>) : (<>
                  <p>{para.text}</p>
                </>)}
              </Fragment>
      ))}
            </Fragment>
      ))}
            <p className={css['corr__see-also']}>
              <Link to={locale.path(guide.seeAlso.path)}>{guide.seeAlso.label}</Link>
            </p>
          </article>
    </app-live-transcript-corrections-guide>
  );
}
