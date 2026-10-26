import { Fragment } from 'react';
import type { MetaArgs } from 'react-router';
import { headFor } from '../head';
import { useLocaleApi } from '../lib/locale';
import css from './automation.module.css';

/**
 * Automation reference. SpeakWith's two recorders can be driven from outside the
 * app via the `speakwith://` URL scheme or AppleScript; this page documents the
 * full command surface. Content lives in `copy.json` (`automation`); code blocks
 * and the reference table are authored as `isHtml` paragraphs.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function Automation() {
  const locale = useLocaleApi();
  const { copy } = locale;

  return (
    <app-automation>
      <article className="container prose">
            <h1>{copy.automation.heading}</h1>
            <p>{copy.automation.intro}</p>
            {copy.automation.sections.map((sec, $index) => (
      <Fragment key={sec.heading}>
              <h2>{sec.heading}</h2>
              {sec.paragraphs.map((para, $index) => (
      <Fragment key={$index}>
                {para.isHtml ? (<>
                  <div className={css.prose__html} dangerouslySetInnerHTML={{ __html: para.text }}></div>
                </>) : (<>
                  <p>{para.text}</p>
                </>)}
              </Fragment>
      ))}
            </Fragment>
      ))}
          </article>
    </app-automation>
  );
}
