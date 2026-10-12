// node --test scripts/__tests__/mocks.test.mjs
// Builds the site (unless dist is fresh) and asserts invariants of the D1 product mocks.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mocksDir = join(root, 'src/components/v2/mocks');
const COMPONENTS = [
  'PhoneFrame', 'PushCard', 'PractitionerCard', 'LilyVerifiedBadge', 'HoursLogPreview',
  'ProgressRing', 'CohortCard', 'AgreementRows', 'MatchWeights', 'GroupCard',
  'InboxPreview', 'SignupPhonePreview', 'VerificationRows', 'Timeline',
];
const TAG = 'Illustrative · pending validation';

let doc;

// Mounted at /_v2-mocks by the shell's src/config/preview-routes.mjs.
function pageCandidates() {
  return [join(root, 'dist/_v2-mocks/index.html')];
}

before(() => {
  if (process.env.MOCKS_SKIP_BUILD !== '1') {
    const r = spawnSync('npx', ['astro', 'build'], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, `astro build failed:\n${r.stdout}\n${r.stderr}`);
  }
  const file = pageCandidates().find(existsSync);
  assert.ok(file, `astro build did not render /_v2-mocks (looked for ${pageCandidates().join(', ')})`);
  doc = parse(readFileSync(file, 'utf8'));
});

// ---- tiny DOM helpers over parse5 ----
const attr = (n, name) => n.attrs?.find((a) => a.name === name)?.value;
const hasAttr = (n, name) => !!n.attrs?.some((a) => a.name === name);
const kids = (n) => n.childNodes ?? n.content?.childNodes ?? [];
function* walk(n) {
  yield n;
  for (const c of kids(n)) yield* walk(c);
}
const elements = () => [...walk(doc)].filter((n) => n.tagName);
const ownText = (n) => kids(n).filter((c) => c.nodeName === '#text').map((c) => c.value).join(' ');
const allText = (n) => [...walk(n)].filter((c) => c.nodeName === '#text').map((c) => c.value).join(' ').replace(/\s+/g, ' ');
const mockRoots = () => elements().filter((e) => hasAttr(e, 'data-mock'));
const rootOf = (name) => mockRoots().filter((e) => attr(e, 'data-mock') === name);
const progressbarOf = (n) => [...walk(n)].find((c) => c.tagName && attr(c, 'role') === 'progressbar');

/** self, ancestor, or sibling (of self/ancestor) carries data-illustrative; climb stops at the nearest data-mock root. */
function illustrativeNear(el) {
  for (let n = el; n && n.tagName && n.tagName !== 'body'; n = n.parentNode) {
    if (hasAttr(n, 'data-illustrative')) return true;
    const sibs = (n.parentNode ? kids(n.parentNode) : []).filter((s) => s.tagName && s !== n);
    if (sibs.some((s) => hasAttr(s, 'data-illustrative'))) return true;
    if (hasAttr(n, 'data-mock')) return false;
  }
  return false;
}

test('page is noindex and renders every mock exactly in the preview', () => {
  const robots = elements().find((e) => e.tagName === 'meta' && attr(e, 'name') === 'robots');
  assert.ok(robots, 'robots meta missing');
  assert.match(attr(robots, 'content'), /noindex/);
  for (const name of COMPONENTS) {
    assert.ok(rootOf(name).length >= 1, `${name} not rendered on _v2-mocks`);
  }
});

test('every element mentioning licensure has data-illustrative nearby (self/ancestor/sibling)', () => {
  const offenders = elements()
    .filter((e) => !['script', 'style', 'title', 'meta', 'head', 'html'].includes(e.tagName))
    .filter((e) => /licens/i.test(ownText(e)))
    .filter((e) => !illustrativeNear(e))
    .map((e) => `<${e.tagName}> "${ownText(e).trim().slice(0, 60)}"`);
  assert.deepEqual(offenders, []);
});

