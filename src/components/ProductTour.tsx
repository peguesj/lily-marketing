import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';

// ============ Mid-fi screen vignette ============
interface TourTileProps {
  eyebrow: string;
  title: string;
  sub?: string;
  screen?: 'default' | 'dark' | 'peach' | 'sage';
  size?: 'default' | 'wide' | 'full';
  children?: React.ReactNode;
}

const TourTile = ({ eyebrow, title, sub, screen = 'default', size = 'default', children }: TourTileProps) => (
  <div className={'tile' + (size === 'wide' ? ' wide' : size === 'full' ? ' full' : '')}>
    <div className="tour-tile">
      <div className={'tile-screen ' + (screen === 'dark' ? 'dark' : screen === 'peach' ? 'peach' : screen === 'sage' ? 'sage' : '')}>
        {children}
      </div>
      <div className="tile-meta">
        <div className="tile-eyebrow">{eyebrow}</div>
        <h3 className="tile-title">{title}</h3>
        {sub && <p className="tile-sub">{sub}</p>}
      </div>
    </div>
  </div>
);

// ============ Tile definitions ============
interface TileDef {
  eyebrow: string;
  title: string;
  sub?: string;
  screen?: 'default' | 'dark' | 'peach' | 'sage';
  size?: 'default' | 'wide' | 'full';
  audiences: string[];
  render: () => React.ReactNode;
}

