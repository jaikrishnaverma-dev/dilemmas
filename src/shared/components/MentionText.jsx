'use client';

import Link from 'next/link';

/**
 * Renders text with @mentions converted to clickable profile links.
 * e.g. "Hey @verdict_king bro tu galat hai" → "Hey " + <Link>@verdict_king</Link> + " bro tu galat hai"
 */
export default function MentionText({ text, className = '' }) {
  if (!text) return null;

  // Split by @mention pattern
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('@') && part.length > 1) {
          const username = part.slice(1);
          return (
            <Link
              key={i}
              href={`/user/${username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-[var(--accent-purple)] hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
