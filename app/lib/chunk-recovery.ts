import { useEffect } from 'react';

const RELOAD_KEY = 'speakwith-chunk-reload-at';
const RELOAD_WINDOW_MS = 10_000;

/**
 * Recover from stale lazy-chunk failures after a deploy. Port of the Angular
 * site's `chunk-error-recovery.ts`.
 *
 * Each build hashes its chunk filenames, so a returning visitor whose browser
 * cached the previous `index.html` requests a lazy route's old chunk, which no
 * longer exists, and lands on a blank page. On such a failure we force a full
 * reload onto the target URL, which fetches the current `index.html` and
 * chunks. A short time-window guard prevents a reload loop if the chunk
 * genuinely cannot load (offline, or a real 404).
 *
 * Angular hooked this on the router's `NavigationError`. Vite raises its own
 * `vite:preloadError` window event for exactly this case, which fires for
 * preloads the router never reports, so that is the primary trigger; the
 * generic `unhandledrejection` path keeps the message-sniffing fallback for
 * browsers that surface the failure only as a rejected dynamic import.
 */
export function useChunkErrorRecovery(): void {
  useEffect(() => {
    const reload = (url: string) => {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RELOAD_KEY) ?? '0');
      } catch {
        /* treat as never reloaded */
      }
      if (Date.now() - last < RELOAD_WINDOW_MS) {
        return; // reloaded moments ago; do not loop
      }
      try {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        /* best effort; the time window simply stops guarding */
      }
      location.assign(url);
    };

    const onPreloadError = (event: Event) => {
      event.preventDefault();
      reload(location.href);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        reload(location.href);
      }
    };

    window.addEventListener('vite:preloadError', onPreloadError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('vite:preloadError', onPreloadError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
}

/** Heuristic match for a dynamic-import / lazy-chunk load failure across browsers. */
function isChunkLoadError(error: unknown): boolean {
  if (error && (error as { name?: string }).name === 'ChunkLoadError') {
    return true;
  }
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
  return (
    message.includes('dynamically imported module') ||
    message.includes('failed to fetch dynamically') ||
    message.includes('loading chunk') ||
    message.includes('importing a module script failed')
  );
}
