// node --test src/components/v2/sections/supervisors/supervisors.test.mjs
// Builds the site (unless SUPERVISORS_SKIP_BUILD=1) and asserts the /supervisors landing page
// against tmp/lily-design-v2/specs/site-supervisors.md: 13 sections in order (the 13th, the
// footer, comes from the shell), copy, links, the waitlist island props and the FAQ markup.
// It also runs the shared page gate (scripts/check-pages.mjs --only=/supervisors).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'parse5';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..');
const distFile = join(root, 'dist/supervisors/index.html');
const APP_SIGNUP = 'https://app.asklily.health/app/signup/supervisor';
const TAG = 'Illustrative · pending validation';

let html;
let doc;

before(() => {
  if (process.env.SUPERVISORS_SKIP_BUILD !== '1') {
    const r = spawnSync('npx', ['astro', 'build'], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, `astro build failed:\n${r.stdout}\n${r.stderr}`);
  }
  assert.ok(existsSync(distFile), `astro build did not emit ${distFile}`);
  html = readFileSync(distFile, 'utf8');
  doc = parse(html);
});

// ---- tiny DOM helpers over parse5 ----
const attr = (n, name) => n.attrs?.find((a) => a.name === name)?.value;
const hasAttr = (n, name) => !!n.attrs?.some((a) => a.name === name);
const kids = (n) => n.childNodes ?? n.content?.childNodes ?? [];
function* walk(n) {
  yield n;
  for (const c of kids(n)) yield* walk(c);
}
const els = (n = doc) => [...walk(n)].filter((e) => e.tagName);
const text = (n) => [...walk(n)].filter((c) => c.nodeName === '#text').map((c) => c.value).join(' ').replace(/\s+/g, ' ').trim();
const section = (name) => {
  const s = els().find((e) => attr(e, 'data-section') === name);
  assert.ok(s, `missing section [data-section="${name}"]`);
  return s;
};
const mocks = (n, name) => els(n).filter((e) => attr(e, 'data-mock') === name);
const links = (n) => els(n).filter((e) => e.tagName === 'a');

const ORDER = [
  'hero', 'why-now', 'what-lily-does', 'verification', 'app', 'group', 'reciprocity',
  'earnings', 'eligibility', 'faq', 'waitlist', 'cta',
];

test('page gate: check-pages --only=/supervisors reports the route as checked with no failures', async () => {
  const { runChecks } = await import(pathToFileURL(join(root, 'scripts/check-pages.mjs')).href);
  const { checked, failures } = runChecks({ dist: join(root, 'dist'), only: ['/supervisors'] });
  assert.deepEqual(failures.filter((f) => f.route === '/supervisors'), []);
  assert.ok(checked.includes('/supervisors'), 'route was not checked (page missing)');
});

test('structure: twelve page sections in spec order, one h1, one main', () => {
  const found = els().filter((e) => hasAttr(e, 'data-section')).map((e) => attr(e, 'data-section'));
  assert.deepEqual(found, ORDER);
  assert.equal(els().filter((e) => e.tagName === 'h1').length, 1);
  assert.equal(els().filter((e) => e.tagName === 'main').length, 1, 'nested <main>');
  const footerAfter = html.lastIndexOf('<footer') > html.indexOf('data-section="cta"');
  assert.ok(footerAfter, 'shell footer must follow the CTA band');
});

test('1 hero: headline, lead, CTAs and trust strip', () => {
  const s = section('hero');
  const h1 = els(s).find((e) => e.tagName === 'h1');
  assert.equal(text(h1), 'Supervise the next generation.');
  assert.ok(els(h1).some((e) => e.tagName === 'em' && text(e).startsWith('generation')), 'italic accent');
  assert.match(text(s), /Paid, scheduled supervisees who already fit your license path\. We verify, you choose\./);
  const joinCta = links(s).find((a) => text(a) === 'Join as a supervisor');
  assert.equal(attr(joinCta, 'href'), APP_SIGNUP);
  const how = links(s).find((a) => text(a) === 'See how verification works');
  assert.equal(attr(how, 'href'), '#verification');
  const strip = text(s);
  for (const t of ['No fee at launch', 'License review pending validation', 'LPC and LCSW matched first']) {
    assert.ok(strip.includes(t), `trust strip missing "${t}"`);
  }
});

