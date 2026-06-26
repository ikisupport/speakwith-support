import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** 404 page: wildcard route. Offers a clear path back home. */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container nf">
      <p class="nf__code">404</p>
      <h1>This page wandered off.</h1>
      <p class="nf__lead">
        The page you were looking for isn't here. It may have moved, or the
        link may be slightly off.
      </p>
      <div class="nf__actions">
        <a class="button button--primary" routerLink="/">Back to home</a>
      </div>
    </section>
  `,
  styles: [`
    .nf {
      text-align: center;
      padding: 5rem 0 6rem;
    }

    .nf__code {
      font-size: 4.5rem;
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .nf__lead {
      color: var(--text-dim);
      max-width: 34rem;
      margin: 0.6rem auto 1.8rem;
    }

    .nf__actions {
      display: flex;
      justify-content: center;
      gap: 0.8rem;
      flex-wrap: wrap;
    }
  `]
})
export class NotFoundComponent {}
