/**
 * The contact form's pure pieces: what gets posted, what the browser refuses
 * before posting, and what each answer means on screen.
 *
 * Separated from `routes/contact.tsx` so they can be asserted without a DOM —
 * `scripts/test-contact-form.mjs` imports this module directly, which Node
 * does by stripping the type annotations. Nothing here imports the copy, the
 * aliased JSON or React, and nothing here reaches the network; keeping it that
 * way is what keeps that test a plain import rather than a build.
 *
 * The bounds below are **restated from the service**, not shared with it: the
 * server is Rust in another repo directory and is the only thing that actually
 * enforces them. A client-side check exists to spare someone a round trip and
 * to put the message beside the field, never as the gate — see
 * `sw_aws/src/contact.rs`, which re-checks every one of them. If the two ever
 * disagree the server wins, and the `invalid` outcomes below are how its answer
 * is rendered.
 */

/** The closed vocabulary the service accepts. A fourth value is a `400`. */
export type ContactTopic = 'privacy_delete' | 'privacy_question' | 'other';

export const TOPICS: readonly ContactTopic[] = ['privacy_delete', 'privacy_question', 'other'];

/** Characters, not bytes, exactly as the service counts them. */
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_REPLY_TO_CHARS = 254;
export const MAX_LICENSE_KEY_CHARS = 100;

/**
 * The service drops anything submitted faster than this. Restated here only so
 * the button can stay disabled rather than letting someone submit into a
 * silent drop — the service's answer to a drop is a cheerful `200`, so a fast
 * submit would otherwise look sent and never arrive.
 */
export const MIN_ELAPSED_MS = 3000;

/** The form's fields, as strings straight out of the inputs. */
export interface ContactDraft {
  topic: string;
  message: string;
  replyTo: string;
  licenseKey: string;
  /** The honeypot. A real person never sees this field, let alone fills it. */
  website: string;
  /** Milliseconds since the form became interactive. */
  elapsedMs: number;
}

/**
 * The JSON body, in the service's snake_case.
 *
 * Optional fields are **omitted when blank** rather than sent as `""`:
 * `JSON.stringify` drops an `undefined` property, and the service treats a
 * blank string as absent anyway, so this keeps the wire body to what was
 * actually filled in.
 */
export interface ContactPayload {
  topic: string;
  message: string;
  reply_to?: string;
  license_key?: string;
  website?: string;
  elapsed_ms: number;
}

export function buildPayload(draft: ContactDraft): ContactPayload {
  const payload: ContactPayload = {
    topic: draft.topic,
    message: draft.message.trim(),
    elapsed_ms: Math.max(0, Math.floor(draft.elapsedMs)),
  };
  const replyTo = draft.replyTo.trim();
  if (replyTo) {
    payload.reply_to = replyTo;
  }
  const licenseKey = draft.licenseKey.trim();
  if (licenseKey) {
    payload.license_key = licenseKey;
  }
  // Sent even when empty, because that is what the real form submits and the
  // service reads a blank value as "not filled". Omitting it would make our
  // own page the one caller whose body looks different from a bot's.
  payload.website = draft.website;
  return payload;
}

/** Why the browser will not post this draft yet, or `null` when it will. */
export type LocalProblem =
  | 'missingMessage'
  | 'tooLong'
  | 'badReplyTo'
  | 'longLicenseKey'
  | 'tooFast'
  | 'unknownTopic';

/**
 * The same checks the service makes, in the same order, so a message that would
 * be refused or silently dropped is caught beside the field instead.
 *
 * `tooFast` is in the list and is **not** shown as an error — the page uses it
 * to keep the button disabled. That matters more than the others: the service
 * answers a too-fast submission with the identical `200` an accepted one gets,
 * so without this the form would report success for a message that was thrown
 * away.
 */
export function localProblem(draft: ContactDraft): LocalProblem | null {
  if (!TOPICS.includes(draft.topic as ContactTopic)) {
    return 'unknownTopic';
  }
  const message = draft.message.trim();
  if (!message) {
    return 'missingMessage';
  }
  if (countChars(message) > MAX_MESSAGE_CHARS) {
    return 'tooLong';
  }
  const replyTo = draft.replyTo.trim();
  if (replyTo && (countChars(replyTo) > MAX_REPLY_TO_CHARS || !looksLikeAddress(replyTo))) {
    return 'badReplyTo';
  }
  if (countChars(draft.licenseKey.trim()) > MAX_LICENSE_KEY_CHARS) {
    return 'longLicenseKey';
  }
  if (draft.elapsedMs < MIN_ELAPSED_MS) {
    return 'tooFast';
  }
  return null;
}

