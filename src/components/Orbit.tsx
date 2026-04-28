import React, { useEffect, useRef, useState } from 'react';

export interface OrbitBadge {
  key: string;
  label: string;
  tone: 'lgbtq' | 'gender' | 'language' | 'faith' | 'bipoc' | 'trauma' | 'tele' | 'sliding';
  icon: React.ReactNode;
  angle: number;
}

interface OrbitProps {
  size: number;
  initials: string;
  avatarTone?: 'teal' | 'peach' | 'sage' | 'amber' | 'lilac';
  badges: OrbitBadge[];
  showVerified?: boolean;
}

const TONE_CLASS: Record<OrbitBadge['tone'], string> = {
  lgbtq: 'b-lgbtq',
  gender: 'b-gender',
  language: 'b-language',
  faith: 'b-faith',
  bipoc: 'b-bipoc',
  trauma: 'b-trauma',
  tele: 'b-tele',
  sliding: 'b-sliding',
};

// Map avatar tone to the classes defined in lily-glass.css
const AVATAR_TONE_CLASS: Record<NonNullable<OrbitProps['avatarTone']>, string> = {
  teal: 'teal',
  peach: 'peach',
  sage: '',       // default gradient is sage-ish
  amber: 'peach', // closest available
  lilac: '',
};

export default function Orbit({
  size,
  initials,
  avatarTone = 'sage',
  badges,
  showVerified = false,
}: OrbitProps) {
  const radius = size * 0.46;
  const [activeBadge, setActiveBadge] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (badges.length === 0) return;

    function cycle() {
      if (!paused) {
        setActiveBadge(indexRef.current);
        indexRef.current = (indexRef.current + 1) % badges.length;
      }
    }

    cycle();
    intervalRef.current = setInterval(cycle, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges.length, paused]);

  const avatarClass = ['avatar', AVATAR_TONE_CLASS[avatarTone]].filter(Boolean).join(' ');
  const fontSize = size * 0.18;

  return (
    <div
      className="orbit-wrap"
      style={{
        width: size,
        height: size,
        animation: 'orbit-sway 14s ease-in-out infinite',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={`Therapist avatar for ${initials}`}
    >
      {/* Outer ring hint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px dashed hsla(145, 30%, 60%, 0.25)',
        }}
        aria-hidden="true"
      />

      {/* Center avatar */}
      <div
        className={avatarClass}
        style={{ fontSize }}
        aria-hidden="true"
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{initials}</span>
      </div>

      {/* Verified badge */}
      {showVerified && (
        <div
          className="lily-verified"
          style={{
            position: 'absolute',
            bottom: size * 0.18,
            right: size * 0.18,
            zIndex: 4,
          }}
          aria-label="Lily verified"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}

      {/* Affinity badges */}
      <div className="badges" aria-hidden="true">
        {badges.map((badge, i) => {
          const rad = (badge.angle * Math.PI) / 180;
          // Use CSS variables so the .badge transform in lily-glass.css is respected
          const isActive = activeBadge === i;

          return (
            <div
              key={badge.key}
              className={`badge ${TONE_CLASS[badge.tone]}`}
              style={
                {
                  '--a': `${badge.angle}deg`,
                  '--r': `${radius}px`,
                  '--w': 'max-content',
                  width: isActive ? 'max-content' : 22,
                  zIndex: isActive ? 5 : undefined,
                  boxShadow: isActive
                    ? '0 4px 12px hsla(31,46%,20%,0.22)'
                    : undefined,
                } as React.CSSProperties
              }
            >
              <span className="icon">{badge.icon}</span>
              <span
                className="lbl"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes orbit-sway {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(8deg); }
          35%  { transform: rotate(-6deg); }
          55%  { transform: rotate(5deg); }
          75%  { transform: rotate(-4deg); }
          90%  { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
