import { useState, type FormEvent } from 'react';

type AudienceRole = 'member' | 'practitioner' | 'org';

interface ContactFormProps {
  defaultRole?: AudienceRole;
}

const ROLE_OPTIONS = [
  { id: 'member'       as const, label: 'Member looking for care',        icon: '♥' },
  { id: 'practitioner' as const, label: 'Practitioner ready to apply',    icon: '🌿' },
  { id: 'org'          as const, label: 'Organization evaluating Lily',   icon: '🏢' },
];

export default function ContactForm({ defaultRole = 'member' }: ContactFormProps) {
  const [role, setRole] = useState<AudienceRole>(defaultRole);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const headings: Record<AudienceRole, string> = {
    member:       'Find your match',
    practitioner: 'Apply to Lily',
    org:          'Talk to our team',
  };

  const ctaLabels: Record<AudienceRole, string> = {
    member:       'Find my match',
    practitioner: 'Submit application',
    org:          'Request demo',
  };

  const messagePlaceholders: Record<AudienceRole, string> = {
    member:       'Anything you want us to know — totally optional.',
    practitioner: 'What you\'re looking for, timeline, anything else.',
    org:          'What you\'re looking for, timeline, anything else.',
  };

  const messageLabels: Record<AudienceRole, string> = {
    member:       'What brings you to Lily?',
    practitioner: 'Tell us a bit more',
    org:          'Tell us a bit more',
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = Object.fromEntries(fd.entries());
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', role, ...payload }),
      });
    } catch {
      // silent — submission logged server-side
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="contact-form contact-success" role="status">
        <div className="contact-success-icon" aria-hidden="true">✓</div>
        <h3>We got it.</h3>
        <p>
          {role === 'member' && "We'll match you with a few practitioners soon. Check your email."}
          {role === 'practitioner' && "Thanks for applying. Our credentialing team will be in touch within 3 business days."}
          {role === 'org' && "Thanks for reaching out. Someone from our team will contact you within 1 business day."}
        </p>
      </div>
    );
  }

  return (
    <div className="contact-grid">
      {/* Left: role picker + crisis notice */}
      <div className="contact-info">
        <h3>I'm a…</h3>
        <p>Pick the path that fits and we'll route you to the right team.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ROLE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRole(opt.id)}
              className="quiz-option"
              aria-pressed={role === opt.id}
              style={{
                borderColor: role === opt.id ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                background:  role === opt.id ? 'hsl(var(--primary) / 0.06)' : 'white',
              }}
            >
              <span className="quiz-option-icon" aria-hidden="true">{opt.icon}</span>
              <span style={{ fontWeight: 600 }}>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Crisis notice */}
        <div
          style={{
            marginTop: 32, padding: 20, borderRadius: 14,
            background: 'hsla(165, 50%, 90%, 0.5)',
            border: '1px solid hsla(165, 30%, 60%, 0.3)',
          }}
          role="note"
          aria-label="Crisis resources"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'hsl(0 60% 35%)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            In a crisis?
          </div>
          <p style={{ marginTop: 8, fontSize: 13.5, color: 'hsl(var(--foreground) / 0.82)', margin: '8px 0 0' }}>
            Call or text <strong>988</strong> for the Suicide &amp; Crisis Lifeline (US). For emergencies, dial <strong>911</strong>. Lily isn't a substitute for crisis care.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <h3 style={{ fontFamily: 'var(--brand)', fontSize: 22, margin: '0 0 22px', letterSpacing: '-0.01em', fontWeight: 500 }}>
          {headings[role]}
        </h3>

        <div className="form-row">
          <div>
            <label htmlFor="contact-first-name">First name</label>
            <input id="contact-first-name" name="firstName" placeholder="Ada" required autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="contact-last-name">Last name</label>
            <input id="contact-last-name" name="lastName" placeholder="Cantor" required autoComplete="family-name" />
          </div>
        </div>

        <div className="form-row full">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" placeholder="you@email.com" required autoComplete="email" />
        </div>

        {role === 'org' && (
          <div className="form-row">
            <div>
              <label htmlFor="contact-org">Organization</label>
              <input id="contact-org" name="organization" placeholder="Acme, Inc." autoComplete="organization" />
            </div>
            <div>
              <label htmlFor="contact-lives">Covered lives</label>
              <select id="contact-lives" name="coveredLives">
                <option>Under 500</option>
                <option>500 – 5,000</option>
                <option>5,000 – 25,000</option>
                <option>25,000+</option>
              </select>
            </div>
          </div>
        )}

        {role === 'practitioner' && (
          <div className="form-row">
            <div>
              <label htmlFor="contact-license">License type</label>
              <select id="contact-license" name="licenseType">
                <option>LMFT</option>
                <option>LCSW</option>
                <option>LPC</option>
                <option>PsyD / PhD</option>
                <option>MD / DO</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-states">State(s)</label>
              <input id="contact-states" name="states" placeholder="CA, OR" />
            </div>
          </div>
        )}

        <div className="form-row full">
          <label htmlFor="contact-message">{messageLabels[role]}</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder={messagePlaceholders[role]}
            rows={4}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Sending…' : ctaLabels[role]}
          {!submitting && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          )}
        </button>

        <p style={{ marginTop: 14, fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>
          By continuing, you agree to Lily's Terms &amp; Privacy. We'll never share your information.
        </p>
      </form>
    </div>
  );
}
