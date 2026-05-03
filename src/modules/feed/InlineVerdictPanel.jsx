'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Lock, MapPin, ArrowRight, ArrowLeft, BarChart3, ChevronDown, MessageSquare } from 'lucide-react';
import MentionText from '@/shared/components/MentionText';
import MentionInput from '@/shared/components/MentionInput';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';
import { getSideLabel } from '@/shared/utils/i18n';
import { timeAgo } from '@/shared/utils/timeAgo';

const SIDE_OPTIONS = [
  { value: 'teri_galti',      icon: ArrowRight, color: 'border-[var(--accent-orange)] bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]' },
  { value: 'uski_galti',      icon: ArrowLeft,  color: 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]' },
  { value: 'situation_galat', icon: BarChart3,   color: 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' },
];

const SIDE_COLORS = {
  teri_galti: 'text-[var(--accent-orange)]',
  uski_galti: 'text-[var(--accent-purple)]',
  situation_galat: 'text-[var(--accent-cyan)]',
};

/**
 * Inline verdict panel — expands below a CaseCard in the feed.
 * Shows quick vote + recent comments. Minimal version of the full case page.
 */
export default function InlineVerdictPanel({ caseData, onVoteSuccess }) {
  const { isLoggedIn, copy, languagePreference } = useAuth();
  const [selectedSide, setSelectedSide] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [verdicts, setVerdicts] = useState([]);
  const [verdictsLoading, setVerdictsLoading] = useState(true);

  // Load recent verdicts on mount
  useEffect(() => {
    api.get(`/api/cases/${caseData.shareSlug}/verdicts?limit=5`)
      .then(data => setVerdicts(data.verdicts))
      .catch(() => {})
      .finally(() => setVerdictsLoading(false));
  }, [caseData.shareSlug]);

  const handleVote = async () => {
    if (!isLoggedIn) { setError(copy.auth.loginRequired); return; }
    if (!selectedSide) { setError(copy.verdict.pickSide); return; }
    if (reason.trim().length < 3) { setError(copy.submission.minChars); return; }

    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/verdicts', {
        caseId: caseData.id,
        side: selectedSide,
        reason: reason.trim(),
      });
      setHasVoted(true);
      onVoteSuccess?.();
      // Reload verdicts to show the new one
      const data = await api.get(`/api/cases/${caseData.shareSlug}/verdicts?limit=5`);
      setVerdicts(data.verdicts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 animate-slide-up border-t border-[var(--border-subtle)] pt-3" onClick={(e) => e.stopPropagation()}>

      {/* Quick vote (if not voted) */}
      {!hasVoted && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[var(--text-secondary)]">{copy.verdict.quickVerdict}</p>
          <div className="flex gap-1.5">
            {SIDE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedSide(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border text-[10px] font-bold transition-all
                    ${selectedSide === opt.value
                      ? opt.color + ' border-current scale-[1.02]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)]'}`}
                >
                  <Icon size={12} />{getSideLabel(opt.value, languagePreference).split(' ')[0]}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <MentionInput
                value={reason}
                onChange={setReason}
                placeholder={copy.verdict.reasonHint}
                maxLength={280}
                className="text-xs rounded-lg px-3 py-2"
              />
            </div>
            <button
              onClick={handleVote}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white h-[38px]
                bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                disabled:opacity-50 active:scale-95 transition-all"
            >
              {submitting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          {error && <p className="text-[10px] text-[var(--accent-orange)] flex items-center gap-1"><Lock size={10} /> {error}</p>}
        </div>
      )}

      {hasVoted && (
        <div className="text-center py-2">
          <p className="text-xs font-bold text-[var(--accent-cyan)]">{copy.verdict.verdictDone} \u2192</p>
        </div>
      )}

      {/* Recent verdicts */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
          <MessageSquare size={10} /> {copy.verdict.recentVerdicts}
        </p>

        {verdictsLoading ? (
          <div className="space-y-2">
            {[1,2].map(i => (
              <div key={i} className="animate-pulse flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] shrink-0" />
                <div className="flex-1 space-y-1"><div className="h-2.5 w-16 rounded bg-[var(--bg-elevated)]" /><div className="h-2.5 w-full rounded bg-[var(--bg-elevated)]" /></div>
              </div>
            ))}
          </div>
        ) : verdicts.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] py-2">{copy.verdict.noVerdicts}</p>
        ) : (
          verdicts.map(v => (
            <div key={v.id} className="flex gap-2 items-start py-1.5">
              <Link href={`/user/${v.user.username}`} onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
                  flex items-center justify-center text-[10px] font-black shrink-0 hover:border-[var(--accent-purple)] transition-colors">
                {v.user.username?.charAt(0).toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link href={`/user/${v.user.username}`} onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-bold hover:text-[var(--accent-purple)] transition-colors">@{v.user.username}</Link>
                  <span className={`text-[9px] font-bold ${SIDE_COLORS[v.side]}`}>{getSideLabel(v.side, languagePreference)}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">{timeAgo(v.createdAt)}</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] leading-snug mt-0.5">
                  <MentionText text={v.reason} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
