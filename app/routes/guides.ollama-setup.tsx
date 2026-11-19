import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.ollama-setup.module.css';

/**
 * Ollama setup guide. The hero is the poster from
 * `doc/assets/ollama-setup-annotated/` (copied to `public/assets/guides/`),
 * shipped as SVG so the panels and their callouts stay crisp. Two variants
 * exist; the page follows the site theme, resolving `system` against
 * `prefers-color-scheme`. Prerender has no `window`, so SSR emits the dark
 * poster and the browser swaps it on hydration. Prose lives in `copy.json`
 * (`guides.ollamaSetup`): each section carries paragraphs and, where the
 * section is a procedure, an ordered `steps` list. A section may carry
 * `figureDark` / `figureLight`. Same theme rule as the hero.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

/** In-article link for a section, or null when that section has none. */
function sectionLink(sec: object): { label: string; path: string } | null {
  const row = sec as { linkLabel?: string; linkPath?: string };
  if (!row.linkLabel || !row.linkPath) {
    return null;
  }
  return { label: row.linkLabel, path: row.linkPath };
}

/** In-article figure for a section, or null when that section has none. */
function sectionFigure(
  sec: object,
  light: boolean,
): { src: string; alt: string; width: number; height: number } | null {
  const row = sec as {
    figureDark?: string;
    figureLight?: string;
    figureAlt?: string;
    figureWidth?: number;
    figureHeight?: number;
  };
  const src = light ? row.figureLight : row.figureDark;
  if (!src) {
    return null;
  }
  return {
    src,
    alt: row.figureAlt ?? '',
    width: row.figureWidth ?? 1280,
    height: row.figureHeight ?? 640,
  };
}

export default function GuidesOllamaSetup() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.ollamaSetup;

  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-ollama-setup-guide>
      <article className="container prose">
        <p className={css.eyebrow}>{guide.eyebrow}</p>
        <h1>{guide.heading}</h1>
        <p>{guide.intro}</p>
        <figure className={css.diagram}>
          <img
            src={asset(diagramSrc)}
            alt={guide.diagramAlt}
            width="1600"
            height="980"
            loading="lazy"
            decoding="async" />
        </figure>
        {guide.sections.map(sec => {
          const link = sectionLink(sec);
          const fig = sectionFigure(sec, siteIsLight);
          return (
            <Fragment key={sec.heading}>
              <h2>{sec.heading}</h2>
              {sec.paragraphs.map((para, $index) => (
                <Fragment key={$index}>
                  <p>{para.text}</p>
                </Fragment>
              ))}
              {link && (
                <p className={css['section-link']}>
                  <Link to={locale.path(link.path)}>{link.label}</Link>
                </p>
              )}
              {fig && (
                <figure className={css.diagram}>
                  <img
                    src={asset(fig.src)}
                    alt={fig.alt}
                    width={fig.width}
                    height={fig.height}
                    loading="lazy"
                    decoding="async" />
                </figure>
              )}
              {(sec.steps?.length ?? 0) > 0 && (
                <ol className={css.steps}>
                  {sec.steps.map((step, $index) => (
                    <Fragment key={$index}>
                      <li>
                        <strong>{step.title}</strong> {step.text}
                        {(step.examples?.length ?? 0) > 0 && (
                          <div className={css.examples}>
                            <p className={css['examples-label']}>{guide.examplesLabel}</p>
                            {step.examples.map((line, $index) => (
                              <Fragment key={$index}>
                                <p>{line}</p>
                              </Fragment>
                            ))}
                          </div>
                        )}
                      </li>
                    </Fragment>
                  ))}
                </ol>
              )}
            </Fragment>
          );
        })}
        {guide.seeAlso.map(item => (
          <p className={css['see-also']} key={item.path}>
            <Link to={locale.path(item.path)}>{item.label}</Link>
          </p>
        ))}
      </article>
    </app-ollama-setup-guide>
  );
}
