'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, MapPin, MessageSquare, BarChart3,
  Send, Lock, Users, ChevronDown, Filter, ThumbsUp, ThumbsDown
} from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import VerdictSplitBar from '@/shared/components/VerdictSplitBar';
import TimeLeftBadge from '@/shared/components/TimeLeftBadge';
import ShareButton from '@/shared/components/ShareButton';
import { CaseCardSkeleton } from '@/shared/components/LoadingPulse';
import MentionText from '@/shared/components/MentionText';
import MentionInput from '@/shared/components/MentionInput';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';
import { getSideLabel } from '@/shared/utils/i18n';
import { isExpired, timeAgo } from '@/shared/utils/timeAgo';

const SIDE_OPTIONS = [
  { value: 'teri_galti',      icon: ArrowRight, color: 'border-[var(--accent-orange)] bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]', dotColor: 'bg-[var(--accent-orange)]' },
  { value: 'uski_galti',      icon: ArrowLeft,  color: 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]', dotColor: 'bg-[var(--accent-purple)]' },
  { value: 'situation_galat', icon: BarChart3,   color: 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]', dotColor: 'bg-[var(--accent-cyan)]' },
];

const SIDE_COLORS = {
  teri_galti: 'text-[var(--accent-orange)]',
  uski_galti: 'text-[var(--accent-purple)]',
  situation_galat: 'text-[var(--accent-cyan)]',
};

const SIDE_DOT_COLORS = {
  teri_galti: 'bg-[var(--accent-orange)]',
  uski_galti: 'bg-[var(--accent-purple)]',
  situation_galat: 'bg-[var(--accent-cyan)]',
};

