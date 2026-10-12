// node --test src/components/v2/sections/how/how.test.mjs   (HP_SKIP_BUILD=1 to reuse dist/)
// Asserts the built /how-it-works page against specs/site-how-it-works.md.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { runChecks, DEFAULT_APP_URL } from '../../../../../scripts/check-pages.mjs';
import { buildOnce, loadRoute, root, TAG, attr, hasAttr, byTag, findAll, flat, mainOf } from './test-dom.mjs';

let page;
let main;
const norm = (s) => s.replace(/\s+([.,;:!?%])/g, '$1').replace(/\s+/g, ' ').trim();
const stepEl = (n) => findAll(main, (el) => el.nodeName === 'section' && attr(el, 'data-step') === String(n))[0]?.n;
const within = (el, pred) => findAll(el, pred).map((x) => x.n);
const hasTag = (el) => within(el, (n) => hasAttr(n, 'data-illustrative') && flat(n).includes(TAG)).length > 0
  || flat(el).includes(TAG);

before(() => {
  buildOnce();
  page = loadRoute('/how-it-works');
  main = mainOf(page.doc);
});

test('check-pages reports no failures for /how-it-works and the /how redirect resolves', () => {
  const { failures, checked } = runChecks({ dist: join(root, 'dist'), only: ['/how-it-works'], appUrl: DEFAULT_APP_URL });
  assert.deepEqual(failures, []);
  assert.ok(checked.includes('/how-it-works'));
});

test('hero: one h1 with the accented agreement, waitlist and sample-agreement CTAs', () => {
  const h1s = byTag(page.doc, 'h1');
  assert.equal(h1s.length, 1);
  assert.equal(norm(flat(h1s[0])), 'From first open to a signed agreement.');
  assert.ok(within(h1s[0], (n) => n.nodeName === 'em' && norm(flat(n)) === 'agreement.').length === 1, 'em accent');
  const links = byTag(main, 'a');
  const wait = links.find((a) => flat(a) === 'Join the waitlist' && attr(a, 'href') === '/waitlist');
  const sample = links.find((a) => flat(a) === 'See a sample agreement');
  assert.ok(wait, 'primary CTA to /waitlist');
  assert.equal(attr(sample, 'href'), '#agree');
});

test('six numbered steps with the spec headlines, in order', () => {
  const heads = ['One notification when your county is ready.', 'We check the license with the licensing jurisdiction.', 'Ranked by fit, chosen by both.', 'Rate, cadence and format in one pass.', 'Hours logged by one, signed by the other.', 'We stay with you past the license.'];
  heads.forEach((h, i) => {
    const s = stepEl(i + 1);
    assert.ok(s, `step ${i + 1} section`);
    const h2 = byTag(s, 'h2')[0];
    assert.equal(norm(flat(h2)), h);
    assert.equal(within(h2, (n) => n.nodeName === 'em').length, 1, `step ${i + 1} accent`);
    assert.match(flat(s), new RegExp(`STEP ${i + 1}`, 'i'));
    assert.ok(hasTag(s), `step ${i + 1} carries an illustrative label`);
  });
});

test('step 1: phone sign-up, push card and a cleared 14 of 12 threshold meter', () => {
  const s = stepEl(1);
  assert.equal(within(s, (n) => attr(n, 'data-mock') === 'PhoneFrame').length, 1);
  assert.equal(within(s, (n) => attr(n, 'data-mock') === 'PushCard').length, 1);
  assert.match(flat(s), /Maya Okafor/);
  assert.match(flat(s), /Join and wait/);
  assert.match(flat(s), /Lily is ready in your county/);
  assert.match(flat(s), /14 of 12/);
  assert.ok(within(s, (n) => attr(n, 'data-threshold') !== undefined).length === 1, 'threshold meter');
});

test('step 2: fictional license CW019274 marked Example, with a proposed-source IllustrativeNotice', () => {
  const s = stepEl(2);
  const rows = within(s, (n) => attr(n, 'data-mock') === 'VerificationRows')[0];
  assert.ok(rows, 'VerificationRows');
  assert.match(flat(rows), /CW019274/);
  assert.match(flat(rows), /Example/);
  const notice = within(s, (n) => n.nodeName === 'aside' && hasAttr(n, 'data-illustrative'));
  assert.ok(notice.some((n) => /proposed license-review source/i.test(flat(n))), 'notice about the proposed source');
});

