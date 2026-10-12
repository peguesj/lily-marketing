// node --test src/components/v2/sections/pricing/pricing.test.mjs   (HP_SKIP_BUILD=1 to reuse dist/)
// Asserts the built /pricing page against specs/site-pricing.md.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { runChecks, DEFAULT_APP_URL, APP_PATH_ALLOWLIST } from '../../../../../scripts/check-pages.mjs';
import { buildOnce, loadRoute, root, TAG, attr, hasAttr, kids, byTag, findAll, flat, mainOf } from '../how/test-dom.mjs';

let page;
let main;
const norm = (s) => s.replace(/\s+([.,;:!?%])/g, '$1').replace(/\s+/g, ' ').trim();
const within = (el, pred) => findAll(el, pred).map((x) => x.n);
const cards = () => within(main, (n) => hasAttr(n, 'data-pricing-card'));
const APP = new URL(DEFAULT_APP_URL).origin;

before(() => {
  buildOnce();
  page = loadRoute('/pricing');
  main = mainOf(page.doc);
});

test('check-pages reports no failures for /pricing', () => {
  const { failures, checked } = runChecks({ dist: join(root, 'dist'), only: ['/pricing'], appUrl: DEFAULT_APP_URL });
  assert.deepEqual(failures, []);
  assert.ok(checked.includes('/pricing'));
});

test('hero: One price, shown before you ask. with the supervisor and graduate app CTAs', () => {
  const h1s = byTag(page.doc, 'h1');
  assert.equal(h1s.length, 1);
  assert.equal(norm(flat(h1s[0])), 'One price, shown before you ask.');
  assert.equal(within(h1s[0], (n) => n.nodeName === 'em').length, 1);
  const links = byTag(main, 'a');
  const sup = links.find((a) => flat(a) === 'Join as a supervisor');
  const grad = links.find((a) => flat(a) === 'Find a supervisor');
  assert.equal(attr(sup, 'href'), `${APP}/app/signup/supervisor`);
  assert.equal(attr(grad, 'href'), `${APP}/app/signup/graduate`);
});

test('three pricing cards; the supervisor card is emphasised', () => {
  const cs = cards();
  assert.equal(cs.length, 3);
  const audiences = cs.map((c) => attr(c, 'data-pricing-card'));
  assert.deepEqual(audiences, ['graduates', 'supervisors', 'programs']);
  const emphasised = cs.filter((c) => attr(c, 'data-emphasis') === 'true');
  assert.equal(emphasised.length, 1);
  assert.equal(attr(emphasised[0], 'data-pricing-card'), 'supervisors');
  const [g, s, p] = cs.map((c) => norm(flat(c)));
  assert.match(g, /posted (supervisor )?rate/i);
  assert.match(g, /no Lily (platform )?fee/i);
  assert.match(s, /free to join/i);
  assert.match(s, /12%/);
  assert.match(s, /after (an )?agreement|once agreements exist/i);
  assert.match(s, /paid through Lily/i);
  assert.match(p, /per clinician, per month/i);
  assert.match(p, /pilot rate/i);
});

test('card CTAs use the app config links and an in-site fallback never points at a bare #', () => {
  const [g, s, p] = cards();
  const href = (c) => attr(byTag(c, 'a')[0], 'href');
  assert.equal(href(g), `${APP}/app/signup/graduate`);
  assert.equal(href(s), `${APP}/app/signup/supervisor`);
  assert.equal(href(p), `${APP}/beta/join?audience=sponsor`);
  for (const a of byTag(main, 'a')) {
    const u = new URL(attr(a, 'href'), 'https://www.asklily.health/pricing/');
    if (u.origin === APP) assert.ok(APP_PATH_ALLOWLIST.includes(u.pathname.replace(/\/+$/, '')), `${u.href} allowlisted`);
  }
});

test('every 12% sits in a block that also carries a data-illustrative marker with the validation label', () => {
  const BLOCKS = new Set(['article', 'details', 'li', 'section', 'tr', 'aside', 'div', 'p', 'td', 'dd']);
  const hits = findAll(main, (n) => kids(n).some((c) => c.nodeName === '#text' && /12\s*%/.test(c.value)));
  assert.ok(hits.length >= 2, 'the 12% share appears in the card and the FAQ');
  for (const { n, parents: ancestors } of hits) {
    const parents = [...ancestors, n];
    // Nearest ancestor (or self) that is a data-illustrative element, else the nearest card/details/section/li.
    const owner = [...parents].reverse().find((p) => hasAttr(p, 'data-illustrative') && flat(p).includes(TAG))
      ?? [...parents].reverse().find((p) => ['article', 'details', 'section', 'li', 'tr'].includes(p.nodeName));
    assert.ok(owner, `owner block for "${flat(n).slice(0, 40)}"`);
    const marked = (hasAttr(owner, 'data-illustrative') && flat(owner).includes(TAG))
      || within(owner, (x) => hasAttr(x, 'data-illustrative') && flat(x).includes(TAG)).length > 0;
    assert.ok(marked, `12% in <${owner.nodeName}> "${flat(owner).slice(0, 60)}" lacks a data-illustrative marker`);
    assert.ok(BLOCKS.has(owner.nodeName));
  }
});

