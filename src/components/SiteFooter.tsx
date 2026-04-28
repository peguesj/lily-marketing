import React from 'react';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Members', href: '/members' },
      { label: 'Practitioners', href: '/practitioners' },
      { label: 'Organizations', href: '/organizations' },
      { label: 'How it works', href: '/how' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Lily Care', href: '/members' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'BAA Agreement', href: '/baa' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/asklilyhealth/' },
      { label: 'Instagram', href: 'https://www.instagram.com/asklilyhealth' },
      { label: 'Twitter / X', href: 'https://x.com/asklilyhealth' },
      { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61588828805568' },
      { label: 'Newsletter', href: '/waitlist' },
    ],
  },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="container wide">
        <div className="site-footer-grid">
          {/* Brand column */}
          <div>
            <a href="/" aria-label="Lily AI home">
              <img
                src="/assets/lily-wordmark-multi.png"
                alt="Lily"
                style={{ height: 28, width: 'auto' }}
              />
            </a>
            <p className="ft-mission">
              Mental health care that fits your life.
            </p>
            <p style={{ fontSize: 13, color: 'hsl(43 30% 92% / 0.55)', lineHeight: 1.55, margin: 0, maxWidth: 320 }}>
              Connecting people with the right practitioners through intelligent matching across 8 dimensions of wellbeing.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="site-footer-bottom">
          <span>
            &copy; {year} Lily AI, Inc. All rights reserved.
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                border: '1px solid hsl(43 30% 92% / 0.18)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'hsl(43 30% 92% / 0.6)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              HIPAA compliant
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                border: '1px solid hsl(43 30% 92% / 0.18)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'hsl(43 30% 92% / 0.6)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              SOC 2 Type II
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
