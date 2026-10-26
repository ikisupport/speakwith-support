import { Fragment } from 'react';
import type { MetaArgs } from 'react-router';
import { headFor } from '../head';
import { useLocaleApi } from '../lib/locale';
import s from './privacy.module.css';

/**
 * Privacy policy. SpeakWith's defining privacy property is that it does its
 * work on the user's own Mac. This page states that plainly.
 *
 * One of the two `localized: false` routes: registered for the default locale
 * only, so /de/privacy/ is a 404 rather than an untranslated legal page.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function Privacy() {
  const { copy } = useLocaleApi();

  return (
    <app-privacy>
      <article className="container prose">
        <h1>{copy.privacy.heading}</h1>
        <p className={s.prose__meta}>{copy.privacy.meta}</p>
        <p>{copy.privacy.intro}</p>
        {copy.privacy.sections.map(sec => (
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
    </app-privacy>
  );
}
