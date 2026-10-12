import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  CheckField,
  ERROR_COPY,
  focusField,
  Honeypot,
  LiveStatus,
  RetryBanner,
  SelectField,
  TextField,
  useSubmission,
} from './ui.tsx';
import {
  COPY,
  STATES,
  buildCohortPayload,
  firstName,
  validateCohortContact,
  validateCohortOrg,
  type CohortContactValues,
  type CohortOrgValues,
} from './validate.ts';

export interface CohortProposalFormProps {
  compact?: boolean;
}

const stateOptions = STATES.map(([code, name]) => [code, name] as const);
const ORG_ORDER = ['organization', 'role', 'cohortSize', 'state'];
const CONTACT_ORDER = ['name', 'email', 'consent'];

export default function CohortProposalForm({ compact = false }: CohortProposalFormProps) {
  const prefix = `co${useId().replace(/:/g, '')}`;
  const id = (k: string) => `${prefix}-${k}`;
  const [step, setStep] = useState<1 | 2>(1);
  const [org, setOrg] = useState<CohortOrgValues>({ organization: '', role: '', cohortSize: '', state: 'PA' });
  const [contact, setContact] = useState<CohortContactValues>({ name: '', email: '', consent: false });
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [announce, setAnnounce] = useState('');
  const { phase, send } = useSubmission();
  const successRef = useRef<HTMLDivElement>(null);

  const orgErrors = useMemo(() => validateCohortOrg(org).errors, [org]);
  const contactErrors = useMemo(() => validateCohortContact(contact).errors, [contact]);
  const errors = step === 1 ? orgErrors : contactErrors;
  const err = (k: string) => (showErrors || touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => {
    if (phase.kind === 'success') successRef.current?.focus();
  }, [phase.kind]);

  function fail(order: string[]) {
    const keys = order.filter((k) => errors[k]);
    if (keys.length === 0) return false;
    setShowErrors(true);
    setAnnounce(`${keys.length} ${keys.length === 1 ? 'field needs' : 'fields need'} attention. ${errors[keys[0]!]}`);
    focusField(prefix, keys[0]!);
    return true;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase.kind === 'submitting') return;
    if (step === 1) {
      if (fail(ORG_ORDER)) return;
      setStep(2);
      setShowErrors(false);
      setTouched({});
      setAnnounce('Step 2 of 2: how can we reach you?');
      focusField(prefix, 'name');
      return;
    }
    submit();
  }

  function submit() {
    if (fail(CONTACT_ORDER)) return;
    setAnnounce('');
    void send(buildCohortPayload(org, contact, honeypot));
  }

  const submitting = phase.kind === 'submitting';
  const first = firstName(contact.name);
  const live = submitting
    ? 'Sending…'
    : phase.kind === 'error'
      ? ERROR_COPY[phase.error]
      : phase.kind === 'success'
        ? `Proposal request received${first ? `, ${first}` : ''}.`
        : announce;
  const titleId = id('title');

  return (
    <div className={`lv2f${compact ? ' lv2f--compact' : ''}`} data-step={step}>
      {phase.kind === 'success' ? (
        <div ref={successRef} tabIndex={-1} className="lv2f-success">
          <h3>
            Thank you{first ? <>, <em>{first}</em></> : null}.
          </h3>
          <p>
            We have your request for {org.organization}. A founder will follow up about a cohort proposal. Work hours and supervision-contact hours are
            tracked separately, and any program report is not licensure approval.
          </p>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} aria-labelledby={titleId} aria-busy={submitting}>
          <p className="lv2f-step">Step {step} of 2</p>
          <h3 id={titleId} className="lv2f-title">
            Request a cohort <em>proposal</em>
          </h3>
          <div className="lv2f-grid">
            {step === 1 ? (
              <>
                <TextField id={id('organization')} label="Organization" required autoComplete="organization" value={org.organization} onChange={(x) => setOrg({ ...org, organization: x })} onBlur={blur('organization')} error={err('organization')} />
                <TextField id={id('role')} label="Your role" required autoComplete="organization-title" value={org.role} onChange={(x) => setOrg({ ...org, role: x })} onBlur={blur('role')} error={err('role')} />
                <TextField id={id('cohortSize')} label="Cohort size" required inputMode="numeric" value={org.cohortSize} onChange={(x) => setOrg({ ...org, cohortSize: x })} onBlur={blur('cohortSize')} error={err('cohortSize')} hint="Clinicians who need supervision." />
                <SelectField id={id('state')} label="State" required options={stateOptions} value={org.state} onChange={(x) => setOrg({ ...org, state: x })} onBlur={blur('state')} error={err('state')} />
                {org.state !== 'PA' ? <p className="lv2f-notice lv2f-notice--waitlist lv2f-span">{COPY.programNoticeNonPa}</p> : null}
              </>
            ) : (
              <>
                <TextField id={id('name')} label="Your name" required autoComplete="name" value={contact.name} onChange={(x) => setContact({ ...contact, name: x })} onBlur={blur('name')} error={err('name')} />
                <TextField id={id('email')} label="Work email" required type="email" inputMode="email" autoComplete="email" value={contact.email} onChange={(x) => setContact({ ...contact, email: x })} onBlur={blur('email')} error={err('email')} />
                <CheckField id={id('consent')} checked={contact.consent} onChange={(x) => setContact({ ...contact, consent: x })} error={err('consent')}>
                  You may contact me about this cohort proposal. Information is never sold.
                </CheckField>
              </>
            )}
          </div>
          <Honeypot value={honeypot} onChange={setHoneypot} />
          {phase.kind === 'error' ? <RetryBanner error={phase.error} onRetry={submit} /> : null}
          <div className="lv2f-actions">
            {step === 2 ? (
              <button
                type="button"
                className="lv2f-btn lv2f-btn--ghost"
                onClick={() => {
                  setStep(1);
                  setShowErrors(false);
                  setAnnounce('Step 1 of 2.');
                }}
              >
                Back
              </button>
            ) : null}
            <button type="submit" className="lv2f-btn" disabled={submitting}>
              {step === 1 ? 'Request a cohort proposal' : submitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      )}
      <LiveStatus message={live} tone={phase.kind === 'error' ? 'error' : 'info'} />
    </div>
  );
}
