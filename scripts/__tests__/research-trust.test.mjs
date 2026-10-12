// node --test scripts/__tests__/research-trust.test.mjs
// Asserts the D2 /research and /trust pages against the built dist/ (builds unless RT_SKIP_BUILD=1).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TAG = 'Illustrative · pending validation';
const PLACEHOLDER = 'placeholders, replace with real study data before publishing';
const docs = {};

const attr = (n, name) => n.attrs?.find((a) => a.name === name)?.value;
const hasAttr = (n, name) => !!n.attrs?.some((a) => a.name === name);
const kids = (n) => n.childNodes ?? n.content?.childNodes ?? [];
function* walk(n) {
  yield n;
  for (const c of kids(n)) yield* walk(c);
}
const els = (d, tag) => [...walk(d)].filter((n) => n.tagName && (!tag || n.tagName === tag));
const text = (n) => [...walk(n)].filter((c) => c.nodeName === '#text').map((c) => c.value).join(' ').replace(/\s+/g, ' ').trim();
const anchors = (d) => els(d, 'a').map((a) => ({ href: attr(a, 'href'), rel: attr(a, 'rel') ?? '', label: text(a), node: a }));

before(() => {
  if (process.env.RT_SKIP_BUILD !== '1') {
    const r = spawnSync('npx', ['astro', 'build'], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, `astro build failed:\n${r.stdout}\n${r.stderr}`);
  }
  for (const route of ['research', 'trust']) {
    const file = join(root, 'dist', route, 'index.html');
    assert.ok(existsSync(file), `dist/${route}/index.html missing`);
    docs[route] = parse(readFileSync(file, 'utf8'));
  }
});

function checkTables(d) {
  const tables = els(d, 'table');
  assert.ok(tables.length >= 1, 'expected at least one table');
  for (const t of tables) {
    const caption = els(t, 'caption')[0];
    assert.ok(caption && text(caption).length > 0, 'table lacks a non-empty <caption>');
    const ths = els(t, 'th');
    assert.ok(ths.length > 0, 'table has no <th>');
    for (const th of ths) assert.match(attr(th, 'scope') ?? '', /^(col|row)$/, `<th> "${text(th)}" lacks scope`);
  }
}

test('/research: single h1 with the hero copy, method card and published date', () => {
  const d = docs.research;
  const h1 = els(d, 'h1');
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0]), 'The two-year gap, measured.');
  const t = text(d);
  assert.match(t, /METHOD/i);
  assert.match(t, /Oct 11, 2026/);
});

test('/research: five stats with citations, the fifth inverted', () => {
  const stats = els(docs.research).filter((n) => hasAttr(n, 'data-research-stat'));
  assert.equal(stats.length, 5);
  const values = stats.map((s) => text(els(s).find((e) => hasAttr(e, 'data-stat-value'))));
  assert.deepEqual(values, ['~3,000', '~2 years', '~$150/hr', '5+ years', '$0']);
  for (const s of stats) assert.ok(els(s).some((e) => e.tagName === 'p' && hasAttr(e, 'data-stat-cite') && text(e).length > 0), 'stat lacks citation');
  assert.equal(attr(stats[4], 'data-inverted'), 'true');
  assert.ok(stats.slice(0, 4).every((s) => !hasAttr(s, 'data-inverted')));
});

test('/research: placeholder notice is present and prominent', () => {
  const notices = els(docs.research, 'aside').filter((a) => hasAttr(a, 'data-illustrative') && text(a).includes(PLACEHOLDER));
  assert.ok(notices.length >= 1, `no illustrative aside containing "${PLACEHOLDER}"`);
  assert.ok(text(docs.research).includes(TAG));
});

