import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.ai-usage.module.css';

/**
 * "Viewing your AI usage" guide. The hero is the annotated poster from
 * `doc/assets/ai-usage-annotated/` (copied to `public/assets/guides/`),
 * shipped as SVG so the callouts stay crisp. Two variants exist; the page
 * follows the site theme. Prerender has no browser, so the static HTML ships
 * the dark figure and the light one is swapped in after hydration. Prose
 * lives in `copy.json` (`guides.aiUsage`). The numbers on the poster are an
 * invented example.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesAiUsage() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.aiUsage;

  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-ai-usage-guide>
      <article className="container prose">
        <p className={css.eyebrow}>{guide.eyebrow}</p>
        <h1>{guide.heading}</h1>
        <p>{guide.intro}</p>
        <figure className={css.diagram}>
          <img
            src={asset(diagramSrc)}
            alt={guide.diagramAlt}
            width="1600"
            height="1060"
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
        {guide.seeAlso.map(item => (
          <p className={css['see-also']} key={item.path}>
            <Link to={locale.path(item.path)}>{item.label}</Link>
          </p>
        ))}
      </article>
    </app-ai-usage-guide>
  );
}
