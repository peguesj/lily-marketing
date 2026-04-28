import { useState } from 'react';

interface HowModeTabsProps {
  className?: string;
}

export default function HowModeTabs({ className = '' }: HowModeTabsProps) {
  const [mode, setMode] = useState<'match' | 'directory'>('match');

  return (
    <div className={`how-mode-tabs-section ${className}`}>
      {/* Mode tab switcher */}
      <div className="mode-tabs">
        <span className="mode-tabs-lbl">Two ways to find care:</span>
        <div className="mode-tabs-pills">
          <button
            className={`mode-tab ${mode === 'directory' ? 'active' : ''}`}
            onClick={() => setMode('directory')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
            </svg>
            Directory
          </button>
          <button
            className={`mode-tab ${mode === 'match' ? 'active' : ''}`}
            onClick={() => setMode('match')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Match
          </button>
        </div>
        <span className="mode-tabs-hint">
          {mode === 'directory'
            ? 'Search 18,000+ practitioners with identity-aware filters.'
            : 'Swipe through ranked matches — relationship, not list.'}
        </span>
      </div>

      {/* Step cards */}
      <div className="how-steps">
        {/* STEP 01 */}
        <div className="how-step">
          <div className="how-step-num">01</div>
          {mode === 'match' ? (
            <div className="how-step-visual hs-intake">
              <div className="hs-card">
                <div className="hs-card-head">
                  <div className="hs-eye">Step 3 of 8 · Identity</div>
                  <div className="hs-progress"><span style={{ width: '37%' }}></span></div>
                </div>
                <div className="hs-q">Which feel most true for you? <span className="hs-opt">Pick any</span></div>
                <div className="hs-chip-grid">
                  <span className="on">Black</span>
                  <span className="on">Queer</span>
                  <span>Asian</span>
                  <span className="on">First-gen</span>
                  <span>Latinx</span>
                  <span>Neurodivergent</span>
                  <span>Disabled</span>
                  <span>Trans</span>
                  <span>Faith-rooted</span>
                  <span className="hs-skip">Prefer not to say</span>
                </div>
                <div className="hs-foot-row">
                  <span className="hs-skip-link">Skip · only what you choose</span>
                  <span className="hs-next">Continue →</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="how-step-visual hs-search">
              <div className="hs-card">
                <div className="hs-eye">Search Lily Directory</div>
                <div className="hs-search-input">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
                  <span>Anxiety, Black therapist, Brooklyn</span>
                  <span className="hs-search-cursor">|</span>
                </div>
                <div className="hs-search-meta">
                  <span><b>18,081</b> practitioners</span>
                  <span>·</span>
                  <span>4 directories indexed</span>
                </div>
                <div className="hs-search-pills">
                  <span className="hs-search-pill">Anxiety <i>×</i></span>
                  <span className="hs-search-pill">Black <i>×</i></span>
                  <span className="hs-search-pill">Brooklyn <i>×</i></span>
                </div>
                <div className="hs-foot-row">
                  <span className="hs-skip-link">No login needed</span>
                  <span className="hs-next">Search →</span>
                </div>
              </div>
            </div>
          )}
          <h4>{mode === 'match' ? 'Tell us who you are' : 'Search the directory'}</h4>
          <p>
            {mode === 'match'
              ? '8-step intake. Identity, lived experience, language, faith, neurodivergence — only what you choose to share.'
              : 'Public, free, no account required. Plain-text search across name, modality, identity, location, insurance.'}
          </p>
        </div>

        {/* STEP 02 */}
        <div className="how-step">
          <div className="how-step-num">02</div>
          {mode === 'match' ? (
            <div className="how-step-visual hs-prefs">
              <div className="hs-card">
                <div className="hs-eye">Step 6 · What works</div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Modality</span>
                  <div className="hs-pref-pills">
                    <span className="on">CBT</span>
                    <span className="on">EMDR</span>
                    <span>IFS</span>
                    <span>Somatic</span>
                  </div>
                </div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">When</span>
                  <div className="hs-when">
                    {['M','T','W','T','F','S','S'].map((d, i) => (
                      <div key={i} className={`hs-when-day${[1,3,4].includes(i) ? ' on' : ''}`}>{d}</div>
                    ))}
                  </div>
                </div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Format</span>
                  <div className="hs-toggle">
                    <span>In-person</span>
                    <span className="on">Telehealth ✓</span>
                  </div>
                </div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Insurance</span>
                  <div className="hs-insur">
                    <div className="hs-insur-card">BCBS · in-network</div>
                    <span className="hs-insur-meta">est. $25 / session</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="how-step-visual hs-filters">
              <div className="hs-card">
                <div className="hs-eye">Filters · Refine 412 results</div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Identity</span>
                  <div className="hs-pref-pills">
                    <span className="on">Black</span>
                    <span className="on">Queer-affirming</span>
                    <span>Asian</span>
                    <span>Latinx</span>
                  </div>
                </div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Insurance</span>
                  <div className="hs-pref-pills">
                    <span className="on">BCBS</span>
                    <span>Aetna</span>
                    <span>Sliding scale</span>
                  </div>
                </div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Modality</span>
                  <div className="hs-pref-pills">
                    <span className="on">CBT</span>
                    <span>EMDR</span>
                    <span>IFS</span>
                  </div>
                </div>
                <div className="hs-pref-row">
                  <span className="hs-pref-lbl">Distance</span>
                  <div className="hs-distance-bar">
                    <div className="hs-distance-track"><div style={{ width: '35%' }}></div></div>
                    <span className="hs-distance-val">5 mi</span>
                  </div>
                </div>
                <div className="hs-foot-row">
                  <span className="hs-skip-link">412 → 38 results</span>
                  <span className="hs-next">Apply →</span>
                </div>
              </div>
            </div>
          )}
          <h4>{mode === 'match' ? 'Tell us what you want' : 'Narrow with filters'}</h4>
          <p>
            {mode === 'match'
              ? 'Modality preference, schedule windows, in-person or telehealth, insurance or sliding scale.'
              : 'Identity-aware filters: race, faith, language, queer-affirming, modality, insurance, distance, sliding scale.'}
          </p>
        </div>

        {/* STEP 03 */}
        <div className="how-step">
          <div className="how-step-num">03</div>
          {mode === 'match' ? (
            <div className="how-step-visual hs-swipe">
              <div className="hs-swipe-deck">
                <div className="hs-swipe-card hs-card-back-2">
                  <div className="hs-swipe-photo" style={{ background: 'linear-gradient(135deg, hsl(280 35% 65%), hsl(310 30% 55%))' }}></div>
                </div>
                <div className="hs-swipe-card hs-card-back-1">
                  <div className="hs-swipe-photo" style={{ background: 'linear-gradient(135deg, hsl(165 35% 55%), hsl(180 30% 45%))' }}></div>
                </div>
                <div className="hs-swipe-card hs-card-front">
                  <div className="hs-swipe-stamp hs-stamp-pass">PASS</div>
                  <div className="hs-swipe-stamp hs-stamp-book">BOOK</div>
                  <div className="hs-swipe-photo" style={{ background: 'linear-gradient(135deg, hsl(15 60% 60%), hsl(28 55% 50%))' }}>
                    <div className="hs-swipe-score">94</div>
                  </div>
                  <div className="hs-swipe-info">
                    <div className="hs-swipe-name">Dr. Maya Robinson <span className="hs-swipe-creds">PhD</span></div>
                    <div className="hs-swipe-meta">Black · queer-affirming · CBT + EMDR</div>
                    <div className="hs-swipe-tags">
                      <span>Anxiety</span>
                      <span>Trauma</span>
                      <span>BCBS</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hs-swipe-actions">
                <button className="hs-swipe-btn hs-btn-pass" type="button" aria-label="Pass">✕</button>
                <button className="hs-swipe-btn hs-btn-info" type="button" aria-label="More info">i</button>
                <button className="hs-swipe-btn hs-btn-book" type="button" aria-label="Book">✓</button>
              </div>
            </div>
          ) : (
            <div className="how-step-visual hs-list">
              <div className="hs-card">
                <div className="hs-eye">38 matches · Sort: best fit</div>
                {[
                  { name: 'Dr. Maya Robinson', meta: 'Black · CBT, EMDR', tag: 'BCBS', chip: '94', color: 'hsl(15 60% 56%)' },
                  { name: 'Dr. Elena Ortiz',   meta: 'Latinx · IFS, Somatic', tag: 'Aetna', chip: '89', color: 'hsl(280 35% 60%)' },
                  { name: 'Aisha Salim, LCSW', meta: 'Muslim · CBT, ACT', tag: 'BCBS', chip: '85', color: 'hsl(165 40% 50%)' },
                ].map((p, i) => (
                  <div key={i} className="hs-list-row">
                    <div className="hs-list-avatar" style={{ background: p.color }}></div>
                    <div className="hs-list-info">
                      <div className="hs-list-name">{p.name}</div>
                      <div className="hs-list-meta">{p.meta}</div>
                    </div>
                    <div className="hs-list-tag">{p.tag}</div>
                    <div className="hs-list-chip">{p.chip}</div>
                  </div>
                ))}
                <div className="hs-foot-row">
                  <span className="hs-skip-link">View all 38</span>
                  <span className="hs-next">Open profile →</span>
                </div>
              </div>
            </div>
          )}
          <h4>{mode === 'match' ? 'Swipe to feel the fit' : 'Browse the list'}</h4>
          <p>
            {mode === 'match'
              ? 'Each card shows the why — match score, identity affinities, modality. Swipe right to book, left to pass. Lily learns either way.'
              : 'Open profiles. Read bios in their own words. See real availability, fees, and insurance — no phone tag.'}
          </p>
        </div>

        {/* STEP 04 */}
        <div className="how-step">
          <div className="how-step-num">04</div>
          <div className="how-step-visual hs-book">
            <div className="hs-card">
              <div className="hs-eye">{mode === 'match' ? 'Free 15-min intro' : 'Book directly · no phone tag'}</div>
              <div className="hs-cal-strip">
                {[
                  { d: 'Tue', n: '13' },
                  { d: 'Wed', n: '14' },
                  { d: 'Thu', n: '15', on: true },
                  { d: 'Fri', n: '16' },
                ].map((day, i) => (
                  <div key={i} className={`hs-cal-day${day.on ? ' on' : ''}`}>
                    <span className="hs-cal-d">{day.d}</span>
                    <span className="hs-cal-n">{day.n}</span>
                  </div>
                ))}
              </div>
              <div className="hs-slots">
                <div className="hs-slot">10:30a</div>
                <div className="hs-slot on">4:30p ✓</div>
                <div className="hs-slot">5:30p</div>
              </div>
              <div className="hs-rematch">
                <div className="hs-rematch-row">
                  <span className="hs-rematch-icon">↻</span>
                  <span>
                    {mode === 'match'
                      ? "Doesn't fit? Re-match in one tap."
                      : "Doesn't click? Pick another from your shortlist."}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <h4>{mode === 'match' ? 'Book, meet, re-match' : 'Book and meet'}</h4>
          <p>
            {mode === 'match'
              ? "Free 15-min intro. If it doesn't fit, re-match in one tap. No conversation needed."
              : 'Book directly from the profile. Calendar synced live. Cancel or rebook with one click.'}
          </p>
        </div>
      </div>
    </div>
  );
}
