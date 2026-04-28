import React from 'react';
import Icon from './Icon';

export default function MobileAppShowcase() {
  return (
    <div className="app-trio">
      {/* MEMBER APP — Lily Match swipe interface */}
      <div className="app-frame reveal delay-1">
        <div className="app-screen">
          <div className="app-notch"></div>
          <div className="app-status">
            <span>9:41</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ width: 14, height: 8, borderRadius: 2, border: '1.5px solid currentColor' }}></span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>5G</span>
            </span>
          </div>
          <div className="app-body" style={{
            background: 'radial-gradient(ellipse 60% 45% at 90% 0%, hsla(35, 85%, 78%, 0.55), transparent 65%), radial-gradient(ellipse 55% 40% at 5% 95%, hsla(165, 55%, 78%, 0.40), transparent 65%), linear-gradient(160deg, hsl(43 35% 96%), hsl(35 35% 93%))',
            gap: 10,
          }}>
            {/* Header */}
            <div className="app-row" style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
              <div>
                <div className="app-sub" style={{ fontSize: 11, color: 'hsl(20 35% 38%)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>Lily Match</div>
                <div className="app-h" style={{ fontSize: 19, fontFamily: 'var(--brand)', fontWeight: 500, marginTop: 2, color: 'hsl(var(--foreground))' }}>For you, Maya</div>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'hsla(43, 35%, 99%, 0.65)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid hsla(0,0%,100%,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(145 50% 26%)',
                boxShadow: '0 1px 0 hsla(0,0%,100%,0.7) inset, 0 4px 12px -4px hsla(20,30%,30%,0.18)',
              }}>
                <Icon name="filter" size={15} />
              </div>
            </div>

            {/* Progress dots */}
            <div className="app-row" style={{ gap: 5, justifyContent: 'center', marginTop: -2 }}>
              <div style={{ width: 22, height: 4, borderRadius: 2, background: 'hsl(20 70% 55%)' }}></div>
              <div style={{ width: 7, height: 4, borderRadius: 2, background: 'hsl(20 50% 78%)' }}></div>
              <div style={{ width: 7, height: 4, borderRadius: 2, background: 'hsl(20 50% 78%)' }}></div>
              <div style={{ width: 7, height: 4, borderRadius: 2, background: 'hsl(20 30% 86%)' }}></div>
              <div style={{ width: 7, height: 4, borderRadius: 2, background: 'hsl(20 30% 86%)' }}></div>
            </div>

            {/* Swipe-card stack */}
            <div style={{ position: 'relative', flex: 1, marginTop: 2, minHeight: 280 }}>
              {/* Back card 2 */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: 'translateY(16px) scale(0.92)',
                opacity: 0.55,
                background: 'hsla(43, 40%, 99%, 0.55)',
                backdropFilter: 'blur(14px) saturate(180%)',
                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                border: '1px solid hsla(0,0%,100%,0.6)',
                borderRadius: 18,
                boxShadow: '0 1px 0 hsla(0,0%,100%,0.7) inset, 0 6px 16px -6px hsla(20,30%,20%,0.14)',
              }}></div>
              {/* Back card 1 */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: 'translateY(8px) scale(0.96)',
                opacity: 0.85,
                background: 'hsla(43, 40%, 99%, 0.65)',
                backdropFilter: 'blur(14px) saturate(180%)',
                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                border: '1px solid hsla(0,0%,100%,0.65)',
                borderRadius: 18,
                boxShadow: '0 1px 0 hsla(0,0%,100%,0.7) inset, 0 8px 20px -6px hsla(20,30%,20%,0.16)',
              }}></div>
              {/* Front card — slightly tilted to suggest mid-swipe */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: 'rotate(-3deg) translateX(-4px)',
                background: 'hsla(43, 40%, 99%, 0.78)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid hsla(0,0%,100%,0.75)',
                borderRadius: 18,
                boxShadow: '0 1px 0 hsla(0,0%,100%,0.85) inset, 0 18px 36px -10px hsla(20,40%,25%,0.28), 0 4px 10px -3px hsla(20,40%,25%,0.12)',
                padding: 14,
                display: 'flex', flexDirection: 'column', gap: 10,
                overflow: 'hidden',
              }}>
                {/* BOOK stamp */}
                <div style={{
                  position: 'absolute', top: 12, right: 10,
                  border: '2px solid hsl(145 55% 38%)',
                  color: 'hsl(145 55% 32%)',
                  padding: '2px 7px', borderRadius: 5,
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
                  transform: 'rotate(12deg)',
                  background: 'hsla(43, 40%, 99%, 0.85)',
                  boxShadow: '0 2px 6px -2px hsla(145,40%,30%,0.2)',
                }}>BOOK</div>

                <div className="app-row" style={{ gap: 9, alignItems: 'center', paddingRight: 46 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(165 50% 60%), hsl(165 50% 32%))',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--brand)', fontWeight: 500, fontSize: 14, flexShrink: 0,
                    boxShadow: '0 2px 8px -2px hsla(165,40%,25%,0.3)',
                  }}>JK</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="app-h" style={{ fontSize: 13, color: 'hsl(145 60% 18%)', lineHeight: 1.15 }}>Jordan Kim, LMFT</div>
                    <div className="app-sub" style={{ fontSize: 10.5, color: 'hsl(145 25% 32%)', marginTop: 2 }}>She/her · 8 yrs · CA, OR</div>
                  </div>
                </div>

                <div className="app-row" style={{ gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'hsla(280, 40%, 88%, 0.85)', color: 'hsl(280 45% 32%)', fontWeight: 500 }}>LGBTQ+</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'hsla(20, 65%, 88%, 0.85)', color: 'hsl(20 60% 30%)', fontWeight: 500 }}>Trauma</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'hsla(165, 35%, 85%, 0.85)', color: 'hsl(165 50% 24%)', fontWeight: 500 }}>IFS</span>
                </div>

                <div style={{ fontSize: 12, lineHeight: 1.45, color: 'hsl(145 30% 22%)', fontStyle: 'italic' }}>
                  &ldquo;Queer-affirming, somatic &amp; IFS. First-gen Asian American clients.&rdquo;
                </div>

                <div style={{ fontSize: 11, color: 'hsl(145 25% 32%)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="app-row" style={{ gap: 6 }}>
                    <Icon name="calendar" size={12} />
                    <span>Open Tue 4pm · Thu 11am</span>
                  </div>
                  <div className="app-row" style={{ gap: 6 }}>
                    <Icon name="cash" size={12} />
                    <span>$140 · sliding · Aetna, BCBS</span>
                  </div>
                </div>

                {/* Match score row */}
                <div className="app-row" style={{
                  gap: 10, padding: '8px 10px',
                  background: 'hsla(20, 75%, 92%, 0.65)',
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid hsla(20, 60%, 75%, 0.4)',
                  borderRadius: 9, marginTop: 'auto',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'conic-gradient(hsl(20 70% 50%) 94%, hsla(20, 30%, 80%, 0.6) 0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', flexShrink: 0,
                  }}>
                    <div style={{ position: 'absolute', inset: 3, background: 'hsla(43, 40%, 99%, 0.95)', borderRadius: '50%' }}></div>
                    <span style={{ position: 'relative', fontFamily: 'var(--brand)', fontSize: 13, fontWeight: 500, color: 'hsl(20 65% 28%)' }}>94</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(20 65% 24%)' }}>Strong fit</div>
                    <div className="app-sub" style={{ fontSize: 10, color: 'hsl(20 35% 38%)' }}>Identity · modality · open this week</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Swipe action buttons */}
            <div className="app-row" style={{ gap: 16, justifyContent: 'center', paddingTop: 6, paddingBottom: 2 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'hsla(43, 40%, 99%, 0.7)', backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid hsla(0,0%,100%,0.65)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(20 25% 40%)',
                boxShadow: '0 1px 0 hsla(0,0%,100%,0.7) inset, 0 3px 8px -2px hsla(20,40%,25%,0.18)',
              }}><Icon name="x" size={18} /></div>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'hsla(43, 40%, 99%, 0.75)', backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid hsla(35, 60%, 70%, 0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(35 70% 40%)',
                boxShadow: '0 1px 0 hsla(0,0%,100%,0.7) inset, 0 3px 10px -2px hsla(35,60%,30%,0.22)',
              }}><Icon name="bookmark" size={18} /></div>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, hsl(20 78% 60%), hsl(20 72% 48%))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                boxShadow: '0 4px 14px -2px hsla(20,60%,40%,0.45), 0 1px 0 hsla(0,0%,100%,0.3) inset',
              }}><Icon name="heart" size={20} /></div>
            </div>
          </div>
          <div className="app-tabbar" style={{
            background: 'hsla(43, 40%, 99%, 0.78)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderTop: '1px solid hsla(0,0%,100%,0.6)',
          }}>
            <div className="tabicon active"><Icon name="heart" size={18} /></div>
            <div className="tabicon"><Icon name="calendar" size={18} /></div>
            <div className="tabicon"><Icon name="chat" size={18} /></div>
            <div className="tabicon"><Icon name="users" size={18} /></div>
          </div>
        </div>
        <div className="app-caption">For members · <strong>Lily Match</strong></div>
      </div>

      {/* PRACTITIONER APP */}
      <div className="app-frame reveal delay-2">
        <div className="app-screen">
          <div className="app-notch"></div>
          <div className="app-status">
            <span>9:41</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>5G</span>
          </div>
          <div className="app-body" style={{ background: 'hsl(145 25% 98%)' }}>
            <div style={{ paddingTop: 4 }}>
              <div className="app-sub" style={{ fontSize: 11 }}>Tuesday, March 4</div>
              <div className="app-h" style={{ fontSize: 19, fontFamily: 'var(--brand)', fontWeight: 500, marginTop: 2 }}>
                Your day · 6 sessions
              </div>
            </div>
            <div className="app-card" style={{ padding: 10 }}>
              <div className="app-row">
                <div style={{ width: 4, alignSelf: 'stretch', background: 'hsl(20 50% 60%)', borderRadius: 2 }}></div>
                <div style={{ flex: 1 }}>
                  <div className="app-row" style={{ justifyContent: 'space-between' }}>
                    <div className="app-h" style={{ fontSize: 13 }}>10:00 — Maya P.</div>
                    <span className="app-pill">Intake</span>
                  </div>
                  <div className="app-sub" style={{ marginTop: 2 }}>Telehealth · 50 min</div>
                </div>
              </div>
            </div>
            <div className="app-card" style={{ padding: 10 }}>
              <div className="app-row">
                <div style={{ width: 4, alignSelf: 'stretch', background: 'hsl(145 50% 50%)', borderRadius: 2 }}></div>
                <div style={{ flex: 1 }}>
                  <div className="app-row" style={{ justifyContent: 'space-between' }}>
                    <div className="app-h" style={{ fontSize: 13 }}>11:30 — James K.</div>
                    <span className="app-pill green">Follow-up</span>
                  </div>
                  <div className="app-sub" style={{ marginTop: 2 }}>In person · Suite 402</div>
                </div>
              </div>
            </div>
            <div className="app-card peach">
              <div className="app-row" style={{ gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(20 60% 40%)' }}>
                  <Icon name="spark" size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="app-h" style={{ fontSize: 13 }}>Draft note ready</div>
                  <div className="app-sub">Aria SOAP · 2 sessions</div>
                </div>
              </div>
            </div>
            <div className="app-row" style={{ gap: 6, marginTop: 4 }}>
              <div className="app-card" style={{ flex: 1, padding: 9, alignItems: 'flex-start' }}>
                <div className="app-sub" style={{ fontSize: 10 }}>This week</div>
                <div className="app-h" style={{ fontSize: 17, color: 'hsl(var(--primary))' }}>22</div>
                <div className="app-sub" style={{ fontSize: 10 }}>Sessions</div>
              </div>
              <div className="app-card" style={{ flex: 1, padding: 9, alignItems: 'flex-start' }}>
                <div className="app-sub" style={{ fontSize: 10 }}>Show-up</div>
                <div className="app-h" style={{ fontSize: 17, color: 'hsl(var(--primary))' }}>94%</div>
                <div className="app-sub" style={{ fontSize: 10 }}>Last 30d</div>
              </div>
            </div>
          </div>
          <div className="app-tabbar">
            <div className="tabicon active"><Icon name="calendar" size={18} /></div>
            <div className="tabicon"><Icon name="users" size={18} /></div>
            <div className="tabicon"><Icon name="note" size={18} /></div>
            <div className="tabicon"><Icon name="chart" size={18} /></div>
          </div>
        </div>
        <div className="app-caption">For practitioners · <strong>Lily Practice</strong></div>
      </div>

      {/* ORG APP */}
      <div className="app-frame reveal delay-3">
        <div className="app-screen">
          <div className="app-notch"></div>
          <div className="app-status">
            <span>9:41</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>5G</span>
          </div>
          <div className="app-body" style={{ background: 'linear-gradient(160deg, hsl(43 32% 96%), hsl(165 22% 93%))', color: 'hsl(145 30% 18%)' }}>
            <div style={{ paddingTop: 4 }}>
              <div className="app-sub" style={{ fontSize: 11, color: 'hsl(145 25% 38%)' }}>Aurora Health · Q1 &lsquo;26</div>
              <div className="app-h" style={{ fontSize: 19, fontFamily: 'var(--brand)', fontWeight: 500, marginTop: 2, color: 'hsl(145 50% 18%)' }}>
                Outcomes pulse
              </div>
            </div>
            <div className="app-card" style={{ background: 'white', border: '1px solid hsl(var(--border))' }}>
              <div className="app-sub" style={{ color: 'hsl(145 25% 38%)' }}>Engagement</div>
              <div className="app-row" style={{ alignItems: 'baseline', gap: 6 }}>
                <div className="app-h" style={{ fontSize: 26, color: 'hsl(20 70% 38%)' }}>62%</div>
                <span style={{ fontSize: 10, color: 'hsl(145 55% 32%)' }}>↑ 18% YoY</span>
              </div>
              <div className="app-bar" style={{ background: 'hsla(20,70%,38%,0.14)' }}>
                <div style={{ width: '62%', background: 'hsl(20 70% 50%)' }}></div>
              </div>
            </div>
            <div className="app-row" style={{ gap: 6 }}>
              <div className="app-card" style={{ flex: 1, padding: 10, background: 'white', border: '1px solid hsl(var(--border))' }}>
                <div className="app-sub" style={{ color: 'hsl(145 25% 38%)', fontSize: 10 }}>PHQ-9</div>
                <div className="app-h" style={{ fontSize: 17, color: 'hsl(20 70% 38%)' }}>−3.4</div>
                <div className="app-sub" style={{ fontSize: 9, color: 'hsl(145 20% 48%)' }}>Avg drop · 8wk</div>
              </div>
              <div className="app-card" style={{ flex: 1, padding: 10, background: 'white', border: '1px solid hsl(var(--border))' }}>
                <div className="app-sub" style={{ color: 'hsl(145 25% 38%)', fontSize: 10 }}>Alliance</div>
                <div className="app-h" style={{ fontSize: 17, color: 'hsl(20 70% 38%)' }}>4.6/5</div>
                <div className="app-sub" style={{ fontSize: 9, color: 'hsl(145 20% 48%)' }}>WAI-SR</div>
              </div>
            </div>
            <div className="app-card" style={{ background: 'white', border: '1px solid hsl(var(--border))' }}>
              <div className="app-sub" style={{ color: 'hsl(145 25% 38%)', fontSize: 10 }}>Cohort breakdown</div>
              {[
                { l: 'Engineering', v: 71, c: 'hsl(165 50% 38%)' },
                { l: 'Operations', v: 58, c: 'hsl(20 70% 50%)' },
                { l: 'Care team', v: 49, c: 'hsl(265 40% 52%)' },
              ].map(r => (
                <div key={r.l}>
                  <div className="app-row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'hsl(145 30% 22%)' }}>{r.l}</span>
                    <span style={{ fontSize: 10, color: 'hsl(145 25% 38%)' }}>{r.v}%</span>
                  </div>
                  <div className="app-bar" style={{ height: 4, background: 'hsla(145,20%,40%,0.12)', marginTop: 3 }}>
                    <div style={{ width: r.v + '%', background: r.c }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="app-tabbar" style={{ background: 'white', borderTopColor: 'hsl(var(--border))' }}>
            <div className="tabicon active"><Icon name="chart" size={18} /></div>
            <div className="tabicon"><Icon name="users" size={18} /></div>
            <div className="tabicon"><Icon name="building" size={18} /></div>
            <div className="tabicon"><Icon name="shield" size={18} /></div>
          </div>
        </div>
        <div className="app-caption">For organizations · <strong>Lily Admin</strong></div>
      </div>
    </div>
  );
}