test('mocks that show verification/license/eligibility/rate/hours claims carry the visible illustrative tag', () => {
  const claimMocks = [
    'PractitionerCard', 'LilyVerifiedBadge', 'HoursLogPreview', 'CohortCard', 'AgreementRows',
    'MatchWeights', 'GroupCard', 'InboxPreview', 'SignupPhonePreview', 'VerificationRows',
  ];
  for (const name of claimMocks) {
    for (const r of rootOf(name)) {
      assert.ok(hasAttr(r, 'data-illustrative') || [...walk(r)].some((n) => n.tagName && hasAttr(n, 'data-illustrative')),
        `${name} lacks data-illustrative`);
      assert.ok(allText(r).includes(TAG), `${name} lacks visible "${TAG}"`);
    }
  }
});

test('ProgressRing hours claims carry the tag, on the ring or on the mock that embeds it', () => {
  const rings = rootOf('ProgressRing');
  assert.ok(rings.length >= 3, 'expected the standalone rings and the one inside HoursLogPreview');
  for (const r of rings) {
    let holder = r;
    if (!allText(r).includes(TAG)) {
      for (let n = r.parentNode; n && n.tagName; n = n.parentNode) {
        if (hasAttr(n, 'data-mock')) { holder = n; break; }
      }
    }
    assert.ok(allText(holder).includes(TAG), `ProgressRing "${attr(progressbarOf(r), 'aria-valuetext')}" has no visible "${TAG}"`);
    assert.ok(hasAttr(holder, 'data-illustrative') || [...walk(holder)].some((n) => n.tagName && hasAttr(n, 'data-illustrative')));
  }
});

test('no invented hour caps or quotas (site-graduates.md: no unverified hour quotas)', () => {
  const t = allText(doc);
  assert.doesNotMatch(t, /allowed per supervisee|hours? (cap|quota|limit)|\bof \d+ allowed\b/i);
  const src = readFileSync(join(mocksDir, 'GroupCard.astro'), 'utf8');
  assert.doesNotMatch(src, /hoursCap|allowed per supervisee/);
});

test('preview is only at /_v2-mocks and is excluded from the sitemap', () => {
  assert.ok(!existsSync(join(root, 'src/pages/v2-mocks.astro')), 'remove the src/pages/v2-mocks.astro wrapper route');
  assert.ok(!existsSync(join(root, 'dist/v2-mocks/index.html')), '/v2-mocks should not be emitted');
  const maps = readdirSync(join(root, 'dist')).filter((f) => /^sitemap.*\.xml$/.test(f));
  assert.ok(maps.length >= 1, 'sitemap not generated');
  for (const f of maps) {
    assert.doesNotMatch(readFileSync(join(root, 'dist', f), 'utf8'), /v2-mocks/, `${f} lists the mocks preview`);
  }
});

test('LilyVerifiedBadge label is "License review pending" and is followed by the tag', () => {
  for (const b of rootOf('LilyVerifiedBadge')) {
    const t = allText(b);
    assert.ok(t.includes('License review pending'));
    assert.ok(t.indexOf(TAG) > t.indexOf('License review pending'), 'tag must follow the label');
  }
});

test('SignupPhonePreview carries the required validation line', () => {
  const t = rootOf('SignupPhonePreview').map(allText).join(' ');
  assert.ok(t.includes('Illustrative license profile · eligibility pending validation.'));
});

test('MatchWeights renders a semantic table with th scope', () => {
  const [mw] = rootOf('MatchWeights');
  const tables = [...walk(mw)].filter((n) => n.tagName === 'table');
  assert.ok(tables.length >= 1, 'no <table>');
  const ths = [...walk(mw)].filter((n) => n.tagName === 'th');
  assert.ok(ths.length >= 4);
  for (const th of ths) assert.match(attr(th, 'scope') ?? '', /^(col|row)$/, 'th missing scope');
  assert.ok([...walk(mw)].some((n) => n.tagName === 'caption'), 'table needs a caption');
});

