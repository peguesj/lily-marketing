import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import Btn from './Btn';

interface Props {
  initialAudience?: string;
  onClose: () => void;
}

const TABS = [
  { id: "member", label: "I'm seeking care", sub: "Find a practitioner who fits.", icon: "heart" },
  { id: "practitioner", label: "I'm a practitioner", sub: "Build a practice that fills.", icon: "users" },
  { id: "organization", label: "I'm with an org", sub: "Cover lives with measurable care.", icon: "building" },
];

const CONCERNS: Record<string, string[]> = {
  member: ["Anxiety", "Depression", "Burnout", "Identity", "Couples / family", "Trauma", "Other"],
  practitioner: ["LCSW / LMFT / LPCC", "Psychologist", "Psychiatry / NP", "Coach / Peer", "Group practice", "Solo practice"],
  organization: ["Employer benefit", "Health plan / payer", "ACO / hospital system", "Higher ed", "K\u201312", "Government / public sector"],
};

export default function WaitlistModal({ initialAudience = "member", onClose }: Props) {
  const [audience, setAudience] = useState(initialAudience);
  const [picked, setPicked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    name: "", email: "", role: "", referral: "", concerns: [] as string[], updates: true,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const choose = (id: string) => { setAudience(id); setPicked(true); };

  const toggleConcern = (c: string) => {
    setForm(f => ({
      ...f,
      concerns: f.concerns.includes(c) ? f.concerns.filter(x => x !== c) : [...f.concerns, c]
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'waitlist', audience, ...form }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const successCopy = audience === "member"
    ? { title: "You're on the list.", sub: "We're inviting members in small cohorts. Watch for an email from match@lily.health \u2014 that's your invite to set up Lily Match." }
    : audience === "practitioner"
    ? { title: "Welcome, future Lily clinician.", sub: "Our credentialing team will reach out within 48 hours to verify your license and walk through the platform." }
    : { title: "Thanks \u2014 we'll be in touch.", sub: "Our partnerships team will reach out within 1 business day with next steps and reference accounts in your sector." };

  return (
    <div className="lily-modal-backdrop" onClick={onClose}>
      <div className="lily-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="arrow" size={18} />
        </button>

        {!submitted ? (
          <>
            <div className="modal-head">
              <div className="modal-eyebrow">
                <span className="dot"></span>
                Waitlist &middot; Alpha Q3 '26
              </div>
              <h2 className="modal-title">Reserve your seat in <em>Lily</em>.</h2>
              <p className="modal-sub">
                We're onboarding a small group at a time so every match is real.
                Tell us a little, and we'll get back within 48 hours.
              </p>
            </div>

            {!picked ? (
              <div className="aud-pick">
                {TABS.map(t => (
                  <button key={t.id} type="button" className="aud-card" onClick={() => choose(t.id)}>
                    <span className="aud-icon"><Icon name={t.icon} size={26} /></span>
                    <span className="aud-label">{t.label}</span>
                    <span className="aud-sub">{t.sub}</span>
                    <span className="aud-cta">Continue <Icon name="arrow" size={13} /></span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="aud-row">
                  {TABS.map(t => (
                    <button key={t.id} type="button"
                      className={`aud-pill ${t.id === audience ? "active" : "muted"}`}
                      onClick={() => setAudience(t.id)}
                      aria-pressed={t.id === audience}>
                      <span className="aud-pill-icon"><Icon name={t.icon} size={t.id === audience ? 18 : 14} /></span>
                      <span className="aud-pill-label">{t.label}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={submit} className="modal-form">
                  <div className="form-row two">
                    <label className="form-field">
                      <span className="form-label">Your name</span>
                      <input required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder={audience === "organization" ? "Mai Hernandez" : "First & last"} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">{audience === "organization" ? "Work email" : "Email"}</span>
                      <input required type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder={audience === "organization" ? "you@company.com" : "you@email.com"} />
                    </label>
                  </div>

                  {audience === "organization" && (
                    <div className="form-row two">
                      <label className="form-field">
                        <span className="form-label">Organization</span>
                        <input value={form.role}
                          onChange={e => setForm({ ...form, role: e.target.value })}
                          placeholder="Acme Health" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Approx. covered lives</span>
                        <select value={form.referral} onChange={e => setForm({ ...form, referral: e.target.value })}>
                          <option value="">Select&hellip;</option>
                          <option>&lt; 500</option>
                          <option>500 &ndash; 2,500</option>
                          <option>2,500 &ndash; 10,000</option>
                          <option>10,000 &ndash; 50,000</option>
                          <option>50,000+</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {audience === "practitioner" && (
                    <div className="form-row two">
                      <label className="form-field">
                        <span className="form-label">License state(s)</span>
                        <input value={form.role}
                          onChange={e => setForm({ ...form, role: e.target.value })}
                          placeholder="CA, NY, TX&hellip;" />
                      </label>
                      <label className="form-field">
                        <span className="form-label">Years in practice</span>
                        <select value={form.referral} onChange={e => setForm({ ...form, referral: e.target.value })}>
                          <option value="">Select&hellip;</option>
                          <option>&lt; 2 yrs</option>
                          <option>2 &ndash; 5 yrs</option>
                          <option>5 &ndash; 10 yrs</option>
                          <option>10+ yrs</option>
                        </select>
                      </label>
                    </div>
                  )}

                  <div className="form-field">
                    <span className="form-label">
                      {audience === "member" ? "What brings you here? (pick any)"
                        : audience === "practitioner" ? "License type (pick any)"
                        : "Use case (pick any)"}
                    </span>
                    <div className="chip-row">
                      {CONCERNS[audience].map(c => (
                        <button type="button" key={c}
                          className={`chip ${form.concerns.includes(c) ? "active" : ""}`}
                          onClick={() => toggleConcern(c)}>
                          {form.concerns.includes(c) && <Icon name="check" size={11} />}
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="form-check">
                    <input type="checkbox" checked={form.updates}
                      onChange={e => setForm({ ...form, updates: e.target.checked })} />
                    <span>Send me product updates and care tips. Unsubscribe anytime.</span>
                  </label>

                  <div className="modal-foot">
                    <div className="trust-mini">
                      <Icon name="lock" size={12} />
                      Encrypted. Never sold. HIPAA-aligned even pre-launch.
                    </div>
                    {submitError && (
                      <p style={{ fontSize: 13, color: 'hsl(0 60% 40%)', margin: '0 0 8px' }}>{submitError}</p>
                    )}
                    <Btn kind="primary" size="lg" icon="arrow" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Join waitlist'}
                    </Btn>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="modal-success">
            <div className="success-icon"><Icon name="check" size={28} /></div>
            <h3>{successCopy.title}</h3>
            <p>{successCopy.sub}</p>
            <Btn kind="ghost" onClick={onClose}>Close</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