test('step 3: 2 gates + 4 weighted dimensions and an example Renée Castillo card', () => {
  const s = stepEl(3);
  const table = byTag(s, 'table')[0];
  assert.ok(table);
  const rows = byTag(table, 'tbody').flatMap((b) => byTag(b, 'tr'));
  assert.equal(rows.length, 6);
  assert.equal(rows.filter((r) => /\bGate\b/.test(flat(r))).length, 2);
  assert.equal(rows.filter((r) => /\bWeighted\b/.test(flat(r))).length, 4);
  const card = within(s, (n) => attr(n, 'data-mock') === 'PractitionerCard')[0];
  assert.match(flat(card), /Renée Castillo/);
  assert.match(flat(card), /Example/);
  assert.match(flat(card), /\$95/);
  assert.match(flat(card), /\$40/);
});

test('step 4: #agree anchor, agreement rows, two signatures and the spec counsel-review wording, labelled illustrative', () => {
  const s = stepEl(4);
  assert.equal(attr(s, 'id'), 'agree');
  const a = within(s, (n) => attr(n, 'data-mock') === 'AgreementRows')[0];
  assert.ok(a);
  assert.equal(byTag(a, 'dt').length, 5);
  assert.equal(byTag(a, 'time').length, 2);
  const t = norm(flat(s));
  assert.ok(t.includes('Board attestation language · counsel-reviewed Sep 2026'), 'agreement row matches spec/SVG');
  assert.ok(t.includes('A Pennsylvania-licensed attorney reviewed the template.'), 'body matches SVG');
  assert.ok(t.includes('Counsel-reviewed'), 'chip matches SVG');
  assert.doesNotMatch(t, /counsel review (of that language )?(is )?pending/i);
  assert.ok(hasTag(s), 'legal-status claim sits beside an Illustrative · pending validation label');
});

test('step 5: hours log whose export buttons are not links', () => {
  const s = stepEl(5);
  const log = within(s, (n) => attr(n, 'data-mock') === 'HoursLogPreview')[0];
  assert.ok(log);
  assert.match(flat(log), /1,240/);
  const exports = within(log, (n) => hasAttr(n, 'data-export'));
  assert.equal(exports.length, 2);
  for (const e of exports) assert.notEqual(e.nodeName, 'a', 'export is not a link');
  assert.equal(byTag(s, 'a').filter((a) => /^Export/.test(flat(a))).length, 0);
});

test('step 6: three roadmap StepCards', () => {
  const s = stepEl(6);
  const cards = within(s, (n) => n.nodeName === 'article' && /\bv2-step\b/.test(attr(n, 'class') ?? ''));
  assert.equal(cards.length, 3);
  for (const c of cards) assert.ok(within(c, (n) => hasAttr(n, 'data-roadmap')).length >= 1 || hasAttr(c, 'data-roadmap'), 'roadmap marker');
  const t = flat(s);
  for (const k of ['Credentialing', 'CE library', 'Referrals back in']) assert.match(t, new RegExp(k));
  assert.match(t, /Roadmap/);
});

test('regulatory note: we match and record, we do not certify', () => {
  const h = byTag(main, 'h2').find((x) => /certify/.test(flat(x)));
  assert.ok(h);
  assert.equal(norm(flat(h)), "We match and record. We don't certify.");
  const note = findAll(main, (n) => attr(n, 'data-regulatory-note') !== undefined)[0]?.n;
  assert.ok(note, 'regulatory note block');
  assert.match(flat(note), /does not issue licenses/);
  assert.match(flat(note), /State Board/);
});

test('timeline: six lotus nodes, the last one filled', () => {
  const nodes = findAll(main, (n) => hasAttr(n, 'data-node')).map((x) => x.n);
  assert.equal(nodes.length, 6);
  assert.equal(attr(nodes[5], 'data-filled'), 'true');
  assert.equal(nodes.filter((n) => attr(n, 'data-filled') === 'true').length, 1);
});

test('CTA band: Start with one screen, joining the waitlist', () => {
  const h = byTag(main, 'h2').find((x) => /Start with/.test(flat(x)));
  assert.ok(h);
  assert.equal(norm(flat(h)), 'Start with one screen.');
  assert.ok(byTag(main, 'a').some((a) => attr(a, 'href') === '/waitlist' && flat(a) === 'Join the waitlist' && /v2-btn--inverse/.test(attr(a, 'class') ?? '')));
});

test('no nested <main>, no dead hrefs, every internal anchor resolves', () => {
  assert.equal(byTag(page.doc, 'main').length, 1);
  const ids = new Set(findAll(page.doc, (n) => hasAttr(n, 'id')).map((x) => attr(x.n, 'id')));
  for (const a of byTag(main, 'a')) {
    const href = attr(a, 'href');
    if (href?.startsWith('#')) assert.ok(ids.has(href.slice(1)), `anchor ${href} has a target`);
  }
});
