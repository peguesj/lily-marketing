// Unit tests for src/config/preview-routes.mjs (internal noindex preview pages).
// Run: node --test scripts/preview-routes.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PREVIEW_PAGES, previewRoutes, excludePreviewsFromSitemap } from '../src/config/preview-routes.mjs';

test('preview pages are the underscore-prefixed v2 previews', () => {
  assert.deepEqual(PREVIEW_PAGES.map((p) => p.pattern), ['/_v2-kit', '/_v2-mocks', '/_v2-forms']);
  for (const p of PREVIEW_PAGES) assert.equal(p.entrypoint, `./src/pages${p.pattern}.astro`);
});

test('injects only previews whose source file exists', () => {
  const root = mkdtempSync(join(tmpdir(), 'preview-routes-'));
  try {
    mkdirSync(join(root, 'src', 'pages'), { recursive: true });
    writeFileSync(join(root, 'src', 'pages', '_v2-mocks.astro'), '---\n---\n');
    const injected = [];
    previewRoutes({ root }).hooks['astro:config:setup']({ injectRoute: (r) => injected.push(r) });
    assert.deepEqual(injected.map((r) => r.pattern), ['/_v2-mocks']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('sitemap filter drops previews and keeps public pages', () => {
  assert.equal(excludePreviewsFromSitemap('https://www.asklily.health/_v2-kit/'), false);
  assert.equal(excludePreviewsFromSitemap('https://www.asklily.health/_v2-forms/'), false);
  assert.equal(excludePreviewsFromSitemap('https://www.asklily.health/v2-mocks/'), false);
  assert.equal(excludePreviewsFromSitemap('https://www.asklily.health/pricing/'), true);
  assert.equal(excludePreviewsFromSitemap('https://www.asklily.health/'), true);
});
