/**
 * Pure validation + payload builders for the v2 conversion forms.
 * No DOM, no React, erasable TypeScript only (importable by node --test).
 *
 * All copy about supervisor eligibility / licensure / verification is
 * illustrative pending validation and never promises eligibility.
 */

export type Errors = Record<string, string>;

export interface ValidationResult {
  valid: boolean;
  errors: Errors;
}

export type Audience = 'supervisor' | 'graduate' | 'program';

export const REQUIRED_YEARS = 5;
export const TOTAL_HOURS = 3000;

export const LICENSE_TYPES = ['LPC', 'LCSW', 'LMFT', 'Psychologist', 'Psychiatrist'] as const;
export const SUPERVISOR_FORMATS = [
  { id: 'individual', label: 'Individual' },
  { id: 'group', label: 'Group' },
  { id: 'both', label: 'Both' },
] as const;
export const DEGREES = ['MSW', 'MA/MS Counseling', 'MFT', 'PsyD/PhD', 'Other'] as const;
export const TARGET_LICENSES = ['LPC', 'LCSW', 'LMFT', 'Psychologist'] as const;

export const STATES: ReadonlyArray<readonly [string, string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

export const CONTACT_TOPICS = [
  { id: 'sponsor', label: 'Sponsor a cohort', hint: 'Founders read these first. Routes to programs. Reply within one business day.' },
  { id: 'supervisor', label: 'Supervisor question', hint: 'Routes to supervisor support. Reply within one business day.' },
  { id: 'graduate', label: 'Graduate question', hint: 'Routes to graduate support. Reply within one business day.' },
  { id: 'press', label: 'Press', hint: 'Reaches Alphonso and Jeremiah the same day.' },
  { id: 'trust', label: 'Trust report', hint: 'Routes to the trust inbox. Reply within one business day.' },
  { id: 'other', label: 'Something else', hint: 'Routes to the general inbox. Reply within one business day.' },
] as const;

export const COPY = {
  supervisorNoticeOk: 'Illustrative license profile · eligibility pending validation.',
  supervisorNoticeWaitlist:
    'Illustrative waitlist copy: outside Pennsylvania, or licensed under five years? Join the waitlist and we will be in touch as eligibility is validated. Nothing here confirms eligibility.',
  programNoticeNonPa:
    'Illustrative: Lily’s pilot starts in Pennsylvania. Other states join an interest list; this does not imply service is available there.',
} as const;

// ---------------------------------------------------------------- helpers

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP_RE = /^\d{5}$/;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function parseNumber(v: string): number | null {
  if (v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseInteger(v: string): number | null {
  const n = parseNumber(v);
  return n !== null && Number.isInteger(n) ? n : null;
}

const result = (errors: Errors): ValidationResult => ({ valid: Object.keys(errors).length === 0, errors });

function checkName(errors: Errors, v: string, key = 'name') {
  if (!str(v)) errors[key] = 'Enter your full name.';
}
function checkEmail(errors: Errors, v: string, key = 'email') {
  const e = str(v);
  if (!e) errors[key] = 'Enter your email address.';
  else if (!EMAIL_RE.test(e)) errors[key] = 'Enter an email address like name@example.com.';
}
function checkState(errors: Errors, v: string, key = 'state') {
  if (!STATES.some(([code]) => code === v)) errors[key] = 'Choose a state.';
}

export function firstName(full: string): string {
  return str(full).split(/\s+/)[0] ?? '';
}

export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = str(full).split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

// ------------------------------------------------------------ supervisor

export interface SupervisorValues {
  name: string;
  email: string;
  licenseType: string;
  licenseNumber: string;
  yearLicensed: string;
  state: string;
  cityZip: string;
  individualRate: string;
  groupRate: string;
  format: string;
  consent: boolean;
}

export interface SupervisorValidation extends ValidationResult {
  /** True when the entry is waitlist-only (non-PA or under five years). Never an eligibility promise. */
  waitlistOnly: boolean;
  /** Inline, illustrative helper copy; undefined until state + year are usable. */
  notice?: string;
}

export function validateSupervisor(v: SupervisorValues, now: Date = new Date()): SupervisorValidation {
  const errors: Errors = {};
  const thisYear = now.getUTCFullYear();

  checkName(errors, v.name);
  checkEmail(errors, v.email);
  if (!(LICENSE_TYPES as readonly string[]).includes(v.licenseType)) errors.licenseType = 'Choose your license type.';
  checkState(errors, v.state);
  if (!str(v.licenseNumber)) errors.licenseNumber = `Enter the number printed on your ${v.state || 'PA'} license.`;

  const year = /^\d{4}$/.test(str(v.yearLicensed)) ? Number(str(v.yearLicensed)) : null;
  if (year === null || year < 1950 || year > thisYear) {
    errors.yearLicensed = 'Enter the four-digit year you were first licensed.';
  }

  if (!str(v.cityZip)) errors.cityZip = 'Enter your city or ZIP code.';

  const rate = parseNumber(str(v.individualRate));
  if (rate === null || rate <= 0 || rate > 1000) errors.individualRate = 'Enter your hourly individual rate in dollars.';
  if (str(v.groupRate) !== '') {
    const g = parseNumber(str(v.groupRate));
    if (g === null || g <= 0 || g > 1000) errors.groupRate = 'Enter a group rate in dollars per person, or leave it blank.';
  }

  if (!SUPERVISOR_FORMATS.some((f) => f.id === v.format)) errors.format = 'Choose at least one session format.';
  if (!v.consent) errors.consent = 'Check the box to allow license verification against the state board.';

  const waitlistOnly = v.state !== 'PA' || (year !== null && year > thisYear - REQUIRED_YEARS);
  let notice: string | undefined;
  if (year !== null && year >= 1950 && year <= thisYear && v.state) {
    notice = waitlistOnly ? COPY.supervisorNoticeWaitlist : COPY.supervisorNoticeOk;
  }

  return { ...result(errors), waitlistOnly, notice };
}

// -------------------------------------------------------------- graduate

export interface GraduateValues {
  name: string;
  email: string;
  degree: string;
  targetLicense: string;
  hoursSoFar: string;
  zip: string;
  sponsored: boolean;
  sponsorCode: string;
}

export function validateGraduate(v: GraduateValues): ValidationResult {
  const errors: Errors = {};
  checkName(errors, v.name);
  checkEmail(errors, v.email);
  if (!(DEGREES as readonly string[]).includes(v.degree)) errors.degree = 'Choose your degree.';
  if (!(TARGET_LICENSES as readonly string[]).includes(v.targetLicense)) errors.targetLicense = 'Choose the license you are working toward.';
  const hours = parseInteger(str(v.hoursSoFar));
  if (hours === null || hours < 0 || hours > TOTAL_HOURS) {
    errors.hoursSoFar = `Enter whole hours between 0 and ${TOTAL_HOURS.toLocaleString('en-US')}.`;
  }
  if (!ZIP_RE.test(str(v.zip))) errors.zip = 'Enter a five-digit ZIP code.';
  return result(errors);
}

// --------------------------------------------------------------- program

export interface ProgramValues {
  organization: string;
  role: string;
  cohortSize: string;
  state: string;
  name: string;
  email: string;
}

function checkOrg(errors: Errors, v: { organization: string; role: string; cohortSize: string; state: string }) {
  if (!str(v.organization)) errors.organization = 'Enter your organization’s name.';
  if (!str(v.role)) errors.role = 'Enter your role.';
  const n = parseInteger(str(v.cohortSize));
  if (n === null || n <= 0) errors.cohortSize = 'Enter a cohort size greater than 0.';
  else if (n > 10000) errors.cohortSize = 'Enter a cohort size of 10,000 or fewer.';
  checkState(errors, v.state);
}

export function validateProgram(v: ProgramValues): ValidationResult {
  const errors: Errors = {};
  checkOrg(errors, v);
  checkName(errors, v.name);
  checkEmail(errors, v.email);
  return result(errors);
}

// --------------------------------------------------------------- contact

export interface ContactValues {
  topic: string;
  name: string;
  email: string;
  organization: string;
  message: string;
}

export function validateContact(v: ContactValues): ValidationResult {
  const errors: Errors = {};
  if (!CONTACT_TOPICS.some((t) => t.id === v.topic)) errors.topic = 'Choose what this is about.';
  checkName(errors, v.name);
  checkEmail(errors, v.email);
  if (!str(v.message)) errors.message = 'Tell us a little about what you need.';
  return result(errors);
}

// ---------------------------------------------------------------- cohort

export interface CohortOrgValues {
  organization: string;
  role: string;
  cohortSize: string;
  state: string;
}
export interface CohortContactValues {
  name: string;
  email: string;
  consent: boolean;
}

export function validateCohortOrg(v: CohortOrgValues): ValidationResult {
  const errors: Errors = {};
  checkOrg(errors, v);
  return result(errors);
}

export function validateCohortContact(v: CohortContactValues): ValidationResult {
  const errors: Errors = {};
  checkName(errors, v.name);
  checkEmail(errors, v.email);
  if (!v.consent) errors.consent = 'Check the box so we can contact you about this proposal.';
  return result(errors);
}

// -------------------------------------------------------------- payloads

export interface Payload {
  type: string;
  _h: string;
  [field: string]: unknown;
}

const dollarsToCents = (v: string): number | undefined => {
  const n = parseNumber(str(v));
  return n === null ? undefined : Math.round(n * 100);
};

export function buildWaitlistPayload(
  audience: 'supervisor',
  values: SupervisorValues,
  honeypot: string,
): Payload;
export function buildWaitlistPayload(audience: 'graduate', values: GraduateValues, honeypot: string): Payload;
export function buildWaitlistPayload(audience: 'program', values: ProgramValues, honeypot: string): Payload;
export function buildWaitlistPayload(
  audience: Audience,
  values: SupervisorValues | GraduateValues | ProgramValues,
  honeypot: string,
): Payload {
  const base = { type: 'waitlist', audience, _h: honeypot };
  if (audience === 'supervisor') {
    const v = values as SupervisorValues;
    return {
      ...base,
      name: str(v.name),
      email: str(v.email),
      licenseType: v.licenseType,
      licenseNumber: str(v.licenseNumber),
      yearLicensed: Number(str(v.yearLicensed)),
      state: v.state,
      cityZip: str(v.cityZip),
      individualRateCents: dollarsToCents(v.individualRate),
      groupRateCents: str(v.groupRate) === '' ? undefined : dollarsToCents(v.groupRate),
      format: v.format,
      boardVerificationConsent: v.consent === true,
    };
  }
  if (audience === 'graduate') {
    const v = values as GraduateValues;
    return {
      ...base,
      name: str(v.name),
      email: str(v.email),
      degree: v.degree,
      targetLicense: v.targetLicense,
      hoursSoFar: Number(str(v.hoursSoFar)),
      zip: str(v.zip),
      sponsored: v.sponsored === true,
      sponsorCode: v.sponsored && str(v.sponsorCode) ? str(v.sponsorCode) : undefined,
    };
  }
  const v = values as ProgramValues;
  return {
    ...base,
    organization: str(v.organization),
    role: str(v.role),
    cohortSize: Number(str(v.cohortSize)),
    state: v.state,
    name: str(v.name),
    email: str(v.email),
  };
}

export function buildContactPayload(v: ContactValues, honeypot: string): Payload {
  return {
    type: 'contact',
    topic: v.topic,
    _h: honeypot,
    name: str(v.name),
    ...splitName(v.name),
    email: str(v.email),
    organization: str(v.organization) || undefined,
    message: str(v.message),
  };
}

export function buildCohortPayload(org: CohortOrgValues, contact: CohortContactValues, honeypot: string): Payload {
  const size = Number(str(org.cohortSize));
  return {
    type: 'contact',
    topic: 'cohort',
    _h: honeypot,
    name: str(contact.name),
    ...splitName(contact.name),
    email: str(contact.email),
    organization: str(org.organization),
    role: str(org.role),
    cohortSize: size,
    coveredLives: size,
    state: org.state,
    states: org.state,
    consentToContact: contact.consent === true,
    message: `Cohort proposal request: ${str(org.organization)} (${str(org.role)}), cohort of ${size} in ${org.state}.`,
  };
}
