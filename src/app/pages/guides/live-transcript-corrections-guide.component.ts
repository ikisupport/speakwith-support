import { Component, computed, Inject, PLATFORM_ID, signal, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../services/locale.service';
import { ThemeService } from '../../services/theme.service';

/**
 * "Reading live transcript corrections" guide: the in-line word paint (typed,
 * dictated-in, deleted) and the trailing badges (Special Terms rewrite, term
 * spotter, second pass) on a settled live-dictation row.
 * Same shell as the recorder-badge guide: an annotated SVG poster in dark and
 * light variants that follows the site theme (SSR emits dark, the browser swaps
 * on hydration), prose from `copy.json` (`guides.liveTranscriptCorrections`).
 *
 * The symbol tables are authored as `isHtml` paragraphs and injected with
 * `[innerHTML]`, which bypasses emulated encapsulation, so the table rules are
 * global and namespaced under `.corr-html` (the automation page does the same
 * under `.prose__html`).
 */
@Component({
  selector: 'app-live-transcript-corrections-guide',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.None,
  template: `
    <article class="container prose corr">
      <p class="corr__eyebrow">{{ guide.eyebrow }}</p>
      <h1>{{ guide.heading }}</h1>
      <p>{{ guide.intro }}</p>
      <figure class="corr__diagram">
        <img
          [src]="diagramSrc()"
          [alt]="guide.diagramAlt"
          width="1800"
          height="1240"
          loading="lazy"
          decoding="async" />
      </figure>
      @for (sec of guide.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          @if (para.isHtml) {
            <div class="corr-html" [innerHTML]="para.text"></div>
          } @else {
            <p>{{ para.text }}</p>
          }
        }
      }
      <p class="corr__see-also">
        <a [routerLink]="locale.path(guide.seeAlso.path)">{{ guide.seeAlso.label }}</a>
      </p>
    </article>
  `,
  styles: [`
    .corr__eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .corr__diagram {
      margin: 1.6rem 0 2rem;
    }

    .corr__diagram img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 0.8rem;
      border: 1px solid var(--rule);
      box-shadow: var(--shadow);
    }

    .corr__see-also {
      margin-top: 2rem;
      font-weight: 600;
    }

    .corr-html table {
      display: block;
      overflow-x: auto;
      width: 100%;
      border-collapse: collapse;
      margin: 0.4rem 0 1rem;
      font-size: 0.92rem;
    }

    .corr-html :is(th, td) {
      text-align: left;
      vertical-align: top;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--rule);
    }

    .corr-html th {
      background: var(--surface);
      font-weight: 700;
    }

    .corr-html td:first-child {
      white-space: nowrap;
    }

    .corr-html code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.95em;
      color: var(--accent);
    }

    .corr-html p {
      margin: 0.8rem 0 0.4rem;
    }
  `]
})
export class LiveTranscriptCorrectionsGuideComponent {
  /** OS preference, tracked live so `system` follows a daytime switch. */
  private readonly prefersLight = signal(false);

  protected readonly diagramSrc = computed(() => {
    const choice = this.theme.themeChoice();
    const light = choice === 'light' || (choice === 'system' && this.prefersLight());
    return light ? this.guide.diagramLight : this.guide.diagramDark;
  });

  protected get guide() {
    return this.locale.copy().guides.liveTranscriptCorrections;
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
