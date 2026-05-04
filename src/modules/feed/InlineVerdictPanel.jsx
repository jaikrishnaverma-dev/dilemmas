'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Lock, MapPin, ArrowRight, ArrowLeft, BarChart3, ChevronDown, MessageSquare, Pencil, Trash2, X } from 'lucide-react';
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
  creator_note: 'text-[var(--accent-purple)] font-black italic',
};

/**
 * Inline verdict panel — expands below a CaseCard in the feed.
 * Shows quick vote + recent comments. Minimal version of the full case page.
 */
export default function InlineVerdictPanel({ caseData, onVoteSuccess }) {
  const { user, isLoggedIn, copy, languagePreference } = useAuth();
  const [selectedSide, setSelectedSide] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [verdicts, setVerdicts] = useState([]);
  const [verdictsLoading, setVerdictsLoading] = useState(true);
  
  // New state for Edit/Comment logic
  const [mode, setMode] = useState('verdict'); // 'verdict' or 'comment'
  const [editingId, setEditingId] = useState(null);

  const isCreator = user && caseData?.userId && (user.id?.toString() === caseData.userId?.toString());

  // Auto-select side for creator or if in comment mode
  useEffect(() => {
    if (isCreator) {
      setSelectedSide('creator_note');
      setMode('comment');
    }
  }, [isCreator]);

  // Load recent verdicts on mount
  useEffect(() => {
    loadVerdicts();
  }, [caseData.shareSlug]);

  const loadVerdicts = async () => {
    try {
      const data = await api.get(`/api/cases/${caseData.shareSlug}/verdicts?limit=10`);
      setVerdicts(data.verdicts);
      
      // Check if user has already voted
      if (user) {
        const userVerdict = data.verdicts.find(v => v.user?.id?.toString() === user.id?.toString() && v.type === 'verdict');
        if (userVerdict) {
          setHasVoted(true);
        }
      }
    } catch (err) {}
    setVerdictsLoading(false);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) { setError(copy.auth.loginRequired); return; }
    
    const isComment = mode === 'comment' || isCreator;
    if (!isComment && !selectedSide) { setError(copy.verdict.pickSide); return; }
    if (reason.trim().length < 3) { setError(copy.submission.minChars); return; }

    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        // UPDATE existing comment/verdict
        await api.patch(`/api/verdicts/${editingId}`, { reason: reason.trim() });
        setEditingId(null);
        setReason('');
      } else {
        // CREATE new
        await api.post('/api/verdicts', {
          caseId: caseData.id,
          side: isComment ? (isCreator ? 'creator_note' : 'situation_galat') : selectedSide,
          reason: reason.trim(),
          type: isComment ? 'comment' : 'verdict'
        });
        setReason('');
      }

      await loadVerdicts();
      if (!isComment && !editingId) {
        setHasVoted(true);
        onVoteSuccess?.();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setReason(v.reason);
    setMode(v.type);
  };

  const handleDelete = async (id) => {
    if (!confirm('Pakka delete karna hai?')) return;
    try {
      await api.delete(`/api/verdicts/${id}`);
      await loadVerdicts();
    } catch (err) {
      alert(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setReason('');
  };

  return (
    <div className="mt-3 space-y-3 animate-slide-up border-t border-[var(--border-subtle)] pt-3" onClick={(e) => e.stopPropagation()}>

      {/* Mode Toggle (Verdict vs Comment) - Only if not creator and not already voted (or editing verdict) */}
      {!isCreator && !editingId && (
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => setMode('verdict')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${mode === 'verdict' ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
          >
            {hasVoted ? 'Update Verdict' : 'Cast Verdict'}
          </button>
          <button 
            onClick={() => setMode('comment')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${mode === 'comment' ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}
          >
            Just Comment
          </button>
        </div>
      )}

      {editingId && (
        <div className="flex items-center justify-between px-3 py-1 bg-[var(--bg-elevated)] rounded-t-lg border-x border-t border-[var(--border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-widest">Editing {mode}...</span>
          <button onClick={cancelEdit} className="text-[var(--text-muted)] hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-2">
        {mode === 'verdict' && !editingId && (
          <div className="flex gap-1.5 mb-2">
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
        )}

        {isCreator && !editingId && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-purple)]">
              Posting as creator ✍️
            </span>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <MentionInput
              value={reason}
              onChange={setReason}
              placeholder={mode === 'comment' ? "Write a comment..." : (isCreator ? "Apna point of view daalo..." : copy.verdict.reasonHint)}
              maxLength={280}
              className={`text-xs px-3 py-2 ${editingId ? 'rounded-b-lg border-t-0' : 'rounded-lg'}`}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white h-[38px] transition-all active:scale-95 disabled:opacity-50
              ${mode === 'comment' ? 'bg-[var(--accent-purple)]' : 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]'}`}
          >
            {submitting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingId ? 'Save' : <Send size={14} />)}
          </button>
        </div>
        {error && <p className="text-[10px] text-[var(--accent-orange)] flex items-center gap-1 mt-1"><Lock size={10} /> {error}</p>}
      </div>

      {/* Recent verdicts & comments */}
      <div className="space-y-1.5 mt-4">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
          <MessageSquare size={10} /> {copy.verdict.recentVerdicts} & Comments
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
            <div key={v.id} className="flex gap-2 items-start py-1.5 group">
              <Link href={`/user/${v.user.username}`} onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
                  flex items-center justify-center text-[10px] font-black shrink-0 hover:border-[var(--accent-purple)] transition-colors">
                {v.user.username?.charAt(0).toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/user/${v.user.username}`} onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-bold hover:text-[var(--accent-purple)] transition-colors">@{v.user.username}</Link>
                    <span className={`text-[9px] font-bold ${v.type === 'comment' ? 'text-[var(--text-muted)]' : SIDE_COLORS[v.side]}`}>
                      {v.side === 'creator_note' ? 'Creator' : (v.type === 'comment' ? 'Comment' : getSideLabel(v.side, languagePreference))}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)]">{timeAgo(v.createdAt)}</span>
                  </div>
                  
                  {/* Edit/Delete Actions */}
                  {user && v.user?.id?.toString() === user.id?.toString() && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(v)} className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
                        <Pencil size={10} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
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
