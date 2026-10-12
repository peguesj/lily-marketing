// Run after `npx astro build`:
//   MOCKS_SKIP_BUILD=1 node --test scripts/__tests__/d2-about-contact-waitlist.test.mjs
// D2-about-contact-waitlist acceptance: asserts the built /about, /contact and /waitlist pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks, visibleText, parseAttrs } from '../check-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = join(root, 'dist');

function load(route) {
  const file = join(dist, route.replace(/^\//, ''), 'index.html');
  assert.ok(existsSync(file), `missing ${file} (run astro build first)`);
  const html = readFileSync(file, 'utf8');
  const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  const main = body.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? body;
  return { html, main, text: visibleText(main) };
}

const APP_WELCOME = 'https://app.asklily.health/app';

test('check-pages passes for /about, /contact, /waitlist', () => {
  const { failures, checked } = runChecks({ dist, only: ['/about', '/contact', '/waitlist'] });
  assert.deepEqual(
    failures.filter((f) => ['/about', '/contact', '/waitlist'].includes(f.route)),
    [],
  );
  assert.deepEqual(checked.sort(), ['/about', '/contact', '/waitlist']);
});

test('/about: founder narrative, ResearchStat, principles, founders, partnership contact', () => {
  const { main, text } = load('/about');
  assert.match(text, /3,000/);
  assert.match(text, /~\$150\/hr/);
  for (const t of ['Verify at the source', 'Show the rate first', 'Both sides sign', 'Keep notes out']) {
    assert.ok(text.includes(t), `principle card "${t}"`);
  }
  assert.match(text, /Alphonso Nathan/);
  assert.match(text, /\bCEO\b/);
  assert.match(text, /Jeremiah Pegues/);
  assert.match(text, /\bCOO\b/);
  assert.match(main, /href="mailto:hello@asklily\.health"/);
  assert.match(main, /href="\/waitlist"/);
  assert.match(main, /data-illustrative/);
  assert.doesNotMatch(main, /<img\b/i, 'founder cards use initials, not photos');
  assert.match(text, /Pennsylvania/);
  assert.match(text, /LPC/);
});

test('/contact: form island with honeypot, topic preselect, direct lines, response tiles, office', () => {
  const { main, text } = load('/contact');
  const form = main.match(/<form\b[^>]*>[\s\S]*?<\/form>/i)?.[0];
  assert.ok(form, 'contact form is server-rendered');
  const open = parseAttrs(form.match(/<form\b[^>]*>/i)[0]);
  assert.equal(open.action, '/api/submit');
  assert.equal((open.method ?? '').toLowerCase(), 'post');
  assert.match(form, /name="_h"/);
  assert.match(form, /name="type"[^>]*value="contact"|value="contact"[^>]*name="type"/);
  assert.match(main, /<astro-island\b/);
  assert.match(main, /href="mailto:hello@asklily\.health"/);
  assert.match(main, /href="mailto:programs@asklily\.health"/);
  assert.doesNotMatch(main, /href="mailto:(press|trust)@/, 'placeholder mailboxes are not live links');
  for (const box of ['press@asklily.health', 'trust@asklily.health']) {
    const i = text.indexOf(box);
    assert.ok(i >= 0, box);
    assert.match(text.slice(i, i + 160), /placeholder until the mailbox exists/i, `${box} is labelled`);
  }
  assert.match(text, /one business day/i);
  assert.match(text, /Philadelphia/);
  assert.match(text, /remote-first/i);
  assert.match(text, /Pennsylvania/);
  // ?topic= is read by the ContactFormPanel island; SSR default is sponsor
  const island = main.match(/<astro-island\b[^>]*ContactFormPanel[^>]*>/)?.[0];
  assert.ok(island, 'ContactFormPanel island');
  assert.match(island, /defaultTopic[^,]*sponsor/);
  assert.match(main, /aria-checked="true"[^>]*>Sponsor a cohort/, 'sponsor chip preselected in SSR output');
  assert.match(main, /href="\/waitlist"/);
});

test('/waitlist: counters, audience switch form, rail, steps, phone preview, privacy, app link', () => {
  const { main, text } = load('/waitlist');
  const form = main.match(/<form\b[^>]*>[\s\S]*?<\/form>/i)?.[0];
  assert.ok(form, 'waitlist form is server-rendered');
  const open = parseAttrs(form.match(/<form\b[^>]*>/i)[0]);
  assert.equal(open.action, '/api/submit');
  assert.match(form, /name="_h"/);
  assert.match(main, /<astro-island\b/);
  // audience switch: supervisor default
  assert.match(main, /Supervisor/);
  assert.match(main, /Graduate/);
  assert.match(main, /Program/);
  // counters carry data-illustrative and are labelled as examples, not live
  for (const [n, label] of [['38', 'supervisors verified'], ['126', 'graduates waiting']]) {
    assert.ok(new RegExp(`${n}\\s+${label}`).test(text), `${n} ${label}`);
    const tile = main.match(new RegExp(`<article[^>]*data-illustrative[^>]*>(?:(?!</article>)[\\s\\S])*?${n}(?:(?!</article>)[\\s\\S])*?</article>`));
    assert.ok(tile, `counter ${n} is inside a [data-illustrative] tile`);
  }
  assert.match(text, /illustrative example counters/i);
  assert.match(text, /not live/i);
  assert.match(text, /fictional/i, 'example peer card labelled fictional');
  assert.match(text, /You(?:'|’|&#39;)re on the list\./);
  assert.match(text, /coming soon/i);
  assert.match(text, /Licenses are verified but not published; information is never sold\./);
  assert.match(main, new RegExp(`href="${APP_WELCOME}"`));
  assert.match(text, /Already invited\? Start in the app/);
  const island = main.match(/<astro-island\b[^>]*WaitlistFormPanel[^>]*>/)?.[0];
  assert.ok(island, 'WaitlistFormPanel island');
  assert.match(island, /defaultAudience[^,]*supervisor/);
  for (const step of ['confirmation', 'verification', 'local']) {
    assert.match(text, new RegExp(step, 'i'), `step mentions ${step}`);
  }
});
