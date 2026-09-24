import { Component, computed, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../services/locale.service';
import { ThemeService } from '../../services/theme.service';

/**
 * "Reading the recorder badge" guide. The hero is the annotated poster from
 * `doc/assets/recorder-status-badge-annotated/` (copied to
 * `public/assets/guides/`), shipped as SVG so the callouts stay crisp at any
 * width. Two variants exist; the page follows the site theme, resolving
 * `system` against `prefers-color-scheme` the same way `ThemeService` does.
 * Prerender has no `window`, so SSR emits the dark poster and the browser
 * swaps it on hydration. Prose lives in `copy.json` (`guides.recorderBadge`).
 */
@Component({
  selector: 'app-recorder-badge-guide',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container prose">
      <p class="eyebrow">{{ copy.guides.recorderBadge.eyebrow }}</p>
      <h1>{{ copy.guides.recorderBadge.heading }}</h1>
      <p>{{ copy.guides.recorderBadge.intro }}</p>
      <figure class="diagram">
        <img
          [src]="diagramSrc()"
          [alt]="copy.guides.recorderBadge.diagramAlt"
          width="1600"
          height="1220"
          loading="lazy"
          decoding="async" />
      </figure>
      @for (sec of copy.guides.recorderBadge.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          <p>{{ para.text }}</p>
        }
      }
      <p class="see-also">
        <a [routerLink]="locale.path(copy.guides.recorderBadge.seeAlso.path)">{{ copy.guides.recorderBadge.seeAlso.label }}</a>
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

    .see-also {
      margin-top: 2rem;
      font-weight: 600;
    }

    .diagram img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 0.8rem;
      border: 1px solid var(--rule);
      box-shadow: var(--shadow);
    }
  `]
})
export class RecorderBadgeGuideComponent {
  /** OS preference, tracked live so `system` follows a daytime switch. */
  private readonly prefersLight = signal(false);

  protected readonly diagramSrc = computed(() => {
    const choice = this.theme.themeChoice();
    const light = choice === 'light' || (choice === 'system' && this.prefersLight());
    const badge = this.copy.guides.recorderBadge;
    return light ? badge.diagramLight : badge.diagramDark;
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
