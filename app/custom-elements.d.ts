import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/**
 * The per-page wrapper elements `src/styles.css` selects on.
 *
 * The global stylesheet styles eight elements by tag name — `app-root`,
 * `app-home`, `app-pricing`, `app-privacy`, `app-terms`, `app-not-found`,
 * `app-live-transcript-corrections-guide` and `app-send-to-agent-guide` — and
 * the whole home-page section layout hangs off `app-home .home-band` and
 * friends. So each page wraps itself in its own element, which is what scopes
 * a page's share of the global sheet to that page without a `.page-foo` class
 * on every rule.
 *
 * They are valid HTML5 custom element names and React renders them verbatim;
 * nothing is registered or upgraded. Every page wraps itself this way, not
 * only the eight that are currently styled, so a new rule in the global sheet
 * needs no change here.
 */
type Host = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'app-root': Host;
      'app-home': Host;
      'app-pricing': Host;
      'app-automation': Host;
      'app-guides-index': Host;
      'app-recorder-badge-guide': Host;
      'app-status-monitor-guide': Host;
      'app-live-transcript-corrections-guide': Host;
      'app-send-to-agent-guide': Host;
      'app-outline-guide': Host;
      'app-context-aware-insertion-guide': Host;
      'app-agent-lists': Host;
      'app-privacy': Host;
      'app-terms': Host;
      'app-not-found': Host;
    }
  }
}
