'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, MapPin, Target, Award, Search } from 'lucide-react';
import JudgeBadgeIcon from '@/shared/components/JudgeBadgeIcon';
import { api } from '@/shared/api/apiClient';
import { COPY } from '@/shared/utils/hinglishCopy';

/**
 * LeaderboardSection — reusable top judges list.
 * Shows the top N judges with ranks, badges, scores.
 * Used in both /search (embedded) and /leaderboard (full page).
 * 
 * Props:
 *   limit: number — how many to show (default 10)
 *   compact: boolean — compact mode for embedding
 */
export default function LeaderboardSection({ limit = 10, compact = false }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/judge-score/leaderboard?limit=${limit}`)
      .then((data) => setLeaderboard(data.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
          <div key={i} className="glass-card p-3 animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-[var(--bg-elevated)]" />
              <div className="h-2.5 w-14 rounded bg-[var(--bg-elevated)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Trophy className="mx-auto text-[var(--text-muted)] mb-2" size={24} />
        <p className="text-xs text-[var(--text-muted)]">No judges yet — be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry, i) => {
        const isTop3 = i < 3;
        const rankColor = i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-[var(--text-muted)]';

        return (
          <Link
            key={i}
            href={`/user/${entry.username}`}
            className={`glass-card ${compact ? 'p-3' : 'p-4'} flex items-center gap-3 animate-slide-up
              hover:border-[var(--border-glow)] transition-all active:scale-[0.98]
              ${isTop3 ? 'border-l-4' : 'border border-[var(--border-subtle)]'}
              ${i === 0 ? 'border-l-yellow-500 bg-yellow-500/[0.03]' : i === 1 ? 'border-l-gray-400' : i === 2 ? 'border-l-orange-500' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* Rank */}
            <div className="w-6 flex flex-col items-center">
              {isTop3 ? <Award className={rankColor} size={compact ? 14 : 18} /> : null}
              <span className={`text-xs font-black ${rankColor}`}>#{entry.rank}</span>
            </div>

            {/* Avatar */}
            <div className={`${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)]
              border border-[var(--border-subtle)] flex items-center justify-center font-black text-[var(--text-primary)]`}>
              {entry.username?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`${compact ? 'text-xs' : 'text-sm'} font-bold truncate`}>@{entry.username}</p>
                <JudgeBadgeIcon badge={entry.badge} size="sm" showLabel={false} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-0.5">
                  <MapPin size={8} /> {entry.city || 'India'}
                </span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-0.5">
                  <Target size={8} /> {entry.totalVerdicts} verdicts
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className={`${compact ? 'text-sm' : 'text-lg'} font-black gradient-text`}>{entry.score.toFixed(1)}</p>
              <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Score</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
