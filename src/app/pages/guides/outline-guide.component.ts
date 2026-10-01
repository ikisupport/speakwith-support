import { Component, computed, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../services/locale.service';
import { ThemeService } from '../../services/theme.service';

/**
 * "Rearrange recordings in the Outline" guide. The hero is the poster from
 * `doc/assets/outline-feature-annotated/` (copied to `public/assets/guides/`),
 * an A-B diagram of the same five recorded text blocks before and after one
 * Outline edit: Figure 1 an indent, Figure 2 a reorder. Two variants exist;
 * the page follows the site theme, resolving `system` against
 * `prefers-color-scheme` the same way `ThemeService` does. Prerender has no
 * `window`, so SSR emits the dark poster and the browser swaps it on
 * hydration. The figure captions drawn inside the poster are repeated as a
 * `figcaption` list from `copy.guides.outline.captions`, so the text is
 * readable and searchable. Prose lives in `copy.json` (`guides.outline`):
 * each section carries a heading and its paragraphs.
 */
@Component({
  selector: 'app-outline-guide',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container prose">
      <p class="eyebrow">{{ copy.guides.outline.eyebrow }}</p>
      <h1>{{ copy.guides.outline.heading }}</h1>
      <p>{{ copy.guides.outline.intro }}</p>
      <figure class="diagram">
        <img
          [src]="diagramSrc()"
          [alt]="copy.guides.outline.diagramAlt"
          width="1600"
          height="1620"
          loading="lazy"
          decoding="async" />
        <figcaption>
          @for (cap of copy.guides.outline.captions; track cap.label) {
            <p><strong>{{ cap.label }}</strong> {{ cap.text }}</p>
          }
        </figcaption>
      </figure>
      @for (sec of copy.guides.outline.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          <p>{{ para.text }}</p>
        }
      }
      <p class="see-also">
        <a [routerLink]="locale.path(copy.guides.outline.seeAlso.path)">{{ copy.guides.outline.seeAlso.label }}</a>
      </p>
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

    .diagram {
      margin: 1.6rem 0 2rem;
    }

    .diagram img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 0.8rem;
      border: 1px solid var(--rule);
      box-shadow: var(--shadow);
    }

    .diagram figcaption {
      margin-top: 0.9rem;
      color: var(--muted, #6b7280);
      font-size: 0.95rem;
    }

    .diagram figcaption p {
      margin: 0 0 0.35rem;
    }

    .diagram figcaption p:last-child {
      margin-bottom: 0;
    }

    .see-also {
      margin-top: 2rem;
      font-weight: 600;
    }
  `]
})
export class OutlineGuideComponent {
  /** OS preference, tracked live so `system` follows a daytime switch. */
  private readonly prefersLight = signal(false);

  protected readonly figuresAreLight = computed(() => {
    const choice = this.theme.themeChoice();
    return choice === 'light' || (choice === 'system' && this.prefersLight());
  });

  protected readonly diagramSrc = computed(() => {
    const guide = this.copy.guides.outline;
    return this.figuresAreLight() ? guide.diagramLight : guide.diagramDark;
  });

  protected get copy() {
    return this.locale.copy();
  }

  constructor(
    protected readonly locale: LocaleService,
    private readonly theme: ThemeService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    if (isPlatformBrowser(platformId)) {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      this.prefersLight.set(media.matches);
      media.addEventListener('change', e => this.prefersLight.set(e.matches));
    }
  }
}
