import {
  EnvironmentProviders,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationError, Router } from '@angular/router';

const RELOAD_KEY = 'speakwith-chunk-reload-at';
const RELOAD_WINDOW_MS = 10_000;

/**
 * Recover from stale lazy-chunk failures after a deploy.
 *
 * Each build hashes its chunk filenames, so a returning visitor whose browser
 * cached the previous `index.html` requests a lazy route's old chunk, which no
 * longer exists, and lands on a blank page. When the router reports such a
 * failure we force a full reload onto the target URL, which fetches the current
 * `index.html` and chunks. A short time-window guard prevents a reload loop if
 * the chunk genuinely cannot load (offline, or a real 404).
 *
 * Browser-only: on the server the initializer returns without subscribing.
 */
export function provideChunkErrorRecovery(): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    const router = inject(Router);
    router.events.subscribe(event => {
      if (!(event instanceof NavigationError) || !isChunkLoadError(event.error)) {
        return;
      }
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? '0');
      if (Date.now() - last < RELOAD_WINDOW_MS) {
        return; // reloaded moments ago; do not loop
      }
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      location.assign(event.url);
    });
  });
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
