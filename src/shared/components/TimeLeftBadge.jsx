'use client';

import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { timeLeft, isExpired } from '@/shared/utils/timeAgo';

/**
 * Time-left badge — creates urgency on every case card.
 * Shows countdown in Hinglish. Pulses when < 3 hours.
 */
export default function TimeLeftBadge({ expiresAt }) {
  const expired = isExpired(expiresAt);
  const remaining = timeLeft(expiresAt);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--text-muted)]/20 text-[var(--text-secondary)]">
        <CheckCircle2 size={12} /> Sealed
      </span>
    );
  }

  // Parse hours for urgency styling
  const hours = remaining ? parseInt(remaining) : 99;
  const isUrgent = remaining && remaining.includes('h') && hours <= 3;
  const isCritical = remaining && remaining.includes('m');

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
        ${isCritical ? 'bg-red-500/20 text-red-400 pulse-live' :
          isUrgent ? 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] pulse-live' :
          'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]'}`}
    >
      {isCritical ? <AlertTriangle size={12} /> : <Clock size={12} />}
      {remaining}
    </span>
  );
}
