import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import css from './guides.send-to-agent.module.css';

/**
 * "Send to agent" guide. The hero is the poster from
 * `doc/assets/send-to-agent-annotated/` (copied to `public/assets/guides/`),
 * shipped as SVG so the two panels and their callouts stay crisp at any
 * width. Two variants exist; the page follows the site theme, resolving
 * `system` against `prefers-color-scheme` the same way `ThemeService` does.
 * Prerender has no `window`, so SSR emits the dark poster and the browser
 * swaps it on hydration. Prose lives in `copy.json` (`guides.sendToAgent`):
 * each section carries intro paragraphs and, for the tutorial parts, an
 * ordered `steps` list of title, text, and optional example paragraphs.
 * A section may carry `linkLabel` / `linkPath`, one router link rendered
 * after its paragraphs (the program-of-your-own section points at the
 * Project and model lists page this way).
 * A section may also carry `figureDark` / `figureLight` (plus alt and
 * pixel size). Those are the in-article moments: Outline, Agent tab,
 * the message, and the terminal running that prompt. Same theme rule as the
 * hero, dark while prerendering.
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

export default function GuidesSendToAgent() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();
  const guide = copy.guides.sendToAgent;

  // Angular seeded `prefersLight` from matchMedia in the constructor and could
  // therefore pick the right figure on the very first render. React cannot:
  // the prerender has no browser, so the static HTML ships the dark figure and
  // the light one is swapped in after hydration. `siteIsLight` is the shared
  // port of that `themeChoice() === 'light' || (system && prefersLight)` rule.
  const diagramSrc = siteIsLight ? guide.diagramLight : guide.diagramDark;

  return (
    <app-send-to-agent-guide>
      <article className="container prose">
            <p className={css.eyebrow}>{copy.guides.sendToAgent.eyebrow}</p>
            <h1>{copy.guides.sendToAgent.heading}</h1>
            <p>{copy.guides.sendToAgent.intro}</p>
            <figure className={css.diagram}>
              <img
                src={asset(diagramSrc)}
                alt={copy.guides.sendToAgent.diagramAlt}
                width="1600"
                height="1220"
                loading="lazy"
                decoding="async" />
            </figure>
            {copy.guides.sendToAgent.sections.map(sec => {
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
              {link && (<>
                <p className={css['section-link']}><Link to={locale.path(link.path)}>{link.label}</Link></p>
              </>)}
              {fig && (<>
                <figure className={css.diagram}>
                  <img
                    src={asset(fig.src)}
                    alt={fig.alt}
                    width={fig.width}
                    height={fig.height}
                    loading="lazy"
                    decoding="async" />
                </figure>
              </>)}
              {(sec.steps?.length ?? 0) > 0 && (<>
                <ol className={css.steps}>
                  {sec.steps.map((step, $index) => (
      <Fragment key={$index}>
                    <li><strong>{step.title}</strong> {step.text}
                      {(step.examples?.length ?? 0) > 0 && (<>
                        <div className={css.examples}>
                          <p className={css['examples-label']}>{copy.guides.sendToAgent.examplesLabel}</p>
                          {step.examples.map((line, $index) => (
      <Fragment key={$index}>
                            <p>{line}</p>
                          </Fragment>
      ))}
                        </div>
                      </>)}
                    </li>
                  </Fragment>
      ))}
                </ol>
              </>)}
            </Fragment>
              );
            })}
            <p className={css['see-also']}>
              <Link to={locale.path(copy.guides.sendToAgent.seeAlso.path)}>{copy.guides.sendToAgent.seeAlso.label}</Link>
            </p>
          </article>
    </app-send-to-agent-guide>
  );
}
