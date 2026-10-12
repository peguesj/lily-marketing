// Run: `npx astro build && node --test scripts/__tests__/ui-kit.test.mjs`
// Parses the built design-system preview page and asserts each v2 UI primitive renders.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kitPath = join(root, 'dist', '_v2-kit', 'index.html');

test('build output contains /_v2-kit', () => {
  assert.ok(existsSync(kitPath), `missing ${kitPath} (run \`npx astro build\` first)`);
});

const html = existsSync(kitPath) ? readFileSync(kitPath, 'utf8') : '';
const hasClass = (cls) => new RegExp(`class="[^"]*\\b${cls}\\b[^"]*"`).test(html);
const count = (re) => (html.match(re) ?? []).length;

// Astro may inline or externalise component CSS; read both.
const linkedCss = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
  .map((m) => join(root, 'dist', m[1]))
  .filter(existsSync)
  .map((f) => readFileSync(f, 'utf8'));
const css = [...[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]), ...linkedCss].join('\n');

test('page is noindex and excluded from sitemap', () => {
  assert.match(html, /<meta name="robots" content="noindex[^"]*"/);
  for (const f of readdirSync(join(root, 'dist')).filter((n) => /^sitemap.*\.xml$/.test(n))) {
    assert.ok(!readFileSync(join(root, 'dist', f), 'utf8').includes('_v2-kit'), `${f} lists _v2-kit`);
  }
});

test('every component root class is present', () => {
  for (const cls of [
    'v2-btn', 'v2-chip', 'v2-eyebrow', 'v2-sectionhead', 'v2-stat', 'v2-step', 'v2-faq',
    'v2-cta', 'v2-trust', 'v2-illustrative', 'v2-petal', 'v2-blob', 'v2-section', 'v2-container',
  ]) {
    assert.ok(hasClass(cls), `missing root class ${cls}`);
  }
});

test('Button variants, href, external and data-action render', () => {
  for (const v of ['primary', 'outline', 'inverse', 'text']) assert.ok(hasClass(`v2-btn--${v}`), `button variant ${v}`);
  assert.ok(hasClass('v2-btn--sm'), 'small button');
  assert.match(html, /<a[^>]*class="[^"]*v2-btn[^"]*"[^>]*href="\/waitlist"|<a[^>]*href="\/waitlist"[^>]*class="[^"]*v2-btn/);
  assert.match(html, /data-action="join-supervisor"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /target="_blank"/);
});

test('Chip variants render; selected has a check', () => {
  for (const v of ['default', 'selected', 'teal', 'peach', 'muted', 'status']) assert.ok(hasClass(`v2-chip--${v}`), `chip ${v}`);
  assert.match(html, /v2-chip--selected[^>]*>[\s\S]*?<svg[^>]*class="[^"]*v2-chip__check/);
  assert.ok(hasClass('v2-chip__dot'), 'status dot');
});

test('Eyebrow renders as a span', () => {
  assert.match(html, /<span[^>]*class="[^"]*v2-eyebrow/);
});

test('SectionHead accent is an em.v2-accent, with onDark variant and right link', () => {
  assert.match(html, /<em[^>]*class="[^"]*v2-accent[^"]*"/);
  assert.ok(hasClass('v2-sectionhead--on-dark'), 'onDark');
  assert.ok(hasClass('v2-sectionhead__link'), 'right-aligned link');
});

test('StatTile renders number, caption, citation, illustrative flag', () => {
  assert.ok(hasClass('v2-stat__value'));
  assert.ok(hasClass('v2-stat__caption'));
  assert.ok(hasClass('v2-stat__cite'));
  assert.match(html, /class="[^"]*v2-stat[^"]*"[^>]*data-illustrative/);
});

test('StepCard renders numbered disc and connector', () => {
  assert.ok(hasClass('v2-step__num'));
  assert.ok(hasClass('v2-step--connector'));
});

test('FAQ uses details/summary, first open', () => {
  assert.ok(count(/<details\b/g) >= 3, 'details items');
  assert.ok(count(/<summary\b/g) >= 3, 'summary items');
  assert.match(html, /<details[^>]*class="[^"]*v2-faq__item[^"]*"[^>]*\sopen(=""|\s|>)/);
  assert.equal(count(/<details[^>]*v2-faq__item[^>]*\sopen(?:=""|\s|>)/g), 1, 'only first open');
  assert.ok(hasClass('v2-faq__glyph'), 'plus/minus glyph');
});

