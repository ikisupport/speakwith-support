import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import COPY from './content/copy.json';

/**
 * Application shell: sticky navbar, routed page content, and a shared footer.
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
          <a routerLink="/">{{ copy.app.footer.links.home }}</a>
          <a routerLink="/privacy">{{ copy.app.footer.links.privacy }}</a>
          <a routerLink="/terms">{{ copy.app.footer.links.terms }}</a>
        </nav>
        <p>{{ copy.app.footer.tagline }}</p>
        <p class="footer__fine">{{ copy.app.footer.copyright }}</p>
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
  `]
})
export class AppComponent {
  protected readonly copy = COPY;
}