test('ProgressRing computes aria-valuenow/max and the arc matches', () => {
  const rings = rootOf('ProgressRing');
  assert.ok(rings.length >= 1);
  for (const root of rings) {
    const r = progressbarOf(root);
    assert.ok(r, 'ProgressRing has no role=progressbar element');
    const now = Number(attr(r, 'aria-valuenow'));
    const max = Number(attr(r, 'aria-valuemax'));
    assert.ok(Number.isFinite(now) && Number.isFinite(max) && max > 0 && now <= max);
    assert.equal(attr(r, 'aria-valuemin'), '0');
    const arc = [...walk(r)].find((n) => n.tagName === 'circle' && hasAttr(n, 'data-arc'));
    assert.ok(arc, 'arc circle missing');
    const len = Number(attr(arc, 'stroke-dasharray'));
    const off = Number(attr(arc, 'stroke-dashoffset'));
    assert.ok(Math.abs((len - off) / len - now / max) < 0.002, 'arc does not match value/total');
  }
  const hero = rings.map(progressbarOf).find((r) => attr(r, 'aria-valuenow') === '1240');
  assert.ok(hero, 'expected a 1,240 of 3,000 ring');
  assert.equal(attr(hero, 'aria-valuemax'), '3000');
});

test('PhoneFrame has role=img or aria-label', () => {
  const frames = rootOf('PhoneFrame');
  assert.ok(frames.length >= 1);
  for (const f of frames) {
    assert.ok(attr(f, 'role') === 'img' || !!attr(f, 'aria-label'), 'PhoneFrame not labelled');
    assert.ok(attr(f, 'aria-label'), 'PhoneFrame should carry a descriptive aria-label');
    assert.match(attr(f, 'style') ?? '', /250px/);
  }
});

test('no anchors with empty or missing href; export buttons are non-links', () => {
  const bad = elements().filter((e) => e.tagName === 'a' && !(attr(e, 'href') ?? '').trim());
  assert.equal(bad.length, 0, `${bad.length} anchors with empty href`);
  const [hl] = rootOf('HoursLogPreview');
  const exp = [...walk(hl)].filter((n) => n.tagName && hasAttr(n, 'data-export'));
  assert.ok(exp.length >= 2);
  assert.ok(exp.some((n) => n.tagName !== 'a'), 'default export buttons must not be links');
});

test('all names are fictional and marked Example; design example data present', () => {
  const t = allText(doc);
  for (const s of ['Elena Reyes', 'Maya Okafor', '1,240', '3,000', 'Thursday group', '$45', 'Example']) {
    assert.ok(t.includes(s), `missing "${s}"`);
  }
  for (const r of rootOf('PractitionerCard')) assert.ok(allText(r).includes('Example'), 'PractitionerCard not marked Example');
  for (const r of rootOf('InboxPreview')) assert.ok(allText(r).includes('Example'));
});

test('Timeline: last node filled, earlier outlined', () => {
  const [tl] = rootOf('Timeline');
  const nodes = [...walk(tl)].filter((n) => n.tagName && hasAttr(n, 'data-node'));
  assert.ok(nodes.length >= 5);
  nodes.forEach((n, i) => {
    assert.equal(attr(n, 'data-filled'), i === nodes.length - 1 ? 'true' : 'false');
  });
});

test('zero-JS: no <script> or client directives in mock sources', () => {
  const files = readdirSync(mocksDir).filter((f) => f.endsWith('.astro'));
  for (const name of COMPONENTS) assert.ok(files.includes(`${name}.astro`), `${name}.astro missing`);
  for (const f of files) {
    const src = readFileSync(join(mocksDir, f), 'utf8');
    assert.ok(!/<script/i.test(src), `${f} contains <script>`);
    assert.ok(!/client:/.test(src), `${f} uses client directive`);
    assert.ok(statSync(join(mocksDir, f)).size > 0);
  }
});
