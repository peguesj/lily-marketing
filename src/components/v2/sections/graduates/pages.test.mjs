// D2-graduates-programs page gate.
//   npx astro build && node --test src/components/v2/sections/graduates/pages.test.mjs
//   PAGES_SKIP_BUILD=1 to reuse an existing dist/.
// check-pages --only=/graduates,/programs reports a missing pending route as a notice and exits 0,
// so this test additionally REQUIRES both routes to be built and checked.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks, visibleText, parseAttrs } from '../../../../../scripts/check-pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..');
const dist = join(root, 'dist');
const ONLY = ['/graduates', '/programs'];
const APP = 'https://app.asklily.health';

let grad = '';
let prog = '';
let gradText = '';
let progText = '';

before(() => {
  if (process.env.PAGES_SKIP_BUILD !== '1') {
    const r = spawnSync('npx', ['astro', 'build'], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, `astro build failed:\n${r.stdout}\n${r.stderr}`);
  }
  const read = (route) => {
    const f = join(dist, route.slice(1), 'index.html');
    assert.ok(existsSync(f), `missing ${f}`);
    return readFileSync(f, 'utf8');
  };
  grad = read('/graduates');
  prog = read('/programs');
  gradText = visibleText(grad);
  progText = visibleText(prog);
});

const anchors = (html) => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map((m) => ({
  attrs: parseAttrs(m[0].match(/<a\b[^>]*>/i)[0]),
  text: visibleText(`<body>${m[0]}</body>`),
}));
const link = (html, label) => anchors(html).find((a) => a.text.replace(/\s*→\s*$/, '').trim() === label);
const hasId = (html, id) => new RegExp(`\\sid="${id}"`).test(html);

test('check-pages --only=/graduates,/programs checks both built routes with no failures', () => {
  const { checked, failures } = runChecks({ dist, only: ONLY });
  assert.deepEqual(checked, ONLY, 'both routes must be built, not left pending');
  assert.deepEqual(failures.filter((f) => ONLY.includes(f.route)), []);
});

test('both pages have exactly one h1 inside the shared main landmark', () => {
  for (const html of [grad, prog]) {
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.equal((html.match(/<main\b/g) ?? []).length, 1, 'BaseLayout owns <main>; pages must not nest another');
  }
});

// ---------------------------------------------------------------- /graduates
test('/graduates hero copy, in-page CTA to #waitlist and app invite link', () => {
  assert.ok(hasId(grad, 'waitlist'), 'built HTML needs #waitlist');
  assert.match(grad, /<h1[^>]*>\s*Your 3,000 hours,\s*<em[^>]*>counted<\/em>\./);
  assert.equal(link(grad, 'Find a supervisor')?.attrs.href, '#waitlist');
  assert.equal(link(grad, 'Have an invite? Start in the app')?.attrs.href, `${APP}/app/signup/graduate`);
  assert.match(gradText, /Pennsylvania pilot/i);
  assert.match(gradText, /No Lily fee for graduates at launch/);
});

test('/graduates labels research as summary findings (not interviews) and personas as fictional', () => {
  for (const s of ['17 groups', '5,869 posts', '239', '183']) assert.ok(gradText.includes(s), s);
  assert.match(gradText, /summary findings/i);
  assert.match(gradText, /not (graduate )?interviews/i);
  assert.match(gradText, /no verbatim testimonials/i);
  assert.match(gradText, /Maya Okafor/);
  assert.match(gradText, /Alex Chen/);
  assert.match(gradText, /fictional/i);
  assert.match(gradText, /persona scenario/i);
  assert.ok((gradText.match(/illustrative/gi) ?? []).length >= 3, 'illustrative label must recur');
});

test('/graduates has five benefits, six matching dimensions and three phone previews', () => {
  for (const b of ['Verified roster', 'Rates up front', 'Your format', 'Affinity matters', 'Your hours, yours']) {
    assert.ok(gradText.includes(b), b);
  }
  assert.equal((grad.match(/data-mock="MatchWeights"/g) ?? []).length, 1);
  for (const d of ['Licensure gate', 'Rate and format', 'Schedule', 'Practice', 'Affinity', 'Reciprocity']) {
    assert.ok(gradText.includes(d), d);
  }
  assert.equal((grad.match(/data-mock="PhoneFrame"/g) ?? []).length, 3);
  assert.match(gradText, /1,240 of 3,000/);
  assert.match(gradText, /Awaiting signature/i);
  assert.match(gradText, /Meet your matches/);
  assert.match(gradText, /Every hour counts/);
});

test('/graduates cost comparison is illustrative and does not invent prices', () => {
  for (const s of ['$150', '$75', '$600', '$300', '$0 out of pocket']) assert.ok(gradText.includes(s), s);
  assert.match(gradText, /Illustrative costs for four one-hour sessions/);
  const prices = new Set([...gradText.matchAll(/\$\d[\d,]*/g)].map((m) => m[0]));
  const allowed = new Set(['$150', '$75', '$600', '$300', '$0', '$90', '$80']);
  for (const p of prices) assert.ok(allowed.has(p), `unexpected price ${p}`);
});

