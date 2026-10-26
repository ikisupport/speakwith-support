import { Fragment } from 'react';
import type { MetaArgs } from 'react-router';
import { headFor } from '../head';
import { useLocaleApi } from '../lib/locale';
import s from './terms.module.css';

/**
 * Terms of service. Includes the accuracy disclaimer: automatic transcription
 * and search are aids, not guarantees.
 *
 * This is a plain-language first draft and is not a substitute for review by
 * a qualified legal professional before launch.
 *
 * The other `localized: false` route; see privacy.tsx.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function Terms() {
  const { copy } = useLocaleApi();

  return (
    <app-terms>
      <article className="container prose">
        <h1>{copy.terms.heading}</h1>
        <p className={s.prose__meta}>{copy.terms.meta}</p>
        <p>{copy.terms.intro}</p>
        {copy.terms.sections.map(sec => (
          <Fragment key={sec.heading}>
            <h2>{sec.heading}</h2>
            {sec.paragraphs.map((para, $index) => (
              <Fragment key={$index}>
                {'isHtml' in para && para.isHtml ? (
                  <p dangerouslySetInnerHTML={{ __html: para.text }} />
                ) : (
                  <p>{para.text}</p>
                )}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </article>
    </app-terms>
  );
}
