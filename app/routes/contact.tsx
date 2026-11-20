/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

import { useEffect, useRef, useState } from 'react';
import type { MetaArgs } from 'react-router';
import { headFor } from '../head';
import {
  MAX_LICENSE_KEY_CHARS,
  MAX_MESSAGE_CHARS,
  MAX_REPLY_TO_CHARS,
  MIN_ELAPSED_MS,
  type ContactDraft,
  type InvalidReason,
  type Outcome,
  buildPayload,
  countChars,
  localProblem,
  stateForResponse,
} from '../lib/contact-form';
import { useLocaleApi } from '../lib/locale';
import s from './contact.module.css';

/**
 * The privacy contact form.
 *
 * The Privacy Policy links here instead of naming a mailbox, because the site
 * publishes no address of ours — `scripts/check-repo-hygiene.mjs` refuses one
 * in any published file. The form posts to one route on the AI service already
 * described in that policy, which mails the message and stores nothing.
 *
 * The third `localized: false` route, beside Privacy and Terms, so `/de/contact/`
 * is a 404 rather than an untranslated page about a legal right.
 *
 * ## It needs JavaScript, and that is a feature here
 *
 * Every page on this site is prerendered to static HTML and there is no server
 * to post a form to, so the submission has to be a `fetch`. That rules out the
 * no-script case, which the `<noscript>` block below sends to the Community —
 * and it is also the cheapest spam filter on offer, since the bots that scrape
 * forms out of HTML do not run the page.
 *
 * ## Nothing here is measured
 *
 * There is **no telemetry call on this page at all**, deliberately. Elsewhere
 * `cta.*` signals measure intent; a signal fired from a form whose whole
 * purpose is a privacy request would be the one place on the site where
 * measuring it is at odds with what the page says. Not "the payload excludes
 * the fields" — no call.
 */
export const meta = ({ location }: MetaArgs) => headFor(location.pathname);

/** Which `invalid` reason maps to which line of copy. */
function invalidBody(copy: ReturnType<typeof useLocaleApi>['copy'], reason: InvalidReason): string {
  switch (reason) {
    case 'tooLong':
      return copy.contact.tooLongBody;
    case 'missingMessage':
      return copy.contact.missingMessageBody;
    case 'badReplyTo':
      return copy.contact.badReplyToBody;
    case 'longLicenseKey':
      return copy.contact.longLicenseKeyBody;
  }
}

