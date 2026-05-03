'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, MessageSquare, Flame } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import JudgeBadgeIcon from '@/shared/components/JudgeBadgeIcon';
import TimeLeftBadge from '@/shared/components/TimeLeftBadge';
import { CaseCardSkeleton } from '@/shared/components/LoadingPulse';
import { api } from '@/shared/api/apiClient';
import { getSideLabel } from '@/shared/utils/hinglishCopy';
import { timeAgo } from '@/shared/utils/timeAgo';
import { formatCount } from '@/shared/utils/formatPercent';

const SIDE_COLORS = {
  teri_galti: 'text-[var(--accent-orange)] bg-[var(--accent-orange)]/10',
  uski_galti: 'text-[var(--accent-purple)] bg-[var(--accent-purple)]/10',
  situation_galat: 'text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10',
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('verdicts');

  useEffect(() => {
    api.get(`/api/users/${username}`)
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-dvh bg-[var(--bg-primary)]"><TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-4"><CaseCardSkeleton /><CaseCardSkeleton /></main>
      <BottomNav /></div>
  );

  if (!data) return (
    <div className="min-h-dvh bg-[var(--bg-primary)]"><TopBar />
      <main className="max-w-lg mx-auto px-4 pt-20 text-center"><p className="text-[var(--text-secondary)]">User nahi mila</p></main>
      <BottomNav /></div>
  );

  const { user, judgeScore, recentVerdicts, submittedCases } = data;

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-5">
        {/* Profile header */}
        <div className="glass-card p-6 text-center space-y-3 animate-slide-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-pink)] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[var(--accent-pink)]/10">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold">@{user.username}</h2>
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
            {user.city && <span className="flex items-center gap-0.5"><MapPin size={10} /> {user.city}</span>}
            <span className="flex items-center gap-0.5"><Calendar size={10} /> Joined {timeAgo(user.joinedAt)}</span>
          </div>
          {judgeScore && <JudgeBadgeIcon badge={judgeScore.currentBadge} size="lg" />}
        </div>

        {/* Stats */}
        {judgeScore && (
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-2xl font-black gradient-text">{judgeScore.score.toFixed(1)}</p><p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Score</p></div>
              <div><p className="text-2xl font-black">{judgeScore.totalVerdicts}</p><p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Verdicts</p></div>
              <div><p className="text-2xl font-black text-[var(--accent-cyan)]">{judgeScore.fairRatings}</p><p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Fair</p></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <button onClick={() => setTab('verdicts')} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'verdicts' ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
            <MessageSquare size={14} /> Verdicts ({recentVerdicts?.length || 0})
          </button>
          <button onClick={() => setTab('cases')} className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'cases' ? 'bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
            <Flame size={14} /> Cases ({submittedCases?.length || 0})
          </button>
        </div>

        {/* Verdicts */}
        {tab === 'verdicts' && (
          <div className="space-y-2">
            {recentVerdicts?.length === 0 ? (
              <div className="glass-card p-8 text-center"><MessageSquare size={32} className="mx-auto text-[var(--text-muted)] mb-2" /><p className="text-sm text-[var(--text-secondary)]">No verdicts yet</p></div>
            ) : recentVerdicts?.map((v, i) => (
              <Link key={v.id} href={v.case ? `/case/${v.case.shareSlug}` : '#'} className="glass-card p-4 block space-y-2 hover:border-[var(--border-glow)] transition-all animate-slide-up active:scale-[0.98]" style={{ animationDelay: `${i * 50}ms` }}>
                {v.case && <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]">{v.case.category}</span><p className="text-xs font-bold truncate flex-1">{v.case.title}</p></div>}
                <div className="flex items-start gap-2">
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${SIDE_COLORS[v.side]}`}>{getSideLabel(v.side)}</span>
                  <p className="text-xs text-[var(--text-secondary)]">&ldquo;{v.reason}&rdquo;</p>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{timeAgo(v.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Cases */}
        {tab === 'cases' && (
          <div className="space-y-2">
            {submittedCases?.length === 0 ? (
              <div className="glass-card p-8 text-center"><Flame size={32} className="mx-auto text-[var(--text-muted)] mb-2" /><p className="text-sm text-[var(--text-secondary)]">No cases submitted</p></div>
            ) : submittedCases?.map((c, i) => (
              <Link key={c._id} href={`/case/${c.shareSlug}`} className="glass-card p-4 block space-y-2 hover:border-[var(--border-glow)] transition-all animate-slide-up active:scale-[0.98]" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]">{c.category}</span><TimeLeftBadge expiresAt={c.expiresAt} /></div>
                <h4 className="text-sm font-bold">{c.title}</h4>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]"><span className="flex items-center gap-1"><MessageSquare size={10} /> {formatCount(c.voteCount)} votes</span>{c.city && <span className="flex items-center gap-0.5"><MapPin size={10} /> {c.city}</span>}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
