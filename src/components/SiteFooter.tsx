
interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: readonly FooterLink[];
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'For supervisors', href: '/supervisors' },
      { label: 'For graduates', href: '/graduates' },
      { label: 'For programs', href: '/programs' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Research',
    links: [
      { label: 'The two-year gap', href: '/research' },
      { label: 'Methodology', href: '/research#methodology' },
    ],
  },
  {
    heading: 'Trust',
    links: [
      { label: 'Trust', href: '/trust' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="lv2-footer" aria-label="Site footer">
      <div className="lv2-footer-inner">
        <div className="lv2-footer-grid">
          <div className="lv2-footer-brand">
            <a href="/" className="lv2-wordmark" aria-label="Lily home">
              Lily
            </a>
            <p className="lv2-footer-tagline">Supervision, verified.</p>
            <span data-illustrative>Illustrative · pending validation</span>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2>{col.heading}</h2>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="lv2-footer-legal">
          <p>
            © 2026 Lily Health, Inc. · Philadelphia, Pennsylvania ·{' '}
            <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{' '}
            <a href="/accessibility">Accessibility</a>
          </p>
          <span className="lv2-footer-sign">
            with care, Lily
          </span>
        </div>
      </div>
    </footer>
  );
}
