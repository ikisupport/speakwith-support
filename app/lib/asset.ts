/**
 * Absolute URL for a static asset path as copy.json writes it.
 *
 * copy.json stores every image, video and poster path relative
 * ('assets/screenshots/x.png?v=1'). No `<base href="/">` ships — a base tag
 * would also rewrite the in-page `#fragment` links the hero uses — so each
 * path is made root-absolute here instead. Without this, every image on a
 * nested route such as /guides/outline/ would 404 while the page's text and
 * head tags still looked right. `npm run check:assets` is the gate.
 */
export function asset(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('/')) {
    return path;
  }
  return `/${path}`;
}
