#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

// Truth table for the contact form's pure pieces. Not a framework test — a
// plain assertion script, in `test-resolve-route.mjs`'s shape.
//
// Unlike that one, this **imports the real module** rather than mirroring its
// rules: `app/lib/contact-form.ts` deliberately pulls in nothing (no React, no
// aliased copy.json, no network), so Node can load it by stripping the type
// annotations. A mirrored copy of this logic would be the one thing worth
// avoiding here, because what is being checked is the agreement between this
// page and a Rust service in another tree — a second copy on this side would
// just be a third thing to keep in step.
import {
  MAX_LICENSE_KEY_CHARS,
  MAX_MESSAGE_CHARS,
  MIN_ELAPSED_MS,
  buildPayload,
  countChars,
  localProblem,
  looksLikeAddress,
  stateForResponse,
  statusToken,
} from '../app/lib/contact-form.ts';

let failed = 0;

function check(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${label}` +
      (ok ? '' : `\n         got  ${JSON.stringify(got)}\n         want ${JSON.stringify(want)}`),
  );
}

function draft(over = {}) {
  return {
    topic: 'privacy_question',
    message: 'Please tell me what you hold about my purchase.',
    replyTo: 'someone@example.com',
    licenseKey: '',
    website: '',
    elapsedMs: 42_000,
    ...over,
  };
}

console.log('payload:');
check('a full draft becomes the service\'s snake_case body', buildPayload(draft({ licenseKey: 'ABCD-1234' })), {
  topic: 'privacy_question',
  message: 'Please tell me what you hold about my purchase.',
  elapsed_ms: 42_000,
  reply_to: 'someone@example.com',
  license_key: 'ABCD-1234',
  website: '',
});
// Blank optionals are omitted, not sent as "". The service reads either the
// same way, so this is about not putting empty strings on the wire.
check('blank optionals are omitted', buildPayload(draft({ replyTo: '   ', licenseKey: '' })), {
  topic: 'privacy_question',
  message: 'Please tell me what you hold about my purchase.',
  elapsed_ms: 42_000,
  website: '',
});
check('the message is trimmed', buildPayload(draft({ message: '  hello  ' })).message, 'hello');
check('a fractional clock is floored', buildPayload(draft({ elapsedMs: 9_999.7 })).elapsed_ms, 9_999);
// A negative clock would be a `-1` on the wire, which the service reads as
// below the floor and drops — same outcome, but the body should not be odd.
check('a negative clock becomes zero', buildPayload(draft({ elapsedMs: -5 })).elapsed_ms, 0);
// The honeypot rides even when empty, so our body is shaped like any other.
check('the honeypot is always present', 'website' in buildPayload(draft()), true);

console.log('local bounds:');
check('a good draft has no problem', localProblem(draft()), null);
check('an empty message', localProblem(draft({ message: '   \n ' })), 'missingMessage');
check('a message at the bound is fine', localProblem(draft({ message: 'a'.repeat(MAX_MESSAGE_CHARS) })), null);
check('a message over the bound', localProblem(draft({ message: 'a'.repeat(MAX_MESSAGE_CHARS + 1) })), 'tooLong');
check('an unknown topic', localProblem(draft({ topic: 'billing' })), 'unknownTopic');
check('a blank reply address is allowed', localProblem(draft({ replyTo: '' })), null);
check('a malformed reply address', localProblem(draft({ replyTo: 'someone@example' })), 'badReplyTo');
// The header-injection shape, refused on this side too so it never leaves the
// browser. The service refuses it again; this is the nicer message.
check('a reply address with a newline', localProblem(draft({ replyTo: 'a@b.com\nBcc: x@y.com' })), 'badReplyTo');
check('a long licence key', localProblem(draft({ licenseKey: 'K'.repeat(MAX_LICENSE_KEY_CHARS + 1) })), 'longLicenseKey');
check('a licence key at the bound is fine', localProblem(draft({ licenseKey: 'K'.repeat(MAX_LICENSE_KEY_CHARS) })), null);
// The gate that matters most: the service answers a too-fast submission with
// the SAME 200 an accepted one gets, so without this the page would report
// success for a message that was discarded.
check('a submission under the fill floor', localProblem(draft({ elapsedMs: MIN_ELAPSED_MS - 1 })), 'tooFast');
check('a submission at the fill floor', localProblem(draft({ elapsedMs: MIN_ELAPSED_MS })), null);
// Ordering: the message is judged before the clock, so an empty form does not
// read as "too fast" while the sender is still typing.
check('the message is judged before the clock', localProblem(draft({ message: '', elapsedMs: 0 })), 'missingMessage');

console.log('character counting:');
// `.length` would say 2 for one emoji and would refuse messages the service
// accepts. The service counts Unicode scalar values; so does this.
check('an emoji is one character', countChars('🙂'), 1);
check('a Japanese character is one character', countChars('あ'), 1);
check('4,000 emoji are within the bound', localProblem(draft({ message: '🙂'.repeat(MAX_MESSAGE_CHARS) })), null);
check('4,001 emoji are not', localProblem(draft({ message: '🙂'.repeat(MAX_MESSAGE_CHARS + 1) })), 'tooLong');

console.log('address shape:');
for (const good of ['a@b.co', 'someone+tag@example.co.uk', 'first.last@sub.example.com']) {
  check(`accepts ${good}`, looksLikeAddress(good), true);
}
for (const bad of [
  '',
  '@example.com',
  'someone@',
  'someone',
  'someone@example',
  'someone@.example.com',
  'someone@example.com.',
  'a@b@c.com',
  'some one@example.com',
  'a@b.com, c@d.com',
  '<a@b.com>',
]) {
  check(`refuses ${JSON.stringify(bad)}`, looksLikeAddress(bad), false);
}

console.log('response mapping:');
check('200 received', stateForResponse(200, { status: 'received' }), { kind: 'sent' });
// A drop answers identically, by design, so this page cannot tell them apart.
check('200 is sent even for a silent drop', stateForResponse(200, { status: 'received' }), { kind: 'sent' });
check('503 contact_busy', stateForResponse(503, { status: 'contact_busy' }), { kind: 'busy' });
check('503 contact_not_configured', stateForResponse(503, { status: 'contact_not_configured' }), {
  kind: 'unavailable',
});
check('502 contact_send_failed', stateForResponse(502, { status: 'contact_send_failed' }), { kind: 'failed' });
check('400 message_too_long', stateForResponse(400, { status: 'message_too_long' }), {
  kind: 'invalid',
  reason: 'tooLong',
});
check('400 missing_message', stateForResponse(400, { status: 'missing_message' }), {
  kind: 'invalid',
  reason: 'missingMessage',
});
check('400 reply_to_not_an_address', stateForResponse(400, { status: 'reply_to_not_an_address' }), {
  kind: 'invalid',
  reason: 'badReplyTo',
});
check('400 reply_to_too_long', stateForResponse(400, { status: 'reply_to_too_long' }), {
  kind: 'invalid',
  reason: 'badReplyTo',
});
check('400 license_key_too_long', stateForResponse(400, { status: 'license_key_too_long' }), {
  kind: 'invalid',
  reason: 'longLicenseKey',
});
// Our bug, not the sender's: it is not dressed up as their mistake.
check('400 invalid_json is a plain failure', stateForResponse(400, { status: 'invalid_json' }), { kind: 'failed' });
check('400 unknown_topic is a plain failure', stateForResponse(400, { status: 'unknown_topic' }), { kind: 'failed' });
check('403 origin_not_allowed is a plain failure', stateForResponse(403, { status: 'origin_not_allowed' }), {
  kind: 'failed',
});
check('415 is a plain failure', stateForResponse(415, { status: 'expected_application_json' }), { kind: 'failed' });
// **The 413 has no body at all** — it is written by the service's body-limit
// layer before its handler runs. Anything that assumed a parsed body here would
// throw on the one answer a very long message actually produces.
check('413 with no body is a long message', stateForResponse(413, null), { kind: 'invalid', reason: 'tooLong' });
check('413 with an unparseable body', stateForResponse(413, undefined), { kind: 'invalid', reason: 'tooLong' });
check('an unknown status is a plain failure', stateForResponse(418, { status: 'teapot' }), { kind: 'failed' });
check('a 503 with no body falls to busy', stateForResponse(503, null), { kind: 'busy' });

console.log('token reading:');
check('a string status', statusToken({ status: 'received' }), 'received');
check('a missing status', statusToken({}), null);
check('a non-string status', statusToken({ status: 7 }), null);
check('null', statusToken(null), null);
check('a string body', statusToken('received'), null);
check('undefined', statusToken(undefined), null);

console.log(failed ? `contact-form: ${failed} failure(s)` : 'contact-form: ok');
process.exit(failed ? 1 : 0);
