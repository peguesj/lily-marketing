// Run: node --test scripts/__tests__/forms.test.mjs   (Node >= 22.18 strips TS types natively)
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateSupervisor,
  validateGraduate,
  validateProgram,
  validateContact,
  validateCohortOrg,
  validateCohortContact,
  buildWaitlistPayload,
  buildContactPayload,
  buildCohortPayload,
  firstName,
} from '../../src/components/v2/forms/validate.ts';
import { postSubmission } from '../../src/lib/submit.ts';

const NOW = new Date('2026-10-12T12:00:00Z');

const supervisor = (over = {}) => ({
  name: 'Jordan Wells',
  email: 'jordan@example.com',
  licenseType: 'LCSW',
  licenseNumber: 'CW012345',
  yearLicensed: '2012',
  state: 'PA',
  cityZip: '19103',
  individualRate: '135',
  groupRate: '',
  format: 'both',
  consent: true,
  ...over,
});

test('supervisor validator rejects a missing license number with the design copy', () => {
  const r = validateSupervisor(supervisor({ licenseNumber: '  ' }), NOW);
  assert.equal(r.valid, false);
  assert.equal(r.errors.licenseNumber, 'Enter the number printed on your PA license.');
});

test('supervisor validator accepts a complete PA record licensed 5+ years, no waitlist notice', () => {
  const r = validateSupervisor(supervisor(), NOW);
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, {});
  assert.equal(r.waitlistOnly, false);
  assert.match(r.notice, /Illustrative/);
  assert.match(r.notice, /pending validation/);
});

test('licensed within 5 years produces waitlist copy containing Illustrative and never promises eligibility', () => {
  const r = validateSupervisor(supervisor({ yearLicensed: '2024' }), NOW);
  assert.equal(r.valid, true);
  assert.equal(r.waitlistOnly, true);
  assert.match(r.notice, /Illustrative/);
  assert.doesNotMatch(r.notice, /you(?:'| a)re eligible|you qualify|approved/i);
});

test('non-PA state also becomes illustrative waitlist copy', () => {
  const r = validateSupervisor(supervisor({ state: 'OH' }), NOW);
  assert.equal(r.waitlistOnly, true);
  assert.match(r.notice, /Illustrative/);
});

test('supervisor validator flags every other required field', () => {
  const r = validateSupervisor(
    supervisor({
      name: '',
      email: 'nope',
      licenseType: '',
      yearLicensed: '',
      cityZip: '',
      individualRate: '',
      format: '',
      consent: false,
    }),
    NOW,
  );
  assert.equal(r.valid, false);
  for (const k of ['name', 'email', 'licenseType', 'yearLicensed', 'cityZip', 'individualRate', 'format', 'consent']) {
    assert.ok(r.errors[k], `expected error for ${k}`);
  }
  const bad = validateSupervisor(supervisor({ groupRate: '-4', yearLicensed: '2031' }), NOW);
  assert.ok(bad.errors.groupRate);
  assert.ok(bad.errors.yearLicensed);
});

test('waitlist payload includes type, audience and the honeypot _h', () => {
  const p = buildWaitlistPayload('supervisor', supervisor(), '');
  assert.equal(p.type, 'waitlist');
  assert.equal(p.audience, 'supervisor');
  assert.equal(p._h, '');
  assert.equal(p.email, 'jordan@example.com');
  assert.equal(p.licenseType, 'LCSW');
  assert.equal(p.licenseNumber, 'CW012345');
  assert.equal(p.individualRateCents, 13500);
  assert.equal(p.groupRateCents, undefined);
  assert.equal(p.boardVerificationConsent, true);
});

test('graduate validator and payload', () => {
  const g = {
    name: 'Elena Marquez',
    email: 'elena@example.com',
    degree: 'MSW',
    targetLicense: 'LCSW',
    hoursSoFar: '1240',
    zip: '15213',
    sponsored: true,
    sponsorCode: 'CMHC-1',
  };
  assert.equal(validateGraduate(g).valid, true);
  assert.ok(validateGraduate({ ...g, hoursSoFar: '3001' }).errors.hoursSoFar);
  assert.ok(validateGraduate({ ...g, hoursSoFar: '-1' }).errors.hoursSoFar);
  assert.ok(validateGraduate({ ...g, zip: '1' }).errors.zip);
  const p = buildWaitlistPayload('graduate', g, '');
  assert.equal(p.audience, 'graduate');
  assert.equal(p.hoursSoFar, 1240);
  assert.equal(p.sponsored, true);
  assert.equal(p.sponsorCode, 'CMHC-1');
  assert.equal(buildWaitlistPayload('graduate', { ...g, sponsored: false }, '').sponsorCode, undefined);
});

test('program cohort size must be greater than 0', () => {
  const base = { organization: 'Penn CMHC', role: 'Clinical director', cohortSize: '9', state: 'PA', name: 'Sam Lee', email: 'sam@example.org' };
  assert.equal(validateProgram(base).valid, true);
  assert.ok(validateProgram({ ...base, cohortSize: '0' }).errors.cohortSize);
  assert.ok(validateProgram({ ...base, cohortSize: '-3' }).errors.cohortSize);
  assert.ok(validateProgram({ ...base, cohortSize: '' }).errors.cohortSize);
  assert.ok(validateProgram({ ...base, cohortSize: '2.5' }).errors.cohortSize);
  assert.equal(buildWaitlistPayload('program', base, '').cohortSize, 9);
});

test('contact payload includes the topic and splits the name for the controller', () => {
  const v = { topic: 'sponsor', name: 'Sam Lee', email: 'sam@example.org', organization: '', message: 'We have nine clinicians.' };
  assert.equal(validateContact(v).valid, true);
  const p = buildContactPayload(v, '');
  assert.equal(p.type, 'contact');
  assert.equal(p.topic, 'sponsor');
  assert.equal(p._h, '');
  assert.equal(p.firstName, 'Sam');
  assert.equal(p.lastName, 'Lee');
  assert.equal(p.message, 'We have nine clinicians.');
  assert.ok(validateContact({ ...v, topic: '' }).errors.topic);
  assert.ok(validateContact({ ...v, message: '' }).errors.message);
});

test('cohort proposal validates in two steps and posts contact/cohort', () => {
  const org = { organization: 'Penn CMHC', role: 'Clinical director', cohortSize: '9', state: 'PA' };
  const contact = { name: 'Sam Lee', email: 'sam@example.org', consent: true };
  assert.equal(validateCohortOrg(org).valid, true);
  assert.ok(validateCohortOrg({ ...org, cohortSize: '0' }).errors.cohortSize);
  assert.ok(validateCohortOrg({ ...org, role: '' }).errors.role);
  assert.equal(validateCohortContact(contact).valid, true);
  assert.ok(validateCohortContact({ ...contact, consent: false }).errors.consent);
  const p = buildCohortPayload(org, contact, '');
  assert.equal(p.type, 'contact');
  assert.equal(p.topic, 'cohort');
  assert.equal(p._h, '');
  assert.equal(p.organization, 'Penn CMHC');
  assert.equal(p.coveredLives, 9);
  assert.match(p.message, /9/);
});

test('firstName helper', () => {
  assert.equal(firstName('Elena Marquez'), 'Elena');
  assert.equal(firstName('  '), '');
});

// ---- submit.ts ----------------------------------------------------------

const res = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (body === undefined) throw new Error('no body');
    return body;
  },
});

