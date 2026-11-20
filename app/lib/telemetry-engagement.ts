/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

/**
 * Pure pieces of a TelemetryDeck website `pageLeave`.
 *
 * The browser module owns listeners and sending. This file only turns a
 * scroll position and a visible-time span into the three engagement fields
 * the website layout reads.
 */

/** One JSON object per request. `sendBeacon` uses this URL on unload. */
export const TELEMETRY_WEB_INGEST = 'https://nom.telemetrydeck.com/v3/w/';

export function quantizeDepth(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  const clamped = Math.min(100, Math.max(0, raw));
  // A fully scrolled page often lands a fraction under 100.
  if (clamped >= 99) return 100;
  return Math.round(clamped);
}

/** Floor to the buckets the website layout groups on. 100 stays 100. */
export function scrollMilestone(depth: number): '0' | '25' | '50' | '75' | '100' {
  const q = quantizeDepth(depth);
  if (q >= 100) return '100';
  const bucket = Math.floor(q / 25) * 25;
  if (bucket >= 75) return '75';
  if (bucket >= 50) return '50';
  if (bucket >= 25) return '25';
  return '0';
}

export function engagedSeconds(visibleMs: number): number {
  if (!Number.isFinite(visibleMs) || visibleMs <= 0) return 0;
  return Math.floor(visibleMs / 1000);
}

/** Deepest viewport position as a percent of document height. A short page is 100. */
export function scrollDepthPercent(scrollY: number, viewport: number, scrollHeight: number): number {
  if (scrollHeight <= 0 || viewport <= 0 || scrollHeight <= viewport) return 100;
  return quantizeDepth(((scrollY + viewport) / scrollHeight) * 100);
}

export interface PageLeaveInput {
  appID: string;
  url: string;
  referrer: string;
  locale: string;
  isTestMode: boolean;
  depth: number;
  visibleMs: number;
}

/** Flat web-ingest body. No visitor id: the server builds its own daily hash. */
export function pageLeaveBody(input: PageLeaveInput): Record<string, string | number> {
  const depth = quantizeDepth(input.depth);
  const body: Record<string, string | number> = {
    appID: input.appID,
    url: input.url,
    locale: input.locale,
    isTestMode: input.isTestMode ? 'true' : 'false',
    type: 'TelemetryDeck.Web.pageLeave',
    'TelemetryDeck.PageEngagement.scrollDepth': depth,
    'TelemetryDeck.PageEngagement.scrollDepthMilestone': scrollMilestone(depth),
    'TelemetryDeck.PageEngagement.engagedSeconds': engagedSeconds(input.visibleMs),
  };
  if (input.referrer) body.referrer = input.referrer;
  return body;
}