test('/research: tables have caption and th scope; licensure table has the four tracks', () => {
  checkTables(docs.research);
  const t = els(docs.research, 'table').find((x) => /licensure/i.test(text(els(x, 'caption')[0])));
  assert.ok(t, 'licensure table with a caption mentioning licensure missing');
  const rowHeads = els(t, 'th').filter((th) => attr(th, 'scope') === 'row').map((th) => text(th));
  assert.equal(rowHeads.length, 4);
  for (const k of ['LPC', 'LCSW', 'LMFT', 'Psychology']) assert.ok(rowHeads.some((h) => h.startsWith(k)), `row ${k} missing`);
  assert.match(text(docs.research), /confirm against PA board sources/i);
});

test('/research: board links go to dos.pa.gov with rel noopener', () => {
  const board = anchors(docs.research).filter((a) => a.href?.startsWith('https://www.dos.pa.gov'));
  assert.ok(board.length >= 3, 'expected board links');
  for (const a of board) assert.match(a.rel, /noopener/);
});

test('/research: 4 labelled quote cards, 3 employer step cards, ranked bars, roster meter, lifecycle', () => {
  const d = docs.research;
  const quotes = els(d).filter((n) => hasAttr(n, 'data-quote-card'));
  assert.equal(quotes.length, 4);
  for (const q of quotes) assert.match(text(q), /community post|illustrative/i);
  assert.equal(els(d).filter((n) => hasAttr(n, 'data-step-card') || (n.tagName === 'article' && /v2-step\b/.test(attr(n, 'class') ?? ''))).length, 3);
  const bars = els(d).filter((n) => hasAttr(n, 'data-ranked-bar'));
  assert.equal(bars.length, 4);
  const meter = els(d).find((n) => attr(n, 'role') === 'meter' || attr(n, 'role') === 'progressbar');
  assert.ok(meter, 'roster meter missing');
  assert.equal(attr(meter, 'aria-valuenow'), '14');
  assert.equal(attr(meter, 'aria-valuemax'), '25');
  const life = els(d).find((n) => hasAttr(n, 'data-lifecycle'));
  assert.ok(life, 'lifecycle diagram missing');
  assert.ok(els(life).filter((n) => hasAttr(n, 'data-lily-pill')).length >= 4, 'Lily intervention pills missing');
});

test('/research: PDF button is disabled "coming soon" with no fake file', () => {
  const d = docs.research;
  const btn = els(d, 'button').find((b) => /Download the summary PDF/.test(text(b)));
  assert.ok(btn, 'button missing');
  assert.ok(hasAttr(btn, 'disabled'));
  assert.match(text(d), /coming soon/i);
  assert.ok(!anchors(d).some((a) => /\.pdf(\?|$)/i.test(a.href ?? '') || /Download the summary PDF/.test(a.label)), 'no anchor may point at a PDF');
});

test('/research: closing CTA goes to /waitlist', () => {
  const d = docs.research;
  const cta = els(d, 'h2').find((h) => /Help us close the gap in/.test(text(h)));
  assert.ok(cta, 'CTA headline missing');
  assert.equal(text(cta), 'Help us close the gap in your county.');
  assert.ok(anchors(d).some((a) => a.href === '/waitlist' && /Join the waitlist/.test(a.label) && !a.node.parentNode.attrs?.some?.((x) => x.name === 'hidden')));
});

test('/trust: hero, example supervisor and illustrative labelling', () => {
  const d = docs.trust;
  const h1 = els(d, 'h1');
  assert.equal(h1.length, 1);
  assert.equal(text(h1[0]), 'What License review pending means.');
  const t = text(d);
  assert.match(t, /Rosalind Okafor, LCSW/);
  assert.match(t, /Checked Oct 3, 2026/);
  assert.match(t, /Next re-check Oct 2027/);
  assert.ok(t.includes(TAG));
  assert.match(t, /pending validation/);
});

test('/trust: seven checks table with caption and th scope', () => {
  checkTables(docs.trust);
  const t = els(docs.trust, 'table').find((x) => /seven/i.test(text(els(x, 'caption')[0])));
  assert.ok(t, 'seven-checks table missing');
  const rowHeads = els(t, 'th').filter((th) => attr(th, 'scope') === 'row').map((th) => text(th));
  assert.deepEqual(rowHeads, ['License type', 'Active status', 'Issued 5+ years', 'Public discipline', 'Source: licensing jurisdiction', 'Manual fallback', 'Re-checked annually']);
});

