import { Link, type ClientLoaderFunctionArgs, type MetaArgs } from 'react-router';
import { cx } from '../lib/cx';
import s from './dev.module.css';

/**
 * Dev-only route-error trigger, registered alongside `routes/dev.tsx`.
 *
 * `isRouteErrorResponse` matches only an error React Router itself built from a
 * loader or action throw — a `Response` thrown during render arrives raw and
 * takes the generic branch instead. So the throw has to happen in a loader,
 * which is the whole reason this is a route rather than another button on the
 * gallery.
 *
 * `clientLoader` has no `hydrate = true`, so it runs on a client-side
 * navigation from the gallery but NOT on a direct load or a reload. That is
 * deliberate: the error page's Reload button then lands on the body below
 * rather than throwing again.
 */
export const meta = (_: MetaArgs) => [
  { title: 'Dev trigger · SpeakWith' },
  { name: 'robots', content: 'noindex, nofollow' },
];

const STATUS_TEXT: Record<string, string> = {
  '400': 'Bad Request',
  '403': 'Forbidden',
  '404': 'Not Found',
  '500': 'Internal Server Error',
  '503': 'Service Unavailable',
};

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get('kind') !== 'route') {
    return null;
  }
  const status = url.searchParams.get('status') ?? '503';
  throw new Response(null, {
    status: Number(status),
    statusText: STATUS_TEXT[status] ?? 'Dev Test Error',
  });
}

export default function DevBoom() {
  return (
    <section className={cx('container', s.dev)}>
      <p className={s.dev__tag}>dev only</p>
      <h1>Nothing was thrown</h1>
      <p className={s.dev__lead}>
        This trigger throws from a client loader, which does not run on a direct load or a
        reload. Go back and follow the link from the index.
      </p>
      <div className={s.dev__actions}>
        <Link className="button button--primary" to="/dev">
          Back to dev pages
        </Link>
      </div>
    </section>
  );
}
