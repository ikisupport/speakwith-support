import { Fragment } from 'react';
import type { MetaArgs } from 'react-router';
import { headFor } from '../head';
import { signal } from '../lib/telemetry';
import { useLocaleApi } from '../lib/locale';
import { cx } from '../lib/cx';
import css from './pricing.module.css';

/**
 * Pricing matrix: Free vs. Paid feature comparison, engine callout, and
 * two-channel distribution overview. Uses a wider .pricing-wrap (960px)
 * instead of .container so the table and engine grid have room to breathe.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function Pricing() {
  const locale = useLocaleApi();
  const { copy } = locale;

  /**
   * Name the CTA by the URL it points at, so the dashboard separates a
   * subscribe from a trial from an outright buy. Ported verbatim from the
   * component; the table rows deliberately stay a named object rather than an
   * array, which is what keeps their differing shapes out of a union type.
   */
  const trackChannel = (url: string, channel: string): void => {
    const type =
      url === copy.links.subscribeMacGumroad
        ? 'cta.subscribe_gumroad'
        : url === copy.links.trialMacGumroad
          ? 'cta.trial_gumroad'
          : url === copy.links.buyMacGumroad
            ? 'cta.buy_gumroad'
            : 'cta.channel';
    signal(type, { placement: 'pricing_channels', channel });
  };

  return (
    <app-pricing>
      <div className={css['pricing-wrap']}>

            {/* Header */}
            <div className={css['pricing-head']}>
              <p className={css.eyebrow}>{copy.pricing.header.eyebrow}</p>
              <h1>{copy.pricing.header.heading}</h1>
              <p className={css.sub}>{copy.pricing.header.sub}</p>
            </div>

            {/* Comparison table */}
            <div className={css['table-wrap']}>
              <table>
                <thead>
                  <tr>
                    <th>{copy.pricing.table.headers.feature}</th>
                    <th className={css['plan-col']}>
                      <span className={cx(css['plan-name'], css['plan-name--free'])}>{copy.pricing.table.headers.freeName}</span>
                      <span className={css['plan-tag']}>{copy.pricing.table.headers.freeTag}</span>
                    </th>
                    <th className={css['plan-col']}>
                      <span className={cx(css['plan-name'], css['plan-name--paid'])}>{copy.pricing.table.headers.paidName}</span>
                      <span className={css['plan-tag']}>{copy.pricing.table.headers.paidTag}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.liveDictation.feature}<small>{copy.pricing.table.rows.liveDictation.subtitle}</small></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.offline.feature}<small>{copy.pricing.table.rows.offline.subtitle}</small></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.engines.feature}</td>
                    <td className={css.cell}><span className={css.val}>{copy.pricing.table.rows.engines.free}</span></td>
                    <td className={css.cell}><span className={css.val}>{copy.pricing.table.rows.engines.paid}</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.importMedia.feature}<small>{copy.pricing.table.rows.importMedia.subtitle}</small></td>
                    <td className={css.cell}><span className={css.dash}>·</span></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.batch.feature}<small>{copy.pricing.table.rows.batch.subtitle}</small></td>
                    <td className={css.cell}><span className={css.dash}>·</span></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.formatting.feature}<small>{copy.pricing.table.rows.formatting.subtitle}</small></td>
                    <td className={css.cell}><span className={css.dash}>·</span></td>
                    <td className={css.cell}><span className={css.check}>&#10003;</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.escalation.feature}<small>{copy.pricing.table.rows.escalation.subtitle}</small></td>
                    <td className={css.cell}><span className={css.dash}>·</span></td>
                    <td className={css.cell}><span className={cx(css.pill, css.addon)}>{copy.pricing.table.rows.escalation.paidPill}</span></td>
                  </tr>
                  <tr>
                    <td className={css.feat}>{copy.pricing.table.rows.bestFor.feature}</td>
                    <td className={css.cell}><span className={css.val}>{copy.pricing.table.rows.bestFor.free}</span></td>
                    <td className={css.cell}><span className={css.val}>{copy.pricing.table.rows.bestFor.paid}</span></td>
                  </tr>
                  <tr className={css['price-row']}>
                    <td className={css.feat}>{copy.pricing.table.rows.price.feature}</td>
                    <td className={css.cell}><span className={css['price-free']}>{copy.pricing.table.rows.price.freePrice}</span></td>
                    <td className={css.cell}>
                      <span className={css['coming-soon']}>{copy.pricing.table.rows.price.paidPrice}</span><br />
                      <small>{copy.pricing.table.rows.price.paidPriceSub}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Engines */}
            <h2 className={css['section-title']}>{copy.pricing.engines.heading}</h2>
            <p className={css['section-sub']}>{copy.pricing.engines.sub}</p>
            <div className={css['engine-grid']}>
              {copy.pricing.engines.items.map((card, $index) => (
      <Fragment key={card.name}>
                <div className="card">
                  {/* `'badge badge--' + card.badgeKind` in Angular. A CSS Module hashes
                      every class name, so a name assembled from a string at runtime
                      never matches; index the module with the suffix instead. */}
                  <span className={cx(css.badge, css[`badge--${card.badgeKind}`])}>{card.badge}</span>
                  <h3>{card.name}</h3>
                  <p>{card.body}</p>
                  {card.note && (<>
                    <div className={css['engine-note']}>{card.note}</div>
                  </>)}
                </div>
              </Fragment>
      ))}
            </div>

            {/* Distribution channels */}
            <h2 className={css['section-title']}>{copy.pricing.channels.heading}</h2>
            <p className={css['section-sub']}>{copy.pricing.channels.sub}</p>
            <div className={css['channel-grid']}>
              {copy.pricing.channels.items.map((ch, $index) => (
      <Fragment key={ch.heading}>
                <div className="card">
                  <span className={css['channel-lead']}>{ch.lead}</span>
                  <h3>{ch.heading}</h3>
                  <p>{ch.body}</p>
                  {ch.ctaUrl && (<>
                    <a className={cx("button", "button--primary", css['channel-cta'])} href={ch.ctaUrl}
                       target="_blank" rel="noopener noreferrer"
                       onClick={() => trackChannel(ch.ctaUrl, ch.lead)}>{ch.ctaLabel}</a>
                  </>)}
                  {ch.ctaSecondaryUrl && (<>
                    <a className={cx("button", "button--ghost", css['channel-cta'], css['channel-cta--secondary'])} href={ch.ctaSecondaryUrl}
                       target="_blank" rel="noopener noreferrer"
                       onClick={() => trackChannel(ch.ctaSecondaryUrl, ch.lead)}>{ch.ctaSecondaryLabel}</a>
                  </>)}
                  {ch.ctaTertiaryUrl && (<>
                    <p className={css['channel-cta--tertiary']}>
                      <a href={ch.ctaTertiaryUrl} target="_blank" rel="noopener noreferrer"
                         onClick={() => trackChannel(ch.ctaTertiaryUrl, ch.lead)}>{ch.ctaTertiaryLabel}</a>
                    </p>
                  </>)}
                </div>
              </Fragment>
      ))}
            </div>

            {/* Fine print */}
            <p className={css.fineprint}>{copy.pricing.finePrint}</p>

          </div>
    </app-pricing>
  );
}
