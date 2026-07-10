import { Component, ViewEncapsulation } from '@angular/core';
import COPY from '../../content/copy.json';

/**
 * Automation reference. SpeakWith's two recorders can be driven from outside the
 * app via the `speakwith://` URL scheme or AppleScript; this page documents the
 * full command surface. Content lives in `copy.json` (`automation`); code blocks
 * and the reference table are authored as `isHtml` paragraphs.
 */
@Component({
  selector: 'app-automation',
  standalone: true,
  // `[innerHTML]` content (code blocks, the reference table) is injected outside
  // Angular's renderer, so emulated-encapsulation `_ngcontent` attributes never
  // reach it and scoped styles would not apply. Encapsulation.None makes these
  // rules global; every selector is namespaced under `.prose__html`, so nothing
  // leaks to other pages.
  encapsulation: ViewEncapsulation.None,
  template: `
    <article class="container prose">
      <h1>{{ copy.automation.heading }}</h1>
      <p>{{ copy.automation.intro }}</p>
      @for (sec of copy.automation.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          @if (para.isHtml) {
            <div class="prose__html" [innerHTML]="para.text"></div>
          } @else {
            <p>{{ para.text }}</p>
          }
        }
      }
    </article>
  `,
  styles: [`
    .prose__html :is(pre) {
      overflow-x: auto;
      padding: 0.85rem 1rem;
      border-radius: 0.6rem;
      background: var(--surface);
      border: 1px solid var(--rule);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .prose__html :is(code) {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .prose__html :is(p) > code {
      padding: 0.1rem 0.35rem;
      border-radius: 0.35rem;
      background: var(--surface);
      border: 1px solid var(--rule);
      font-size: 0.88em;
    }

    .prose__html table {
      display: block;
      overflow-x: auto;
      width: 100%;
      border-collapse: collapse;
      margin: 0.4rem 0 1rem;
      font-size: 0.92rem;
    }

    .prose__html :is(th, td) {
      text-align: left;
      vertical-align: top;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--rule);
    }

    .prose__html th {
      background: var(--surface);
      font-weight: 700;
    }

    .prose__html td code {
      white-space: nowrap;
    }
  `]
})
export class AutomationComponent {
  protected readonly copy = COPY;
}
