import React from 'react';

export type IconName =
  | 'lock'
  | 'check'
  | 'users'
  | 'heart'
  | 'arrow'
  | 'calendar'
  | 'cash'
  | 'globe'
  | 'video'
  | 'search'
  | 'spark'
  | 'note'
  | 'chart'
  | 'headphones'
  | 'book'
  | 'leaf'
  | 'chat'
  | 'filter'
  | 'bookmark'
  | 'shield'
  | 'language'
  | 'sparkle'
  | 'arrow-left'
  | 'arrow-right'
  | 'x'
  | 'building'
  | 'phone';

interface IconProps {
  name: IconName | string;
  size?: number;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

const paths: Record<string, string> = {
  lock: 'M12 2a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V7a3 3 0 0 1 3-3zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  check: 'M20 6 9 17l-5-5',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  cash: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  globe: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  video: 'M23 7l-7 5 7 5V7zM1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  spark: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  chart: 'M18 20V10M12 20V4M6 20v-6',
  headphones: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34c2.06-.53 4.06-1.29 5.64-2.76C14.48 14.15 18.3 9.29 17 8zM22 2S12 4 10 12c0 0 3-1 5-3s7-7 7-7z',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  language: 'M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6',
  sparkle: 'M12 3v3M12 18v3M3 12h3M18 12h3m-3.22-6.78-2.12 2.12M8.34 15.66l-2.12 2.12m0-9.9 2.12 2.12M15.66 15.66l2.12 2.12M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  'arrow-left': 'M19 12H5M12 5l-7 7 7 7',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  x: 'M18 6 6 18M6 6l12 12',
  building: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.09 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08z',
};

export default function Icon({
  name,
  size = 20,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  const d = paths[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {d ? (
        <path d={d} />
      ) : (
        // Fallback: circle with a dot for unknown icons
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