export default function Contact() {
  const { copy, path } = useLocaleApi();
  const c = copy.contact;

  const [topic, setTopic] = useState<string>(c.topics[0].value);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  /**
   * When the form became interactive, as `Date.now()`.
   *
   * **Set in an effect, not at module load and not in the initial state**, and
   * that is the whole reason this is a ref with an effect rather than a
   * constant. Every route here is prerendered through Node at build time, so a
   * clock captured outside an effect is the *build's* clock: the elapsed time
   * would read as however long ago the site was built — hours or days — and the
   * service's fill-time floor would be satisfied by a bot that never waited.
   * An effect runs only in the browser, on hydration.
   */
  const startedAt = useRef<number | null>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const elapsedMs = () => (startedAt.current === null ? 0 : Date.now() - startedAt.current);

  const draft = (): ContactDraft => ({
    topic,
    message,
    replyTo,
    licenseKey,
    website,
    elapsedMs: elapsedMs(),
  });

  const remaining = MAX_MESSAGE_CHARS - countChars(message.trim());

  /** The request itself. Only ever called once the draft has passed its bounds. */
  async function post() {
    try {
      const response = await fetch(copy.links.contactEndpoint, {
        method: 'POST',
        // The service refuses anything else with a 415, and this exact value is
        // what its `Access-Control-Allow-Headers` names.
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildPayload(draft())),
      });
      // The 413 carries no body at all — it comes from the service's body-limit
      // layer, before its handler runs — so a parse failure is an expected
      // path and not an error. `stateForResponse` takes `unknown` for this.
      const body = await response.json().catch(() => null);
      setOutcome(stateForResponse(response.status, body));
    } catch {
      // A network failure, or — the case that matters before the service is
      // configured — a cross-origin response the browser will not let us read.
      // A dark deployment answers `503 contact_not_configured` with **no**
      // CORS header, because it has no configured origin to advertise, so the
      // `unavailable` outcome is unreachable from here and this is what the
      // sender actually gets. That is why `failed` also offers the Community.
      setOutcome({ kind: 'failed' });
    } finally {
      setSending(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const problem = localProblem(draft());

    if (problem === 'tooFast') {
      // **Wait the floor out rather than refusing.** The sender did nothing
      // wrong — they pasted a message and pressed Send — and the service
      // answers a too-fast submission with the byte-identical `200` an
      // accepted one gets, so posting now would report success for a message
      // that was thrown away. Saying "too fast" would instead hand a bot the
      // threshold, so the form just takes a moment.
      setOutcome(null);
      setSending(true);
      const remainingWait = MIN_ELAPSED_MS - elapsedMs();
      // A small margin over the floor: the service compares `>=`, and the
      // value is computed again inside `post()` a few milliseconds later.
      await new Promise(resolve => setTimeout(resolve, Math.max(0, remainingWait) + 100));
      await post();
      return;
    }

    if (problem === 'unknownTopic') {
      // Unreachable from the select; only a tampered DOM gets here. Not the
      // sender's mistake to explain, so it reads as a plain failure rather
      // than as advice they cannot act on.
      setOutcome({ kind: 'failed' });
      return;
    }

    if (problem) {
      setOutcome({ kind: 'invalid', reason: problem });
      return;
    }

    setOutcome(null);
    setSending(true);
    await post();
  }

  const sent = outcome?.kind === 'sent';

  return (
    <app-contact>
      <article className="container prose">
        <h1>{c.heading}</h1>
        <p className={s.meta}>{c.meta}</p>

        {sent ? (
          <div className={s.notice} role="status">
            <h2>{c.sentHeading}</h2>
            <p>{c.sentBody}</p>
          </div>
        ) : (
          <>
            <p>{c.intro}</p>
            <p className={s.privacyNote}>{c.privacyNote}</p>

            <noscript>
              <p className={s.notice} dangerouslySetInnerHTML={{ __html: c.noscriptHtml }} />
            </noscript>

            {/* `outcome` is already narrowed to the non-`sent` cases here: the
                `sent` const above is an inferred type predicate, so adding a
                `kind !== 'sent'` guard is a comparison TypeScript rejects as
                impossible. */}
            {outcome && (
              <div className={s.notice} role="alert">
                <h2>
                  {outcome.kind === 'busy'
                    ? c.busyHeading
                    : outcome.kind === 'unavailable'
                      ? c.unavailableHeading
                      : outcome.kind === 'invalid'
                        ? c.invalidHeading
                        : c.failedHeading}
                </h2>
                <p>
                  {outcome.kind === 'busy'
                    ? c.busyBody
                    : outcome.kind === 'unavailable'
                      ? c.unavailableBody
                      : outcome.kind === 'invalid'
                        ? invalidBody(copy, outcome.reason)
                        : c.failedBody}
                </p>
                {/*
                  **On `failed` too, and that is the important one.** Before
                  the service is configured — the whole window between
                  publishing this page and finishing the mailbox, SES, IAM and
                  the deploy — a submission cannot be read by the browser at
                  all: the route either does not exist yet or answers dark with
                  no CORS header, so `fetch` throws and this is a `failed`.
                  Without the link here, the Privacy Policy's only contact
                  route would be a dead end for exactly that period.

                  `invalid` is the one case that gets no link: the sender can
                  fix it themselves, and offering the forum instead would be
                  sending them away from a form that is about to work.
                */}
                {outcome.kind !== 'invalid' && (
                  <p>
                    <a
                      href={copy.links.supportContactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.communityLinkLabel}
                    </a>
                  </p>
                )}
              </div>
            )}

            <form className={s.form} onSubmit={submit} noValidate>
              <label className={s.field}>
                <span className={s.label}>{c.topicLabel}</span>
                <select
                  className={s.control}
                  value={topic}
                  onChange={event => setTopic(event.target.value)}
                >
                  {c.topics.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={s.field}>
                <span className={s.label}>{c.messageLabel}</span>
                <textarea
                  className={s.control}
                  rows={8}
                  value={message}
                  required
                  onChange={event => setMessage(event.target.value)}
                />
                <span className={s.hint}>
                  {c.messageHint}
                  {/* Only once they are close to it; a running count on an empty
                      field reads as a demand rather than as help. */}
                  {remaining <= 500 && ` (${remaining})`}
                </span>
              </label>

              <label className={s.field}>
                <span className={s.label}>{c.replyToLabel}</span>
                <input
                  className={s.control}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={MAX_REPLY_TO_CHARS}
                  value={replyTo}
                  onChange={event => setReplyTo(event.target.value)}
                />
                <span className={s.hint}>{c.replyToHint}</span>
              </label>

              <label className={s.field}>
                <span className={s.label}>{c.licenseKeyLabel}</span>
                <input
                  className={s.control}
                  type="text"
                  // Off deliberately: a licence key is not something a browser
                  // should be invited to remember or offer on another site.
                  autoComplete="off"
                  maxLength={MAX_LICENSE_KEY_CHARS}
                  value={licenseKey}
                  onChange={event => setLicenseKey(event.target.value)}
                />
                <span className={s.hint}>{c.licenseKeyHint}</span>
              </label>

              {/*
                The honeypot.

                Hidden by CSS rather than by `type="hidden"`, because a form
                filler reads the DOM and skips hidden inputs — the point is that
                it looks fillable to a script and is unreachable for a person.
                `aria-hidden` on the wrapper keeps a screen reader out of it,
                `tabIndex={-1}` keeps the keyboard out, and `autoComplete="off"`
                stops a browser helpfully filling it in and getting a real
                sender silently dropped. The name `website` is chosen because it
                is the field name form fillers most want to populate.

                Never `display: none` — see the stylesheet.
              */}
              <div className={s.honeypot} aria-hidden="true">
                <label>
                  {c.honeypotLabel}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={event => setWebsite(event.target.value)}
                  />
                </label>
              </div>

              <div className={s.actions}>
                <button className={s.submit} type="submit" disabled={sending}>
                  {sending ? c.sending : outcome ? c.retryLabel : c.submit}
                </button>
              </div>

            </form>

            <p className={s.hint}>
              <a href={path('privacy')}>{copy.nav.links.privacy}</a>
            </p>
          </>
        )}
      </article>
    </app-contact>
  );
}
