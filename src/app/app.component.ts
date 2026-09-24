import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SeoService } from './services/seo.service';
import { TelemetryService } from './services/telemetry.service';
import { LocaleService } from './services/locale.service';

/**
 * Application shell: sticky navbar, routed page content, and a shared footer.
 *
 * The footer carries the locale switcher: a native `<details>` disclosure whose
 * entries are plain `<a href>` links to the same page in each locale, so a
 * crawler with JavaScript off can follow them. The chevron flips while open
 * and the control stays in place (reversible disclosure). Pages that exist in
 * English only (Privacy, Terms) link every locale to the English URL and say so.
 * The whole control is omitted when the build has a single active locale.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main>
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <nav class="footer__links" aria-label="Footer">
          <a [routerLink]="locale.path('')">{{ copy.app.footer.links.home }}</a>
          <a [routerLink]="locale.path('automation')">{{ copy.app.footer.links.automation }}</a>
          <a [routerLink]="locale.path('guides')">{{ copy.app.footer.links.guides }}</a>
          <a [routerLink]="locale.path('privacy')">{{ copy.app.footer.links.privacy }}</a>
          <a [routerLink]="locale.path('terms')">{{ copy.app.footer.links.terms }}</a>
          <a [href]="copy.links.newsletter" target="_blank" rel="noopener noreferrer"
             (click)="telemetry.signal('cta.newsletter', { placement: 'footer' })">{{ copy.app.footer.links.newsletter }}</a>
          <a [href]="copy.links.x" target="_blank" rel="noopener noreferrer"
             (click)="telemetry.signal('cta.x', { placement: 'footer' })">{{ copy.app.footer.links.x }}</a>
          <a [href]="copy.links.ikiSystemsHome" target="_blank" rel="noopener noreferrer">{{ copy.app.footer.links.ikiSystems }}</a>
        </nav>
        <p>{{ copy.app.footer.tagline }}</p>

        @if (locale.multilingual) {
        <details class="locale">
          <summary class="locale__summary">
            <svg class="locale__globe" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <path d="M2 12h20M4.5 7h15M4.5 17h15" fill="none" stroke="currentColor" stroke-width="1.6"/>
            </svg>
            <span class="visually-hidden">{{ copy.app.localeSwitcher.label }}:</span>
            <span class="locale__current" [attr.lang]="locale.locale().htmlLang">{{ locale.locale().endonym }}</span>
            <svg class="locale__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </summary>
          <ul class="locale__list" [attr.aria-label]="copy.app.localeSwitcher.label">
            @for (link of locale.switcherLinks(); track link.locale.code) {
              <li>
                <a [href]="link.href"
                   [attr.lang]="link.locale.htmlLang"
                   [attr.hreflang]="link.locale.htmlLang"
                   [attr.aria-current]="link.current ? 'true' : null"
                   [class.locale__link--current]="link.current">{{ link.locale.endonym }}</a>
              </li>
            }
          </ul>
          @if (!locale.pageIsLocalized()) {
            <p class="locale__note">{{ copy.app.localeSwitcher.legalNote }}</p>
          }
        </details>
        }

        <p class="footer__fine" [innerHTML]="copyright"></p>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1 0 auto;
    }

    .footer {
      border-top: 1px solid var(--rule);
      background: var(--surface);
      color: var(--text-dim);
      font-size: 0.92rem;
    }

    .footer__inner {
      text-align: center;
      padding: 2.4rem 0;
    }

    .footer__links {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem 1.2rem;
      margin-bottom: 1rem;
    }

    .footer__links a {
      color: var(--text-dim);
      text-decoration: none;
      font-weight: 600;
    }

    .footer__links a:hover {
      color: var(--accent);
    }

    .footer p {
      margin-bottom: 0.25rem;
    }

    .footer__fine {
      font-size: 0.84rem;
      opacity: 0.8;
    }

    .locale {
      display: inline-block;
      position: relative;
      text-align: left;
      margin: 0.6rem 0 1rem;
    }

    .locale__summary {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      list-style: none;
      cursor: pointer;
      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text);
      padding: 0.4rem 0.7rem;
      border-radius: 0.5rem;
      border: 1px solid var(--rule);
      background: var(--surface);
    }

    .locale__summary::-webkit-details-marker {
      display: none;
    }

    .locale__summary:hover {
      color: var(--accent);
    }

    .locale__chevron {
      transition: transform 120ms ease;
    }

    .locale[open] .locale__chevron {
      transform: rotate(180deg);
    }

    .locale__list {
      list-style: none;
      margin: 0.35rem 0 0;
      padding: 0.3rem 0;
      min-width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--rule);
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .locale__list a {
      display: block;
      padding: 0.35rem 0.8rem 0.35rem 1.7rem;
      color: var(--text);
      text-decoration: none;
      white-space: nowrap;
      position: relative;
    }

    .locale__list a:hover {
      color: var(--accent);
    }

    .locale__link--current::before {
      content: "\\2713";
      position: absolute;
      left: 0.65rem;
    }

    .locale__note {
      font-size: 0.82rem;
      max-width: 22rem;
      margin: 0.4rem 0 0;
    }

    .footer__fine ::ng-deep a {
      color: var(--text-dim);
      text-decoration: none;
      font-weight: 600;
    }

    .footer__fine ::ng-deep a:hover {
      color: var(--accent);
    }
  `]
})
export class AppComponent {
  protected get copy() {
    return this.locale.copy();
  }

  protected get copyright(): string {
    const copy = this.copy;
    return copy.app.footer.copyrightHtml
      .replace('{{year}}', String(new Date().getFullYear()))
      .replace('{{ikiSystemsHome}}', copy.links.ikiSystemsHome);
  }

  constructor(
    seo: SeoService,
    protected readonly telemetry: TelemetryService,
    protected readonly locale: LocaleService,
  ) {
    seo.init();
    telemetry.init();
  }
}
