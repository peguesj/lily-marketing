import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ChipGroup,
  ERROR_COPY,
  focusField,
  Honeypot,
  LiveStatus,
  RetryBanner,
  TextAreaField,
  TextField,
  useSubmission,
} from './ui.tsx';
import { CONTACT_TOPICS, buildContactPayload, firstName, validateContact, type ContactValues } from './validate.ts';

export interface ContactFormProps {
  /** Preselect a topic id (e.g. from a query string). Starts blank by default. */
  defaultTopic?: (typeof CONTACT_TOPICS)[number]['id'];
  compact?: boolean;
}

const topicChips = CONTACT_TOPICS.map((t) => ({ id: t.id, label: t.label }));
const ORDER = ['topic', 'name', 'email', 'message'];

export default function ContactForm({ defaultTopic, compact = false }: ContactFormProps) {
  const prefix = `ct${useId().replace(/:/g, '')}`;
  const id = (k: string) => `${prefix}-${k}`;
  const [v, setV] = useState<ContactValues>({ topic: defaultTopic ?? '', name: '', email: '', organization: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [announce, setAnnounce] = useState('');
  const { phase, send } = useSubmission();
  const successRef = useRef<HTMLDivElement>(null);

  const { errors } = useMemo(() => validateContact(v), [v]);
  const err = (k: string) => (showErrors || touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const topic = CONTACT_TOPICS.find((t) => t.id === v.topic);

  useEffect(() => {
    if (phase.kind === 'success') successRef.current?.focus();
  }, [phase.kind]);

  function submit() {
    setShowErrors(true);
    const keys = ORDER.filter((k) => errors[k]);
    if (keys.length > 0) {
      setAnnounce(`${keys.length} ${keys.length === 1 ? 'field needs' : 'fields need'} attention. ${errors[keys[0]!]}`);
      focusField(prefix, keys[0]!);
      return;
    }
    setAnnounce('');
    void send(buildContactPayload(v, honeypot));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase.kind !== 'submitting') submit();
  }

  const submitting = phase.kind === 'submitting';
  const first = firstName(v.name);
  const live = submitting
    ? 'Sending…'
    : phase.kind === 'error'
      ? ERROR_COPY[phase.error]
      : phase.kind === 'success'
        ? `Message sent${first ? `, ${first}` : ''}.`
        : announce;
  const titleId = id('title');

  return (
    <div className={`lv2f${compact ? ' lv2f--compact' : ''}`}>
      {phase.kind === 'success' ? (
        <div ref={successRef} tabIndex={-1} className="lv2f-success">
          <h3>
            Thank you{first ? <>, <em>{first}</em></> : null}.
          </h3>
          <p>Your message is in. {topic ? topic.hint.replace('Founders read these first. ', '') : 'We reply within one business day.'}</p>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} aria-labelledby={titleId} aria-busy={submitting}>
          <h3 id={titleId} className="lv2f-title">
            Talk to a <em>person.</em>
          </h3>
          <div className="lv2f-grid">
            <ChipGroup
              id={id('topic')}
              legend="What is this about?"
              required
              options={topicChips}
              value={v.topic}
              onChange={(t) => setV({ ...v, topic: t })}
              error={err('topic')}
              hint={topic?.hint ?? 'Pick a topic and we will route your message to the right inbox.'}
            />
            <TextField id={id('name')} label="Your name" required autoComplete="name" value={v.name} onChange={(x) => setV({ ...v, name: x })} onBlur={blur('name')} error={err('name')} />
            <TextField id={id('email')} label="Email" required type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(x) => setV({ ...v, email: x })} onBlur={blur('email')} error={err('email')} />
            <TextField id={id('organization')} label="Organization (optional)" span autoComplete="organization" value={v.organization} onChange={(x) => setV({ ...v, organization: x })} />
            <TextAreaField id={id('message')} label="Message" required span value={v.message} onChange={(x) => setV({ ...v, message: x })} onBlur={blur('message')} error={err('message')} />
          </div>
          <Honeypot value={honeypot} onChange={setHoneypot} />
          {phase.kind === 'error' ? <RetryBanner error={phase.error} onRetry={submit} /> : null}
          <div className="lv2f-actions">
            <button type="submit" className="lv2f-btn" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send my message'}
            </button>
          </div>
        </form>
      )}
      <LiveStatus message={live} tone={phase.kind === 'error' ? 'error' : 'info'} />
    </div>
  );
}
