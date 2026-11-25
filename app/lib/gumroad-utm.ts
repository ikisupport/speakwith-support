/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

/**
 * Campaign-tagged form of a Gumroad product permalink.
 *
 * Gumroad stores a visit under Analytics → Links only when the URL carries
 * `utm_source`, `utm_medium` *and* `utm_campaign` together — its tracker
 * returns before the insert if any one of the three is missing. `utm_content`
 * is optional and is what separates one button from another, so a sale can be
 * read back to the control that sent the visitor. Attribution is per product:
 * the click is stored on first arrival and counts as a sale when that same
 * browser buys that same product within 7 days.
 *
 * Only the `href` is tagged. The click handlers keep comparing and reporting
 * the bare permalink, because `copy.links.*` string equality is what names the
 * TelemetryDeck signal — tagging the string those comparisons see would
 * collapse every channel click to a single `cta.channel`.
 *
 * Values are stripped, lowercased and reduced to `[a-z0-9_-]` by Gumroad, so
 * the constants below are already in their stored form. Any query the
 * permalink already carries (the app's trial `?price=0`, say) is preserved —
 * this never invents one.
 */
export function withGumroadUtm(url: string, content: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Relative, empty or malformed: hand it back untouched rather than
    // throwing. A throw here would take down the prerender, not just skip one
    // link.
    return url;
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== 'gumroad.com' && !host.endsWith('.gumroad.com')) return url;
  parsed.searchParams.set('utm_source', 'support-site');
  parsed.searchParams.set('utm_medium', 'referral');
  parsed.searchParams.set('utm_campaign', 'mac-checkout');
  parsed.searchParams.set('utm_content', content);
  return parsed.toString();
}
