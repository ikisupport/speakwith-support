import { Component } from '@angular/core';
import COPY from '../../content/copy.json';

/**
 * Pricing matrix: Free vs. Paid feature comparison, engine callout, and
 * two-channel distribution overview. Uses a wider .pricing-wrap (960px)
 * instead of .container so the table and engine grid have room to breathe.
 */
@Component({
  selector: 'app-pricing',
  standalone: true,
  template: `
    <div class="pricing-wrap">

      <!-- Header -->
      <div class="pricing-head">
        <p class="eyebrow">{{ copy.pricing.header.eyebrow }}</p>
        <h1>{{ copy.pricing.header.heading }}</h1>
        <p class="sub">{{ copy.pricing.header.sub }}</p>
      </div>

      <!-- Comparison table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ copy.pricing.table.headers.feature }}</th>
              <th class="plan-col">
                <span class="plan-name plan-name--free">{{ copy.pricing.table.headers.freeName }}</span>
                <span class="plan-tag">{{ copy.pricing.table.headers.freeTag }}</span>
              </th>
              <th class="plan-col">
                <span class="plan-name plan-name--paid">{{ copy.pricing.table.headers.paidName }}</span>
                <span class="plan-tag">{{ copy.pricing.table.headers.paidTag }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.liveDictation.feature }}<small>{{ copy.pricing.table.rows.liveDictation.subtitle }}</small></td>
              <td class="cell"><span class="check">&#10003;</span></td>
              <td class="cell"><span class="check">&#10003;</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.offline.feature }}<small>{{ copy.pricing.table.rows.offline.subtitle }}</small></td>
              <td class="cell"><span class="check">&#10003;</span></td>
              <td class="cell"><span class="check">&#10003;</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.engines.feature }}</td>
              <td class="cell"><span class="val">{{ copy.pricing.table.rows.engines.free }}</span></td>
              <td class="cell"><span class="val">{{ copy.pricing.table.rows.engines.paid }}</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.importMedia.feature }}<small>{{ copy.pricing.table.rows.importMedia.subtitle }}</small></td>
              <td class="cell"><span class="dash">·</span></td>
              <td class="cell"><span class="check">&#10003;</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.batch.feature }}<small>{{ copy.pricing.table.rows.batch.subtitle }}</small></td>
              <td class="cell"><span class="dash">·</span></td>
              <td class="cell"><span class="check">&#10003;</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.formatting.feature }}<small>{{ copy.pricing.table.rows.formatting.subtitle }}</small></td>
              <td class="cell"><span class="dash">·</span></td>
              <td class="cell"><span class="check">&#10003;</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.escalation.feature }}<small>{{ copy.pricing.table.rows.escalation.subtitle }}</small></td>
              <td class="cell"><span class="dash">·</span></td>
              <td class="cell"><span class="pill addon">{{ copy.pricing.table.rows.escalation.paidPill }}</span></td>
            </tr>
            <tr>
              <td class="feat">{{ copy.pricing.table.rows.bestFor.feature }}</td>
              <td class="cell"><span class="val">{{ copy.pricing.table.rows.bestFor.free }}</span></td>
              <td class="cell"><span class="val">{{ copy.pricing.table.rows.bestFor.paid }}</span></td>
            </tr>
            <tr class="price-row">
              <td class="feat">{{ copy.pricing.table.rows.price.feature }}</td>
              <td class="cell"><span class="price-free">{{ copy.pricing.table.rows.price.freePrice }}</span></td>
              <td class="cell">
                <span class="coming-soon">{{ copy.pricing.table.rows.price.paidPrice }}</span><br>
                <small>{{ copy.pricing.table.rows.price.paidPriceSub }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Engines -->
      <h2 class="section-title">{{ copy.pricing.engines.heading }}</h2>
      <p class="section-sub">{{ copy.pricing.engines.sub }}</p>
      <div class="engine-grid">
        @for (card of copy.pricing.engines.items; track card.name) {
          <div class="card">
            <span [class]="'badge badge--' + card.badgeKind">{{ card.badge }}</span>
            <h3>{{ card.name }}</h3>
            <p>{{ card.body }}</p>
            @if (card.note) {
              <div class="engine-note">{{ card.note }}</div>
            }
          </div>
        }
      </div>

      <!-- Distribution channels -->
      <h2 class="section-title">{{ copy.pricing.channels.heading }}</h2>
      <p class="section-sub">{{ copy.pricing.channels.sub }}</p>
      <div class="channel-grid">
        @for (ch of copy.pricing.channels.items; track ch.heading) {
          <div class="card">
            <span class="channel-lead">{{ ch.lead }}</span>
            <h3>{{ ch.heading }}</h3>
            <p>{{ ch.body }}</p>
            @if (ch.ctaUrl) {
              <a class="button button--primary channel-cta" [href]="ch.ctaUrl"
                 target="_blank" rel="noopener noreferrer">{{ ch.ctaLabel }}</a>
            }
            @if (ch.ctaSecondaryUrl) {
              <a class="button button--ghost channel-cta channel-cta--secondary" [href]="ch.ctaSecondaryUrl"
                 target="_blank" rel="noopener noreferrer">{{ ch.ctaSecondaryLabel }}</a>
            }
          </div>
        }
      </div>

      <!-- Fine print -->
      <p class="fineprint">{{ copy.pricing.finePrint }}</p>

    </div>
  `,
  styles: [`
    :host {
      --clr-check: #1f9d57;
    }
    :host-context(html[data-theme='dark']) {
      --clr-check: #22c55e;
    }

    .pricing-wrap {
      max-width: 960px;
      margin: 0 auto;
      padding: 56px 24px 80px;
    }

    .pricing-head {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 2.5rem;
    }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }

    .sub {
      font-size: 1.06rem;
      color: var(--text-dim);
      margin-bottom: 0;
    }

    /* Comparison table */
    .table-wrap {
      border: 1px solid var(--rule);
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: var(--shadow);
      margin-bottom: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      text-align: left;
      padding: 16px 20px;
      border-bottom: 1px solid var(--rule);
      vertical-align: middle;
    }

    thead th {
      background: var(--surface);
      font-size: 0.82rem;
    }

    .plan-col {
      text-align: center;
      width: 26%;
    }

    .plan-name {
      font-size: 1rem;
      font-weight: 700;
      display: block;
    }

    .plan-name--free { color: var(--text); }
    .plan-name--paid { color: var(--accent); }

    .plan-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-dim);
      display: block;
      margin-top: 2px;
    }

    tbody td.feat {
      font-weight: 600;
    }

    tbody td.feat small {
      display: block;
      font-weight: 400;
      color: var(--text-dim);
      font-size: 0.82rem;
      margin-top: 2px;
    }

    tbody td.cell {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.875rem;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .check {
      color: var(--clr-check);
      font-weight: 700;
      font-size: 1.12rem;
    }

    .dash {
      color: var(--text-dim);
      font-size: 1.12rem;
    }

    .pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .addon {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent-strong);
    }

    .val {
      color: var(--text);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .price-row td {
      background: var(--surface);
    }

    .price-free {
      color: var(--text);
      font-weight: 800;
      font-size: 1.12rem;
    }

    .coming-soon {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent-strong);
    }

    /* Section headings */
    .section-title {
      font-size: 1.38rem;
      margin: 3.5rem 0 0.4rem;
      letter-spacing: -0.01em;
    }

    .section-sub {
      color: var(--text-dim);
      margin: 0 0 1.5rem;
      font-size: 0.94rem;
    }

    /* Engine grid: global .card handles background/border/shadow */
    .engine-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .engine-grid .card h3 {
      margin-bottom: 0.4rem;
    }

    .engine-grid .card p {
      margin-bottom: 0;
      color: var(--text-dim);
      font-size: 0.875rem;
    }

    .badge {
      display: inline-block;
      font-size: 0.69rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 0.75rem;
    }

    .badge--free-paid {
      background: color-mix(in srgb, var(--clr-check) 14%, transparent);
      color: var(--clr-check);
    }

    .badge--paid {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent-strong);
    }

    .engine-note {
      margin-top: 0.75rem;
      font-size: 0.75rem;
      color: var(--accent-strong);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: 8px 10px;
      border-radius: 0.5rem;
    }

    /* Channel grid: global .card handles background/border/shadow */
    .channel-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .channel-grid .card h3 {
      margin-bottom: 0.5rem;
    }

    .channel-grid .card p {
      margin-bottom: 0;
      color: var(--text-dim);
      font-size: 0.875rem;
    }

    .channel-lead {
      font-weight: 700;
      color: var(--text-dim);
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.4rem;
      display: block;
    }

    /* CTA buttons inside the channel cards */
    .channel-grid .card .channel-cta {
      margin-top: 1rem;
    }

    .channel-grid .card .channel-cta--secondary {
      margin-top: 0.6rem;
      margin-left: 0.6rem;
    }

    /* Fine print */
    .fineprint {
      margin-top: 2rem;
      margin-left: auto;
      margin-right: auto;
      font-size: 0.82rem;
      color: var(--text-dim);
      text-align: center;
      max-width: 680px;
    }

    @media (max-width: 760px) {
      .engine-grid {
        grid-template-columns: 1fr;
      }
      .channel-grid {
        grid-template-columns: 1fr;
      }
      th, td {
        padding: 13px 12px;
      }
      .plan-tag {
        display: none;
      }
    }
  `]
})
export class PricingComponent {
  protected readonly copy = COPY;
}