export default function CaseVerdictPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const { user, isLoggedIn, copy, languagePreference } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSide, setSelectedSide] = useState('');
  const [reason, setReason] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [shareData, setShareData] = useState(null);

  // Voters / comments state
  const [verdicts, setVerdicts] = useState([]);
  const [verdictsLoading, setVerdictsLoading] = useState(false);
  const [verdictsPage, setVerdictsPage] = useState(1);
  const [verdictsHasMore, setVerdictsHasMore] = useState(false);
  const [sideFilter, setSideFilter] = useState('');
  const [showVoters, setShowVoters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/api/cases/${slug}`);
        setCaseData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // Auto-open voters section if coming from a @mention notification
  useEffect(() => {
    if (highlightId) setShowVoters(true);
  }, [highlightId]);

  // Load verdicts (voters list)
  const loadVerdicts = async (page = 1, append = false) => {
    setVerdictsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (sideFilter) params.set('side', sideFilter);
      if (highlightId && page === 1) params.set('highlight', highlightId);
      const data = await api.get(`/api/cases/${slug}/verdicts?${params}`);
      if (append) {
        setVerdicts(prev => [...prev, ...data.verdicts]);
      } else {
        setVerdicts(data.verdicts);
      }
      setVerdictsHasMore(data.pagination.hasMore);
    } catch {}
    setVerdictsLoading(false);
  };

  // Load verdicts when section opens or filter changes
  useEffect(() => {
    if (showVoters) {
      setVerdictsPage(1);
      loadVerdicts(1, false);
    }
  }, [showVoters, sideFilter]);

  const loadMoreVerdicts = () => {
    const next = verdictsPage + 1;
    setVerdictsPage(next);
    loadVerdicts(next, true);
  };

  const handleVote = async () => {
    if (!isLoggedIn) {
      setError(copy.auth.loginRequired);
      return;
    }
    if (!selectedSide) { setError(copy.verdict.pickSide); return; }
    if (reason.trim().length < 3) { setError(copy.verdict.reasonRequired); return; }

    setSubmitting(true);
    setError('');
    try {
      const data = await api.post('/api/verdicts', {
        caseId: caseData.id,
        side: selectedSide,
        reason: reason.trim(),
      });

      setHasVoted(true);

      // Load results
      const res = await api.get(`/api/verdicts/${caseData.id}/results`);
      setResults(res);
      setShowResults(true);
      setShowVoters(true); // Auto-show voters after voting

      // Generate share card
      try {
        const share = await api.post('/api/share/generate', { verdictId: data.verdictId });
        setShareData({
          caseTitle: caseData.title,
          side: getSideLabel(selectedSide, languagePreference),
          agreePercent: share.cardData.agreePercent,
          fullUrl: share.fullUrl,
          caseSlug: slug,
        });
      } catch {}

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-4"><CaseCardSkeleton /><CaseCardSkeleton /></main>
      <BottomNav />
    </div>
  );

  if (!caseData) return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-20 text-center">
        <p className="text-[var(--text-secondary)]">{copy.search.noResults}</p>
      </main>
      <BottomNav />
    </div>
  );

  const expired = isExpired(caseData.expiresAt);

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-nav space-y-4">

        {/* Case detail card */}
        <div className="glass-card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]">
              {caseData.category}
            </span>
            <TimeLeftBadge expiresAt={caseData.expiresAt} />
          </div>

          <h2 className="text-xl font-extrabold leading-snug">{caseData.title}</h2>
          {/* Render rich HTML context or plain text fallback */}
          {caseData.context?.includes('<') ? (
            <div
              className="prose-editor text-sm text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: caseData.context }}
            />
          ) : (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{caseData.context}</p>
          )}

          <VerdictSplitBar voteSplit={caseData.voteSplit} totalVotes={caseData.voteCount} />

          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
              <MessageSquare size={12} /> {caseData.voteCount} {copy.feed.votes}
            </span>
            {caseData.city && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {caseData.city}
              </span>
            )}
          </div>
        </div>

        {/* Voting panel (if not voted and not expired) */}
        {!hasVoted && !expired && (
          <div className="glass-card p-5 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-base font-bold">{copy.verdict.pickSide}</h3>

            <div className="grid grid-cols-1 gap-2">
              {SIDE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedSide(opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left
                      ${selectedSide === opt.value
                        ? opt.color + ' scale-[1.02]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'}`}
                  >
                    <Icon size={18} />
                    <span className="font-bold text-sm">{getSideLabel(opt.value, languagePreference)}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <MentionInput
                value={reason}
                onChange={setReason}
                placeholder={copy.verdict.reasonHint}
                maxLength={280}
                multiline={true}
                rows={3}
              />
              <p className="text-right text-xs text-[var(--text-muted)]">{reason.length}/280</p>
            </div>

            {error && <p className="text-sm text-[var(--accent-orange)] flex items-center gap-1"><Lock size={14} /> {error}</p>}

            <button
              onClick={handleVote}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                hover:shadow-lg hover:shadow-[var(--accent-pink)]/25
                disabled:opacity-50 transition-all duration-200 active:scale-95 shake-cta"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Send size={16} /> {copy.buttons.vote}</>
              )}
            </button>
          </div>
        )}

        {/* Results panel */}
        {(showResults || expired) && results && (
          <div className="glass-card p-5 space-y-4 animate-slide-up glow-effect" style={{ animationDelay: '200ms' }}>
            <h3 className="text-base font-bold gradient-text flex items-center gap-2">
              <BarChart3 size={18} /> Results Reveal
            </h3>

            <VerdictSplitBar voteSplit={results.overall} totalVotes={results.totalVotes} />

            {/* City breakdown */}
            {results.citySplit?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <MapPin size={14} /> City Breakdown
                </h4>
                {results.citySplit.map((city) => (
                  <div key={city._id} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-primary)] font-medium">{city._id}</span>
                    <div className="flex gap-2">
                      {city.splits.map((s) => (
                        <span key={s.side} className={`font-semibold ${SIDE_COLORS[s.side] || 'text-[var(--text-muted)]'}`}>
                          {getSideLabel(s.side, languagePreference)}: {Math.round((s.count / city.total) * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Share CTA */}
            {shareData && (
              <div className="space-y-3 pt-2">
                <div className="glass-card p-4 text-center">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {copy.share.cardTitle} <span className="gradient-text">{shareData.side}</span>
                  </p>
                  <p className="text-2xl font-black gradient-text mt-1">{shareData.agreePercent}% {copy.share.agreesWith}</p>
                </div>
                <ShareButton shareData={shareData} />
              </div>
            )}
          </div>
        )}

        {/* Voters / Comments section — toggle */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button
            onClick={() => setShowVoters(!showVoters)}
            className="w-full glass-card p-4 flex items-center justify-between text-sm font-bold
              hover:border-[var(--border-glow)] transition-all active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <Users size={16} className="text-[var(--accent-purple)]" />
              {copy.verdict.verdictsAndComments} ({caseData.voteCount})
            </span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${showVoters ? 'rotate-180' : ''}`} />
          </button>

          {showVoters && (
            <div className="mt-3 space-y-3">
              {/* Side filter tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSideFilter('')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap
                    ${!sideFilter
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >
                  <Filter size={10} /> {copy.categories.all}
                </button>
                {SIDE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSideFilter(opt.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap
                      ${sideFilter === opt.value
                        ? opt.color.replace('border-', 'border border-')
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                    {getSideLabel(opt.value, languagePreference)}
                  </button>
                ))}
              </div>

              {/* Verdicts list */}
              {verdictsLoading && verdicts.length === 0 ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="glass-card p-4 animate-pulse space-y-2">
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)]" />
                        <div className="h-3 w-20 rounded bg-[var(--bg-elevated)]" />
                      </div>
                      <div className="h-4 w-full rounded bg-[var(--bg-elevated)]" />
                    </div>
                  ))}
                </div>
              ) : verdicts.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <MessageSquare size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">{copy.verdict.noVerdicts}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {verdicts.map((v, i) => (
                    <div
                      key={v.id}
                      id={`verdict-${v.id}`}
                      className={`glass-card p-4 space-y-2 animate-slide-up
                        ${v.isHighlighted ? 'border-[var(--accent-purple)] glow-effect' : ''}`}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Highlighted tag */}
                      {v.isHighlighted && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-purple)] mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)] pulse-live" />
                          {copy.verdict.taggedComment}
                        </div>
                      )}
                      {/* User row */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/user/${v.user.username}`}
                          onClick={(e) => { if (v.user.username === 'Anonymous') e.preventDefault(); }}
                          className="flex items-center gap-2.5 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)]
                            border border-[var(--border-subtle)] flex items-center justify-center text-xs font-black text-[var(--text-primary)]
                            group-hover:border-[var(--accent-purple)] transition-colors">
                            {v.user.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold group-hover:text-[var(--accent-purple)] transition-colors">
                              @{v.user.username}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                              {v.city && <span className="flex items-center gap-0.5"><MapPin size={8} /> {v.city}</span>}
                              <span>{timeAgo(v.createdAt)}</span>
                            </div>
                          </div>
                        </Link>

                        {/* Side badge */}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${SIDE_COLORS[v.side]}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${SIDE_DOT_COLORS[v.side]}`} />
                          {getSideLabel(v.side, languagePreference)}
                        </span>
                      </div>

                      {/* Reason with @mention rendering */}
                      <div className="text-sm text-[var(--text-secondary)] leading-relaxed pl-10">
                        &ldquo;<MentionText text={v.reason} />&rdquo;
                      </div>
                    </div>
                  ))}

                  {/* Load more */}
                  {verdictsHasMore && (
                    <button
                      onClick={loadMoreVerdicts}
                      disabled={verdictsLoading}
                      className="w-full py-3 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)]
                        hover:text-[var(--text-primary)] transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      {verdictsLoading ? (
                        <div className="w-4 h-4 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><ChevronDown size={14} /> {copy.verdict.loadMore}</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
