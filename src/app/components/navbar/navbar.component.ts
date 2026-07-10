import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import COPY from '../../content/copy.json';

/** Top navigation bar: SpeakWith wordmark, primary links, and a system-aware light/dark theme selector. Shown on every page via `AppComponent`. */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="nav">
      <div class="container nav__inner">
        <a class="wordmark" routerLink="/" aria-label="SpeakWith home">
          <img class="wordmark__icon" src="brand-icon.svg" alt="" aria-hidden="true" width="44" height="44" />
          {{ copy.nav.wordmark }}
        </a>

        <nav class="nav__links" aria-label="Primary">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ copy.nav.links.home }}</a>
          <a routerLink="/privacy" routerLinkActive="active">{{ copy.nav.links.privacy }}</a>
          <a routerLink="/terms" routerLinkActive="active">{{ copy.nav.links.terms }}</a>
          <a routerLink="/pricing" routerLinkActive="active">{{ copy.nav.links.pricing }}</a>
          <a routerLink="/automation" routerLinkActive="active">{{ copy.nav.links.automation }}</a>
        </nav>

        <label class="theme">
          <span class="visually-hidden">{{ copy.nav.theme.label }}</span>
          <select
            [ngModel]="theme.themeChoice()"
            (ngModelChange)="theme.setTheme($event)"
            [attr.aria-label]="copy.nav.theme.label">
            <option value="system">{{ copy.nav.theme.system }}</option>
            <option value="light">{{ copy.nav.theme.light }}</option>
            <option value="dark">{{ copy.nav.theme.dark }}</option>
          </select>
        </label>
      </div>
    </header>
  `,
  styles: [`
    .nav {
      position: sticky;
      top: 0;
      z-index: 10;
      background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: saturate(160%) blur(10px);
      border-bottom: 1px solid var(--rule);
    }

    .nav__inner {
      display: flex;
      align-items: center;
      gap: 1rem 1.5rem;
      flex-wrap: wrap;
      padding: 0.85rem 0;
    }

    .wordmark {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 800;
      font-size: 1.18rem;
      letter-spacing: -0.01em;
      color: var(--text);
      text-decoration: none;
    }

    .wordmark__icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      box-sizing: border-box;
      padding: 5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }

    :host-context(html[data-theme="light"]) .wordmark__icon {
      background: #15171a;
    }

    .nav__links {
      display: flex;
      gap: 0.4rem 1.2rem;
      flex-wrap: wrap;
      margin-left: auto;
      font-weight: 600;
      font-size: 0.96rem;
    }

    .nav__links a {
      color: var(--text-dim);
      text-decoration: none;
      border-bottom: 2px solid transparent;
      padding-bottom: 2px;
    }

    .nav__links a:hover,
    .nav__links a.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    .theme select {
      font: inherit;
      font-size: 0.9rem;
      padding: 0.35rem 0.6rem;
      border-radius: 0.5rem;
      border: 1px solid var(--rule);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
    }

    @media (max-width: 560px) {
      .nav__links { margin-left: 0; width: 100%; }
    }
  `]
})
export class NavbarComponent {
  protected readonly copy = COPY;
  constructor(public theme: ThemeService) {}
}
