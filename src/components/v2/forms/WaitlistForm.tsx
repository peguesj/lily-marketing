import { SUBMIT_ENDPOINT } from '../../../lib/submit.ts';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  CheckField,
  ChipGroup,
  focusField,
  Honeypot,
  LiveStatus,
  RetryBanner,
  SelectField,
  TextField,
  useSubmission,
  ERROR_COPY,
} from './ui.tsx';
import {
  DEGREES,
  LICENSE_TYPES,
  STATES,
  SUPERVISOR_FORMATS,
  TARGET_LICENSES,
  TOTAL_HOURS,
  COPY,
  buildWaitlistPayload,
  firstName,
  validateGraduate,
  validateProgram,
  validateSupervisor,
  type Audience,
  type Errors,
  type GraduateValues,
  type ProgramValues,
  type SupervisorValues,
} from './validate.ts';

export interface WaitlistFormProps {
  defaultAudience: Audience;
  compact?: boolean;
  /** Link to the app sign-up shown on the confirmation. Omitted when not provided. */
  appHref?: string;
  /** URL shared by the "Share" button. Defaults to this page's /waitlist. */
  shareUrl?: string;
}

const AUDIENCES: ReadonlyArray<{ id: Audience; label: string }> = [
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'graduate', label: 'Graduate' },
  { id: 'program', label: 'Program' },
];

const SUP0: SupervisorValues = {
  name: '', email: '', licenseType: '', licenseNumber: '', yearLicensed: '', state: 'PA',
  cityZip: '', individualRate: '', groupRate: '', format: '', consent: false,
};
const GRAD0: GraduateValues = {
  name: '', email: '', degree: '', targetLicense: '', hoursSoFar: '', zip: '', sponsored: false, sponsorCode: '',
};
const PROG0: ProgramValues = { organization: '', role: '', cohortSize: '', state: 'PA', name: '', email: '' };

const FIELD_ORDER: Record<Audience, string[]> = {
  supervisor: ['name', 'email', 'licenseType', 'licenseNumber', 'yearLicensed', 'state', 'cityZip', 'individualRate', 'groupRate', 'format', 'consent'],
  graduate: ['name', 'email', 'degree', 'targetLicense', 'hoursSoFar', 'zip'],
  program: ['organization', 'role', 'cohortSize', 'state', 'name', 'email'],
};

const LEDE: Record<Audience, string> = {
  supervisor: 'Pennsylvania first. We check licenses against the state board before anything is published.',
  graduate: 'Tell us where you are on the path to licensure and we will let you know as supervisors open near you.',
  program: 'Training programs and clinics: tell us about your cohort and we will follow up.',
};

const SUCCESS_NOTE: Record<Audience, string> = {
  supervisor: 'Illustrative: we will check your license against the state board before anything is published. Eligibility is pending validation.',
  graduate: 'We will email you as supervisors are verified near your ZIP. Hours shown are illustrative.',
  program: 'A founder will follow up about your cohort.',
};

const stateOptions = STATES.map(([code, name]) => [code, name] as const);
const licenseChips = LICENSE_TYPES.map((t) => ({ id: t, label: t }));
const formatChips = SUPERVISOR_FORMATS.map((f) => ({ id: f.id, label: f.label }));
const degreeOptions = DEGREES.map((d) => [d, d] as const);
const targetOptions = TARGET_LICENSES.map((d) => [d, d] as const);
const audienceChips = AUDIENCES.map((a) => ({ id: a.id, label: a.label }));