test('CTABand renders headline accent, buttons and progress', () => {
  assert.ok(hasClass('v2-cta__accent'));
  assert.ok(hasClass('v2-cta__actions'));
  assert.match(html, /role="progressbar"/);
});

test('TrustStrip renders check discs', () => {
  assert.ok(hasClass('v2-trust__disc'));
  assert.ok(count(/v2-trust__item/g) >= 3);
});

test('IllustrativeNotice is aside[data-illustrative] with required label', () => {
  assert.match(html, /<aside[^>]*\bdata-illustrative\b/);
  assert.match(html, /Illustrative · pending validation/);
  assert.match(html, /Prototype copy does not establish a credential/);
});

test('PetalMark has 3/4/5 petal variants and is decorative', () => {
  for (const n of [3, 4, 5]) assert.ok(hasClass(`v2-petal--${n}`), `${n} petals`);
  assert.match(html, /<svg[^>]*class="[^"]*v2-petal[^"]*"[^>]*aria-hidden="true"/);
});

test('Blob is decorative and uses 18% opacity', () => {
  assert.match(html, /class="[^"]*v2-blob[^"]*"[^>]*aria-hidden="true"/);
  assert.match(css, /prefers-reduced-motion/);
});

test('Section / Container render with tone', () => {
  assert.ok(hasClass('v2-section--muted'));
});

test('no inline white-on-peach styles', () => {
  const inline = [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1].toLowerCase());
  for (const s of inline) {
    const white = /(^|;)\s*color\s*:\s*(#fff(fff)?\b|white\b)/.test(s);
    const peach = /background(-color)?\s*:\s*[^;]*(#f0b882|peach)/.test(s);
    assert.ok(!(white && peach), `white-on-peach inline style: ${s}`);
  }
  // Chip peach variant must not use a white foreground in the shipped CSS either.
  assert.match(css, /\.v2-chip--peach/, 'peach chip CSS shipped');
  for (const rule of css.matchAll(/\.v2-chip--peach[^{]*\{([^}]*)\}/g)) {
    assert.ok(!/(^|;)\s*color\s*:\s*(#fff(fff)?\b|white\b)/i.test(rule[1]), 'peach chip has white text');
  }
});

// Every kit section that shows supervisor verification / licensure / eligibility, the
// threshold, or hours copy must carry its own visible label, not rely on another section's.
const CLAIM = /verif|licens|eligib|threshold|3,000|\bhours?\b/i;
const LABEL = 'Illustrative · pending validation';
const sectionText = (s) => s.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&middot;|&#183;/g, '·').replace(/\s+/g, ' ');

test('each kit section with claim copy carries its own illustrative label', () => {
  // Kit sections are the top-level <section aria-labelledby="kit-*">; components such as
  // CTABand render nested <section>s, so slice between kit-section starts instead.
  const body = html.slice(0, html.lastIndexOf('</body>'));
  const starts = [...body.matchAll(/<section\b[^>]*aria-labelledby="kit-[^"]+"/g)].map((m) => m.index);
  const sections = starts.map((start, i) => body.slice(start, starts[i + 1] ?? body.length));
  assert.ok(sections.length >= 8, `expected the kit sections, found ${sections.length}`);
  const unlabelled = sections
    .filter((s) => CLAIM.test(sectionText(s)))
    .filter((s) => !/\sdata-illustrative(\s|=|>)/.test(s) || !sectionText(s).includes(LABEL))
    .map((s) => s.match(/aria-labelledby="([^"]+)"/)?.[1] ?? s.slice(0, 80));
  assert.deepEqual(unlabelled, [], `sections with unlabelled claim copy: ${unlabelled.join(', ')}`);
});

test('build does not inject routes from component folders', () => {
  assert.ok(!existsSync(join(root, 'src', 'components', 'v2', 'ui', 'kit-route.mjs')), 'routing belongs to src/config/preview-routes.mjs (shell)');
});
