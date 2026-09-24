import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../services/locale.service';

/**
 * Guides index. Reference material about what the app shows on screen, kept
 * off the marketing pages on purpose: a diagram that explains the recorder
 * badge is documentation, not a hero band. One card per guide, driven by
 * `copy.guides.index.cards`; each card's `path` is a router path relative to
 * the locale prefix so the same list works under `/de/`.
 */
@Component({
  selector: 'app-guides-index',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container prose">
      <p class="eyebrow">{{ copy.guides.index.eyebrow }}</p>
      <h1>{{ copy.guides.index.heading }}</h1>
      <p>{{ copy.guides.index.intro }}</p>
      <div class="guide-grid">
        @for (card of copy.guides.index.cards; track card.path) {
          <a class="card guide-card" [routerLink]="locale.path(card.path)">
            <h2>{{ card.title }}</h2>
            <p>{{ card.body }}</p>
            <span class="guide-card__cta">{{ card.cta }}</span>
          </a>
        }
      </div>
    </article>
  `,
  styles: [`
    .eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .guide-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      gap: 1.2rem;
      margin-top: 1.6rem;
    }

    .guide-card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: inherit;
      text-decoration: none;
    }

    .guide-card h2 {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 1.15rem;
    }

    .guide-card p {
      margin: 0;
      flex: 1 0 auto;
    }

    .guide-card__cta {
      font-weight: 600;
      color: var(--accent);
    }

    .guide-card:hover h2 {
      color: var(--accent);
    }
  `]
})
export class GuidesIndexComponent {
  protected get copy() {
    return this.locale.copy();
  }

  constructor(protected readonly locale: LocaleService) {}
}
