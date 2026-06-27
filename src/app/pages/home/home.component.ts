import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import COPY from '../../content/copy.json';

/**
 * Home / landing page. Hero, moments strip, technical-moat row, feature
 * blocks, the parallel-input value-prop band, an FAQ, and a download CTA.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <p class="eyebrow">{{ copy.home.hero.eyebrow }}</p>
        <h1>{{ copy.home.hero.headline }}</h1>
        <p class="hero__lead">{{ copy.home.hero.lead }}</p>
        <div class="hero__actions">
          <a class="button button--primary" [href]="copy.links.buyMacGumroad"
             target="_blank" rel="noopener noreferrer">{{ copy.home.hero.ctaPrimary }}</a>
          <span class="button button--coming-soon">{{ copy.home.hero.ctaSecondary }}</span>
          <a class="button button--ghost" href="#moments">{{ copy.home.hero.ctaGhost }}</a>
        </div>
        <p class="hero__note">{{ copy.home.hero.note }}</p>
      </div>
    </section>

    <!-- Hero screenshot -->
    <section id="moments" class="heroshot">
      <div class="container heroshot__inner">
        <h2 class="heroshot__title">{{ copy.home.moments.title }}</h2>
        <figure class="heroshot__figure">
          <img class="heroshot__image" [src]="copy.home.moments.heroImage"
               [alt]="copy.home.moments.heroAlt" loading="lazy" />
          <figcaption class="heroshot__caption">{{ copy.home.moments.heroCaption }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- Two apps band: Mac studio + iOS companion as peers -->
    <section id="platforms" class="platforms">
      <div class="container platforms__inner">
        <p class="eyebrow eyebrow--accent">{{ copy.home.platforms.eyebrow }}</p>
        <h2 class="platforms__title">{{ copy.home.platforms.title }}</h2>
        <p class="platforms__sub">{{ copy.home.platforms.sub }}</p>
        <div class="platforms__grid">
          @for (p of copy.home.platforms.items; track p.name) {
            <article class="card platform">
              <p class="platform__tag">{{ p.tag }}</p>
              <h3 class="platform__name">{{ p.name }}</h3>
              <p class="platform__body">{{ p.body }}</p>
              <ul class="platform__points">
                @for (point of p.points; track point) {
                  <li>{{ point }}</li>
                }
              </ul>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- Screenshots gallery: the actual product, 16:10 composed frames.
         Phase 2: the five referenced images under /assets/screenshots/ are not
         captured yet, so this section is hidden to avoid broken frames. Flip
         showScreenshots to true once the real shots are dropped in. -->
    @if (showScreenshots) {
      <section id="screenshots" class="shots">
        <div class="container shots__inner">
          <h2 class="shots__title">{{ copy.home.screenshots.title }}</h2>
          <p class="shots__subtitle">{{ copy.home.screenshots.subtitle }}</p>
          <div class="shots__list">
            @for (s of copy.home.screenshots.items; track s.src) {
              <figure class="shot">
                <div class="shot__frame">
                  <img class="shot__image" [src]="s.src" [alt]="s.ariaLabel" loading="lazy" />
                </div>
                <figcaption class="shot__caption">{{ s.caption }}</figcaption>
              </figure>
            }
          </div>
        </div>
      </section>
    }

    <!-- Your file. Your machine. Your AI. -->
    <section class="moat">
      <div class="container moat__inner">
        <h2 class="moat__title">{{ copy.home.moat.title }}</h2>
        <div class="moat__grid">
          @for (item of copy.home.moat.items; track item.label) {
            <div class="moat__item">
              <p class="moat__label">{{ item.label }}</p>
              @if (item.isHtml) {
                <p class="moat__copy" [innerHTML]="item.body"></p>
              } @else {
                <p class="moat__copy">{{ item.body }}</p>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Inclusive band: you don't have to talk to AI -->
    <section class="band band--inclusive">
      <div class="container band__inner">
        <p class="eyebrow eyebrow--accent">{{ copy.home.inclusive.eyebrow }}</p>
        <h2>{{ copy.home.inclusive.heading }}</h2>
        <p>{{ copy.home.inclusive.p1 }}</p>
        <p [innerHTML]="copy.home.inclusive.p2Html"></p>
      </div>
    </section>

    <!-- Feature blocks -->
    <section class="container section">
      <h2 class="section__title">{{ copy.home.features.title }}</h2>
      <div class="features">
        @for (f of copy.home.features.items; track f.title) {
          <article [class]="f.wide ? 'card feature feature--wide' : 'card feature'">
            <h3>{{ f.title }}</h3>
            <p>{{ f.body }}</p>
          </article>
        }
      </div>
    </section>

    <!-- Parallel-input value prop (Part C) -->
    <section class="band">
      <div class="container band__inner">
        <p class="eyebrow eyebrow--accent">{{ copy.home.parallel.eyebrow }}</p>
        <h2>{{ copy.home.parallel.heading }}</h2>
        <p [innerHTML]="copy.home.parallel.p1Html"></p>
        <p>{{ copy.home.parallel.p2 }}</p>
      </div>
    </section>

    <!-- Speaking rhythm / training effect -->
    <section class="rhythm">
      <div class="container rhythm__inner">
        <p class="eyebrow eyebrow--accent">{{ copy.home.rhythm.eyebrow }}</p>
        <h2>{{ copy.home.rhythm.heading }}</h2>
        <p>{{ copy.home.rhythm.p1 }}</p>
        <p>{{ copy.home.rhythm.p2 }}</p>
      </div>
    </section>

    <!-- Home base across parallel work -->
    <section class="band">
      <div class="container band__inner">
        <p class="eyebrow eyebrow--accent">{{ copy.home.homebase.eyebrow }}</p>
        <h2>{{ copy.home.homebase.heading }}</h2>
        <p>{{ copy.home.homebase.p1 }}</p>
        <p>{{ copy.home.homebase.p2 }}</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container section">
      <h2 class="section__title">{{ copy.home.faq.title }}</h2>
      <div class="faq">
        @for (item of copy.home.faq.items; track item.q) {
          <details>
            <summary>{{ item.q }}</summary>
            <p>{{ item.a }}</p>
          </details>
        }
      </div>
    </section>

    <!-- Download CTA -->
    <section id="download" class="container section download">
      <div class="card download__card">
        <h2>{{ copy.home.download.heading }}</h2>
        <p>{{ copy.home.download.body }}</p>
        <div class="hero__actions">
          <a class="button button--primary" [href]="copy.links.buyMacGumroad"
             target="_blank" rel="noopener noreferrer">{{ copy.home.download.ctaPrimary }}</a>
          <span class="button button--coming-soon">{{ copy.home.download.ctaSecondary }}</span>
        </div>
        <p class="download__links">
          <a routerLink="/privacy">Privacy Policy</a>
          <span aria-hidden="true">·</span>
          <a routerLink="/terms">Terms of Service</a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-dim);
      margin-bottom: 0.7rem;
    }

    .eyebrow--accent {
      color: var(--accent);
    }

    /* Hero */
    .hero {
      background: var(--hero-grad);
      border-bottom: 1px solid var(--rule);
    }

    .hero__inner {
      padding: 4rem 0 4rem;
      text-align: center;
    }

    .hero__lead {
      color: var(--text-dim);
      font-size: 1.12rem;
      max-width: 40rem;
      margin: 1rem auto 1.8rem;
      text-wrap: balance;
    }

    .hero__actions {
      display: flex;
      justify-content: center;
      gap: 0.8rem;
      flex-wrap: wrap;
    }

    .hero__note {
      margin-top: 1.1rem;
      font-size: 0.9rem;
      color: var(--text-dim);
    }

    .button--coming-soon {
      opacity: 0.5;
      cursor: default;
      pointer-events: none;
    }

    /* Secondary button: a filled peer to the primary, in a surface tone */
    .button--secondary {
      background: var(--surface-2);
      color: var(--text);
      border-color: var(--rule);
    }

    .button--secondary:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Hero screenshot — one big full-app frame */
    .heroshot {
      background: var(--surface);
      border-bottom: 1px solid var(--rule);
    }

    .heroshot__inner {
      padding: 3.8rem 0 3.6rem;
      max-width: 1100px;
      width: min(94%, 1100px);
      text-align: center;
    }

    .heroshot__title {
      text-align: center;
      margin-bottom: 2rem;
    }

    .heroshot__figure {
      margin: 0;
    }

    /* Full 16:10 app screenshot, served from canonical_screenshots/hero.png
       (public/canonical_screenshots → served at site root). object-fit: contain
       shows the whole window, never clipped; the surface tone is the frame and
       the fallback shown if the shot is missing. */
    .heroshot__image {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: contain;
      border-radius: 0.9rem;
      background: var(--surface-2);
      box-shadow: var(--shadow);
      border: 1px solid var(--rule);
    }

    .heroshot__caption {
      margin-top: 1rem;
      color: var(--text);
      font-size: 1.06rem;
      font-style: italic;
      text-align: center;
    }

    /* Two apps band: Mac + iOS as peers */
    .platforms {
      background: var(--surface);
      border-bottom: 1px solid var(--rule);
    }

    .platforms__inner {
      padding: 3.8rem 0 3.6rem;
      max-width: 1100px;
      width: min(94%, 1100px);
      text-align: center;
    }

    .platforms__title {
      margin-bottom: 0.6rem;
    }

    .platforms__sub {
      color: var(--text-dim);
      font-size: 1.06rem;
      margin: 0 auto 2.4rem;
      max-width: 44rem;
    }

    .platforms__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.4rem;
      text-align: left;
    }

    .platform__tag {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.4rem;
    }

    .platform__name {
      margin-bottom: 0.6rem;
    }

    .platform__body {
      color: var(--text-dim);
      font-size: 1rem;
      line-height: 1.55;
      margin-bottom: 1.1rem;
    }

    .platform__points {
      margin: 0;
      padding-left: 1.1rem;
    }

    .platform__points li {
      color: var(--text-dim);
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }

    /* Screenshots gallery: full-bleed 16:10 frames, alternating sides */
    .shots {
      background: var(--surface);
      border-bottom: 1px solid var(--rule);
    }

    .shots__inner {
      padding: 3.8rem 0 3.6rem;
      max-width: 1100px;
      width: min(94%, 1100px);
    }

    .shots__title {
      text-align: center;
      margin-bottom: 0.6rem;
    }

    .shots__subtitle {
      text-align: center;
      color: var(--text-dim);
      font-size: 1.06rem;
      margin: 0 auto 2.4rem;
      max-width: 40rem;
    }

    .shots__list {
      display: grid;
      gap: 2.6rem;
    }

    .shot {
      margin: 0;
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
      align-items: center;
      gap: 1.6rem 2.2rem;
    }

    /* Alternate the image to the right on even rows (caption leads). Swap the
       column widths too, so the image stays in the wide 1.45fr column — order
       alone would drop it into the narrow 1fr column and shrink it. */
    .shot:nth-child(even) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.45fr);
    }
    .shot:nth-child(even) .shot__frame {
      order: 2;
    }

    .shot__frame {
      border-radius: 0.9rem;
      overflow: hidden;
      box-shadow: var(--shadow);
      border: 1px solid var(--rule);
      background: var(--surface-2);
    }

    .shot__image {
      display: block;
      width: 100%;
      /* 16:10 composed frame with the headline baked in — contain, never crop. */
      height: auto;
      aspect-ratio: 16 / 10;
      object-fit: contain;
    }

    .shot__caption {
      color: var(--text);
      font-size: 1.18rem;
      line-height: 1.5;
    }

    /* Your file. Your machine. Your AI. */
    .moat {
      background: var(--bg);
      border-bottom: 1px solid var(--rule);
    }

    .moat__inner {
      padding: 3.4rem 0 3.4rem;
      max-width: 1100px;
      width: min(94%, 1100px);
    }

    .moat__title {
      text-align: center;
      margin-bottom: 2rem;
    }

    .moat__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.1rem;
    }

    .moat__item {
      padding: 1.3rem 1.2rem;
      background: var(--surface);
      border: 1px solid var(--rule);
      border-radius: 0.9rem;
    }

    .moat__label {
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.4rem;
      letter-spacing: -0.01em;
    }

    .moat__copy {
      color: var(--text-dim);
      margin-bottom: 0;
      font-size: 0.98rem;
      line-height: 1.55;
    }

    .moat__copy code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.9em;
      background: var(--surface-2);
      padding: 0.05rem 0.35rem;
      border-radius: 0.3rem;
    }

    /* Sections */
    .section {
      padding: 3.5rem 0;
    }

    .section__title {
      text-align: center;
      margin-bottom: 2rem;
    }

    /* Feature grid */
    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.1rem;
    }

    .feature h3 {
      color: var(--accent);
    }

    .feature p {
      color: var(--text-dim);
      margin-bottom: 0;
    }

    .feature--wide {
      grid-column: 1 / -1;
    }

    /* Value-prop band */
    .band {
      background: var(--surface);
      border-top: 1px solid var(--rule);
      border-bottom: 1px solid var(--rule);
    }

    .band__inner {
      padding: 3.8rem 0;
      max-width: 44rem;
    }

    .band__inner p {
      color: var(--text-dim);
      font-size: 1.06rem;
    }

    .band__inner h2 {
      margin-bottom: 1rem;
    }

    /* Speaking rhythm band */
    .rhythm {
      background: var(--bg);
      border-bottom: 1px solid var(--rule);
    }

    .rhythm__inner {
      padding: 3.8rem 0;
      max-width: 44rem;
    }

    .rhythm__inner h2 {
      margin-bottom: 1rem;
    }

    .rhythm__inner p {
      color: var(--text-dim);
      font-size: 1.06rem;
    }

    /* FAQ */
    .faq {
      max-width: 44rem;
      margin: 0 auto;
    }

    .faq details {
      border: 1px solid var(--rule);
      border-radius: 0.7rem;
      background: var(--surface);
      padding: 0.2rem 1.1rem;
      margin-bottom: 0.7rem;
    }

    .faq summary {
      cursor: pointer;
      font-weight: 600;
      padding: 0.85rem 0;
      list-style: none;
    }

    .faq summary::-webkit-details-marker {
      display: none;
    }

    .faq summary::after {
      content: "+";
      float: right;
      color: var(--accent);
      font-weight: 700;
    }

    .faq details[open] summary::after {
      content: "−";
    }

    .faq details p {
      color: var(--text-dim);
      padding-bottom: 0.9rem;
      margin-bottom: 0;
    }

    /* Download */
    .download__card {
      text-align: center;
      max-width: 38rem;
      margin: 0 auto;
    }

    .download__card .hero__actions {
      margin-top: 1.3rem;
    }

    .download__links {
      margin-top: 1.3rem;
      margin-bottom: 0;
      font-size: 0.92rem;
    }

    .download__links span {
      margin: 0 0.5rem;
      color: var(--text-dim);
    }

    @media (max-width: 880px) {
      .platforms__grid {
        grid-template-columns: 1fr;
      }
      .moat__grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .shot,
      .shot:nth-child(even) {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      /* Single column: image always on top, regardless of row parity. */
      .shot:nth-child(even) .shot__frame {
        order: 0;
      }
    }

    @media (max-width: 620px) {
      .features {
        grid-template-columns: 1fr;
      }
      .moat__grid {
        grid-template-columns: 1fr;
      }
      .hero__inner {
        padding: 3rem 0 2.8rem;
      }
      .heroshot__inner,
      .moat__inner {
        padding: 2.8rem 0;
      }
    }
  `]
})
export class HomeComponent {
  protected readonly copy = COPY;
  /** The gallery shows the three captured macOS frames under /assets/screenshots/
      (iOS shots are deferred and removed from copy.json). */
  protected readonly showScreenshots = true;
}