test('/graduates sponsorship: Explore programs -> /programs; Ask your director opens a panel and never sends', () => {
  assert.equal(link(grad, 'Explore programs')?.attrs.href, '/programs');
  assert.match(grad, /<summary[^>]*>[\s\S]*?Ask your director[\s\S]*?<\/summary>/);
  assert.match(gradText, /Lily does not send (this|anything)/i);
  assert.ok(!/mailto:/i.test(grad), 'no mailto: links');
  assert.equal((grad.match(/<form\b/g) ?? []).length, 1, 'only the waitlist form');
});

test('/graduates has six FAQ answers, the graduate waitlist form and the gradient CTA', () => {
  const qs = ['Does Lily charge me?', 'Which states?', 'How many hours does my license require?',
    'Will the board accept my log?', 'Can my employer pay?', 'Can I choose group supervision?'];
  for (const q of qs) assert.ok(gradText.includes(q), q);
  assert.equal((grad.match(/class="v2-faq__item"/g) ?? []).length, 6);
  assert.match(gradText, /does not guarantee board acceptance/i);
  assert.match(grad, /component-export="default"[^>]*WaitlistForm|WaitlistForm[^>]*component-export="default"/);
  assert.match(grad, /defaultAudience&quot;:\[0,&quot;graduate&quot;\]/);
  assert.match(gradText, /Join the waitlist for your county\./);
  // waitlist section sits inside the anchor target
  const i = grad.indexOf('id="waitlist"');
  assert.ok(grad.indexOf('<form', i) > i, 'form follows #waitlist');
});

// ----------------------------------------------------------------- /programs
test('/programs hero copy and CTA scroll to #proposal', () => {
  assert.ok(hasId(prog, 'proposal'), 'built HTML needs #proposal');
  assert.match(prog, /<h1[^>]*>\s*Keep the clinicians\s*you\s*<em[^>]*>trained<\/em>\./);
  assert.equal(link(prog, 'Talk to us about a cohort')?.attrs.href, '#proposal');
  assert.match(progText, /Pennsylvania/);
});

test('/programs gap section is qualitative and labels the quote as illustrative, not a testimonial', () => {
  assert.match(progText, /Two miserable years end in a resignation\./);
  for (const s of ['A vacancy to fill', 'Trust to rebuild', 'Experience lost']) assert.ok(progText.includes(s), s);
  assert.match(progText, /not a testimonial/i);
  assert.match(progText, /Illustrative program-director persona/i);
  assert.ok(!/\d+\s*%/.test(progText), 'no invented statistics');
});

test('/programs includes list never covers session notes and the walkthrough separates hour types', () => {
  for (const s of ['Verified supervisors', 'Rates you agree upfront', 'A shared agreement', 'Weekly attestations',
    'Your director dashboard', 'A report for your board']) assert.ok(progText.includes(s), s);
  assert.match(progText, /Never session notes/);
  assert.match(prog, /data-mock="CohortCard"/);
  assert.match(prog, /data-mock="HoursLogPreview"/);
  assert.match(progText, /October 2026/);
  assert.match(progText, /Nine clinicians/i);
  assert.match(progText, /Priya R\./);
  assert.match(progText, /Marcus B\./);
  assert.match(progText, /work hours (and|vs\.?) supervision contact hours are (recorded )?separate/i);
  assert.match(progText, /not a licensure approval/i);
});

test('/programs pricing has no invented prices and links /pricing', () => {
  assert.match(progText, /Priced per clinician, per month\./);
  assert.ok(!/\$\s?\d/.test(progText), 'no dollar amounts on /programs');
  assert.equal(link(prog, 'See pricing')?.attrs.href, '/pricing');
  assert.match(progText, /9 clinicians × your monthly rate/);
  assert.match(progText, /No graduate Lily fee at launch/);
});

test('/programs audiences label named institutions as pilot conversations and the pilot as proposed', () => {
  for (const s of ['Community mental-health centers', 'Group practices', 'Colleges and training programs']) {
    assert.ok(progText.includes(s), s);
  }
  assert.match(progText, /Chestnut Hill: pilot conversation, not a confirmed partnership/);
  assert.match(progText, /proposed 30-day/i);
  for (const s of ['Days 1–7', 'Days 8–14', 'Days 15–21', 'Days 22–30']) assert.ok(new RegExp(s, 'i').test(progText), s);
  assert.match(progText, /subject to local supervisor availability/i);
  assert.match(progText, /SSO optional/);
  assert.match(progText, /Data handling/);
});

test('/programs proposal form, CTA band and app inquiry link', () => {
  const i = prog.indexOf('id="proposal"');
  assert.ok(prog.indexOf('<form', i) > i, 'CohortProposalForm follows #proposal');
  assert.match(prog, /CohortProposalForm/);
  assert.equal((prog.match(/<form\b/g) ?? []).length, 1);
  assert.match(progText, /Be the first sponsoring program\./);
  assert.equal(link(prog, 'Talk to Lily')?.attrs.href, '#proposal');
  const inquiry = anchors(prog).find((a) => a.attrs.href === `${APP}/beta/join?audience=sponsor`);
  assert.ok(inquiry, 'secondary programInquiry link');
});
