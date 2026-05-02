'use strict';

const nodemailer = require('nodemailer');

const NOTIFY_TO = process.env.NOTIFY_TO || 'hello@asklily.health';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_FROM = process.env.SMTP_FROM || 'hello@asklily.health';

function buildTransport() {
  const base = { host: SMTP_HOST, port: SMTP_PORT, secure: false };
  if (process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      ...base,
      auth: { user: process.env.SMTP_USER || SMTP_FROM, pass: process.env.SMTP_PASS },
    });
  }
  // IP-allowlisted relay (GWS relay authorized at 15.197.225.128 for asklily.health)
  return nodemailer.createTransport(base);
}

function formatRow(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:13px;color:#111827">${value}</td></tr>`;
}

function buildEmailHtml(data) {
  const type = data.type || 'form';
  const badge = type === 'waitlist' ? '#145a32' : '#1a3a6b';
  const badgeLabel = type === 'waitlist' ? 'Waitlist' : 'Contact';

  let rows = '';
  if (type === 'waitlist') {
    rows += formatRow('Audience', data.audience);
    rows += formatRow('Name', data.name);
    rows += formatRow('Email', data.email);
    rows += formatRow('Role / specialty', data.role);
    rows += formatRow('Referral / extra', data.referral);
    rows += formatRow('Interests', Array.isArray(data.concerns) ? data.concerns.join(', ') : data.concerns);
    rows += formatRow('Marketing opt-in', data.updates === true || data.updates === 'true' ? 'Yes' : 'No');
  } else {
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
    rows += formatRow('Name', name);
    rows += formatRow('Email', data.email);
    rows += formatRow('Role', data.role);
    rows += formatRow('Organization', data.organization);
    rows += formatRow('Covered lives', data.coveredLives);
    rows += formatRow('License type', data.licenseType);
    rows += formatRow('States', data.states);
    if (data.message) {
      rows += `<tr><td colspan="2" style="padding:12px 0 0;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">Message</td></tr>`;
      rows += `<tr><td colspan="2" style="padding:4px 0 0;font-size:13px;color:#111827;white-space:pre-wrap">${data.message}</td></tr>`;
    }
  }

  const subjectName = type === 'waitlist'
    ? (data.name || data.email || 'anonymous')
    : ([data.firstName, data.lastName].filter(Boolean).join(' ') || data.email || 'anonymous');

  const subjectRole = type === 'waitlist' ? (data.audience || 'web') : (data.role || 'web');

  return {
    subject: `[Lily ${badgeLabel}] ${subjectName} — ${subjectRole}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
  <div style="padding:20px 24px;background:${badge}">
    <span style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;opacity:.75">Lily AI</span>
    <div style="font-size:18px;font-weight:600;color:#fff;margin-top:4px">${badgeLabel} submission</div>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse">${rows}</table>
  </div>
  <div style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af">
    Submitted via asklily.health · ${new Date().toUTCString()}
  </div>
</div>
</body></html>`,
  };
}

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = { status: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    return;
  }

  const data = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

  // Basic honeypot — bots fill hidden field
  if (data._h) {
    context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
    return;
  }

  if (!data.email) {
    context.res = { status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Email required' }) };
    return;
  }

  const { subject, html } = buildEmailHtml(data);

  try {
    const transport = buildTransport();
    await transport.sendMail({
      from: `"Lily AI" <${SMTP_FROM}>`,
      to: NOTIFY_TO,
      replyTo: data.email,
      subject,
      html,
    });
  } catch (err) {
    // Log but don't expose SMTP errors to client
    context.log.error('SMTP error:', err.message);
  }

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
