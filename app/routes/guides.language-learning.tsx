import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.language-learning.module.css';

/**
 * "Practise a language aloud" guide: spoken input language plus translating
 * polish, read as one pair. The hero is the annotated poster from
 * `doc/assets/language-learning-annotated/` (copied to
 * `public/assets/guides/`), shipped as SVG so the callouts stay crisp at any
 * width, and taller than the other posters (1600x1420) because it recreates
 * four panels rather than one badge. Two variants exist; the page follows the
 * site theme. Prerender has no browser, so the static HTML ships the dark
 * figure and the light one is swapped in after hydration, exactly as the
 * recorder-badge guide does. Prose lives in `copy.json`
 * (`guides.languageLearning`).
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesLanguageLearning() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.languageLearning;

  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-language-learning-guide>
      <article className="container prose">
        <p className={css.eyebrow}>{guide.eyebrow}</p>
        <h1>{guide.heading}</h1>
        <p>{guide.intro}</p>
        <figure className={css.diagram}>
          <img
            src={asset(diagramSrc)}
            alt={guide.diagramAlt}
            width="1600"
            height="1420"
            loading="lazy"
            decoding="async" />
        </figure>
        {guide.sections.map(sec => (
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
          <Link to={locale.path(guide.seeAlso.path)}>{guide.seeAlso.label}</Link>
        </p>
      </article>
    </app-language-learning-guide>
  );
}
