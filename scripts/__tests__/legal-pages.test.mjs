// Run after `npx astro build`: node --test scripts/__tests__/legal-pages.test.mjs
// Asserts the built /privacy and /terms pages (D2-legal) meet their contract:
//   - the draft banner + IllustrativeNotice is present on both pages
//   - the three attestation strings on /terms are byte-for-byte the strings in
//     src/content/legal/attestations.json, and #agreement / #attestation anchors exist
//     (the app's "What this means" sheet deep-links to them)
//   - attestations.json matches LilyAi.Supervision.Attestations in the Phoenix app. The Elixir
//     source is looked up via LILY_ATTESTATIONS_EX, or ../lib/lily_ai/supervision/attestations.ex
//     relative to this repo (monorepo layout); the parity test is skipped when neither exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });
// Inline tags join their neighbours (so "<em>sign</em>." reads "sign."); every other tag is a break.
const INLINE = 'em|strong|span|a|i|b|code|time|abbr|mark|small|sup|sub';
const textOf = (html) =>
  decode(
    html
      .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(new RegExp(`</?(?:${INLINE})\\b[^>]*>`, 'gi'), '')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
const count = (html, re) => (html.match(re) ?? []).length;

const pageFile = (route) => join(root, 'dist', route.replace(/^\//, ''), 'index.html');
const pages = {};
for (const route of ['/privacy', '/terms']) {
  const f = pageFile(route);
  test(`build output contains ${route}`, () => assert.ok(existsSync(f), `missing ${f} (run \`npx astro build\` first)`));
  pages[route] = existsSync(f) ? readFileSync(f, 'utf8') : '';
}
const privacy = pages['/privacy'];
const terms = pages['/terms'];

const BANNER = 'Draft for the Pennsylvania pilot. Pending counsel review; not yet in effect.';

test('both pages: exactly one h1 and a draft banner with an IllustrativeNotice', () => {
  for (const [route, html] of Object.entries(pages)) {
    assert.equal(count(html, /<h1\b/g), 1, `${route} h1 count`);
    const banner = html.match(/<[a-z]+\b[^>]*data-draft-banner[^>]*>[\s\S]*?<\/aside>/i)?.[0] ?? '';
    assert.ok(banner, `${route} lacks a [data-draft-banner] element`);
    assert.match(banner, /data-illustrative/, `${route} banner is not an IllustrativeNotice`);
    assert.ok(textOf(banner).includes(BANNER), `${route} banner text`);
    assert.ok(textOf(banner).includes('Illustrative · pending validation'), `${route} illustrative label`);
    // the banner sits above the first heading of the page
    assert.ok(html.indexOf('data-draft-banner') < html.indexOf('<h1'), `${route} banner precedes the h1`);
  }
});

test('legal sources are present and well-formed', () => {
  const a = JSON.parse(read('src/content/legal/attestations.json'));
  for (const key of ['agreement_supervisor_v1', 'agreement_supervisee_v1', 'weekly_signoff_v1']) {
    assert.equal(typeof a[key]?.text, 'string', `${key}.text`);
    assert.ok(a[key].text.length > 20, `${key}.text non-empty`);
    assert.equal(a[key].version, 1, `${key}.version`);
  }
  assert.equal(a.weekly_signoff_v1.text, 'I supervised these hours as described. Lily records attestations; it does not certify hours to the board.');
  const t = JSON.parse(read('src/content/legal/agreement-terms.json'));
  assert.equal(t.terms.length, 10, 'ten agreement terms');
  assert.deepEqual(t.terms.map((x) => x.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('attestations.json matches LilyAi.Supervision.Attestations (Phoenix)', (ctx) => {
  const candidates = [process.env.LILY_ATTESTATIONS_EX, resolve(root, '..', 'lib/lily_ai/supervision/attestations.ex')].filter(Boolean);
  const ex = candidates.find(existsSync);
  if (!ex) return ctx.skip('Phoenix attestations.ex not found (set LILY_ATTESTATIONS_EX)');
  const src = readFileSync(ex, 'utf8');
  const a = JSON.parse(read('src/content/legal/attestations.json'));
  for (const [key, entry] of Object.entries(a)) {
    if (key.startsWith('_')) continue;
    const m = src.match(new RegExp(`key:\\s*"${key}",\\s*version:\\s*(\\d+),\\s*text:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    assert.ok(m, `${key} not found in ${ex}`);
    assert.equal(Number(m[1]), entry.version, `${key} version`);
    assert.equal(JSON.parse(`"${m[2]}"`), entry.text, `${key} text drifted from Phoenix`);
  }
});

test('/terms: #agreement and #attestation anchors exist exactly once', () => {
  for (const id of ['agreement', 'attestation']) {
    assert.equal(count(terms, new RegExp(`\\sid="${id}"`, 'g')), 1, `#${id}`);
  }
});

test('/terms: the three attestation strings appear byte-for-byte from attestations.json', () => {
  const a = JSON.parse(read('src/content/legal/attestations.json'));
  const text = textOf(terms);
  for (const key of ['agreement_supervisor_v1', 'agreement_supervisee_v1', 'weekly_signoff_v1']) {
    assert.ok(text.includes(a[key].text), `${key} text missing from /terms`);
    assert.match(terms, new RegExp(`data-attestation="${key}"`), `${key} data-attestation hook`);
  }
  // the attestation section is where they live
  const section = terms.slice(terms.indexOf('id="attestation"'));
  assert.ok(textOf(section).includes(a.weekly_signoff_v1.text), 'weekly text inside #attestation');
});

test('/terms: headline, chips and structure', () => {
  const text = textOf(terms);
  assert.match(text, /The terms, and what you sign\./);
  assert.match(text, /Effective 2026-11-03/);
  assert.match(text, /Version 1\.0 \(draft\)/);
  assert.match(text, /PA pilot/);
  assert.match(text, /Lily is the platform, not your supervisor\./);
  assert.equal(count(terms, /class="[^"]*\bv2-step\b[^"]*"/g), 3, 'three who-Lily-is cards');
  assert.match(text, /The rules, in five parts\./);
  assert.equal(count(terms, /<details\b[^>]*data-platform-term/g), 5, 'five platform-term rows');
  assert.equal(count(terms, /<details\b[^>]*data-platform-term[^>]*\sopen(\s|=|>)/g), 1, 'only the first row is open');
  assert.match(terms.match(/<details\b[^>]*data-platform-term[^>]*>/)[0], /\sopen(\s|=|>)/, 'first row is the open one');
  assert.match(text, /The agreement you countersign\./);
  assert.match(text, /What a weekly sign-off says\./);
  assert.match(text, /Requirements differ by state and license\./);
  assert.match(text, /Join as a supervisor/);
  assert.match(text, /See my matches/);
});

test('/terms: ten numbered agreement terms with example values labelled as examples', () => {
  const section = terms.slice(terms.indexOf('id="agreement"'), terms.indexOf('id="attestation"'));
  assert.equal(count(section, /<li\b[^>]*data-agreement-term/g), 10, 'ten terms');
  const text = textOf(section);
  for (const needle of ['$95', '$45', 'Thu 7:00pm', '24 hours', '50%', '14 days']) assert.ok(text.includes(needle), `example value ${needle}`);
  assert.match(text, /example values/i, 'values are labelled as examples');
  assert.ok(count(section, /data-example/g) >= 4, 'example values carry data-example');
});

test('/terms: fine-print cards and CTA hrefs', () => {
  const text = textOf(terms);
  for (const needle of ['Liability', 'Governing law', 'Commonwealth of Pennsylvania', '30 days', 'legal@lily.example']) assert.ok(text.includes(needle), needle);
  assert.match(terms, /href="https:\/\/[^"]*\/app\/signup\/supervisor"/);
  assert.match(terms, /href="https:\/\/[^"]*\/app\/sign-in"/);
});

test('/privacy: headline, effective date and summary tiles', () => {
  const text = textOf(privacy);
  assert.match(text, /Your data, in plain language\./);
  assert.match(text, /12 Oct 2026 · v1\.0 \(draft\)/);
  assert.equal(count(privacy, /class="[^"]*\bv2-stat\b[^"]*"/g), 4, 'four stat tiles');
  for (const needle of ['What we collect', 'Why we use it', 'Who sees it', 'How long we keep it']) assert.ok(text.includes(needle), needle);
});

test('/privacy: role cards, affinity callout, disclosure, choices, retention, policy rows', () => {
  const text = textOf(privacy);
  assert.equal(count(privacy, /data-role-card="(graduate|supervisor|program-admin)"/g), 3, 'three role cards');
  assert.match(text, /Affinity answers are for matching, never public\./);
  assert.match(text, /hours and signatures only/i);
  assert.match(text, /Stripe, only if you opt into payments/);
  assert.match(text, /We do not sell your personal information\./);
  for (const needle of ['Export, correct or delete', 'Control visibility and reminders']) assert.ok(text.includes(needle), needle);
  assert.match(text, /dual-signed hours logs/);
  assert.match(text, /licensure evidence/);
  assert.equal(count(privacy, /<details\b[^>]*data-policy-row/g), 3, 'children, cookies, changes');
  for (const needle of ['Children and age requirements', 'Cookies and service analytics', 'Changes to this privacy policy']) assert.ok(text.includes(needle), needle);
  assert.match(privacy, /href="\/contact\?topic=trust"/, 'CTA to /contact?topic=trust');
});

test('/privacy: clinical records are explicitly excluded', () => {
  assert.match(textOf(privacy), /We do not collect your clinical records or therapy notes\./);
});
