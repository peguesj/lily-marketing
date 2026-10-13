// Run: node --test scripts/host-redirects.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REDIRECTS } from '../src/config/redirects.mjs';
import { nginxRules } from './host-redirects.mjs';
import { REDIRECTS as CHECKED_REDIRECTS } from './check-pages.mjs';

test('every retired page has a permanent (301) host rule to its target', () => {
  const rules = nginxRules().split('\n');
  assert.equal(rules.length, Object.keys(REDIRECTS).length);
  for (const [from, to] of Object.entries(REDIRECTS)) {
    const rule = rules.find((r) => r.includes(`^${from}/?$`));
    assert.ok(rule, `no rule for ${from}`);
    assert.match(rule, new RegExp(`return 301 ${to};`));
  }
});

test('rules match the page with or without a trailing slash and nothing longer', () => {
  const [rule] = nginxRules({ '/how': '/how-it-works' }).split('\n');
  const pattern = new RegExp(rule.match(/~ (\S+) \{/)[1]);
  assert.ok(pattern.test('/how'));
  assert.ok(pattern.test('/how/'));
  assert.ok(!pattern.test('/how-it-works'));
  assert.ok(!pattern.test('/howto'));
});

test('astro.config.mjs uses the same redirect list', async () => {
  const { readFileSync } = await import('node:fs');
  const config = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
  assert.match(config, /redirects: REDIRECTS/);
});

test('the page checker verifies the same redirects the host serves', () => {
  assert.deepEqual(CHECKED_REDIRECTS, REDIRECTS);
});
