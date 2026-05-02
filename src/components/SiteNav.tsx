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

interface RoleContext {
  label: string;
  /** Color for product name subscript */
  color: string;
  /** Short product descriptor shown as small text below the logo */
  product: string;
  /** Icon image path */
  iconSrc: string;
  /** Whether to render "Lily" text alongside the icon (logo+wordmark composition) */
  showWordmark: boolean;
  /** Color for the "Lily" wordmark text when shown */
  wordmarkColor: string;
}

// Role context derived from URL path
// Members  → lily-icon-multi.png alone (the multi-color peach icon IS Lily Care)
// Others   → role icon + "Lily" text rendered inline (composing logo+wordmark)
const ROLE_CONTEXT: Record<string, RoleContext> = {
  '/members': {
    label: 'for members',
    color: 'hsl(20 60% 48%)',
    product: 'care',
    iconSrc: '/assets/lily-icon-multi.png',
    showWordmark: false,
    wordmarkColor: 'hsl(20 55% 30%)',
  },
  '/practitioners': {
    label: 'for practitioners',
    color: 'hsl(145 50% 32%)',
    product: 'practice',
    iconSrc: '/assets/lily-icon-green.png',
    showWordmark: true,
    wordmarkColor: 'hsl(145 55% 26%)',
  },
  '/organizations': {
    label: 'for organizations',
    color: 'hsl(220 45% 45%)',
    product: 'admin',
    iconSrc: '/assets/lily-icon-fullcolor.png',
    showWordmark: true,
    wordmarkColor: 'hsl(220 50% 38%)',
  },
};

function getRoleContext(path: string): RoleContext | null {
  for (const [prefix, ctx] of Object.entries(ROLE_CONTEXT)) {
    if (path.startsWith(prefix)) return ctx;
  }
  return null;
}

// Inline CSS for badge animations — injected once at mount
const NAV_BADGE_STYLES = `
  @keyframes nav-dot-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(0.78); }
  }
  .nav-waitlist-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: hsl(145 60% 34%);
    animation: nav-dot-pulse 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }
`;

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
      <style>{NAV_BADGE_STYLES}</style>

      <div className="site-nav-inner">
        {/* Logo group — logo/wordmark + product name + badges */}
        <a
          href="/"
          className="site-logo"
          aria-label="Lily AI home"
          style={{ alignItems: 'center', gap: 8 }}
        >
          {/* Logo mark */}
          {roleCtx ? (
            /* Role pages: icon + optional "Lily" text + product name — all inline */
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <img
                src={roleCtx.iconSrc}
                alt="Lily"
                style={{ width: 'auto', height: 28, borderRadius: 6 }}
              />
              {roleCtx.showWordmark && (
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: roleCtx.wordmarkColor,
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Lily
                </span>
              )}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: roleCtx.color,
                  lineHeight: 1,
                  opacity: 0.85,
                  alignSelf: 'flex-end',
                  paddingBottom: 1,
                }}
              >
                {roleCtx.product}
              </span>
            </span>
          ) : (
            /* Homepage: full wordmark image */
            <img
              src="/assets/lily-wordmark-multi.png"
              alt="Lily"
              className="site-logo-mark"
              style={{ width: 'auto', height: 30, borderRadius: 0 }}
            />
          )}

          {/* Badge cluster — separator + ALPHA + WAITLIST */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              borderLeft: '1px solid hsla(145,15%,60%,0.28)',
              paddingLeft: 8,
            }}
          >
            {/* ALPHA badge — always visible */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.09em',
                color: 'hsl(145 60% 26%)',
                background: 'hsl(145 60% 96%)',
                border: '1px solid hsl(145 55% 72%)',
                borderRadius: 4,
                padding: '2px 5px',
                lineHeight: 1.3,
                textTransform: 'uppercase',
              }}
            >
              Alpha
            </span>

            {/* WAITLIST OPEN — animated pulsing dot */}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.07em',
                color: 'hsl(145 55% 28%)',
                background: 'hsl(145 50% 96%)',
                border: '1px solid hsl(145 45% 76%)',
                borderRadius: 4,
                padding: '2px 6px 2px 5px',
                lineHeight: 1.3,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
              aria-label="Waitlist is open"
            >
              <span className="nav-waitlist-dot" aria-hidden="true" />
              Waitlist open
            </span>
          </span>
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
