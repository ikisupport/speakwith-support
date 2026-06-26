import { Component } from '@angular/core';
import COPY from '../../content/copy.json';

/**
 * Terms of service. Includes the accuracy disclaimer: automatic
 * transcription and search are aids, not guarantees.
 *
 * This is a plain-language first draft and is not a substitute for review by
 * a qualified legal professional before launch.
 */
@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <article class="container prose">
      <h1>{{ copy.terms.heading }}</h1>
      <p class="prose__meta">{{ copy.terms.meta }}</p>
      <p>{{ copy.terms.intro }}</p>
      @for (sec of copy.terms.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          @if (para.isHtml) {
            <p [innerHTML]="para.text"></p>
          } @else {
            <p>{{ para.text }}</p>
          }
        }
      }
    </article>
  `,
  styles: [`
    .prose__meta {
      color: var(--text-dim);
      font-size: 0.92rem;
      margin-bottom: 1.4rem;
    }
  `]
})
export class TermsComponent {
  protected readonly copy = COPY;
}
