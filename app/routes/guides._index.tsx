import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { useLocaleApi } from '../lib/locale';
import { cx } from '../lib/cx';
import css from './guides._index.module.css';

/**
 * Guides index. Reference material about what the app shows on screen, kept
 * off the marketing pages on purpose: a diagram that explains the recorder
 * badge is documentation, not a hero band. One card per guide, driven by
 * `copy.guides.index.cards`; each card's `path` is a router path relative to
 * the locale prefix so the same list works under `/de/`.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function GuidesIndex() {
  const locale = useLocaleApi();
  const { copy } = locale;

  return (
    <app-guides-index>
      <article className="container prose">
            <p className={css.eyebrow}>{copy.guides.index.eyebrow}</p>
            <h1>{copy.guides.index.heading}</h1>
            <p>{copy.guides.index.intro}</p>
            <div className={css['guide-grid']}>
              {copy.guides.index.cards.map((card, $index) => (
      <Fragment key={card.path}>
                <Link className={cx("card", css['guide-card'])} to={locale.path(card.path)}>
                  <h2>{card.title}</h2>
                  <p>{card.body}</p>
                  <span className={css['guide-card__cta']}>{card.cta}</span>
                </Link>
              </Fragment>
      ))}
            </div>
          </article>
    </app-guides-index>
  );
}