export default function WaitlistForm({ defaultAudience, compact = false, appHref, shareUrl }: WaitlistFormProps) {
  const uid = useId().replace(/:/g, '');
  const prefix = `wl${uid}`;
  const [audience, setAudience] = useState<Audience>(defaultAudience);
  const [sup, setSup] = useState<SupervisorValues>(SUP0);
  const [grad, setGrad] = useState<GraduateValues>(GRAD0);
  const [prog, setProg] = useState<ProgramValues>(PROG0);
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const { phase, send, reset } = useSubmission();
  const successRef = useRef<HTMLDivElement>(null);

  const supResult = useMemo(() => validateSupervisor(sup), [sup]);
  const gradResult = useMemo(() => validateGraduate(grad), [grad]);
  const progResult = useMemo(() => validateProgram(prog), [prog]);
  const result = audience === 'supervisor' ? supResult : audience === 'graduate' ? gradResult : progResult;
  const errors: Errors = result.errors;

  useEffect(() => {
    if (phase.kind === 'success') successRef.current?.focus();
  }, [phase.kind]);

  const err = (key: string) => (showErrors || touched[key] ? errors[key] : undefined);
  const blur = (key: string) => () => setTouched((t) => ({ ...t, [key]: true }));
  const id = (key: string) => `${prefix}-${key}`;

  function currentPayload() {
    if (audience === 'supervisor') return buildWaitlistPayload('supervisor', sup, honeypot);
    if (audience === 'graduate') return buildWaitlistPayload('graduate', grad, honeypot);
    return buildWaitlistPayload('program', prog, honeypot);
  }

  function switchAudience(next: string) {
    setAudience(next as Audience);
    setShowErrors(false);
    setTouched({});
    setAnnounce('');
    reset();
  }

  function submit() {
    setShowErrors(true);
    const keys = FIELD_ORDER[audience].filter((k) => errors[k]);
    if (keys.length > 0) {
      setAnnounce(`${keys.length} ${keys.length === 1 ? 'field needs' : 'fields need'} attention. ${errors[keys[0]!]}`);
      focusField(prefix, keys[0]!);
      return;
    }
    setAnnounce('');
    void send(currentPayload());
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase.kind === 'submitting') return;
    submit();
  }

  async function share() {
    const url = shareUrl ?? `${window.location.origin}/waitlist`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Lily', url });
        setShareMsg('Thanks for sharing.');
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg('Link copied.');
      }
    } catch {
      setShareMsg(`Copy this link: ${url}`);
    }
  }

  const name = audience === 'supervisor' ? sup.name : audience === 'graduate' ? grad.name : prog.name;
  const submitting = phase.kind === 'submitting';
  const liveMessage = submitting
    ? 'Checking…'
    : phase.kind === 'error'
      ? ERROR_COPY[phase.error]
      : phase.kind === 'success'
        ? `You’re on the list${firstName(name) ? `, ${firstName(name)}` : ''}.`
        : shareMsg || announce;

  const ctaLabel = audience === 'supervisor' && !supResult.waitlistOnly ? 'Join as a supervisor' : 'Join the waitlist';
  const titleId = id('title');

  return (
    <div className={`lv2f${compact ? ' lv2f--compact' : ''}`} data-audience={audience}>
      {phase.kind === 'success' ? (
        <div ref={successRef} tabIndex={-1} className="lv2f-success">
          <h3>
            You&rsquo;re on the list{firstName(name) ? <>, <em>{firstName(name)}</em></> : null}.
          </h3>
          <p>{SUCCESS_NOTE[audience]}</p>
          <div className="lv2f-actions">
            {appHref ? (
              <a className="lv2f-btn" href={appHref}>
                Continue to the app
              </a>
            ) : null}
            <button type="button" className="lv2f-btn lv2f-btn--ghost" onClick={() => void share()}>
              Share Lily
            </button>
          </div>
        </div>
      ) : (
        <form action={SUBMIT_ENDPOINT} method="post" noValidate onSubmit={onSubmit} aria-labelledby={titleId} aria-busy={submitting}>
          <input type="hidden" name="type" value="waitlist" />
          <h3 id={titleId} className="lv2f-title">
            Join the <em>waitlist</em>
          </h3>
          <p className="lv2f-lede">{LEDE[audience]}</p>

          <ChipGroup id={id('audience')} legend="I am a" options={audienceChips} value={audience} onChange={switchAudience} variant="segmented" />

          <div className="lv2f-grid">
            {audience === 'supervisor' && (
              <>
                <TextField id={id('name')} label="Full name" required autoComplete="name" value={sup.name} onChange={(v) => setSup({ ...sup, name: v })} onBlur={blur('name')} error={err('name')} />
                <TextField id={id('email')} label="Email" required type="email" inputMode="email" autoComplete="email" value={sup.email} onChange={(v) => setSup({ ...sup, email: v })} onBlur={blur('email')} error={err('email')} />
                <ChipGroup id={id('licenseType')} legend="License type" required options={licenseChips} value={sup.licenseType} onChange={(v) => setSup({ ...sup, licenseType: v })} error={err('licenseType')} />
                <TextField id={id('licenseNumber')} label="License number" required value={sup.licenseNumber} onChange={(v) => setSup({ ...sup, licenseNumber: v })} onBlur={blur('licenseNumber')} error={err('licenseNumber')} />
                <TextField id={id('yearLicensed')} label="Year licensed" required inputMode="numeric" maxLength={4} value={sup.yearLicensed} onChange={(v) => setSup({ ...sup, yearLicensed: v })} onBlur={blur('yearLicensed')} error={err('yearLicensed')} describedByExtra={supResult.notice ? id('notice') : undefined} />
                <SelectField id={id('state')} label="State" required autoComplete="address-level1" options={stateOptions} value={sup.state} onChange={(v) => setSup({ ...sup, state: v })} onBlur={blur('state')} error={err('state')} />
                <TextField id={id('cityZip')} label="City or ZIP" required autoComplete="postal-code" value={sup.cityZip} onChange={(v) => setSup({ ...sup, cityZip: v })} onBlur={blur('cityZip')} error={err('cityZip')} />
                <TextField id={id('individualRate')} label="Individual rate ($/hr)" required inputMode="decimal" value={sup.individualRate} onChange={(v) => setSup({ ...sup, individualRate: v })} onBlur={blur('individualRate')} error={err('individualRate')} />
                <TextField id={id('groupRate')} label="Group rate ($/hr per person, optional)" inputMode="decimal" value={sup.groupRate} onChange={(v) => setSup({ ...sup, groupRate: v })} onBlur={blur('groupRate')} error={err('groupRate')} />
                <ChipGroup id={id('format')} legend="Session format" required options={formatChips} value={sup.format} onChange={(v) => setSup({ ...sup, format: v })} error={err('format')} />
                {supResult.notice ? (
                  <p id={id('notice')} className={`lv2f-notice lv2f-span${supResult.waitlistOnly ? ' lv2f-notice--waitlist' : ''}`}>
                    {supResult.notice}
                  </p>
                ) : null}
                <CheckField id={id('consent')} checked={sup.consent} onChange={(v) => setSup({ ...sup, consent: v })} error={err('consent')}>
                  I consent to verification of my license with the state board. Licenses are verified, not published, and information is never sold.
                </CheckField>
              </>
            )}

            {audience === 'graduate' && (
              <>
                <TextField id={id('name')} label="Full name" required autoComplete="name" value={grad.name} onChange={(v) => setGrad({ ...grad, name: v })} onBlur={blur('name')} error={err('name')} />
                <TextField id={id('email')} label="Email" required type="email" inputMode="email" autoComplete="email" value={grad.email} onChange={(v) => setGrad({ ...grad, email: v })} onBlur={blur('email')} error={err('email')} />
                <SelectField id={id('degree')} label="Degree" required placeholder="Choose a degree" options={degreeOptions} value={grad.degree} onChange={(v) => setGrad({ ...grad, degree: v })} onBlur={blur('degree')} error={err('degree')} />
                <SelectField id={id('targetLicense')} label="Target license" required placeholder="Choose a license" options={targetOptions} value={grad.targetLicense} onChange={(v) => setGrad({ ...grad, targetLicense: v })} onBlur={blur('targetLicense')} error={err('targetLicense')} />
                <TextField id={id('hoursSoFar')} label={`Hours so far (of ${TOTAL_HOURS.toLocaleString('en-US')})`} required inputMode="numeric" value={grad.hoursSoFar} onChange={(v) => setGrad({ ...grad, hoursSoFar: v })} onBlur={blur('hoursSoFar')} error={err('hoursSoFar')} hint="Signed experience hours so far. The 3,000 total is illustrative." />
                <TextField id={id('zip')} label="ZIP code" required inputMode="numeric" maxLength={5} autoComplete="postal-code" value={grad.zip} onChange={(v) => setGrad({ ...grad, zip: v })} onBlur={blur('zip')} error={err('zip')} />
                <CheckField id={id('sponsored')} variant="switch" checked={grad.sponsored} onChange={(v) => setGrad({ ...grad, sponsored: v })}>
                  My program or employer is sponsoring my supervision
                </CheckField>
                {grad.sponsored ? (
                  <TextField id={id('sponsorCode')} label="Sponsor code (optional)" span value={grad.sponsorCode} onChange={(v) => setGrad({ ...grad, sponsorCode: v })} />
                ) : null}
              </>
            )}

            {audience === 'program' && (
              <>
                <TextField id={id('organization')} label="Organization" required autoComplete="organization" value={prog.organization} onChange={(v) => setProg({ ...prog, organization: v })} onBlur={blur('organization')} error={err('organization')} />
                <TextField id={id('role')} label="Your role" required autoComplete="organization-title" value={prog.role} onChange={(v) => setProg({ ...prog, role: v })} onBlur={blur('role')} error={err('role')} />
                <TextField id={id('cohortSize')} label="Cohort size" required inputMode="numeric" value={prog.cohortSize} onChange={(v) => setProg({ ...prog, cohortSize: v })} onBlur={blur('cohortSize')} error={err('cohortSize')} />
                <SelectField id={id('state')} label="State" required options={stateOptions} value={prog.state} onChange={(v) => setProg({ ...prog, state: v })} onBlur={blur('state')} error={err('state')} />
                <TextField id={id('name')} label="Your name" required autoComplete="name" value={prog.name} onChange={(v) => setProg({ ...prog, name: v })} onBlur={blur('name')} error={err('name')} />
                <TextField id={id('email')} label="Email" required type="email" inputMode="email" autoComplete="email" value={prog.email} onChange={(v) => setProg({ ...prog, email: v })} onBlur={blur('email')} error={err('email')} />
                {prog.state !== 'PA' ? <p className="lv2f-notice lv2f-notice--waitlist lv2f-span">{COPY.programNoticeNonPa}</p> : null}
              </>
            )}
          </div>

          <Honeypot value={honeypot} onChange={setHoneypot} />

          {phase.kind === 'error' ? <RetryBanner error={phase.error} onRetry={submit} /> : null}

          <div className="lv2f-actions">
            <button type="submit" className="lv2f-btn" disabled={submitting}>
              {submitting ? 'Checking…' : ctaLabel}
            </button>
          </div>
          <p className="lv2f-helper">Licenses are verified but not published. Information is never sold.</p>
        </form>
      )}
      <LiveStatus message={liveMessage} tone={phase.kind === 'error' ? 'error' : 'info'} />
    </div>
  );
}
