// Run after `npx astro build`: node --test scripts/__tests__/forms-render.test.mjs
// Asserts the server-rendered v2 forms on the /_v2-forms preview meet the page contract
// enforced by scripts/check-pages.mjs (method=post action=/api/submit, _h honeypot).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const page = join(root, 'dist', '_v2-forms', 'index.html');

test('/_v2-forms preview is emitted and noindex', () => {
  assert.ok(existsSync(page), `missing ${page} (run astro build; the shell mounts /_v2-forms)`);
  assert.match(readFileSync(page, 'utf8'), /<meta name="robots" content="noindex/);
});

test('every v2 form posts to /api/submit and carries an off-screen _h honeypot', () => {
  const html = readFileSync(page, 'utf8');
  const forms = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  assert.ok(forms.length >= 5, `expected 5 forms, found ${forms.length}`);
  for (const f of forms) {
    const open = f.match(/<form\b[^>]*>/i)[0];
    assert.match(open, /\saction="\/api\/submit"/, open);
    assert.match(open, /\smethod="post"/i, open);
    assert.match(f, /<input[^>]*name="_h"[^>]*tabindex="-1"|<input[^>]*tabindex="-1"[^>]*name="_h"/i, 'honeypot');
    assert.match(f, /<input[^>]*type="hidden"[^>]*name="type"|<input[^>]*name="type"[^>]*type="hidden"/i, 'hidden type field for no-JS posts');
  }
});

test('every server-rendered submit button is disabled until the form hydrates (no raw-JSON native post)', () => {
  const html = readFileSync(page, 'utf8');
  const forms = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  assert.ok(forms.length >= 5, `expected 5 forms, found ${forms.length}`);
  for (const f of forms) {
    const buttons = [...f.matchAll(/<button\b[^>]*type="submit"[^>]*>/gi)].map((m) => m[0]);
    assert.ok(buttons.length > 0, 'form has a submit button');
    for (const b of buttons) assert.match(b, /\sdisabled(=|\s|>)/, `submit must start disabled: ${b}`);
  }
});
