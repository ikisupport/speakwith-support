import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { useLocaleApi } from '../lib/locale';
import { cx } from '../lib/cx';
import s from './not-found.module.css';

/**
 * 404 page. Registered twice: at `/404`, which is prerendered so the publish
 * step can copy it to the `404.html` GitHub Pages serves for an unmatched URL,
 * and at the `*` splat for a client-side navigation that matches nothing.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function NotFound() {
  const locale = useLocaleApi();

  return (
    <app-not-found>
      <section className={cx('container', s.nf)}>
        <p className={s.nf__code}>404</p>
        <h1>This page wandered off.</h1>
        <p className={s.nf__lead}>
          The page you were looking for isn't here. It may have moved, or the link may be
          slightly off.
        </p>
        <div className={s.nf__actions}>
          <Link className="button button--primary" to={locale.path('')}>
            Back to home
          </Link>
        </div>
      </section>
    </app-not-found>
  );
}
