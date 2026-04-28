import React from 'react';

interface IllustrationProps {
  /** 1–8 maps to /assets/illustration-{n}.svg */
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  alt: string;
  size?: number;
  className?: string;
}

export default function Illustration({ n, alt, size = 260, className = '' }: IllustrationProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden={alt === '' ? true : undefined}
    >
      {/* Soft circular halo */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(0,0%,100%,0.72) 0%, hsla(0,0%,100%,0) 72%)',
          pointerEvents: 'none',
        }}
      />
      <img
        src={`/assets/illustration-${n}.svg`}
        alt={alt}
        width={size * 0.82}
        height={size * 0.82}
        style={{
          position: 'relative',
          zIndex: 1,
          objectFit: 'contain',
          display: 'block',
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
