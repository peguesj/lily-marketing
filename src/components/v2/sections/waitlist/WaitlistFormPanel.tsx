import { useEffect, useState } from 'react';
import WaitlistForm from '../../forms/WaitlistForm.tsx';
import type { Audience } from '../../forms/validate.ts';

export interface WaitlistFormPanelProps {
  defaultAudience?: Audience;
  /** App sign-up link shown on the confirmation, per audience (from src/config/app.ts). */
  appHrefs?: Partial<Record<Audience, string>>;
}

const AUDIENCES: readonly Audience[] = ['supervisor', 'graduate', 'program'];

export function audienceFromSearch(search: string): Audience | null {
  const raw = new URLSearchParams(search).get('audience')?.trim().toLowerCase();
  return AUDIENCES.find((a) => a === raw) ?? null;
}

/**
 * Hydrates the D1 WaitlistForm with the audience preselected from `?audience=`.
 * Server render and first client render use `defaultAudience` (supervisor); a valid query
 * value remounts the form once with that audience. The in-form segmented switch is untouched.
 */
export default function WaitlistFormPanel({ defaultAudience = 'supervisor', appHrefs = {} }: WaitlistFormPanelProps) {
  const [audience, setAudience] = useState<Audience>(defaultAudience);

  useEffect(() => {
    const fromQuery = audienceFromSearch(window.location.search);
    if (fromQuery) setAudience(fromQuery);
  }, []);

  return <WaitlistForm key={audience} defaultAudience={audience} appHref={appHrefs[audience]} />;
}