test('postSubmission posts JSON to /api/submit, always with _h and type', async () => {
  let seen;
  const fetchImpl = async (url, init) => {
    seen = { url, init };
    return res(200, { ok: true });
  };
  const out = await postSubmission({ type: 'waitlist', email: 'a@b.co' }, { fetchImpl });
  assert.deepEqual(out, { ok: true });
  assert.equal(seen.url, '/api/submit');
  assert.equal(seen.init.method, 'POST');
  assert.match(seen.init.headers['Content-Type'], /application\/json/);
  const body = JSON.parse(seen.init.body);
  assert.equal(body.type, 'waitlist');
  assert.equal(body._h, '');
  assert.equal(body.email, 'a@b.co');
});

test('postSubmission maps a 400 to invalid', async () => {
  const out = await postSubmission({ type: 'contact' }, { fetchImpl: async () => res(400, { error: 'Email required' }) });
  assert.deepEqual(out, { ok: false, error: 'invalid' });
});

test('postSubmission maps 5xx and unconfirmed 200 to server', async () => {
  assert.deepEqual(await postSubmission({ type: 'contact' }, { fetchImpl: async () => res(503, {}) }), { ok: false, error: 'server' });
  assert.deepEqual(await postSubmission({ type: 'contact' }, { fetchImpl: async () => res(200, { nope: 1 }) }), { ok: false, error: 'server' });
  assert.deepEqual(await postSubmission({ type: 'contact' }, { fetchImpl: async () => res(200) }), { ok: false, error: 'server' });
});

test('postSubmission maps a timeout to network (even if fetch ignores the signal)', async () => {
  const hang = () => new Promise(() => {});
  const out = await postSubmission({ type: 'contact' }, { fetchImpl: hang, timeoutMs: 20 });
  assert.deepEqual(out, { ok: false, error: 'network' });
});

test('postSubmission maps an aborted fetch and a thrown fetch to network', async () => {
  const abortable = (_u, init) =>
    new Promise((_r, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
  assert.deepEqual(await postSubmission({ type: 'contact' }, { fetchImpl: abortable, timeoutMs: 20 }), { ok: false, error: 'network' });
  assert.deepEqual(
    await postSubmission({ type: 'contact' }, { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }),
    { ok: false, error: 'network' },
  );
});

test('postSubmission default timeout is 10 seconds', async () => {
  const { SUBMIT_TIMEOUT_MS } = await import('../../src/lib/submit.ts');
  assert.equal(SUBMIT_TIMEOUT_MS, 10_000);
});
