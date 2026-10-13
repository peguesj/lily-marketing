// Run after `npx astro build`: node --test scripts/__tests__/landmarks.test.mjs
// BaseLayout owns the single <main id="main"> landmark; pages must not nest another one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = join(root, 'dist');

// HTML comments (and the style comments Astro keeps) may mention <main>; they are not landmarks.
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === '_astro' ? [] : htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

test('dist is built', () => {
  assert.ok(existsSync(dist), 'run astro build first');
});

test('every page served through BaseLayout has exactly one <main> landmark', () => {
  const pages = htmlFiles(dist).filter((f) => {
    const rel = relative(dist, f);
    // Internal previews with their own shell, and meta-refresh redirect stubs.
    if (rel.startsWith('_v2-mocks')) return false;
    return readFileSync(f, 'utf8').includes('id="main"');
  });
  assert.ok(pages.length >= 10, `expected the marketing pages, found ${pages.length}`);
  const offenders = pages
    .map((f) => [relative(dist, f), (stripComments(readFileSync(f, 'utf8')).match(/<main[\s>]/g) ?? []).length])
    .filter(([, n]) => n !== 1);
  assert.deepEqual(offenders, [], 'pages with nested or missing <main>');
});
