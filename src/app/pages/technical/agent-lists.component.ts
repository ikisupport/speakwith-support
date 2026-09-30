import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../services/locale.service';

/**
 * Project and model lists. How a program on the Mac fills the Project menu
 * and the Model menu on the Agent tab of the Gumroad app, over the local
 * catalog service the Engine keeps up. Written for people who write such a
 * program; the Send to agent guide is the page for everyone else. Content
 * lives in `copy.json` (`technical.agentLists`); code blocks are authored as
 * `isHtml` paragraphs, the same way the Automation page does it.
 */
@Component({
  selector: 'app-agent-lists',
  standalone: true,
  imports: [RouterLink],
  // `[innerHTML]` content (the code blocks) is injected outside Angular's
  // renderer, so emulated-encapsulation `_ngcontent` attributes never reach it
  // and scoped styles would not apply. Encapsulation.None makes these rules
  // global; every selector is namespaced under `.prose__html`, so nothing leaks
  // to other pages (the Automation page declares the same rules).
  encapsulation: ViewEncapsulation.None,
  template: `
    <article class="container prose">
      <p class="eyebrow">{{ copy.technical.agentLists.eyebrow }}</p>
      <h1>{{ copy.technical.agentLists.heading }}</h1>
      <p>{{ copy.technical.agentLists.intro }}</p>
      @for (sec of copy.technical.agentLists.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          @if (para.isHtml) {
            <div class="prose__html" [innerHTML]="para.text"></div>
          } @else {
            <p>{{ para.text }}</p>
          }
        }
      }
      <p class="see-also">
        <a [routerLink]="locale.path(copy.technical.agentLists.seeAlso.path)">{{ copy.technical.agentLists.seeAlso.label }}</a>
      </p>
    </article>
  `,
  styles: [`
    .prose .eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .prose .see-also {
      margin-top: 2rem;
      font-weight: 600;
    }

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
  `]
})
export class AgentListsComponent {
  protected get copy() {
    return this.locale.copy();
  }

  constructor(protected readonly locale: LocaleService) {}
}
