import React from 'react';

const PLACEHOLDER_WIDTHS = [72, 88, 64, 96, 80, 68];

interface LogoStripProps {
  heading?: string;
  className?: string;
}

export default function LogoStrip({
  heading = 'Trusted by forward-thinking organizations',
  className = '',
}: LogoStripProps) {
  return (
    <div
      className={className}
      style={{ textAlign: 'center', padding: '40px 0' }}
      aria-label="Partner organizations"
    >
      <p
        style={{
          fontFamily: 'var(--ui)',
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: 28,
        }}
      >
        {heading}
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
        role="list"
        aria-label="Organization logos"
      >
        {PLACEHOLDER_WIDTHS.map((w, i) => (
          <div
            key={i}
            role="listitem"
            aria-label={`Partner organization ${i + 1}`}
            style={{
              width: w,
              height: 32,
              borderRadius: 8,
              background: 'hsl(var(--muted))',
              opacity: 0.55,
            }}
          />
        ))}
      </div>
    </div>
  );
}
