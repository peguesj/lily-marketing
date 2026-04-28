import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import Btn from './Btn';

interface Props {
  onClose: () => void;
}

export default function DemoModal({ onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", role: "", lives: "", timeline: "", goals: "",
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="lily-modal-backdrop" onClick={onClose}>
      <div className="lily-modal demo" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="arrow" size={18} />
        </button>

        {!submitted ? (
          <>
            <div className="modal-head">
              <div className="modal-eyebrow">
                <span className="dot"></span>
                Request a demo &middot; For organizations
              </div>
              <h2 className="modal-title">See <em>Lily</em> for your population.</h2>
              <p className="modal-sub">
                A 30-minute walkthrough with our clinical &amp; benefits team. We'll model utilization,
                outcomes, and integration paths against your stack.
              </p>
            </div>

            <form onSubmit={submit} className="modal-form">
              <div className="form-row two">
                <label className="form-field">
                  <span className="form-label">Your name</span>
                  <input required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="First & last" />
                </label>
                <label className="form-field">
                  <span className="form-label">Work email</span>
                  <input required type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com" />
                </label>
              </div>

              <div className="form-row two">
                <label className="form-field">
                  <span className="form-label">Company</span>
                  <input required value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Health" />
                </label>
                <label className="form-field">
                  <span className="form-label">Your role</span>
                  <input value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    placeholder="VP, Total Rewards" />
                </label>
              </div>

              <div className="form-row two">
                <label className="form-field">
                  <span className="form-label">Covered lives</span>
                  <select required value={form.lives}
                    onChange={e => setForm({ ...form, lives: e.target.value })}>
                    <option value="">Select&hellip;</option>
                    <option>&lt; 500</option>
                    <option>500 &ndash; 2,500</option>
                    <option>2,500 &ndash; 10,000</option>
                    <option>10,000 &ndash; 50,000</option>
                    <option>50,000+</option>
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-label">Timeline</span>
                  <select value={form.timeline}
                    onChange={e => setForm({ ...form, timeline: e.target.value })}>
                    <option value="">Select&hellip;</option>
                    <option>Researching &mdash; Q3 '26</option>
                    <option>Renewal in next 6 mo</option>
                    <option>Active RFP</option>
                    <option>Replacing existing solution</option>
                    <option>Just exploring</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span className="form-label">What are you trying to solve?</span>
                <textarea rows={3} value={form.goals}
                  onChange={e => setForm({ ...form, goals: e.target.value })}
                  placeholder="e.g. Low engagement on EAP, gaps in identity-aware care, parity reporting&hellip;"></textarea>
              </label>

              <div className="modal-foot">
                <div className="trust-mini">
                  <Icon name="shield" size={12} />
                  No-pitch first call. NDA on request. We follow up within 1 business day.
                </div>
                <Btn kind="primary" size="lg" icon="arrow">Request demo</Btn>
              </div>
            </form>
          </>
        ) : (
          <div className="modal-success">
            <div className="success-icon"><Icon name="check" size={28} /></div>
            <h3>We'll be in touch within 1 business day.</h3>
            <p>You'll get a calendar link from clinical@lily.health and a custom modeling deck before the call.</p>
            <Btn kind="ghost" onClick={onClose}>Close</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
