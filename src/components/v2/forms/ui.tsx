import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { postSubmission, type SubmitErrorKind, type SubmissionPayload } from '../../../lib/submit.ts';
import './forms.css';

/* ------------------------------------------------------------ submission */

export type SubmitPhase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; error: SubmitErrorKind };

export const ERROR_COPY: Record<SubmitErrorKind, string> = {
  network: 'We could not reach Lily. Check your connection and try again.',
  invalid: 'Something in that form was not accepted. Check your email address and try again.',
  server: 'Something went wrong on our side. Please try again in a moment.',
};

/** Success is only ever set after the server confirms ({ok:true}). */
export function useSubmission() {
  const [phase, setPhase] = useState<SubmitPhase>({ kind: 'idle' });
  const inFlight = useRef(false);

  const send = useCallback(async (payload: SubmissionPayload) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPhase({ kind: 'submitting' });
    try {
      const out = await postSubmission(payload);
      setPhase(out.ok ? { kind: 'success' } : { kind: 'error', error: out.error });
    } finally {
      inFlight.current = false;
    }
  }, []);

  const reset = useCallback(() => setPhase({ kind: 'idle' }), []);
  return { phase, send, reset };
}

/** Focus the first invalid control (by key order) once it has rendered. */
export function focusField(prefix: string, key: string) {
  requestAnimationFrame(() => document.getElementById(`${prefix}-${key}`)?.focus());
}

/* ------------------------------------------------------------- primitives */

interface FieldBase {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  span?: boolean;
  autoComplete?: string;
}

function describedBy(id: string, error?: string, hint?: string, extra?: string) {
  const ids = [error ? `${id}-err` : null, hint ? `${id}-hint` : null, extra ?? null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

function Messages({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return (
    <>
      {error ? (
        <p id={`${id}-err`} className="lv2f-msg lv2f-msg--error">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="lv2f-msg">
          {hint}
        </p>
      ) : null}
    </>
  );
}

export function TextField(
  props: FieldBase & {
    type?: 'text' | 'email' | 'tel';
    inputMode?: 'text' | 'numeric' | 'decimal' | 'email';
    maxLength?: number;
    describedByExtra?: string;
  },
) {
  const { id, label, value, onChange, onBlur, error, hint, required, span, autoComplete, type = 'text', inputMode, maxLength, describedByExtra } = props;
  return (
    <div className={`lv2f-field${span ? ' lv2f-span' : ''}`}>
      <input
        id={id}
        name={id}
        className="lv2f-control"
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder=" "
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint, describedByExtra)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      <label htmlFor={id} className="lv2f-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
}

export function SelectField(props: FieldBase & { options: ReadonlyArray<readonly [string, string]>; placeholder?: string }) {
  const { id, label, value, onChange, onBlur, error, hint, required, span, autoComplete, options, placeholder } = props;
  return (
    <div className={`lv2f-field${span ? ' lv2f-span' : ''}`}>
      <select
        id={id}
        name={id}
        className="lv2f-control"
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="lv2f-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
}

export function TextAreaField(props: FieldBase & { rows?: number }) {
  const { id, label, value, onChange, onBlur, error, hint, required, span, rows = 5 } = props;
  return (
    <div className={`lv2f-field${span ? ' lv2f-span' : ''}`}>
      <textarea
        id={id}
        name={id}
        className="lv2f-control"
        rows={rows}
        placeholder=" "
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      <label htmlFor={id} className="lv2f-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
}

export interface ChipOption {
  id: string;
  label: string;
}

/** Keyboard-operable single-select chips: role=radiogroup, roving tabindex, arrows select. */
export function ChipGroup({
  id,
  legend,
  options,
  value,
  onChange,
  error,
  hint,
  variant = 'chips',
  span = true,
  required,
}: {
  id: string;
  legend: string;
  options: ReadonlyArray<ChipOption>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  variant?: 'chips' | 'segmented';
  span?: boolean;
  required?: boolean;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((o) => o.id === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = options.length - 1;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next]!.id);
    refs.current[next]?.focus();
  }

  const labelId = `${id}-legend`;
  return (
    <div className={`lv2f-group${span ? ' lv2f-span' : ''}`}>
      <span id={labelId} className="lv2f-group-label">
        {legend}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={variant === 'segmented' ? 'lv2f-seg' : 'lv2f-chips'}
      >
        {options.map((o, i) => (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={o.id === value}
            tabIndex={i === tabStop ? 0 : -1}
            className="lv2f-chip"
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
}

export function CheckField({
  id,
  checked,
  onChange,
  children,
  error,
  variant = 'checkbox',
  span = true,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  error?: string;
  variant?: 'checkbox' | 'switch';
  span?: boolean;
}) {
  return (
    <div className={span ? 'lv2f-span' : undefined}>
      <label className={`lv2f-check${variant === 'switch' ? ' lv2f-check--switch' : ''}`} htmlFor={id}>
        <input
          id={id}
          name={id}
          type="checkbox"
          role={variant === 'switch' ? 'switch' : undefined}
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="lv2f-check-box" aria-hidden="true" />
        <span>{children}</span>
      </label>
      <Messages id={id} error={error} />
    </div>
  );
}

/** Hidden honeypot input; real users never see or tab into it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="lv2f-hp" aria-hidden="true">
      <label>
        Leave this field empty
        <input name="_h" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

/** Persistent polite live region; announce progress, errors and confirmation here. */
export function LiveStatus({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={`lv2f-status${tone === 'error' ? ' lv2f-status--error' : ''}`}>
      {message}
    </div>
  );
}

export function RetryBanner({ error, onRetry }: { error: SubmitErrorKind; onRetry: () => void }) {
  return (
    <div className="lv2f-banner">
      <span>{ERROR_COPY[error]}</span>
      <button type="button" className="lv2f-btn" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
