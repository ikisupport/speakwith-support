import { Component, computed, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../services/locale.service';
import { ThemeService } from '../../services/theme.service';

/**
 * "Send to agent" guide. The hero is the poster from
 * `doc/assets/send-to-agent-annotated/` (copied to `public/assets/guides/`),
 * shipped as SVG so the two panels and their callouts stay crisp at any
 * width. Two variants exist; the page follows the site theme, resolving
 * `system` against `prefers-color-scheme` the same way `ThemeService` does.
 * Prerender has no `window`, so SSR emits the dark poster and the browser
 * swaps it on hydration. Prose lives in `copy.json` (`guides.sendToAgent`):
 * each section carries intro paragraphs and, for the tutorial parts, an
 * ordered `steps` list of title, text, and optional example paragraphs.
 * A section may carry `linkLabel` / `linkPath`, one router link rendered
 * after its paragraphs (the program-of-your-own section points at the
 * Project and model lists page this way).
 * A section may also carry `figureDark` / `figureLight` (plus alt and
 * pixel size). Those are the in-article moments: Outline, Agent tab,
 * the message, and the terminal running that prompt. Same theme rule as the
 * hero, dark while prerendering.
 */
@Component({
  selector: 'app-send-to-agent-guide',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container prose">
      <p class="eyebrow">{{ copy.guides.sendToAgent.eyebrow }}</p>
      <h1>{{ copy.guides.sendToAgent.heading }}</h1>
      <p>{{ copy.guides.sendToAgent.intro }}</p>
      <figure class="diagram">
        <img
          [src]="diagramSrc()"
          [alt]="copy.guides.sendToAgent.diagramAlt"
          width="1600"
          height="1220"
          loading="lazy"
          decoding="async" />
      </figure>
      @for (sec of copy.guides.sendToAgent.sections; track sec.heading) {
        <h2>{{ sec.heading }}</h2>
        @for (para of sec.paragraphs; track $index) {
          <p>{{ para.text }}</p>
        }
        @if (sectionLink(sec); as link) {
          <p class="section-link"><a [routerLink]="locale.path(link.path)">{{ link.label }}</a></p>
        }
        @if (sectionFigure(sec, figuresAreLight()); as fig) {
          <figure class="diagram">
            <img
              [src]="fig.src"
              [alt]="fig.alt"
              [width]="fig.width"
              [height]="fig.height"
              loading="lazy"
              decoding="async" />
          </figure>
        }
        @if (sec.steps?.length) {
          <ol class="steps">
            @for (step of sec.steps; track $index) {
              <li><strong>{{ step.title }}</strong> {{ step.text }}
                @if (step.examples?.length) {
                  <div class="examples">
                    <p class="examples-label">{{ copy.guides.sendToAgent.examplesLabel }}</p>
                    @for (line of step.examples; track $index) {
                      <p>{{ line }}</p>
                    }
                  </div>
                }
              </li>
            }
          </ol>
        }
      }
      <p class="see-also">
        <a [routerLink]="locale.path(copy.guides.sendToAgent.seeAlso.path)">{{ copy.guides.sendToAgent.seeAlso.label }}</a>
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

    .steps {
      margin: 0.4rem 0 1.6rem;
      padding-left: 1.4rem;
    }

    .steps li {
      margin: 0 0 0.9rem;
      padding-left: 0.3rem;
    }

    .steps li::marker {
      font-weight: 700;
      color: var(--accent);
    }

    .steps strong {
      display: block;
      margin-bottom: 0.15rem;
    }

    .examples {
      margin: 0.55rem 0 0;
      padding: 0.55rem 0.8rem;
      border-left: 3px solid var(--rule, #e5e7eb);
      color: var(--muted, #6b7280);
    }

    .examples-label {
      margin: 0 0 0.35rem;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .examples p {
      margin: 0 0 0.45rem;
      white-space: pre-wrap;
    }

    .examples p:last-child {
      margin-bottom: 0;
    }

    .section-link {
      font-weight: 600;
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
export class SendToAgentGuideComponent {
  /** OS preference, tracked live so `system` follows a daytime switch. */
  private readonly prefersLight = signal(false);

  protected readonly figuresAreLight = computed(() => {
    const choice = this.theme.themeChoice();
    return choice === 'light' || (choice === 'system' && this.prefersLight());
  });

  protected readonly diagramSrc = computed(() => {
    const guide = this.copy.guides.sendToAgent;
    return this.figuresAreLight() ? guide.diagramLight : guide.diagramDark;
  });

  /** A section's outbound link (label + router path), or null when it has none. */
  protected sectionLink(sec: object): { label: string; path: string } | null {
    const row = sec as { linkLabel?: string; linkPath?: string };
    if (!row.linkLabel || !row.linkPath) {
      return null;
    }
    return { label: row.linkLabel, path: row.linkPath };
  }

  /** In-article figure for a section, or null when that section has none. */
  protected sectionFigure(sec: object, light: boolean): {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null {
    const row = sec as {
      figureDark?: string;
      figureLight?: string;
      figureAlt?: string;
      figureWidth?: number;
      figureHeight?: number;
    };
    const src = light ? row.figureLight : row.figureDark;
    if (!src) {
      return null;
    }
    return {
      src,
      alt: row.figureAlt ?? '',
      width: row.figureWidth ?? 1280,
      height: row.figureHeight ?? 640,
    };
  }

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