test('2 why now: four stat tiles flagged illustrative', () => {
  const s = section('why-now');
  const tiles = els(s).filter((e) => (attr(e, 'class') ?? '').split(/\s+/).some((c) => c.startsWith('v2-stat') && !c.includes('__') ));
  assert.equal(tiles.length, 4);
  const t = tiles.map(text);
  for (const [v, c] of [['DM', 'Requests arrive cold'], ['1 in 4', 'First calls that never happen'], ['3 hrs', 'Unpaid admin, every week'], ['$0', 'No fee at launch']]) {
    assert.ok(t.some((x) => x.includes(v) && x.includes(c)), `tile ${v} / ${c}`);
  }
  assert.ok(tiles.every((x) => hasAttr(x, 'data-illustrative')), 'every figure tile is illustrative');
  assert.match(text(s), /Requests arrive by DM\. Vetting is tedious\./);
});

test('3 what Lily does: four step cards', () => {
  const s = section('what-lily-does');
  const steps = els(s).filter((e) => e.tagName === 'article' && (attr(e, 'class') ?? '').includes('v2-step'));
  assert.equal(steps.length, 4);
  const titles = ['State-board check', 'Ranked matches, hours to date', 'Agreement in one pass', 'Weekly sign-off in a minute'];
  titles.forEach((t, i) => assert.ok(text(steps[i]).includes(t), `step ${i + 1} ${t}`));
  assert.match(text(s), /We verify, you choose\./);
});

test('4 verification: anchor, agreement text rows, example card, verification rows, notice', () => {
  const s = section('verification');
  assert.equal(attr(s, 'id'), 'verification');
  assert.match(text(s), /A badge that means something\./);
  for (const t of ['The license-status badge concept', 'How the board check works', 'What graduates see']) {
    assert.ok(text(s).includes(t), t);
  }
  const card = mocks(s, 'PractitionerCard');
  assert.equal(card.length, 1);
  assert.match(text(card[0]), /Danielle Okafor, LCSW/);
  assert.equal(mocks(s, 'VerificationRows').length, 1);
  const notice = els(s).filter((e) => e.tagName === 'aside' && hasAttr(e, 'data-illustrative'));
  assert.ok(notice.length >= 1, 'IllustrativeNotice');
  assert.ok(notice.some((n) => /proposed license-review source/.test(text(n)) && /pending validation/.test(text(n))));
});

test('5 app: three phone frames with the spec captions', () => {
  const s = section('app');
  assert.equal(mocks(s, 'PhoneFrame').length, 3);
  assert.match(text(s), /One screen\. One notification\./);
  assert.ok(text(s).includes('1. Sign up in one screen'));
  assert.ok(text(s).includes('2. "Lily is ready" when the roster clears'));
  assert.ok(text(s).includes('3. Weekly sign-off in a minute'));
  assert.equal(mocks(s, 'PushCard').length, 1);
  assert.match(text(s), /Lily is ready/);
  assert.match(text(s), /Sign off 2\.5 hours\./);
});

test('6 group: GroupCard with an illustrative cap line', () => {
  const s = section('group');
  assert.equal(mocks(s, 'GroupCard').length, 1);
  assert.match(text(s), /Run a group of four at a fair rate\./);
  assert.match(text(s), /\$45 \/hr per seat/);
  const cap = els(s).find((e) => hasAttr(e, 'data-illustrative') && /Group hours so far: 18 of 60 allowed/.test(text(e)));
  assert.ok(cap, 'cap line must sit in a data-illustrative element');
});

test('7 reciprocity: inbox phone and the three bullets', () => {
  const s = section('reciprocity');
  assert.equal(mocks(s, 'PhoneFrame').length, 1);
  assert.equal(mocks(s, 'InboxPreview').length, 1);
  assert.match(text(s), /You pick too\./);
  for (const t of ['Nobody is matched one-sided.', 'Passing is private', 'Affinity cuts both ways', 'Capacity is yours']) {
    assert.ok(text(s).includes(t), t);
  }
  assert.equal(els(s).filter((e) => e.tagName === 'li' && (attr(e, 'class') ?? '').includes('bullet')).length, 3);
});

