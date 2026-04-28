import React from 'react';

interface TrustItem {
  icon: React.ReactNode;
  label: string;
}

const ITEMS: TrustItem[] = [
  {
    label: 'HIPAA Compliant',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'SOC 2 Type II',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  {
    label: 'Verified Clinicians',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="m16 11 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: '50 States',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: '8 Dimensions of Wellbeing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

interface TrustStripProps {
  className?: string;
}

export default function TrustStrip({ className = '' }: TrustStripProps) {
  return (
    <div className={`trust-strip ${className}`.trim()} role="list" aria-label="Trust certifications">
      {ITEMS.map((item) => (
        <div key={item.label} className="ts-item" role="listitem">
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
