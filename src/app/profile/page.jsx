'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, LogOut, BarChart2, ShieldCheck, Trophy, ChevronRight, UserCircle, LogIn, UserPlus, Globe } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import JudgeBadgeIcon from '@/shared/components/JudgeBadgeIcon';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';
import { getBadgeLabel } from '@/shared/utils/i18n';
import LoginSheet from '@/modules/auth/LoginSheet';
import SignupSheet from '@/modules/auth/SignupSheet';

export default function ProfilePage() {
  const { user, isLoggedIn, logout, copy, changeLanguage } = useAuth();
  const router = useRouter();
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.get(`/api/judge-score/${user.id}`)
      .then(setScoreData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, user]);

  // Not logged in — show auth
  if (!isLoggedIn) {
    return (
      <div className="min-h-dvh bg-[var(--bg-primary)]">
        <TopBar />
        <main className="max-w-lg mx-auto px-4 pt-12 pb-nav space-y-6">
          <div className="text-center space-y-4 animate-slide-up">
            <div className="flex justify-center">
              <div className="p-5 rounded-full bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
                <ShieldCheck size={56} />
              </div>
            </div>
            <h2 className="text-xl font-extrabold">{copy.auth.signupTitle}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Account banao, Judge Score build karo, aur apni identity lock karo.
            </p>
          </div>

          {showSignup ? (
            <SignupSheet onSuccess={() => setShowSignup(false)} onSwitch={() => { setShowSignup(false); setShowLogin(true); }} />
          ) : showLogin ? (
            <LoginSheet onSuccess={() => setShowLogin(false)} onSwitch={() => { setShowLogin(false); setShowSignup(true); }} />
          ) : (
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <button
                onClick={() => setShowSignup(true)}
                className="w-full py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                  bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                  active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20 shake-cta"
              >
                <UserPlus size={18} /> {copy.buttons.signup}
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2
                  bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]
                  active:scale-95 transition-all"
              >
                <LogIn size={18} /> {copy.buttons.login}
              </button>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-5">

        {/* Profile header */}
        <div className="glass-card p-6 text-center space-y-3 animate-slide-up">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-pink)]
              flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[var(--accent-pink)]/10">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[var(--bg-primary)] p-1 rounded-full">
              <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold">@{user.username}</h2>
            {user.city && (
              <span className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1 mt-1">
                <MapPin size={10} /> {user.city}
              </span>
            )}
          </div>
          {scoreData && <JudgeBadgeIcon badge={scoreData.currentBadge} size="lg" />}
        </div>

        {/* Judge Score stats */}
        {scoreData && (
          <div className="glass-card p-6 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <BarChart2 size={16} /> JUDGE ANALYTICS
              </h3>
              <span className="text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 px-2 py-0.5 rounded-full">
                Rank #{scoreData.rank || 'N/A'}
              </span>
            </div>

            {/* Score display */}
            <div className="text-center py-2">
              <p className="text-6xl font-black gradient-text">{scoreData.score.toFixed(1)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-bold tracking-widest uppercase">Fairness Quotient</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 text-center border border-[var(--border-subtle)]">
                <p className="text-2xl font-black text-[var(--text-primary)]">{scoreData.totalVerdicts}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-1">{copy.judgeScore.totalVerdicts}</p>
              </div>
              <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 text-center border border-[var(--border-subtle)]">
                <p className="text-2xl font-black text-[var(--accent-cyan)]">{scoreData.fairRatings}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-1">{copy.judgeScore.fairRatings}</p>
              </div>
            </div>

            {/* Progress to next badge */}
            {scoreData.nextBadge && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-secondary)]">NEXT: {getBadgeLabel(scoreData.nextBadge, user.languagePreference).toUpperCase()}</span>
                  <span className="text-[var(--accent-purple)]">{scoreData.verdictsToNextBadge} {copy.judgeScore.nextBadge}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] animate-bar shadow-sm shadow-[var(--accent-cyan)]/20"
                    style={{
                      width: `${Math.min(100, 100 - (scoreData.verdictsToNextBadge / (scoreData.totalVerdicts + scoreData.verdictsToNextBadge)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings / Action List */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          
          {/* Language Selector */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
              <Globe size={16} /> SELECT LANGUAGE
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'english', label: 'English' },
                { id: 'hinglish', label: 'Hinglish' },
                { id: 'hindi', label: 'Hindi (हिंदी)' },
                { id: 'telugu', label: 'Telugu (తెలుగు)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => changeLanguage(lang.id)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border
                    ${(user.languagePreference === lang.id || (!user.languagePreference && lang.id === 'hinglish'))
                      ? 'bg-[var(--accent-purple)]/10 border-[var(--accent-purple)] text-[var(--accent-purple)]'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => router.push('/leaderboard')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Trophy size={18} />
              </div>
              <span className="text-sm font-bold">{copy.judgeScore.leaderboard}</span>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>

          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-red-500/10 group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold text-red-400">{copy.buttons.logout}</span>
            </div>
          </button>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