const ALL_TILES: TileDef[] = [
  // ----- MEMBER -----
  {
    eyebrow: 'Member · Onboarding',
    title: 'A welcome that already knows a little.',
    sub: 'First visit. No form-wall — a single soft step at a time.',
    screen: 'peach',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {[1, 1, 1, 0, 0].map((d, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: d ? 'hsl(20 60% 60%)' : 'hsla(20,30%,80%,0.5)' }}></div>
          ))}
        </div>
        <div className="mini-sub" style={{ marginBottom: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'hsl(20 50% 40%)' }}>Step 3 of 5</div>
        <div style={{ fontFamily: 'var(--brand)', fontSize: 20, fontWeight: 500, lineHeight: 1.2, marginBottom: 14, color: 'hsl(20 60% 22%)' }}>
          What brings you to <em style={{ color: 'hsl(20 70% 45%)' }}>Lily</em> today?
        </div>
        <div className="tile-stack">
          {['Anxiety or worry', 'Feeling stuck', 'Relationship support', 'Just exploring'].map((o, i) => (
            <div key={i} className="mini-card" style={{ padding: '9px 12px', background: i === 1 ? 'hsl(20 60% 92%)' : 'white', borderColor: i === 1 ? 'hsl(20 60% 70%)' : 'hsl(var(--border))' }}>
              <div className="mini-row" style={{ justifyContent: 'space-between' }}>
                <span className="mini-h" style={{ fontSize: 12 }}>{o}</span>
                {i === 1 && <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'hsl(20 60% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Member · Companion',
    title: 'A companion that listens first.',
    sub: 'Reflective AI that sits with you. Coping suggestions only when you ask.',
    screen: 'sage',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <div className="mini-avatar sage" style={{ width: 24, height: 24, fontSize: 10 }}>L</div>
          <div className="mini-card" style={{ padding: '8px 11px', borderRadius: '12px 12px 12px 4px', maxWidth: '78%' }}>
            <div className="mini-h" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>That sounds heavy. Want to sit with it for a moment, or talk through it?</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div className="mini-card" style={{ padding: '8px 11px', borderRadius: '12px 12px 4px 12px', background: 'hsl(145 50% 28%)', borderColor: 'hsl(145 50% 28%)', color: 'white', maxWidth: '78%' }}>
            <div className="mini-h" style={{ fontSize: 12, fontWeight: 500, color: 'white', lineHeight: 1.4 }}>I think I just need to talk through it.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <div className="mini-avatar sage" style={{ width: 24, height: 24, fontSize: 10 }}>L</div>
          <div className="mini-card" style={{ padding: '8px 11px', borderRadius: '12px 12px 12px 4px', maxWidth: '78%' }}>
            <div className="mini-h" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>Take your time. What's the part that's loudest right now?</div>
          </div>
        </div>
        <div className="mini-card" style={{ padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 6, background: 'white' }}>
          <Icon name="chat" size={12} />
          <span className="mini-sub" style={{ fontSize: 11 }}>Type your reply…</span>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Member · Journal',
    title: "Journaling that's a door, not a form.",
    sub: 'Write in whatever shape it comes out. Private by default.',
    screen: 'default',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="mini-sub" style={{ fontSize: 10.5 }}>Tonight · Mar 14</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'hsl(145 40% 35%)', fontWeight: 600 }}>
            <Icon name="lock" size={10} /> Private
          </span>
        </div>
        <div style={{ fontFamily: 'var(--brand)', fontSize: 18, fontWeight: 500, marginBottom: 10, color: 'hsl(var(--foreground))' }}>
          What's with you tonight?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {[
            { l: 'calm', on: false },
            { l: 'tired', on: true },
            { l: 'anxious', on: false },
            { l: 'hopeful', on: true },
            { l: 'raw', on: false },
          ].map(c => (
            <span key={c.l} className="mini-chip" style={{
              background: c.on ? 'hsl(35 80% 88%)' : 'transparent',
              borderColor: c.on ? 'hsl(35 70% 70%)' : 'hsl(var(--border))',
              color: c.on ? 'hsl(20 60% 30%)' : 'hsl(var(--muted-foreground))',
            }}>{c.l}</span>
          ))}
        </div>
        <div className="mini-card" style={{ padding: '10px 12px', minHeight: 70 }}>
          <div className="mini-h" style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.5, color: 'hsl(var(--foreground) / 0.9)' }}>
            Today felt like fog. I kept reaching for things I couldn't name. Maybe it's just the season turning…
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Member · Match results',
    title: 'Matches that explain themselves.',
    sub: 'Three practitioners. An honest reason why for each. No commitment to ask.',
    screen: 'default',
    size: 'wide',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>3 matches · sorted by fit</div>
        <div className="tile-stack">
          {[
            { i: 'MR', n: 'Maya Rivera, LMFT', m: '94% match', r: 'Bilingual EN/ES · grief & life transitions · she/her', c: 'sage', tone: 'primary' },
            { i: 'JK', n: 'Jordan Kim, LCSW', m: '89% match', r: 'Queer-affirming · CBT for anxiety · he/they', c: 'lilac', tone: 'default' },
            { i: 'DR', n: 'Dr. Devi Reyes, PhD', m: '86% match', r: 'EMDR · trauma & PTSD · accepts BCBS', c: 'gold', tone: 'default' },
          ].map((p, i) => (
            <div key={i} className="mini-card" style={{ padding: '10px 12px', borderColor: i === 0 ? 'hsl(145 40% 60%)' : 'hsl(var(--border))', background: i === 0 ? 'hsl(145 30% 96%)' : 'white' }}>
              <div className="mini-row" style={{ gap: 10 }}>
                <div className={'mini-avatar ' + p.c}>{p.i}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mini-row" style={{ justifyContent: 'space-between', gap: 8 }}>
                    <span className="mini-h" style={{ fontSize: 12.5 }}>{p.n}</span>
                    <span className="mini-chip" style={{ fontSize: 10, padding: '2px 6px', background: i === 0 ? 'hsl(145 50% 50%)' : 'hsla(145, 30%, 90%, 0.6)', color: i === 0 ? 'white' : 'hsl(145 50% 28%)', borderColor: i === 0 ? 'hsl(145 50% 50%)' : 'hsla(145, 30%, 80%, 0.5)' }}>{p.m}</span>
                  </div>
                  <div className="mini-sub" style={{ fontSize: 11, marginTop: 2 }}>{p.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Member · Booking',
    title: 'Booking without the back-and-forth.',
    sub: "Your therapist's open times. Pick one — it's yours.",
    screen: 'default',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ gap: 10, marginBottom: 12 }}>
          <div className="mini-avatar sage">MR</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mini-h" style={{ fontSize: 13 }}>Maya Rivera, LMFT</div>
            <div className="mini-sub" style={{ fontSize: 11 }}>50 min · telehealth</div>
          </div>
        </div>
        <div className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>This week</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { d: 'Tue', t: '10:00 AM', on: false },
            { d: 'Tue', t: '2:30 PM', on: true },
            { d: 'Wed', t: '9:00 AM', on: false },
            { d: 'Thu', t: '4:00 PM', on: false },
            { d: 'Fri', t: '11:30 AM', on: false },
            { d: 'Fri', t: '3:00 PM', on: false },
          ].map((s, i) => (
            <div key={i} className="mini-card" style={{ padding: '8px 6px', textAlign: 'center', borderColor: s.on ? 'hsl(145 50% 50%)' : 'hsl(var(--border))', background: s.on ? 'hsl(145 50% 28%)' : 'white', color: s.on ? 'white' : 'inherit' }}>
              <div className="mini-sub" style={{ fontSize: 9.5, color: s.on ? 'hsla(43, 30%, 95%, 0.7)' : 'hsl(var(--muted-foreground))', marginBottom: 1 }}>{s.d}</div>
              <div className="mini-h" style={{ fontSize: 11, color: s.on ? 'white' : 'inherit' }}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ----- PRACTITIONER -----
  {
    eyebrow: 'Practitioner · Session prep',
    title: 'The 90 seconds before Avery joins.',
    sub: "What's changed since you last met — only what they chose to share.",
    screen: 'sage',
    size: 'wide',
    audiences: ['practitioner'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="mini-row" style={{ gap: 8 }}>
            <div className="mini-avatar gold">AM</div>
            <div>
              <div className="mini-h" style={{ fontSize: 13 }}>Avery M. · session #6</div>
              <div className="mini-sub" style={{ fontSize: 11 }}>Joins in 1 min · 50 min</div>
            </div>
          </div>
          <span className="mini-chip" style={{ fontSize: 10 }}>Telehealth</span>
        </div>
        <div className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>Since last session</div>
        <div className="tile-stack">
          <div className="mini-card" style={{ padding: '9px 11px', background: 'white' }}>
            <div className="mini-row" style={{ gap: 8 }}>
              <div style={{ width: 6, alignSelf: 'stretch', background: 'hsl(35 70% 60%)', borderRadius: 3 }}></div>
              <div style={{ flex: 1 }}>
                <div className="mini-h" style={{ fontSize: 12 }}>Sleep dropped to 4.5 hrs avg</div>
                <div className="mini-sub" style={{ fontSize: 11 }}>Down from 6.8 last week · they noted "work deadline"</div>
              </div>
            </div>
          </div>
          <div className="mini-card" style={{ padding: '9px 11px', background: 'white' }}>
            <div className="mini-row" style={{ gap: 8 }}>
              <div style={{ width: 6, alignSelf: 'stretch', background: 'hsl(145 50% 50%)', borderRadius: 3 }}></div>
              <div style={{ flex: 1 }}>
                <div className="mini-h" style={{ fontSize: 12 }}>Practiced grounding · 3 days</div>
                <div className="mini-sub" style={{ fontSize: 11 }}>"It actually helped on Tuesday"</div>
              </div>
            </div>
          </div>
          <div className="mini-card" style={{ padding: '9px 11px', background: 'white' }}>
            <div className="mini-row" style={{ gap: 8 }}>
              <div style={{ width: 6, alignSelf: 'stretch', background: 'hsl(265 40% 60%)', borderRadius: 3 }}></div>
              <div style={{ flex: 1 }}>
                <div className="mini-h" style={{ fontSize: 12 }}>Wants to talk about: family</div>
                <div className="mini-sub" style={{ fontSize: 11 }}>Marked as agenda item · their words: "the holidays thing"</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Practitioner · Aria scribe',
    title: 'Notes, without the note-taking tax.',
    sub: 'SOAP draft from what you said in session. Edit in 3 minutes.',
    screen: 'default',
    audiences: ['practitioner'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="mini-sub" style={{ fontSize: 10.5, fontWeight: 600 }}>SOAP draft</span>
          <span className="mini-chip peach" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Icon name="spark" size={9} /> Aria · 2 min ago
          </span>
        </div>
        <div className="mini-card" style={{ padding: '10px 12px' }}>
          <div className="mini-sub" style={{ fontSize: 10, fontWeight: 700, color: 'hsl(145 50% 28%)', letterSpacing: '0.08em' }}>S — SUBJECTIVE</div>
          <div className="mini-h" style={{ fontSize: 11.5, fontWeight: 400, marginTop: 2, lineHeight: 1.5 }}>
            Client reports increased anxiety related to <span style={{ background: 'hsl(35 80% 88%)', padding: '0 2px', borderRadius: 2 }}>upcoming work deadline</span>. Sleep avg 4.5h.
          </div>
        </div>
        <div className="mini-card" style={{ padding: '10px 12px', marginTop: 8 }}>
          <div className="mini-sub" style={{ fontSize: 10, fontWeight: 700, color: 'hsl(145 50% 28%)', letterSpacing: '0.08em' }}>O — OBJECTIVE</div>
          <div className="mini-h" style={{ fontSize: 11.5, fontWeight: 400, marginTop: 2, lineHeight: 1.5 }}>
            Affect: anxious but engaged. Speech: rapid at intake, slowed by mid-session.
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Practitioner · Caseload',
    title: 'Caseload at a glance — and who needs attention.',
    sub: 'Zero dashboards. Zero math. The right names rise to the top.',
    screen: 'default',
    size: 'wide',
    audiences: ['practitioner'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>24 active clients</span>
          <span className="mini-chip peach" style={{ fontSize: 10 }}>3 need a check-in</span>
        </div>
        <div className="tile-stack">
          {[
            { i: 'AM', n: 'Avery M.', st: 'Trending down · 2 wks', a: 'Reach out', c: 'gold', urgent: true },
            { i: 'JL', n: 'James L.', st: "Hasn't engaged · 6 days", a: 'Send nudge', c: 'lilac', urgent: true },
            { i: 'RS', n: 'Rae S.', st: 'Session this week · Thu 4pm', a: 'Prep ready', c: 'sage', urgent: false },
            { i: 'TC', n: 'Theo C.', st: 'PHQ-9 dropped 4 pts ↓', a: 'Note progress', c: 'sage', urgent: false },
          ].map((r, i) => (
            <div key={i} className="mini-card" style={{ padding: '8px 11px', borderColor: r.urgent ? 'hsl(35 70% 70%)' : 'hsl(var(--border))', background: r.urgent ? 'hsl(35 60% 97%)' : 'white' }}>
              <div className="mini-row" style={{ gap: 10 }}>
                <div className={'mini-avatar ' + r.c} style={{ width: 26, height: 26, fontSize: 10 }}>{r.i}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mini-row" style={{ justifyContent: 'space-between', gap: 8 }}>
                    <span className="mini-h" style={{ fontSize: 12 }}>{r.n}</span>
                    <span className="mini-sub" style={{ fontSize: 10.5, color: r.urgent ? 'hsl(20 60% 40%)' : 'hsl(145 50% 30%)', fontWeight: 600 }}>{r.a} →</span>
                  </div>
                  <div className="mini-sub" style={{ fontSize: 10.5, marginTop: 1 }}>{r.st}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Practitioner · Earnings',
    title: 'What you earned — without the spreadsheet.',
    sub: 'Direct deposit weekly. No platform fee on first 10 sessions/mo.',
    screen: 'sage',
    audiences: ['practitioner'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>This month · March</div>
        <div className="mini-row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span className="mini-num" style={{ fontSize: 32 }}>$8,420</span>
          <span style={{ fontSize: 11, color: 'hsl(145 50% 35%)', fontWeight: 600 }}>↑ 12% vs Feb</span>
        </div>
        <div className="mini-bar" style={{ marginBottom: 14 }}><span style={{ width: '68%' }}></span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="mini-card" style={{ padding: '9px 11px' }}>
            <div className="mini-sub" style={{ fontSize: 10 }}>Sessions</div>
            <div className="mini-h" style={{ fontSize: 18, fontFamily: 'var(--brand)', fontWeight: 500, color: 'hsl(var(--primary))' }}>52</div>
          </div>
          <div className="mini-card" style={{ padding: '9px 11px' }}>
            <div className="mini-sub" style={{ fontSize: 10 }}>Show-up rate</div>
            <div className="mini-h" style={{ fontSize: 18, fontFamily: 'var(--brand)', fontWeight: 500, color: 'hsl(var(--primary))' }}>96%</div>
          </div>
        </div>
        <div className="mini-card" style={{ padding: '8px 11px', marginTop: 8, background: 'hsl(35 60% 95%)', borderColor: 'hsl(35 70% 80%)' }}>
          <div className="mini-h" style={{ fontSize: 11.5 }}>Next deposit · Friday · $1,920</div>
        </div>
      </div>
    ),
  },

  // ----- ORG -----
  {
    eyebrow: 'Org · Anonymous seats',
    title: "Invite seats without exposing who uses them.",
    sub: "You fund seats. You never see who activated them.",
    screen: 'dark',
    audiences: ['organization'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="mini-sub" style={{ fontSize: 10.5, color: 'hsl(43 30% 70%)' }}>Aurora Health · 240 seats</div>
            <div className="mini-h" style={{ fontSize: 16, fontFamily: 'var(--brand)', fontWeight: 500, color: 'hsl(43 30% 95%)' }}>Seat utilization</div>
          </div>
          <span className="mini-chip dark" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="lock" size={10} /> Anonymous</span>
        </div>
        <div className="mini-row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span className="mini-num" style={{ color: 'hsl(35 80% 70%)' }}>148<span style={{ fontSize: 14, color: 'hsl(43 30% 70%)' }}>/240</span></span>
          <span style={{ fontSize: 11, color: 'hsl(145 60% 70%)', fontWeight: 600 }}>62% activated</span>
        </div>
        <div className="mini-bar" style={{ background: 'hsla(43, 30%, 95%, 0.12)', marginBottom: 14 }}>
          <span style={{ width: '62%', background: 'hsl(35 80% 70%)' }}></span>
        </div>
        <div className="mini-card dark" style={{ padding: '9px 11px' }}>
          <div className="mini-sub" style={{ fontSize: 10, color: 'hsl(43 30% 70%)' }}>Pending invites · 92</div>
          <div className="mini-h" style={{ fontSize: 11.5, color: 'hsl(43 30% 95%)', marginTop: 2 }}>Send a fresh batch · Q1 push</div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Org · Outcomes',
    title: 'Aggregate utilization. Never individual.',
    sub: 'Activation, sentiment, top-of-mind themes. Cohort-only — never a person.',
    screen: 'dark',
    size: 'wide',
    audiences: ['organization'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="mini-sub" style={{ fontSize: 10.5, color: 'hsl(43 30% 70%)' }}>Q1 '26 · Aurora Health</div>
            <div className="mini-h" style={{ fontSize: 16, fontFamily: 'var(--brand)', fontWeight: 500, color: 'hsl(43 30% 95%)' }}>Outcomes pulse</div>
          </div>
          <span className="mini-chip dark" style={{ fontSize: 10 }}>De-identified · k≥25</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { l: 'Engagement', v: '62%', t: '↑ 18% YoY', c: 'hsl(35 80% 70%)' },
            { l: 'PHQ-9 drop', v: '−3.4', t: '8-week avg', c: 'hsl(145 60% 70%)' },
            { l: 'Alliance', v: '4.6/5', t: 'WAI-SR', c: 'hsl(265 50% 75%)' },
          ].map(s => (
            <div key={s.l} className="mini-card dark" style={{ padding: '9px 10px' }}>
              <div className="mini-sub" style={{ fontSize: 9.5, color: 'hsl(43 30% 70%)' }}>{s.l}</div>
              <div style={{ fontFamily: 'var(--brand)', fontSize: 18, fontWeight: 500, color: s.c, lineHeight: 1, marginTop: 4 }}>{s.v}</div>
              <div className="mini-sub" style={{ fontSize: 9.5, color: 'hsl(43 30% 60%)', marginTop: 2 }}>{s.t}</div>
            </div>
          ))}
        </div>
        <div className="mini-sub" style={{ fontSize: 10, color: 'hsl(43 30% 70%)', marginBottom: 6 }}>Top-of-mind themes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            { l: 'burnout', w: 1.2 },
            { l: 'team change', w: 1 },
            { l: 'sleep', w: 0.9 },
            { l: 'manager support', w: 0.85 },
            { l: 'back-to-office', w: 0.7 },
          ].map(t => (
            <span key={t.l} className="mini-chip dark" style={{ fontSize: 9 + 2 * t.w, padding: '3px 8px' }}>{t.l}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Platform · Safety queue',
    title: 'When AI flags, humans decide.',
    sub: 'Every flagged conversation reviewed by a licensed clinician within 4 minutes.',
    screen: 'default',
    audiences: ['organization', 'practitioner'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Safety queue · 2 active</span>
          <span className="mini-chip peach" style={{ fontSize: 10 }}>SLA: 4 min</span>
        </div>
        <div className="tile-stack">
          {[
            { sev: 'high', l: 'Self-harm ideation · passive', t: '0:42 ago', who: 'On-call clinician · Dr. Reyes', c: 'hsl(0 70% 55%)' },
            { sev: 'med', l: 'Disclosure · DV history', t: '2:15 ago', who: 'Routing → trauma specialist', c: 'hsl(35 80% 55%)' },
          ].map((r, i) => (
            <div key={i} className="mini-card" style={{ padding: '9px 11px', borderColor: r.c, borderLeftWidth: 4 }}>
              <div className="mini-row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <span className="mini-h" style={{ fontSize: 12 }}>{r.l}</span>
                <span className="mini-sub" style={{ fontSize: 10.5 }}>{r.t}</span>
              </div>
              <div className="mini-sub" style={{ fontSize: 11, marginTop: 3, color: 'hsl(145 50% 30%)', fontWeight: 600 }}>→ {r.who}</div>
            </div>
          ))}
        </div>
        <div className="mini-card" style={{ padding: '8px 11px', marginTop: 10, background: 'hsl(145 30% 96%)', borderColor: 'hsl(145 30% 80%)' }}>
          <div className="mini-row" style={{ gap: 6 }}>
            <Icon name="shield" size={12} />
            <span className="mini-sub" style={{ fontSize: 10.5, color: 'hsl(145 50% 25%)', fontWeight: 600 }}>0 flags missed in last 30 days</span>
          </div>
        </div>
      </div>
    ),
  },

  // ----- CROSS-CUT -----
  {
    eyebrow: 'Member · Crisis',
    title: "When the moment is bigger than the app.",
    sub: "From any screen — one tap to a real human. No spinner, no form.",
    screen: 'peach',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-card" style={{ padding: '14px 14px', background: 'hsl(20 70% 55%)', borderColor: 'hsl(20 70% 45%)', color: 'white', marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--brand)', fontSize: 15, fontWeight: 500, lineHeight: 1.3, color: 'white', marginBottom: 4 }}>You're not alone right now.</div>
          <div className="mini-sub" style={{ fontSize: 11.5, color: 'hsla(43, 30%, 95%, 0.9)' }}>Pick the door that feels right. We'll be there in seconds.</div>
        </div>
        <div className="tile-stack">
          {[
            { i: 'phone', l: 'Call 988 · Suicide & Crisis Lifeline', a: 'Tap to call' },
            { i: 'chat', l: 'Text a Lily crisis counselor', a: 'Avg 38 sec' },
            { i: 'users', l: 'Stay with Lily AI for now', a: "She'll listen" },
          ].map((d, i) => (
            <div key={i} className="mini-card" style={{ padding: '9px 11px' }}>
              <div className="mini-row" style={{ gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'hsl(20 60% 92%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(20 60% 35%)' }}>
                  <Icon name={d.i} size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mini-h" style={{ fontSize: 12 }}>{d.l}</div>
                  <div className="mini-sub" style={{ fontSize: 10.5 }}>{d.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Member · Dashboard',
    title: 'Seeing the shape of the month.',
    sub: "Patterns, not grades. Notice what's improving.",
    screen: 'default',
    audiences: ['member'],
    render: () => (
      <div style={{ paddingTop: 4 }}>
        <div className="mini-sub" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>Last 30 days</div>
        <div style={{ fontFamily: 'var(--brand)', fontSize: 18, fontWeight: 500, lineHeight: 1.2, marginBottom: 10 }}>
          You're <em style={{ color: 'hsl(var(--primary))' }}>steadier</em> on weeknights.
        </div>
        <svg viewBox="0 0 200 60" style={{ width: '100%', height: 64, display: 'block', marginBottom: 10 }}>
          <defs>
            <linearGradient id="grad-mood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(145 50% 50%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(145 50% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M0 40 Q 20 30, 40 32 T 80 28 T 120 22 T 160 18 T 200 14 L 200 60 L 0 60 Z" fill="url(#grad-mood)" />
          <path d="M0 40 Q 20 30, 40 32 T 80 28 T 120 22 T 160 18 T 200 14" stroke="hsl(145 50% 35%)" strokeWidth="1.5" fill="none" />
          {[40, 80, 120, 160, 200].map((x, i) => (
            <circle key={i} cx={x} cy={[32, 28, 22, 18, 14][i]} r="2.5" fill="hsl(145 50% 35%)" />
          ))}
        </svg>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {Array.from({ length: 14 }, (_, i) => {
            const v = [3, 2, 4, 3, 4, 5, 4, 4, 5, 4, 5, 5, 4, 5][i];
            return (
              <div key={i} style={{ flex: 1, height: 18, borderRadius: 3, background: `hsl(145 ${30 + v * 6}% ${80 - v * 6}%)` }}></div>
            );
          })}
        </div>
        <div className="mini-sub" style={{ fontSize: 10.5 }}>Mood · daily · last 14 days</div>
      </div>
    ),
  },
];

// ============ Filtered Product Tour (audience-specific, slideshow) ============
interface ProductTourProps {
  audience?: 'all' | 'member' | 'practitioner' | 'organization';
  title?: React.ReactNode;
  subtitle?: string;
  limit?: number;
  pick?: number[];
}

export default function ProductTour({ audience = 'all', title, subtitle, limit, pick }: ProductTourProps) {
  let tiles = ALL_TILES.filter(t => audience === 'all' || t.audiences.includes(audience));
  if (pick) tiles = pick.map(idx => ALL_TILES[idx]).filter(Boolean);
  if (limit) tiles = tiles.slice(0, limit);

  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = tiles.length;

  const go = useCallback((next: number) => {
    setDirection(next > idx ? 1 : -1);
    setIdx(((next % total) + total) % total);
  }, [idx, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(idx - 1);
      else if (e.key === 'ArrowRight') go(idx + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, go]);

  if (total === 0) return null;
  const t = tiles[idx];

  return (
    <section className="section">
      <div className="container wide">
        <div className="section-head center">
          <div className="section-eyebrow">A look inside</div>
          <h2 className="section-title">{title || <>A look <em>inside</em> the platform.</>}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>

        <div className="tour-slideshow">
          <div className="tour-stage">
            <button
              className="tour-nav prev"
              onClick={() => go(idx - 1)}
              aria-label="Previous"
              disabled={total < 2}
            >
              <Icon name="arrow-left" size={20} />
            </button>

            <div className="tour-track">
              <div
                key={idx}
                className={'tour-slide tour-slide-enter-' + (direction > 0 ? 'right' : 'left')}
              >
                <TourTile eyebrow={t.eyebrow} title={t.title} sub={t.sub} screen={t.screen} size="full">
                  {t.render()}
                </TourTile>
              </div>
            </div>

            <button
              className="tour-nav next"
              onClick={() => go(idx + 1)}
              aria-label="Next"
              disabled={total < 2}
            >
              <Icon name="arrow-right" size={20} />
            </button>
          </div>

          <div className="tour-indicators" role="tablist">
            <div className="tour-dots">
              {tiles.map((_, i) => (
                <button
                  key={i}
                  className={'tour-dot' + (i === idx ? ' active' : '')}
                  onClick={() => go(i)}
                  aria-label={'Slide ' + (i + 1)}
                  aria-selected={i === idx}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