test('12% is described as a proposal, never as live or approved terms', () => {
  const t = norm(flat(main));
  assert.match(t, /proposed 12%/i);
  assert.doesNotMatch(t, /\b(guarantee[ds]?|approved|final) (rate|share|fee)/i);
});

test('rate transparency: Renée Okafor example at $95 / $45, labelled illustrative and not a live listing', () => {
  const ex = findAll(main, (n) => attr(n, 'data-rate-example') !== undefined)[0]?.n;
  assert.ok(ex, 'rate example');
  const t = norm(flat(ex));
  assert.match(t, /Renée Okafor/);
  assert.match(t, /\$95/);
  assert.match(t, /\$45/);
  assert.match(t, /Thu 7:00pm/);
  assert.match(t, /Illustrative profile/i);
  assert.match(t, /not a live listing/i);
  assert.ok(hasAttr(ex, 'data-illustrative') || within(ex, (n) => hasAttr(n, 'data-illustrative')).length > 0);
  assert.match(norm(flat(main)), /Typical PA ranges are pending source validation/);
  assert.doesNotMatch(norm(flat(main)), /\bmedian (rate|is) \$|average rate/i);
});

test('included list has verification, agreement, hours log and export; board-format acceptance is not promised', () => {
  const sec = findAll(main, (n) => attr(n, 'data-section') === 'included')[0]?.n;
  assert.ok(sec);
  const items = within(sec, (n) => n.nodeName === 'li');
  assert.deepEqual(items.map((i) => norm(flat(i)).split(' ')[0]), ['Verification', 'Agreement', 'Hours', 'Export']);
  assert.match(norm(flat(sec)), /not promis|does not promise|no promise/i);
});

test('comparison is a semantic table with scoped headers and no categorical competitor claims', () => {
  const t = byTag(main, 'table')[0];
  assert.ok(t, 'a <table>');
  assert.ok(byTag(t, 'caption').length === 1, 'caption');
  const ths = byTag(t, 'th');
  assert.ok(ths.length >= 8);
  for (const th of ths) assert.ok(['col', 'row'].includes(attr(th, 'scope')), `th "${flat(th)}" needs scope`);
  assert.deepEqual(byTag(byTag(t, 'thead')[0], 'th').map(flat), ['At a glance', 'Lily', 'Email / DM', 'Directory listing']);
  assert.deepEqual(byTag(byTag(t, 'tbody')[0], 'th').map(flat), ['Graduate cost', 'Verification', 'Hours log', 'Admin']);
  assert.match(norm(flat(main)), /Directory features and fees vary by provider/);
  assert.doesNotMatch(norm(flat(t)), /\b(never|always|worst|best|all (directories|competitors)|no other)\b/i);
});

test('funding: $150 individual example, $45 group against $95, sponsored by agreement, hours caveat', () => {
  const sec = findAll(main, (n) => attr(n, 'data-section') === 'funding')[0]?.n;
  assert.ok(sec);
  const t = norm(flat(sec));
  assert.match(t, /\$150 \/ hour example/);
  assert.match(t, /\$45 compared with \$95 individual/);
  assert.match(t, /Full or partial support, by agreement/);
  assert.match(norm(flat(main)), /Supervised clinical experience hours are not all paid supervision sessions/);
  assert.ok(hasAttr(sec, 'data-illustrative') || within(sec, (n) => hasAttr(n, 'data-illustrative')).length > 0, 'funding examples labelled illustrative');
});

test('five FAQs, every one expanded (details open) with no collapsed plus affordance', () => {
  const d = within(main, (n) => n.nodeName === 'details');
  assert.equal(d.length, 5);
  for (const x of d) {
    assert.ok(hasAttr(x, 'open'), 'open');
    assert.equal(byTag(x, 'summary').length, 1);
  }
  assert.deepEqual(d.map((x) => norm(flat(byTag(x, 'summary')[0]))), [
    'When does the share start?', 'Paid directly or through Lily?', 'Can a program sponsor only part?',
    'What about refunds and disputes?', 'What does a sponsored seat cover?',
  ]);
  assert.match(norm(flat(d[3])), /being finalized/);
  assert.match(norm(flat(d[3])), /no refund guarantee is implied/);
});

test('closing CTA: Nothing to pay until it works., scoped to the supervisor share', () => {
  const h = byTag(main, 'h2').find((x) => /Nothing to pay/.test(flat(x)));
  assert.ok(h);
  assert.equal(norm(flat(h)), 'Nothing to pay until it works.');
  const band = findAll(main, (n) => /\bv2-cta\b/.test(attr(n, 'class') ?? ''))[0].n;
  assert.match(norm(flat(band)), /Your supervisor share applies only to sessions paid through Lily/);
  const links = byTag(band, 'a');
  assert.equal(attr(links.find((a) => flat(a) === 'Join as a supervisor'), 'href'), `${APP}/app/signup/supervisor`);
  assert.equal(attr(links.find((a) => flat(a) === 'Find a supervisor'), 'href'), `${APP}/app/signup/graduate`);
});

test('single <main> and no AI/legacy v1 copy', () => {
  assert.equal(byTag(page.doc, 'main').length, 1);
  assert.doesNotMatch(flat(main), /per eligible employee|PEPM|free therapy/i);
});

test('pilot-review disclaimer from the SVG footer line is rendered on /pricing', () => {
  assert.ok(norm(flat(main)).includes('Pilot design preview · Commercial and policy terms subject to review.'));
});
