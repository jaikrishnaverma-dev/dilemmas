'use client';

import { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, MapPin, MessageSquare, ChevronUp } from 'lucide-react';
import VerdictSplitBar from '@/shared/components/VerdictSplitBar';
import TimeLeftBadge from '@/shared/components/TimeLeftBadge';
import ShareButton from '@/shared/components/ShareButton';
import InlineVerdictPanel from '@/modules/feed/InlineVerdictPanel';
import { useAuth } from '@/modules/auth/AuthContext';
import { formatCount } from '@/shared/utils/formatPercent';
import { timeAgo } from '@/shared/utils/timeAgo';

const CATEGORY_COLORS = {
  relationship: 'bg-pink-500/15 text-pink-400',
  family: 'bg-orange-500/15 text-orange-400',
  friendship: 'bg-blue-500/15 text-blue-400',
  college: 'bg-green-500/15 text-green-400',
  workplace: 'bg-yellow-500/15 text-yellow-400',
  money: 'bg-emerald-500/15 text-emerald-400',
  roommate: 'bg-cyan-500/15 text-cyan-400',
  'social-media': 'bg-violet-500/15 text-violet-400',
  desi: 'bg-orange-500/15 text-orange-300',
  politics: 'bg-red-500/15 text-red-400',
  'tv-shows': 'bg-indigo-500/15 text-indigo-400',
  other: 'bg-gray-500/15 text-gray-400',
};

/**
 * CaseCard — feed card for each dilemma.
 * 
 * Interaction model:
 * - Single click: Expand/collapse inline verdict panel (accordion — only one open at a time)
 * - Double click: Navigate to full case detail page
 * - Share button: Excluded from both via stopPropagation
 */
export default function CaseCard({ caseData, index = 0, isExpanded, onToggleExpand }) {
  const router = useRouter();
  const { copy } = useAuth();
  const clickTimer = useRef(null);
  const { title, context, category, city, shareSlug, voteCount, voteSplit, expiresAt, createdAt } = caseData;

  const isHot = voteCount > 300;
  const totalVotes = (voteSplit?.teri_galti || 0) + (voteSplit?.uski_galti || 0) + (voteSplit?.situation_galat || 0);

  /**
   * Click handler with single/double click discrimination.
   * Single click (after 250ms timeout): toggle expand
   * Double click (within 250ms): navigate to case page
   */
  const handleClick = useCallback(() => {
    if (clickTimer.current) {
      // Double click detected — cancel single click & navigate
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      router.push(`/case/${shareSlug}`);
    } else {
      // Start single-click timer
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onToggleExpand?.();
      }, 250);
    }
  }, [router, shareSlug, onToggleExpand]);

  return (
    <div
      onClick={handleClick}
      className={`glass-card p-4 space-y-3 animate-slide-up transition-all duration-300 cursor-pointer select-none
        ${isExpanded
          ? 'border-[var(--accent-purple)]/30 shadow-lg shadow-[var(--accent-purple)]/5'
          : 'hover:border-[var(--border-glow)] active:scale-[0.98]'}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row: category + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other}`}>
            {copy.categories[category] || category}
          </span>
          {isHot && (
            <span className="flex items-center gap-1 text-xs font-bold text-[var(--accent-orange)] pulse-live">
              <Flame size={12} /> {copy.feed.hot}
            </span>
          )}
        </div>
        <TimeLeftBadge expiresAt={expiresAt} />
      </div>

      {/* Title */}
      <h3 className="text-base font-bold leading-snug text-[var(--text-primary)]">
        {title}
      </h3>

      {/* Context preview */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
        {context}
      </p>

      {/* Split bar */}
      <VerdictSplitBar voteSplit={voteSplit} totalVotes={totalVotes} />

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
            <MessageSquare size={12} /> {formatCount(voteCount)} {copy.feed.votes}
          </span>
          {city && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              <MapPin size={10} /> {city}
            </span>
          )}
          <span>{timeAgo(createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share button — isolated */}
          <div onClick={(e) => e.stopPropagation()}>
            <ShareButton
              variant="compact"
              shareData={{ caseTitle: title, caseSlug: shareSlug, side: '', agreePercent: 0 }}
            />
          </div>
          {/* Expand indicator */}
          <ChevronUp
            size={14}
            className={`text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
          />
        </div>
      </div>

      {/* Inline verdict panel — expands on single click */}
      {isExpanded && <InlineVerdictPanel caseData={caseData} />}

      {/* Double-click hint */}
      {isExpanded && (
        <p className="text-center text-[10px] text-[var(--text-muted)] font-medium pt-1">
          {copy.feed.doubleTapHint} \u2192
        </p>
      )}
    </div>
  );
}
