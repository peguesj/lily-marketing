// Home page (/) content contract, asserted against the built dist/index.html.
// Run after `npx astro build`:
//   node --test src/components/v2/sections/home/__tests__/home.test.mjs
// The generic page rules (single h1, illustrative markers, app-link allowlist, dead hrefs)
// come from scripts/check-pages.mjs so this suite and `check-pages --only=/` cannot drift.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPage, DEFAULT_APP_URL, visibleText } from '../../../../../../scripts/check-pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../');
const file = join(root, 'dist', 'index.html');
const APP = process.env.PUBLIC_LILY_APP_URL ?? DEFAULT_APP_URL;
const SUPERVISOR = `${APP}/app/signup/supervisor`;
const GRADUATE = `${APP}/app/signup/graduate`;

assert.ok(existsSync(file), `dist/index.html missing (${file}); run npx astro build first`);
const html = readFileSync(file, 'utf8');
const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
const main = body.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? '';
const text = visibleText(main);

const SECTIONS = ['hero', 'paths', 'gap', 'how', 'trust', 'affinity', 'split', 'programs', 'app', 'teasers', 'cta'];

function section(id) {
  const re = new RegExp(`<(section|div)\\b[^>]*data-home-section="${id}"[^>]*>`, 'i');
  const m = re.exec(main);
  assert.ok(m, `section ${id} missing`);
  const tag = m[1];
  // Walk to the matching close tag so nested same-name elements do not truncate the slice.
  let depth = 0;
  const tokens = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  tokens.lastIndex = m.index;
  let t;
  while ((t = tokens.exec(main))) {
    depth += t[1] ? -1 : 1;
    if (depth === 0) return main.slice(m.index, tokens.lastIndex);
  }
  assert.fail(`section ${id} is not closed`);
}

function anchors(fragment) {
  return [...fragment.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: /href="([^"]*)"/.exec(m[1])?.[1] ?? '',
    label: visibleText(`<body>${m[2]}</body>`).replace(/\s*→$/, '').trim(),
  }));
}

const textOf = (fragment) => visibleText(`<body>${fragment}</body>`);

test('generic page rules pass (h1, illustrative, app allowlist, dead hrefs, internal links)', () => {
  const failures = checkPage(html, '/', { dist: join(root, 'dist'), appUrl: APP });
  assert.deepEqual(failures, []);
});

test('SEO title is set verbatim', () => {
  assert.match(html, /<title>Lily — Supervision, verified\. Pennsylvania pilot<\/title>/);
});

test('exactly one h1 with the verbatim headline', () => {
  const h1s = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(h1s.length, 1);
  assert.equal(textOf(h1s[0][1]), 'The two years nobody told you about.');
  assert.match(h1s[0][1], /<em[^>]*>\s*told you about\.\s*<\/em>/);
});

test('legacy home copy is gone', () => {
  assert.doesNotMatch(text, /Three apps · one platform/);
  assert.doesNotMatch(text, /legacy/i);
});

test('sections render in spec order', () => {
  const found = [...main.matchAll(/data-home-section="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(found, SECTIONS);
});

test('hero: eyebrow, lead, CTAs, trust strip, petal mark and blobs', () => {
  const s = section('hero');
  const t = textOf(s);
  assert.match(t, /SUPERVISION, VERIFIED/i);
  assert.match(s, /v2-eyebrow/);
  assert.ok(t.includes('Lily matches newly graduated clinicians with verified, fairly priced supervisors, writes the agreement, and keeps an hours log you both sign.'));
  const a = anchors(s);
  assert.equal(a.find((x) => x.label === 'Join as a supervisor')?.href, SUPERVISOR);
  assert.equal(a.find((x) => x.label === 'Find a supervisor')?.href, GRADUATE);
  assert.match(s, /v2-btn--primary[^>]*>\s*Join as a supervisor/);
  assert.match(s, /v2-btn--outline[^>]*>\s*Find a supervisor/);
  for (const item of ['Pennsylvania pilot', 'LPC and LCSW first', 'Licenses verified with the licensing jurisdiction']) {
    assert.ok(t.includes(item), `trust strip item ${item}`);
  }
  assert.match(s, /class="[^"]*v2-trust/);
  assert.match(s, /v2-petal/);
  assert.equal((s.match(/class="[^"]*v2-blob/g) ?? []).length, 2, 'two blobs');
  assert.match(s, /data-illustrative/);
  assert.ok(t.includes('Illustrative · pending validation'));
});

