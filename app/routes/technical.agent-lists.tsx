import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { useLocaleApi } from '../lib/locale';
import css from './technical.agent-lists.module.css';

/**
 * Project and model lists. How a program on the Mac fills the Project menu
 * and the Model menu on the Agent tab of the Gumroad app, over the local
 * catalog service the Engine keeps up. Written for people who write such a
 * program; the Send to agent guide is the page for everyone else. Content
 * lives in `copy.json` (`technical.agentLists`); code blocks are authored as
 * `isHtml` paragraphs, the same way the Automation page does it.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function TechnicalAgentLists() {
  const locale = useLocaleApi();
  const { copy } = locale;

  return (
    <app-agent-lists>
      <article className="container prose">
            <p className={css.eyebrow}>{copy.technical.agentLists.eyebrow}</p>
            <h1>{copy.technical.agentLists.heading}</h1>
            <p>{copy.technical.agentLists.intro}</p>
            {copy.technical.agentLists.sections.map((sec, $index) => (
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
            <p className={css['see-also']}>
              <Link to={locale.path(copy.technical.agentLists.seeAlso.path)}>{copy.technical.agentLists.seeAlso.label}</Link>
            </p>
          </article>
    </app-agent-lists>
  );
}
