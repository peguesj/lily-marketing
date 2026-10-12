// Unit tests for scripts/check-pages.mjs, run against scripts/__fixtures__.
// Run: node --test scripts/check-pages.test.mjs   (npm run test:check-pages)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks } from './check-pages.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, '__fixtures__');
const APP_URL = 'https://app.asklily.health';

function withBad(name) {
  const dir = mkdtempSync(join(tmpdir(), 'check-pages-'));
  cpSync(join(FIX, 'good'), dir, { recursive: true });
  copyFileSync(join(FIX, 'bad', name), join(dir, 'index.html'));
  return dir;
}

function rules(result) {
  return result.failures.map((f) => f.rule);
}

test('good fixture passes', () => {
  const r = runChecks({ dist: join(FIX, 'good'), only: ['/'], appUrl: APP_URL });
  assert.deepEqual(r.failures, []);
});

const VIOLATIONS = [
  ['missing-illustrative.html', 'illustrative'],
  ['app-url-not-allowlisted.html', 'app-url-allowlist'],
  ['missing-honeypot.html', 'honeypot'],
  ['form-wrong-action.html', 'form-action'],
  ['hash-href.html', 'dead-href'],
  ['empty-href.html', 'dead-href'],
  ['two-h1.html', 'h1'],
  ['no-h1.html', 'h1'],
];

for (const [file, rule] of VIOLATIONS) {
  test(`${file} fails rule ${rule}`, () => {
    const dir = withBad(file);
    try {
      const r = runChecks({ dist: dir, only: ['/'], appUrl: APP_URL });
      assert.ok(rules(r).includes(rule), `expected ${rule}, got ${JSON.stringify(r.failures)}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

test('missing redirect fails', () => {
  const dir = withBad('../good/index.html');
  try {
    rmSync(join(dir, 'how'), { recursive: true });
    const r = runChecks({ dist: dir, only: ['/'], appUrl: APP_URL });
    assert.ok(rules(r).includes('redirect'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('page that does not exist fails by design', () => {
  const r = runChecks({ dist: join(FIX, 'good'), only: ['/supervisors'], appUrl: APP_URL });
  assert.ok(rules(r).includes('exists'));
});
