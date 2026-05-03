'use client';

import { useState, useEffect } from 'react';
import { Search, Trophy, MapPin, Target, Award, ChevronRight } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import JudgeBadgeIcon from '@/shared/components/JudgeBadgeIcon';
import { api } from '@/shared/api/apiClient';
import { useAuth } from '@/modules/auth/AuthContext';

export default function LeaderboardPage() {
  const { copy } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '30' });
    if (cityFilter) params.set('city', cityFilter);

    api.get(`/api/judge-score/leaderboard?${params}`)
      .then((data) => setLeaderboard(data.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cityFilter]);

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-6">

        <div className="text-center animate-slide-up space-y-1">
          <h2 className="text-2xl font-black flex items-center justify-center gap-2">
            <Trophy className="text-yellow-500" size={24} /> {copy.judgeScore.leaderboard}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-bold tracking-widest uppercase">{copy.leaderboard.subtitle}</p>
        </div>

        {/* Search/Filter */}
        <div className="relative animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder={copy.leaderboard.searchPlaceholder}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 py-4
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-purple)] transition-all shadow-lg shadow-black/20"
          />
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]" />
                  <div className="h-3 w-16 rounded bg-[var(--bg-elevated)]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, i) => {
              const isTop3 = i < 3;
              const rankColor = i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-[var(--text-muted)]';
              
              return (
                <div
                  key={i}
                  className={`glass-card p-4 flex items-center gap-4 animate-slide-up relative overflow-hidden
                    ${isTop3 ? 'border-l-4' : 'border border-[var(--border-subtle)]'}
                    ${i === 0 ? 'border-l-yellow-500 bg-yellow-500/[0.03]' : i === 1 ? 'border-l-gray-400' : i === 2 ? 'border-l-orange-500' : ''}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Rank */}
                  <div className="w-8 flex flex-col items-center">
                    {isTop3 ? <Award className={rankColor} size={20} /> : null}
                    <span className={`text-sm font-black ${rankColor} ${isTop3 ? 'mt-0.5' : ''}`}>#{entry.rank}</span>
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] border border-[var(--border-subtle)]
                      flex items-center justify-center text-base font-black text-[var(--text-primary)]">
                      {entry.username?.charAt(0).toUpperCase()}
                    </div>
                    {isTop3 && (
                      <div className="absolute -top-1 -right-1 bg-[var(--bg-primary)] p-0.5 rounded-full">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-500'}`} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black truncate text-[var(--text-primary)]">@{entry.username}</p>
                      <JudgeBadgeIcon badge={entry.badge} size="sm" showLabel={false} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-0.5">
                        <MapPin size={8} /> {entry.city || 'India'}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-0.5">
                        <Target size={8} /> {entry.totalVerdicts} {copy.feed.verdicts}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-black gradient-text">{entry.score.toFixed(1)}</p>
                    <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{copy.leaderboard.scoreLabel}</p>
                  </div>
                </div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="glass-card p-10 text-center space-y-3">
                <Search className="mx-auto text-[var(--text-muted)]" size={40} />
                <p className="text-[var(--text-secondary)] font-bold">{copy.leaderboard.noJudges}</p>
              </div>
            )}
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