test('paths: three cards with their CTAs', () => {
  const s = section('paths');
  const t = textOf(s);
  for (const title of ['Supervising', 'Earning your hours', 'Sponsoring a program']) assert.ok(t.includes(title), title);
  assert.ok(t.includes('Set your rate, format and availability. Lily sends you graduates who fit.'));
  assert.ok(t.includes('See verified supervisors near you, rate shown up front. Pick, agree, start logging.'));
  assert.ok(t.includes('Cover supervision for a cohort so the clinicians you trained stay with you.'));
  const a = anchors(s);
  assert.deepEqual(a.map((x) => [x.label, x.href]), [
    ['Join as a supervisor', SUPERVISOR],
    ['Find a supervisor', GRADUATE],
    ['Sponsor a cohort', '/programs#proposal'],
  ]);
  assert.equal((s.match(/<article\b/g) ?? []).length, 3);
  assert.match(s, /data-illustrative/);
});

test('gap: four illustrative stats and the research link', () => {
  const s = section('gap');
  const t = textOf(s);
  assert.match(t, /THE GAP IN NUMBERS/i);
  assert.ok(t.includes('The part of the career nobody explains.'));
  for (const v of ['~3,000', '~2 years', '~$150 / hr', '5+ years']) assert.ok(t.includes(v), v);
  for (const c of ['supervised hours before licensure', 'of supervision, start to finish', 'out of pocket, the going rate', 'licensed before you can supervise']) {
    assert.ok(t.includes(c), c);
  }
  assert.equal((s.match(/class="[^"]*v2-stat\b/g) ?? []).length, 4);
  assert.equal((s.match(/<article[^>]*data-illustrative/g) ?? []).length, 4, 'each stat tile is tagged illustrative');
  assert.equal(anchors(s).find((x) => x.label === 'Read the research')?.href, '/research');
});

test('how it works: three steps and a link to /how-it-works', () => {
  const s = section('how');
  const t = textOf(s);
  assert.ok(t.includes('Matched, agreed and counted in three steps.'));
  assert.equal((s.match(/class="[^"]*v2-step\b/g) ?? []).length, 3);
  for (const x of ['Verify', 'Match and agree', 'Log weekly, signed twice', '1,240 of 3,000 counted, never disputed.']) assert.ok(t.includes(x), x);
  assert.ok(anchors(s).some((x) => x.href === '/how-it-works'));
  assert.match(s, /data-illustrative/);
});

test('trust band: four check rows, example badge and caption', () => {
  const s = section('trust');
  const t = textOf(s);
  assert.match(t, /LILY VERIFIED/i);
  assert.ok(t.includes('Every supervisor is License review pending.'));
  for (const x of [
    'License checked with the licensing jurisdiction (proposed license-review source)',
    'Licensed 5+ years, by rule',
    'Rate shown before you ask',
    'You both pick. Nobody is assigned.',
  ]) assert.ok(t.includes(x), x);
  assert.equal((s.match(/<li\b[^>]*data-check-row/g) ?? []).length, 4);
  assert.match(s, /data-mock="LilyVerifiedBadge"/);
  assert.ok(t.includes('LCSW · PA · licensed since 2011'));
  assert.ok(t.includes('Example'));
  assert.match(s, /data-illustrative/);
});

test('affinity: eight chips, three selected, helper line', () => {
  const s = section('affinity');
  const t = textOf(s);
  assert.ok(t.includes('Someone who gets it.'));
  assert.ok(t.includes('Pick what matters to you across eight identity dimensions. Gender-neutral and culturally inclusive by design.'));
  assert.equal((s.match(/class="[^"]*\bv2-chip\b/g) ?? []).length, 8);
  assert.equal((s.match(/v2-chip--selected/g) ?? []).length, 3);
  for (const c of ['Race and ethnicity', 'Gender identity', 'Sexual orientation', 'Faith', 'Language', 'Disability', 'Neurodivergence', 'First-generation']) {
    assert.ok(t.includes(c), c);
  }
  assert.ok(t.includes('Three selected · matches are weighted by affinity, never filtered out'));
});

