import React from 'react';
import Btn from './Btn';

interface CTABandProps {
  /**
   * Title text. May contain <em>...</em> for italic brand accent.
   * Only <em> tags are parsed — all other content is treated as plain text,
   * eliminating any XSS risk.
   */
  title: string;
  sub?: string;
  audience?: 'members' | 'practitioners' | 'organizations' | 'general';
  primaryLabel: string;
  primaryHref?: string;
  onPrimaryClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryClick?: () => void;
  showDemo?: boolean;
  className?: string;
}

/**
 * Parse a string that may contain <em>…</em> tags into a React node array.
 * Only <em> is allowed — every other character is rendered as plain text.
 */
function parseEmTitle(raw: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /<em>(.*?)<\/em>/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) {
      parts.push(raw.slice(last, match.index));
    }
    parts.push(<em key={match.index}>{match[1]}</em>);
    last = match.index + match[0].length;
  }

  if (last < raw.length) {
    parts.push(raw.slice(last));
  }

  return parts;
}

export default function CTABand({
  title,
  sub,
  primaryLabel,
  primaryHref,
  onPrimaryClick,
  secondaryLabel,
  secondaryHref,
  onSecondaryClick,
  showDemo = false,
  className = '',
}: CTABandProps) {
  return (
    <section className={`cta-band ${className}`.trim()} aria-labelledby="cta-band-title">
      <div className="cta-band-inner">
        <h2 id="cta-band-title">{parseEmTitle(title)}</h2>
        {sub && <p>{sub}</p>}
        <div className="cta-band-actions">
          <Btn
            kind="primary"
            size="lg"
            icon="arrow"
            href={primaryHref}
            onClick={onPrimaryClick}
          >
            {primaryLabel}
          </Btn>

          {secondaryLabel && (
            <Btn
              kind="ghost"
              size="lg"
              href={secondaryHref}
              onClick={onSecondaryClick}
            >
              {secondaryLabel}
            </Btn>
          )}

          {showDemo && !secondaryLabel && (
            <Btn kind="ghost" size="lg" href="/demo">
              See a demo
            </Btn>
          )}
        </div>
      </div>
    </section>
  );
}
