#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

// Truth table for withGumroadUtm(). Not a framework test — a plain assertion
// script, in the shape of test-resolve-route.mjs, because the helper is one
// pure function that every paid CTA on the site now routes through. It is
// imported for real (Node strips the types) rather than mirrored here: a
// mirrored copy could pass while the shipped function was wrong.
import assert from 'node:assert/strict';
import { withGumroadUtm } from '../app/lib/gumroad-utm.ts';

let checks = 0;
const check = (label, fn) => {
  fn();
  checks += 1;
  console.log(`  ok  ${label}`);
};

// Gumroad's tracker returns before the insert unless source, medium and
// campaign are all present; content is the button id.
check('tags a permalink with all four parameters', () => {
  const out = new URL(withGumroadUtm('https://ikisystems.gumroad.com/l/dcltnn', 'home-subscribe'));
  assert.equal(out.origin + out.pathname, 'https://ikisystems.gumroad.com/l/dcltnn');
  assert.equal(out.searchParams.get('utm_source'), 'support-site');
  assert.equal(out.searchParams.get('utm_medium'), 'referral');
  assert.equal(out.searchParams.get('utm_campaign'), 'mac-checkout');
  assert.equal(out.searchParams.get('utm_content'), 'home-subscribe');
});

check('content is per button, so two slots on one product stay apart', () => {
  const card = withGumroadUtm('https://ikisystems.gumroad.com/l/vkaxll', 'pricing-appstore-card');
  const tertiary = withGumroadUtm('https://ikisystems.gumroad.com/l/vkaxll', 'pricing-trial');
  assert.notEqual(card, tertiary);
  assert.equal(new URL(card).searchParams.get('utm_content'), 'pricing-appstore-card');
  assert.equal(new URL(tertiary).searchParams.get('utm_content'), 'pricing-trial');
});

// The app's trial URL carries ?price=0. The helper must never drop a query the
// permalink already had, and must never invent that one.
check('keeps a pre-existing query parameter', () => {
  const out = new URL(withGumroadUtm('https://ikisystems.gumroad.com/l/vkaxll?price=0', 'pricing-trial'));
  assert.equal(out.searchParams.get('price'), '0');
  assert.equal(out.searchParams.get('utm_source'), 'support-site');
});

check('does not invent price=0', () => {
  const out = new URL(withGumroadUtm('https://ikisystems.gumroad.com/l/vkaxll', 'pricing-trial'));
  assert.equal(out.searchParams.get('price'), null);
});

check('replaces rather than duplicates an existing utm value', () => {
  const out = new URL(withGumroadUtm('https://ikisystems.gumroad.com/l/vozgsy?utm_source=stale', 'home-buy'));
  assert.deepEqual(out.searchParams.getAll('utm_source'), ['support-site']);
});

// Hostname guard: nothing but Gumroad is tagged, so an unrelated link in copy
// can be passed through the same render helper without acquiring a campaign.
check('leaves a non-Gumroad URL untouched', () => {
  assert.equal(
    withGumroadUtm('https://apps.apple.com/app/id123', 'pricing-appstore-card'),
    'https://apps.apple.com/app/id123',
  );
});

check('is not fooled by a lookalike host', () => {
  const evil = 'https://gumroad.com.example.test/l/dcltnn';
  assert.equal(withGumroadUtm(evil, 'home-subscribe'), evil);
});

check('tags the apex host as well as a subdomain', () => {
  const out = new URL(withGumroadUtm('https://gumroad.com/l/dcltnn', 'home-subscribe'));
  assert.equal(out.searchParams.get('utm_campaign'), 'mac-checkout');
});

// A relative or empty href must come back unchanged, not throw: a throw inside
// the render would take down the prerender rather than skip one link.
check('returns a relative, empty or malformed string unchanged', () => {
  assert.equal(withGumroadUtm('/pricing/', 'home-buy'), '/pricing/');
  assert.equal(withGumroadUtm('', 'home-buy'), '');
  assert.equal(withGumroadUtm('not a url', 'home-buy'), 'not a url');
});

console.log(`\nwithGumroadUtm: ${checks} checks passed`);