test('split: supervisor and graduate audience cards', () => {
  const s = section('split');
  const t = textOf(s);
  assert.ok(t.includes('Supervise without the admin.'));
  assert.ok(t.includes('Agreements written, hours counted, payments on time. You keep your rate. Lily keeps the paperwork.'));
  assert.ok(t.includes('A supervisor you can afford.'));
  assert.ok(t.includes('Rates from $75 an hour, shown before you ask. Individual or group. Hours logged and signed weekly.'));
  const a = anchors(s);
  assert.equal(a.find((x) => x.label === 'Join as a supervisor')?.href, SUPERVISOR);
  assert.equal(a.find((x) => x.label === 'Find a supervisor')?.href, GRADUATE);
  assert.match(s, /data-illustrative/, 'rate claim sits beside an illustrative tag');
});

test('programs: card, sponsor CTA and example cohort', () => {
  const s = section('programs');
  const t = textOf(s);
  assert.ok(t.includes('Keep the clinicians you trained.'));
  assert.ok(t.includes('Community mental-health centers and training programs sponsor a cohort. Priced per clinician per month. Chestnut Hill College is first in line.'));
  assert.equal(anchors(s).find((x) => x.label === 'Sponsor a cohort')?.href, '/programs#proposal');
  assert.match(s, /data-mock="CohortCard"/);
  assert.ok(t.includes('FALL 2026 COHORT'));
  assert.ok(t.includes('12 clinicians'));
  assert.ok(t.includes('9/12 matched'));
  assert.ok(t.includes('Next agreement due Thu 7:00pm · 3 awaiting a supervisor'));
});

test('app band: phone preview, push card, App Store coming soon with no store link', () => {
  const s = section('app');
  const t = textOf(s);
  assert.ok(t.includes("One screen today. One notification when it's time."));
  assert.ok(t.includes("Supervisors sign up in under two minutes. There is nothing to browse yet. When your county's roster clears the threshold, Lily sends one push:"));
  assert.match(s, /data-mock="SignupPhonePreview"/);
  assert.match(s, /data-mock="PushCard"/);
  for (const x of ['Maya Okafor, LCSW', 'CW021847', '2011', '$95 / hr', 'Lily is ready', '3 graduates in Montgomery County want LCSW supervision.']) assert.ok(t.includes(x), x);
  assert.ok(t.includes('Coming soon'));
  assert.ok(t.includes('App Store'));
  assert.doesNotMatch(s, /apps\.apple\.com|itunes\.apple\.com/);
  assert.ok(t.includes('Graduates get the same app a few weeks later, once the roster is live.'));
  assert.match(s, /data-illustrative/);
});

test('teasers: labelled community-research quote and pricing rows', () => {
  const s = section('teasers');
  const t = textOf(s);
  assert.ok(t.includes('We asked the groups where graduates already talk.'));
  assert.ok(t.includes('“I found out in my last semester.”'));
  assert.ok(t.includes('MSW graduate, Philadelphia · Reddit r/socialwork, March 2026'));
  assert.ok(/community[- ]research summary/i.test(t), 'labelled as a community-research summary');
  assert.match(s, /data-illustrative/);
  assert.ok(t.includes('One price, shown before you ask.'));
  for (const x of [
    'pay the supervisor directly. No Lily fee at launch.',
    'pay nothing at launch, then a small per-session share.',
    'sponsor cohorts, priced per clinician per month.',
  ]) assert.ok(t.includes(x), x);
  const a = anchors(s);
  assert.equal(a.find((x) => x.label === 'Read the research')?.href, '/research');
  assert.equal(a.find((x) => x.label === 'See pricing')?.href, '/pricing');
});

test('CTA band goes to the waitlist', () => {
  const s = section('cta');
  const t = textOf(s);
  assert.ok(t.includes('Pennsylvania first. Your county next.'));
  assert.ok(t.includes('Join the waitlist and we will tell you the week your county clears the threshold.'));
  assert.equal(anchors(s).find((x) => x.label === 'Join the waitlist')?.href, '/waitlist');
  assert.match(s, /data-illustrative/);
});

test('every Join / Find / Sponsor CTA on the page uses an allowed destination', () => {
  const all = anchors(main);
  for (const a of all.filter((x) => x.label === 'Join as a supervisor')) assert.equal(a.href, SUPERVISOR);
  for (const a of all.filter((x) => x.label === 'Find a supervisor')) assert.equal(a.href, GRADUATE);
  for (const a of all.filter((x) => x.label === 'Sponsor a cohort')) assert.equal(a.href, '/programs#proposal');
  for (const a of all.filter((x) => x.label === 'Join the waitlist')) assert.equal(a.href, '/waitlist');
  assert.ok(all.every((a) => a.href.trim() !== '' && a.href !== '#'));
});
