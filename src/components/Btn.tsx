import React from 'react';

interface BtnProps {
  kind: 'primary' | 'ghost';
  size?: 'lg' | 'md';
  icon?: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
}

function ArrowRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Btn({
  kind,
  size = 'md',
  icon,
  href,
  onClick,
  children,
  className = '',
  type = 'button',
  disabled,
  'aria-label': ariaLabel,
}: BtnProps) {
  const classes = [
    'btn',
    kind === 'primary' ? 'primary' : 'ghost',
    size === 'lg' ? 'lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {children}
      {icon === 'arrow' && <ArrowRight />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