test('/trust: sections, hours log preview and data lists', () => {
  const d = docs.trust;
  const heads = els(d, 'h2').map(text);
  for (const h of [
    'Seven things we check, every time',
    "We don't copy directories.",
    'Logged by one, signed by the other, never certified by us.',
    'Licensure and scheduling data, not clinical records.',
    'Four roles, clear edges.',
    'At launch, you pay your supervisor directly.',
    'Plain protections, stated plainly.',
    'Something look wrong? Tell us.',
  ]) assert.ok(heads.includes(h), `missing h2 "${h}" (have ${JSON.stringify(heads)})`);
  assert.ok(els(d).some((n) => attr(n, 'data-mock') === 'HoursLogPreview'));
  const t = text(d);
  assert.match(t, /Client names, notes or diagnoses/);
  assert.match(t, /Social Security numbers/);
});

test('/trust: permissions table is 4 roles x 7 data types with the allowed states', () => {
  const t = els(docs.trust, 'table').find((x) => /who can see what|permission/i.test(text(els(x, 'caption')[0])));
  assert.ok(t, 'permissions table missing');
  const colHeads = els(t, 'th').filter((th) => attr(th, 'scope') === 'col').map(text);
  assert.deepEqual(colHeads.slice(-4), ['Graduate', 'Supervisor', 'Sponsor', 'Lily admin']);
  const body = els(t, 'tbody')[0];
  const rows = els(body, 'tr');
  assert.equal(rows.length, 7);
  const allowed = new Set(['Yes', 'Own', 'Totals', 'Audit only', 'Count', 'Support only', 'No', 'Status only', 'If matched']);
  for (const r of rows) {
    const cells = els(r, 'td');
    assert.equal(cells.length, 4);
    assert.equal(els(r, 'th').length, 1);
    for (const c of cells) assert.ok(allowed.has(text(c)), `unexpected cell "${text(c)}"`);
  }
  const states = new Set(rows.flatMap((r) => els(r, 'td').map(text)));
  for (const s of ['Yes', 'Own', 'Totals', 'Audit only', 'Count', 'Support only', 'No']) assert.ok(states.has(s), `state ${s} unused`);
});

test('/trust: pricing card is labelled and protections list covers 2FA, 15-minute links, encryption, export, deletion', () => {
  const t = text(docs.trust);
  assert.match(t, /\$0 Lily fee/);
  assert.match(t, /Announced 60 days ahead/);
  for (const re of [/Two-factor sign-in/, /Links expire in 15 minutes/, /Encrypted at rest/, /Export anytime/, /Delete on request/]) assert.match(t, re);
});

test('/trust: concern link targets /contact?topic=trust and the supervisor CTA goes to the app', () => {
  const a = anchors(docs.trust);
  assert.ok(a.some((x) => x.href === '/contact?topic=trust' && /Open the concern form/.test(x.label)));
  assert.ok(a.some((x) => /Join as a supervisor/.test(x.label) && /^https:\/\/app\.asklily\.health\/app\/signup\/supervisor$/.test(x.href ?? '')));
  assert.match(text(docs.trust), /2 business days/);
});

test('both pages: check-pages strict passes for /research and /trust', () => {
  const r = spawnSync('node', ['scripts/check-pages.mjs', '--strict', '--only=/research,/trust'], { cwd: root, encoding: 'utf8' });
  // Strict also reports other pending routes' redirect targets; only assert our routes are clean.
  const ours = (r.stderr + r.stdout).split('\n').filter((l) => /\/(research|trust)\b/.test(l) && /^FAIL/.test(l));
  assert.deepEqual(ours, []);
  assert.match(r.stdout, /checked \/research/);
  assert.match(r.stdout, /checked \/trust/);
});

test('both pages: tables everywhere have captions and th scope', () => {
  checkTables(docs.research);
  checkTables(docs.trust);
});
