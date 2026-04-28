import React, { useState, useEffect } from 'react';

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Members', href: '/members' },
  { label: 'Practitioners', href: '/practitioners' },
  { label: 'Organizations', href: '/organizations' },
  { label: 'How it works', href: '/how' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Trust', href: '/trust' },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  );
}

// Role context derived from URL path
const ROLE_CONTEXT: Record<string, { label: string; color: string }> = {
  '/members':       { label: 'for members',       color: 'hsl(20 60% 48%)'  },
  '/practitioners': { label: 'for practitioners',  color: 'hsl(145 50% 32%)' },
  '/organizations': { label: 'for organizations',  color: 'hsl(220 45% 45%)' },
};

function getRoleContext(path: string) {
  for (const [prefix, ctx] of Object.entries(ROLE_CONTEXT)) {
    if (path.startsWith(prefix)) return ctx;
  }
  return null;
}

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePath, setActivePath] = useState('/');

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  function isActive(href: string) {
    if (href === '/') return activePath === '/';
    return activePath.startsWith(href);
  }

  const roleCtx = getRoleContext(activePath);

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="site-nav-inner">
        {/* Logo — conditionally shows role tagline on role pages */}
        <a
          href="/"
          className="site-logo"
          aria-label="Lily AI home"
          style={roleCtx ? { flexDirection: 'column', alignItems: 'flex-start', gap: 0 } : undefined}
        >
          <img
            src="/assets/lily-wordmark-multi.png"
            alt="Lily"
            className="site-logo-mark"
            style={{ width: 'auto', height: 30, borderRadius: 0 }}
          />
          {roleCtx && (
            <span
              style={{
                display: 'block',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: roleCtx.color,
                lineHeight: 1,
                marginTop: 2,
                opacity: 0.9,
              }}
            >
              {roleCtx.label}
            </span>
          )}
        </a>

        {/* Desktop nav links */}
        <div className="site-nav-links" role="list">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`site-nav-link${isActive(link.href) ? ' active' : ''}`}
              role="listitem"
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="site-nav-cta">
          <a href="/waitlist" className="btn primary desktop-only" aria-label="Join the Lily waitlist">
            Join the waitlist
          </a>

          {/* Mobile hamburger */}
          <button
            className="btn ghost site-nav-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ padding: '8px 10px' }}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="menu"
          style={{
            background: 'hsla(43, 35%, 96%, 0.97)',
            backdropFilter: 'blur(18px)',
            borderTop: '1px solid hsla(145, 15%, 80%, 0.4)',
            padding: '12px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`site-nav-link${isActive(link.href) ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block' }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ marginTop: 12 }}>
            <a
              href="/waitlist"
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileOpen(false)}
            >
              Join the waitlist
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
