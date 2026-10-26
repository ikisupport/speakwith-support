import { Fragment } from 'react';
import { Link, type MetaArgs } from 'react-router';
import { headFor } from '../head';
import { asset } from '../lib/asset';
import { useTheme } from '../lib/theme';
import { useLocaleApi } from '../lib/locale';
import { signal } from '../lib/telemetry';
import { cx } from '../lib/cx';
import css from './home.module.css';

/**
 * Home / landing page. Hero, moments strip, Type into app demo band,
 * live-edit frames, platforms, technical-moat row, feature blocks, value-prop bands, FAQ, download CTA.
 *
 * The moments hero ships dark and light captures; the page follows the site
 * theme the same way the guide pages do. Prerender emits the dark frame.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

export default function Home() {
  const locale = useLocaleApi();
  const { copy } = locale;
  const { siteIsLight } = useTheme();

  /**
   * The hero and the iOS card ship a dark and a light capture each.
   *
   * Angular read `matchMedia` in the constructor, so it could choose on the
   * first render. React cannot: the prerender has no browser, and the static
   * HTML and React's first client render must agree or hydration keeps the
   * wrong DOM without saying so. Both therefore start dark -- which is what
   * the Angular page prerenders too -- and the light asset is swapped in one
   * frame later, once `siteIsLight` is real.
   */
  const heroImageSrc = siteIsLight
    ? copy.home.moments.heroImageLight
    : copy.home.moments.heroImageDark;

  /** Mocha for a dark page, Latte when the iOS card has a light twin. */
  const platformImageSrc = (item: { src: string; srcLight?: string }): string =>
    siteIsLight && item.srcLight ? item.srcLight : item.src;

  /** The gallery shows the three captured macOS frames under /assets/screenshots/
      (iOS shots are deferred and removed from copy.json). */
  const showScreenshots = true;

  /** The Voice Examples band; its frame is assets/screenshots/voice-examples.png. */
  const showVoiceExamples = true;

  return (
    <app-home>
      {/* Hero */}
          <section className={css.hero}>
            <div className={cx("container", css.hero__inner)}>
              <p className="eyebrow">{copy.home.hero.eyebrow}</p>
              <h1>{copy.home.hero.headline}</h1>
              <p className={css.hero__lead}>{copy.home.hero.lead}</p>
              {copy.home.hero.leadSecondary && (<>
                <p className={cx(css.hero__lead, css['hero__lead--secondary'])}>{copy.home.hero.leadSecondary}</p>
              </>)}
              <div className={css.hero__actions}>
                <Link className="button button--primary" to={locale.path('pricing')}
                   onClick={() => signal('cta.pricing', { placement: 'hero' })}>{copy.home.hero.ctaPrimary}</Link>
                <a className="button button--ghost" href="#moments">{copy.home.hero.ctaGhost}</a>
                <a className="button button--ghost" href={'#' + copy.home.typeIntoApp.id}>{copy.home.hero.ctaDemo}</a>
              </div>
              <p className={css.hero__note}>{copy.home.hero.note}</p>
            </div>
          </section>

          {/* Hero screenshot */}
          <section id="moments" className={css.heroshot}>
            <div className="container home-band home-band--center">
              <h2 className={css.heroshot__title}>{copy.home.moments.title}</h2>
              <figure className={css.heroshot__figure}>
                <div className="shot-alpha">
                  <img className={css.heroshot__image} src={asset(heroImageSrc)}
                       alt={copy.home.moments.heroAlt} loading="lazy" />
                </div>
                <figcaption className={css.heroshot__caption}>{copy.home.moments.heroCaption}</figcaption>
              </figure>
            </div>
          </section>

          {/* Two apps band: Mac studio + iOS companion as peers */}
          <section id="platforms" className={css.platforms}>
            <div className="container home-band home-band--center">
              <p className="eyebrow eyebrow--accent">{copy.home.platforms.eyebrow}</p>
              <h2 className={css.platforms__title}>{copy.home.platforms.title}</h2>
              <p className={css.platforms__sub}>{copy.home.platforms.sub}</p>
              <div className={css.platforms__grid}>
                {copy.home.platforms.items.map((p, $index) => (
      <Fragment key={p.name}>
                  <article className={cx('card', 'platform', !!p.src && css['platform--shot'])}>
                    <div className="platform__text">
                      <p className={css.platform__tag}>{p.tag}</p>
                      <h3 className={css.platform__name}>{p.name}</h3>
                      <p className={css.platform__body}>{p.body}</p>
                      <ul className={css.platform__points}>
                        {p.points.map((point, $index) => (
      <Fragment key={point}>
                          <li>{point}</li>
                        </Fragment>
      ))}
                      </ul>
                    </div>
                    {p.src && (<>
                      <figure className={css.platform__figure}>
                        <img className={css.platform__image} src={asset(platformImageSrc(p))} alt={p.ariaLabel}
                             width="660" height="1434" loading="lazy" />
                      </figure>
                    </>)}
                  </article>
                </Fragment>
      ))}
              </div>
            </div>
          </section>

          {/* Type into app demo: separate band with stable #type-into-app anchor */}
          <section id={copy.home.typeIntoApp.id} className={css.typedemo}>
            <div className="container home-band home-band--center">
              <p className="eyebrow eyebrow--accent">{copy.home.typeIntoApp.eyebrow}</p>
              <h2 className={css.heroshot__title}>{copy.home.typeIntoApp.heading}</h2>
              <p className={css.typedemo__lead}>{copy.home.typeIntoApp.lead}</p>
              <figure className={css.heroshot__figure}>
                <video
                  className={css.typedemo__video}
                  controls
                  playsInline
                  preload="metadata"
                  poster={asset(copy.home.typeIntoApp.posterSrc)}
                  aria-label={copy.home.typeIntoApp.ariaLabel}>
                  <source src={asset(copy.home.typeIntoApp.videoSrc)} type="video/mp4" />
                </video>
                <figcaption className={css.heroshot__caption}>{copy.home.typeIntoApp.caption}</figcaption>
              </figure>
            </div>
          </section>

          {/* Live edit: fix or remove lines while recording */}
          <section id={copy.home.liveEdit.id} className={css.liveedit}>
            <div className="container home-band home-band--center">
              <p className="eyebrow eyebrow--accent">{copy.home.liveEdit.eyebrow}</p>
              <h2 className={css.liveedit__title}>{copy.home.liveEdit.heading}</h2>
              <p className={css.liveedit__lead}>{copy.home.liveEdit.lead}</p>
              <div className={css.liveedit__grid}>
                {copy.home.liveEdit.items.map((s, $index) => (
      <Fragment key={s.src}>
                  <figure className={css.liveedit__figure}>
                    <div className={css.liveedit__frame}>
                      <img className={css.liveedit__image} src={asset(s.src)} alt={s.ariaLabel} loading="lazy" />
                    </div>
                    <figcaption className={css.liveedit__caption}>{s.caption}</figcaption>
                  </figure>
                </Fragment>
      ))}
              </div>
            </div>
          </section>

          {/* Voice examples: record readings of a tricky term so it is easier to spot. */}
          {showVoiceExamples && (<>
            <section id={copy.home.voiceExamples.id} className={css.typedemo}>
              <div className="container home-band home-band--center">
                <p className="eyebrow eyebrow--accent">{copy.home.voiceExamples.eyebrow}</p>
                <h2 className={css.liveedit__title}>{copy.home.voiceExamples.heading}</h2>
                <p className={css.liveedit__lead}>{copy.home.voiceExamples.intro}</p>
                <div className={css.vemethods}>
                  <div className={css.vemethod}>
                    <h3 className={css.vemethod__title}>{copy.home.voiceExamples.exampleTitle}</h3>
                    <p className={css.vemethod__body}>{copy.home.voiceExamples.lead}</p>
                    <figure className={css.vemethod__figure}>
                      <div className="shot-alpha">
                        <img
                          className={css.liveedit__image}
                          src={asset(copy.home.voiceExamples.item.src)}
                          alt={copy.home.voiceExamples.item.ariaLabel}
                          loading="lazy" />
                      </div>
                      <figcaption className={css.liveedit__caption}>{copy.home.voiceExamples.item.caption}</figcaption>
                    </figure>
                  </div>
                  {copy.home.voiceExamples.methods.map((m, $index) => (
      <Fragment key={m.title}>
                    <div className={css.vemethod}>
                      <h3 className={css.vemethod__title}>{m.title}</h3>
                      <p className={css.vemethod__body}>{m.body}</p>
                    </div>
                  </Fragment>
      ))}
                </div>
                <p className={css.liveedit__more}>
                  <Link to={locale.path(copy.home.voiceExamples.morePath)}>{copy.home.voiceExamples.moreLabel}</Link>
                </p>
              </div>
            </section>
          </>)}

          {/* Screenshots gallery: the actual product, 16:10 composed frames.
               Phase 2: the five referenced images under /assets/screenshots/ are not
               captured yet, so this section is hidden to avoid broken frames. Flip
               showScreenshots to true once the real shots are dropped in. */}
          {showScreenshots && (<>
            <section id="screenshots" className={css.shots}>
              <div className="container home-band">
                <h2 className={css.shots__title}>{copy.home.screenshots.title}</h2>
                <p className={css.shots__subtitle}>{copy.home.screenshots.subtitle}</p>
                <div className={css.shots__list}>
                  {copy.home.screenshots.items.map((s, $index) => (
      <Fragment key={s.src}>
                    <figure className={css.shot}>
                      <div className={css.shot__frame}>
                        <img className={css.shot__image} src={asset(s.src)} alt={s.ariaLabel} loading="lazy" />
                      </div>
                      <figcaption className={css.shot__caption}>{s.caption}</figcaption>
                    </figure>
                  </Fragment>
      ))}
                </div>
              </div>
            </section>
          </>)}

          {/* Your recordings stay on your Mac. */}
          <section className={css.moat}>
            <div className="container home-band home-band--moat">
              <h2 className={css.moat__title}>{copy.home.moat.title}</h2>
              <div className={css.moat__grid}>
                {copy.home.moat.items.map((item, $index) => (
      <Fragment key={item.label}>
                  <div className={css.moat__item}>
                    <p className={css.moat__label}>{item.label}</p>
                    {item.isHtml ? (<>
                      <p className={css.moat__copy} dangerouslySetInnerHTML={{ __html: item.body }}></p>
                    </>) : (<>
                      <p className={css.moat__copy}>{item.body}</p>
                    </>)}
                  </div>
                </Fragment>
      ))}
              </div>
            </div>
          </section>

          {/* Inclusive band: you don't have to talk to AI */}
          <section className={cx(css.band, "band--inclusive")}>
            <div className="container home-narrow">
              <p className="eyebrow eyebrow--accent">{copy.home.inclusive.eyebrow}</p>
              <h2>{copy.home.inclusive.heading}</h2>
              <p>{copy.home.inclusive.p1}</p>
              <p dangerouslySetInnerHTML={{ __html: copy.home.inclusive.p2Html }}></p>
            </div>
          </section>

          {/* Feature blocks */}
          <section className={cx("container", css.section)}>
            <h2 className={css.section__title}>{copy.home.features.title}</h2>
            <div className={css.features}>
              {copy.home.features.items.map((f, $index) => (
      <Fragment key={f.title}>
                <article className={cx('card', css.feature, f.wide && css['feature--wide'])}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              </Fragment>
      ))}
            </div>
          </section>

          {/* Parallel-input value prop (Part C) */}
          <section className={css.band}>
            <div className="container home-narrow">
              <p className="eyebrow eyebrow--accent">{copy.home.parallel.eyebrow}</p>
              <h2>{copy.home.parallel.heading}</h2>
              <p dangerouslySetInnerHTML={{ __html: copy.home.parallel.p1Html }}></p>
              <p>{copy.home.parallel.p2}</p>
            </div>
          </section>

          {/* Speaking rhythm / training effect */}
          <section className={css.rhythm}>
            <div className="container home-narrow">
              <p className="eyebrow eyebrow--accent">{copy.home.rhythm.eyebrow}</p>
              <h2>{copy.home.rhythm.heading}</h2>
              <p>{copy.home.rhythm.p1}</p>
              <p>{copy.home.rhythm.p2}</p>
            </div>
          </section>

          {/* Home base across parallel work */}
          <section className={css.band}>
            <div className="container home-narrow">
              <p className="eyebrow eyebrow--accent">{copy.home.homebase.eyebrow}</p>
              <h2>{copy.home.homebase.heading}</h2>
              <p>{copy.home.homebase.p1}</p>
              <p>{copy.home.homebase.p2}</p>
            </div>
          </section>

          {/* Speech metrics: four denominators, then the volume totals. */}
          <section className={cx("container", css.section)}>
            <p className="eyebrow eyebrow--accent">{copy.home.metrics.eyebrow}</p>
            <h2>{copy.home.metrics.heading}</h2>
            <p className={css.metrics__lead} dangerouslySetInnerHTML={{ __html: copy.home.metrics.leadHtml }}></p>
            <div className={css.features}>
              {copy.home.metrics.items.map((item, $index) => (
      <Fragment key={item.title}>
                <article className={cx("card", css.feature)}>
                  <h3>{item.title}</h3>
                  {item.isHtml ? (<>
                    <p dangerouslySetInnerHTML={{ __html: item.body }}></p>
                  </>) : (<>
                    <p>{item.body}</p>
                  </>)}
                </article>
              </Fragment>
      ))}
            </div>
            <p className={css.metrics__totals}>{copy.home.metrics.totals}</p>
            <p className={css.metrics__more}>
              <Link to={locale.path(copy.home.metrics.guide.path)}>{copy.home.metrics.guide.label}</Link>
            </p>
          </section>

          {/* FAQ */}
          <section className={cx("container", css.section)}>
            <h2 className={css.section__title}>{copy.home.faq.title}</h2>
            <div className={css.faq}>
              {copy.home.faq.items.map((item, $index) => (
      <Fragment key={item.q}>
                <details>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                  {item.morePath && (<>
                    <p><Link to={locale.path(item.morePath)}>{item.moreLabel}</Link></p>
                  </>)}
                </details>
              </Fragment>
      ))}
            </div>
          </section>

          {/* Download CTA */}
          <section id="download" className={cx("container", css.section, "download")}>
            <div className={cx("card", css.download__card)}>
              <h2>{copy.home.download.heading}</h2>
              <p>{copy.home.download.body}</p>
              <div className={css.hero__actions}>
                <a className="button button--primary" href={copy.links.subscribeMacGumroad}
                   target="_blank" rel="noopener noreferrer"
                   onClick={() => signal('cta.subscribe_gumroad', { placement: 'home_download' })}>{copy.home.download.ctaPrimary}</a>
              </div>
              <p className={cx(css.download__links, css['download__buy-once'])}>
                <a href={copy.links.buyMacGumroad} target="_blank" rel="noopener noreferrer"
                   onClick={() => signal('cta.buy_gumroad', { placement: 'home_download' })}>{copy.home.download.ctaBuyOnce}</a>
              </p>
              <p className={css.download__links}>
                <Link to={locale.path('privacy')}>Privacy Policy</Link>
                <span aria-hidden="true">·</span>
                <Link to={locale.path('terms')}>Terms of Service</Link>
              </p>
            </div>
          </section>
    </app-home>
  );
}
