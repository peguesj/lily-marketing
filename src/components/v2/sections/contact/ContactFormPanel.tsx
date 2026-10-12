import { useEffect, useState } from 'react';
import ContactForm from '../../forms/ContactForm.tsx';
import { CONTACT_TOPICS } from '../../forms/validate.ts';

type TopicId = (typeof CONTACT_TOPICS)[number]['id'];

export interface ContactFormPanelProps {
  /** Topic preselected on the server render and when the query string has no valid ?topic=. */
  defaultTopic?: TopicId;
}

export function topicFromSearch(search: string): TopicId | null {
  const raw = new URLSearchParams(search).get('topic')?.trim().toLowerCase();
  return CONTACT_TOPICS.find((t) => t.id === raw)?.id ?? null;
}

/**
 * Hydrates the D1 ContactForm with a topic preselected from `?topic=`.
 * The server render and the first client render both use `defaultTopic` (no hydration
 * mismatch); a valid query value then remounts the form once with that topic selected.
 */
export default function ContactFormPanel({ defaultTopic = 'sponsor' }: ContactFormPanelProps) {
  const [topic, setTopic] = useState<TopicId>(defaultTopic);

  useEffect(() => {
    const fromQuery = topicFromSearch(window.location.search);
    if (fromQuery) setTopic(fromQuery);
  }, []);

  return <ContactForm key={topic} defaultTopic={topic} />;
}
