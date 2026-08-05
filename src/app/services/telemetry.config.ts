/**
 * TelemetryDeck configuration for the support website.
 *
 * `TELEMETRY_DECK_APP_ID` is the App ID of the *website* app in the
 * TelemetryDeck dashboard (Dashboard → App → Set Up App). It is a public
 * identifier — it is embedded in the shipped JavaScript bundle by design and
 * is not a secret, so it lives in source rather than in a build secret.
 *
 * Leave it empty to disable telemetry entirely: `TelemetryService` then
 * constructs, does nothing, and never contacts the network.
 *
 * Scope note: this covers the marketing/support website only. The SpeakWith
 * macOS and iOS apps ship with no analytics of any kind, and nothing here is
 * linked into them.
 */
export const TELEMETRY_DECK_APP_ID = '83E0CDF5-9251-4B90-8169-5A0CE405F51C';

/**
 * Hostnames that should report as TelemetryDeck *test* signals rather than
 * production traffic — local `ng serve` and any `*.local` bonjour name. Test
 * signals are only visible in the dashboard's Test Mode, so development never
 * pollutes the real numbers.
 */
export const TELEMETRY_TEST_HOSTS = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'];
