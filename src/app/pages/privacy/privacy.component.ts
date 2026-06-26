import { Component } from '@angular/core';
import COPY from '../../content/copy.json';

/**
 * Privacy policy. SpeakWith's defining privacy property is that it does its
 * work on the user's own Mac. This page states that plainly.
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <article class="container prose">
      <h1>{{ copy.privacy.heading }}</h1>
      <p class="prose__meta">{{ copy.privacy.meta }}</p>
      <p>{{ copy.privacy.intro }}</p>
      @for (sec of copy.privacy.sections; track sec.heading) {
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
export class PrivacyComponent {
  protected readonly copy = COPY;
}
