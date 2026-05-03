'use client';

import { useAuth } from '@/modules/auth/AuthContext';
import { getSideLabel } from '@/shared/utils/i18n';

/**
 * 3-way vote split bar — the signature UI element.
 * Shows teri_galti / uski_galti / situation_galat as colored segments.
 */
export default function VerdictSplitBar({ voteSplit = {}, totalVotes = 0, compact = false }) {
  const { languagePreference } = useAuth();
  const teri = voteSplit.teri_galti || 0;
  const uski = voteSplit.uski_galti || 0;
  const situ = voteSplit.situation_galat || 0;
  const total = teri + uski + situ || 1;

  const teriPct = Math.round((teri / total) * 100);
  const uskiPct = Math.round((uski / total) * 100);
  const situPct = 100 - teriPct - uskiPct;

  const height = compact ? 'h-2' : 'h-3';

  return (
    <div className="w-full">
      {/* Bar */}
      <div className={`w-full ${height} rounded-full overflow-hidden flex bg-[var(--bg-elevated)]`}>
        {teriPct > 0 && (
          <div
            className="animate-bar bg-[var(--accent-orange)] transition-all duration-700"
            style={{ width: `${teriPct}%` }}
          />
        )}
        {uskiPct > 0 && (
          <div
            className="animate-bar bg-[var(--accent-purple)] transition-all duration-700"
            style={{ width: `${uskiPct}%` }}
          />
        )}
        {situPct > 0 && (
          <div
            className="animate-bar bg-[var(--accent-cyan)] transition-all duration-700"
            style={{ width: `${situPct}%` }}
          />
        )}
      </div>

      {/* Labels */}
      {!compact && (
        <div className="flex justify-between mt-1.5 text-xs">
          <span className="text-[var(--accent-orange)] font-medium">{getSideLabel('teri_galti', languagePreference)} {teriPct}%</span>
          <span className="text-[var(--accent-purple)] font-medium">{getSideLabel('uski_galti', languagePreference)} {uskiPct}%</span>
          <span className="text-[var(--accent-cyan)] font-medium">{getSideLabel('situation_galat', languagePreference)} {situPct}%</span>
        </div>
      )}
    </div>
  );
}
