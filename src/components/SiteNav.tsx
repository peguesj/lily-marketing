import { useEffect, useRef, useState } from 'react';
import { appLinks } from '../config/app';

interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Supervisors', href: '/supervisors' },
  { label: 'Graduates', href: '/graduates' },
  { label: 'Programs', href: '/programs' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Research', href: '/research' },
] as const;

const WAITLIST_HREF = '/waitlist';

interface SiteNavProps {
  /** Pathname for server-rendered active state; refreshed from window.location on mount. */
  currentPath?: string;
}

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" focusable="false">
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

export default function SiteNav({ currentPath = '/' }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState(normalize(currentPath));
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActivePath(normalize(window.location.pathname));
  }, []);

  // Escape closes the menu and returns focus to the toggle; widening the viewport closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 961px)');
    const onChange = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onChange);
    };
  }, [open]);

  const isActive = (href: string) => activePath === href || activePath.startsWith(`${href}/`);

  const renderLink = (link: NavLink, onClick?: () => void) => (
    <a
      key={link.href}
      href={link.href}
      className="lv2-nav-link"
      aria-current={isActive(link.href) ? 'page' : undefined}
      onClick={onClick}
    >
      {link.label}
    </a>
  );

  return (
    <header className="lv2-nav">
      <nav className="lv2-nav-inner" aria-label="Main">
        <a href="/" className="lv2-wordmark" aria-label="Lily home">
          Lily
        </a>

        <ul className="lv2-nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>{renderLink(link)}</li>
          ))}
        </ul>

        <div className="lv2-nav-actions">
          <a href={appLinks.signIn} className="lv2-signin">
            Sign in
          </a>
          <a href={WAITLIST_HREF} className="lv2-pill" aria-current={isActive(WAITLIST_HREF) ? 'page' : undefined}>
            Join the waitlist
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="lv2-nav-toggle"
          aria-expanded={open}
          aria-controls="lv2-mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <MenuIcon open={open} />
        </button>
      </nav>

      <div id="lv2-mobile-menu" ref={menuRef} className="lv2-mobile-menu" hidden={!open}>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>{renderLink(link, () => setOpen(false))}</li>
          ))}
        </ul>
        <a href={appLinks.signIn} className="lv2-signin">
          Sign in
        </a>
        <a href={WAITLIST_HREF} className="lv2-pill" onClick={() => setOpen(false)}>
          Join the waitlist
        </a>
      </div>
    </header>
  );
}