test('8 earnings: two pricing cards, 12% share illustrative, link to /pricing', () => {
  const s = section('earnings');
  const cards = els(s).filter((e) => attr(e, 'data-pricing-card') !== undefined);
  assert.equal(cards.length, 2);
  assert.match(text(cards[0]), /Individual/);
  assert.match(text(cards[0]), /\$120/);
  assert.match(text(cards[1]), /Group of four/);
  assert.match(text(cards[1]), /\$45/);
  assert.match(text(s), /No fee to join\. A share only when it works\./);
  assert.match(text(s), /No Lily fee at launch/);
  assert.match(text(s), /Later, a per-session share, disclosed in writing before it starts/);
  assert.match(text(s), /12%/);
  const share = els(s).find((e) => hasAttr(e, 'data-illustrative') && /12%/.test(text(e)));
  assert.ok(share, '12% must sit in a data-illustrative element');
  const pricing = links(s).find((a) => /See pricing/.test(text(a)));
  assert.equal(attr(pricing, 'href'), '/pricing');
});

test('9 eligibility: five chips, pending-validation headline, waitlist line', () => {
  const s = section('eligibility');
  assert.match(text(s), /Eligibility criteria pending validation\. Pennsylvania first\./);
  const chips = els(s).filter((e) => (attr(e, 'class') ?? '').split(/\s+/).includes('v2-chip'));
  assert.deepEqual(chips.map(text), ['LPC', 'LCSW', 'LMFT', 'Psychology', 'Psychiatry']);
  assert.match(text(s), /Outside Pennsylvania, or under five years\? Join the waitlist/);
  assert.ok(els(s).some((e) => hasAttr(e, 'data-illustrative')));
});

test('10 faq: six native details rows, only the first open', () => {
  const s = section('faq');
  const details = els(s).filter((e) => e.tagName === 'details');
  assert.equal(details.length, 6);
  assert.deepEqual(details.map((d) => hasAttr(d, 'open')), [true, false, false, false, false, false]);
  const qs = details.map((d) => text(els(d).find((e) => e.tagName === 'summary')));
  const want = ['What does Lily cost me?', 'How do you verify?', 'What happens before the threshold?', 'Can I run a group?', 'What if a graduate disputes hours?', 'Psychology Today vs Lily'];
  want.forEach((q, i) => assert.ok(qs[i].includes(q), `FAQ ${i + 1}: ${q}`));
  assert.match(text(details[0]), /Nothing at launch\. You keep your full rate/);
});

test('11 waitlist: React island is the supervisor audience and links to the app signup', () => {
  const s = section('waitlist');
  assert.match(text(s), /Tell us your license\. We do the rest\./);
  const island = els(s).find((e) => e.tagName === 'astro-island');
  assert.ok(island, 'WaitlistForm island missing');
  assert.match(attr(island, 'component-url') ?? '', /WaitlistForm/);
  const props = JSON.parse(attr(island, 'props'));
  assert.deepEqual(props.defaultAudience, [0, 'supervisor']);
  assert.deepEqual(props.appHref, [0, APP_SIGNUP]);
  const form = els(island).find((e) => e.tagName === 'form');
  assert.ok(form, 'form is server-rendered');
  assert.equal(attr(form, 'action'), '/api/submit');
  assert.equal(attr(form, 'method')?.toLowerCase(), 'post');
});

test('12 cta band: headline, static example counter labelled illustrative and not live', () => {
  const s = section('cta');
  assert.match(text(s), /Twenty-five supervisors start Pennsylvania\./);
  assert.match(text(s), /17 of 25 signed/);
  assert.match(text(s), /Eight more and "Lily is ready" goes out to every graduate waiting\./);
  const bar = els(s).find((e) => attr(e, 'role') === 'progressbar');
  assert.equal(attr(bar, 'aria-valuenow'), '17');
  assert.equal(attr(bar, 'aria-valuemax'), '25');
  const note = els(s).find((e) => hasAttr(e, 'data-illustrative'));
  assert.ok(note, 'counter needs a data-illustrative label');
  assert.match(text(note), /not live/i);
  const cta = links(s).find((a) => text(a) === 'Join as a supervisor');
  assert.equal(attr(cta, 'href'), APP_SIGNUP);
});

test('copy hygiene: illustrative tag present, no demo/AI leakage, only allowlisted app links', () => {
  assert.ok(text(doc).includes(TAG));
  for (const a of links(doc)) {
    const href = attr(a, 'href') ?? '';
    if (href.startsWith('https://app.asklily.health')) {
      assert.ok(['/app', '/app/sign-in', '/app/signup/supervisor', '/app/signup/graduate', '/beta/join'].includes(new URL(href).pathname), href);
    }
  }
  assert.ok(!/demo:true|Co-Authored|Claude/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')));
});
