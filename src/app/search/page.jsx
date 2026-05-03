'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, X, MapPin, MessageSquare, User, Flame, Clock, Trophy } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import TimeLeftBadge from '@/shared/components/TimeLeftBadge';
import { api } from '@/shared/api/apiClient';
import { formatCount } from '@/shared/utils/formatPercent';
import { timeAgo } from '@/shared/utils/timeAgo';
import LeaderboardSection from '@/shared/components/LeaderboardSection';

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ cases: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'cases' | 'users'
  const debounceRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults({ cases: [], users: [] });
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}&limit=15`);
        setResults(data);
        setSearched(true);
      } catch {}
      setLoading(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, activeTab]);

  const totalResults = (results.cases?.length || 0) + (results.users?.length || 0);

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-nav space-y-4">

        {/* Search input */}
        <div className="relative animate-slide-up">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <SearchIcon size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, users, cities..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl pl-12 pr-12 py-4
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-purple)] transition-all shadow-lg shadow-black/10"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults({ cases: [], users: [] }); setSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
          {[
            { key: 'all', label: 'All', icon: SearchIcon },
            { key: 'cases', label: 'Cases', icon: MessageSquare },
            { key: 'users', label: 'Users', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all
                  ${activeTab === tab.key
                    ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)] text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                <Icon size={12} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div className="space-y-4">
            {totalResults === 0 ? (
              <div className="glass-card p-8 text-center animate-slide-up">
                <SearchIcon size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-sm font-bold text-[var(--text-secondary)]">Kuch nahi mila &ldquo;{query}&rdquo; ke liye</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[var(--text-muted)] font-bold">{totalResults} RESULTS</p>

                {/* Case results */}
                {results.cases?.length > 0 && (activeTab === 'all' || activeTab === 'cases') && (
                  <div className="space-y-2">
                    {activeTab === 'all' && (
                      <h3 className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 uppercase tracking-widest">
                        <MessageSquare size={12} /> Cases
                      </h3>
                    )}
                    {results.cases.map((c, i) => (
                      <Link
                        key={c._id}
                        href={`/case/${c.shareSlug}`}
                        className="glass-card p-4 block space-y-2 hover:border-[var(--border-glow)] transition-all animate-slide-up active:scale-[0.98]"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]">
                            {c.category}
                          </span>
                          <TimeLeftBadge expiresAt={c.expiresAt} />
                        </div>
                        <h4 className="text-sm font-bold">{c.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1"><Flame size={10} /> {formatCount(c.voteCount)} votes</span>
                          {c.city && <span className="flex items-center gap-0.5"><MapPin size={10} /> {c.city}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* User results */}
                {results.users?.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                  <div className="space-y-2">
                    {activeTab === 'all' && (
                      <h3 className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 uppercase tracking-widest mt-4">
                        <User size={12} /> Users
                      </h3>
                    )}
                    {results.users.map((u, i) => (
                      <Link
                        key={u._id}
                        href={`/user/${u.username}`}
                        className="glass-card p-4 flex items-center gap-3 hover:border-[var(--border-glow)] transition-all animate-slide-up active:scale-[0.98]"
                        style={{ animationDelay: `${(results.cases?.length || 0 + i) * 50}ms` }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)]
                          border border-[var(--border-subtle)] flex items-center justify-center text-sm font-black text-[var(--text-primary)]">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">@{u.username}</p>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            {u.city && <span className="flex items-center gap-0.5"><MapPin size={10} /> {u.city}</span>}
                            <span><Clock size={10} className="inline mr-0.5" /> Joined {timeAgo(u.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Default state — before search: show leaderboard */}
        {!searched && !loading && (
          <div className="space-y-4 animate-slide-up">
            <div className="text-center pt-4">
              <SearchIcon size={36} className="mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)] font-bold">Cases ya users search karo</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Case titles, categories, cities, usernames</p>
            </div>

            {/* Embedded Leaderboard */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-1.5 text-[var(--text-primary)]">
                  <Trophy size={16} className="text-yellow-500" /> Top Judges
                </h3>
                <Link
                  href="/leaderboard"
                  className="text-[10px] font-bold text-[var(--accent-purple)] hover:underline"
                >
                  See Full Leaderboard →
                </Link>
              </div>
              <LeaderboardSection limit={10} compact={true} />
            </div>
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