/**
 * Count by code point, not by UTF-16 unit.
 *
 * `"".length` is 2 for one emoji and 1 for one Japanese character, while the
 * service counts `chars()` — Unicode scalar values. Using `.length` would
 * refuse a message of 2,001 emoji that the service would accept, and the
 * disagreement would only ever show up for someone writing in a script nobody
 * tested with.
 */
export function countChars(value: string): number {
  return [...value].length;
}

/**
 * The same conservative shape the service accepts, and it is the same two
 * questions: is this address-like, and is it safe as a `Reply-To` header. The
 * character class is what refuses `a@b\nBcc: everyone`.
 *
 * Deliberately not a full RFC 5322 grammar, for the service's reason: that
 * grammar admits quoted local parts containing almost anything.
 */
export function looksLikeAddress(value: string): boolean {
  if (/[\s,;<>"\\]/.test(value)) {
    return false;
  }
  const parts = value.split('@');
  if (parts.length !== 2) {
    return false;
  }
  const [local, domain] = parts;
  if (!local || !domain) {
    return false;
  }
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

/** What the page shows after an attempt. */
export type Outcome =
  | { kind: 'sent' }
  /** The day's cap is spent. The page points at the Community. */
  | { kind: 'busy' }
  /** The service has no contact form configured. Also the Community. */
  | { kind: 'unavailable' }
  /** Something went wrong that a retry might fix. */
  | { kind: 'failed' }
  /** The sender can fix this one; `reason` picks the line to show. */
  | { kind: 'invalid'; reason: InvalidReason };

export type InvalidReason = 'tooLong' | 'missingMessage' | 'badReplyTo' | 'longLicenseKey';

/**
 * Turn the service's answer into what the page shows.
 *
 * ## Why this reads the status *and* the token
 *
 * Both `503`s are real states with different copy — `contact_busy` means "try
 * tomorrow or use the Community", `contact_not_configured` means "the form is
 * off" — and they are told apart only by the token. The `400`s likewise: four
 * of them name a field the sender can fix, and the rest (`invalid_json`,
 * `unknown_topic`, `expected_application_json`) are bugs in **this page**,
 * which a sender can do nothing about, so they render as a plain failure
 * rather than as advice.
 *
 * ## The body may be absent, and `413` is why
 *
 * The `413` is written by the service's body-limit layer before its handler is
 * entered, so it has **no JSON body at all**. Anything that assumed a parsed
 * body here would throw on the one answer a long message actually produces.
 * `body` is therefore `unknown` and every read of it is guarded.
 *
 * ## `200` is not proof of delivery, and cannot be
 *
 * A message dropped by the honeypot, the fill-time floor or the link ceiling is
 * answered with the byte-identical `200` an accepted one gets — deliberately,
 * so a bot learns nothing. So `sent` here means "accepted or silently
 * discarded", and the page's own `localProblem` gate is what keeps an honest
 * sender out of the discard case.
 */
export function stateForResponse(status: number, body: unknown): Outcome {
  const token = statusToken(body);

  if (status === 200) {
    return { kind: 'sent' };
  }
  // Before the 400 group: the body-limit answer carries no token to read.
  if (status === 413) {
    return { kind: 'invalid', reason: 'tooLong' };
  }
  if (status === 400) {
    switch (token) {
      case 'message_too_long':
        return { kind: 'invalid', reason: 'tooLong' };
      case 'missing_message':
        return { kind: 'invalid', reason: 'missingMessage' };
      case 'reply_to_not_an_address':
      case 'reply_to_too_long':
        return { kind: 'invalid', reason: 'badReplyTo' };
      case 'license_key_too_long':
        return { kind: 'invalid', reason: 'longLicenseKey' };
      default:
        // `invalid_json` or `unknown_topic`: this page built a bad body. Not
        // the sender's to fix, so it is not dressed up as their mistake.
        return { kind: 'failed' };
    }
  }
  if (status === 503) {
    return token === 'contact_not_configured' ? { kind: 'unavailable' } : { kind: 'busy' };
  }
  return { kind: 'failed' };
}

/** The `status` string out of a JSON body, or `null` for anything else. */
export function statusToken(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const status = (body as { status?: unknown }).status;
  return typeof status === 'string' ? status : null;
}
