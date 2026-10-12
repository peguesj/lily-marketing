// Unit tests for scripts/check-pages.mjs, run against scripts/__fixtures__.
// Run: node --test scripts/check-pages.test.mjs   (npm run test:check-pages)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks, ROUTES, PENDING_ROUTES, SHIPPED_ROUTES } from './check-pages.mjs';

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
  ['illustrative-footer-only.html', 'illustrative'],
  ['honeypot-visible-text.html', 'honeypot'],
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

test('footer marker does not cover a claim in <main>', () => {
  const dir = withBad('illustrative-footer-only.html');
  try {
    const r = runChecks({ dist: dir, only: ['/'], appUrl: APP_URL });
    const f = r.failures.find((x) => x.rule === 'illustrative');
    assert.ok(f, 'expected illustrative failure');
    assert.match(f.message, /main/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('off-screen text honeypot (tabindex=-1) is accepted', () => {
  const dir = mkdtempSync(join(tmpdir(), 'check-pages-'));
  try {
    cpSync(join(FIX, 'good'), dir, { recursive: true });
    copyFileSync(join(FIX, 'variants', 'honeypot-text-offscreen.html'), join(dir, 'index.html'));
    const r = runChecks({ dist: dir, only: ['/'], appUrl: APP_URL });
    assert.deepEqual(r.failures, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('pending route missing is a notice by default, not a failure', () => {
  assert.ok(PENDING_ROUTES.includes('/supervisors'));
  const r = runChecks({ dist: join(FIX, 'good'), only: ['/supervisors'], appUrl: APP_URL });
  assert.ok(!rules(r).includes('exists'), JSON.stringify(r.failures));
  assert.ok(r.pending.some((p) => p.route === '/supervisors'));
});

test('pending route missing fails in strict mode (launch gate)', () => {
  const r = runChecks({ dist: join(FIX, 'good'), only: ['/supervisors'], appUrl: APP_URL, strict: true });
  assert.ok(rules(r).includes('exists'));
});

test('shipped route missing always fails', () => {
  assert.ok(!PENDING_ROUTES.includes('/pricing'));
  const r = runChecks({ dist: join(FIX, 'good'), only: ['/pricing'], appUrl: APP_URL });
  assert.ok(rules(r).includes('exists'));
});

test('redirect to a pending route is a notice by default and a failure in strict mode', () => {
  const lax = runChecks({ dist: join(FIX, 'good'), only: ['/'], appUrl: APP_URL });
  assert.ok(!rules(lax).includes('redirect-target'), JSON.stringify(lax.failures));
  assert.ok(lax.pending.some((p) => p.rule === 'redirect-target' && p.route === '/how'));
  const strict = runChecks({ dist: join(FIX, 'good'), only: ['/'], appUrl: APP_URL, strict: true });
  assert.ok(rules(strict).includes('redirect-target'));
});

test('default route set is shipped routes only', () => {
  for (const r of PENDING_ROUTES) assert.ok(ROUTES.includes(r), `${r} is in the full sitemap`);
  assert.deepEqual(SHIPPED_ROUTES, ROUTES.filter((r) => !PENDING_ROUTES.includes(r)));
});

function runVariant(name) {
  const dir = mkdtempSync(join(tmpdir(), 'check-pages-'));
  try {
    cpSync(join(FIX, 'good'), dir, { recursive: true });
    copyFileSync(join(FIX, 'variants', name), join(dir, 'index.html'));
    return runChecks({ dist: dir, only: ['/'], appUrl: APP_URL });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('commercial "eligible" terms and the not-a-provider disclaimer do not trigger the illustrative rule', () => {
  assert.deepEqual(runVariant('commercial-eligible-terms.html').failures, []);
});

test('supervisor eligibility copy still triggers next to an exempt phrase', () => {
  const dir = withBad('missing-illustrative.html');
  try {
    const r = runChecks({ dist: dir, only: ['/'], appUrl: APP_URL });
    assert.ok(rules(r).includes('illustrative'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
