'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, LogOut, BarChart2, ShieldCheck, Trophy, ChevronRight, UserCircle, LogIn, UserPlus, Globe, Settings } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState('verdicts'); // 'cases' | 'verdicts'
  const [userContent, setUserContent] = useState({ cases: [], verdicts: [] });
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    
    // Fetch stats
    api.get(`/api/judge-score/${user.id}`)
      .then(setScoreData)
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch user content (cases/verdicts)
    setContentLoading(true);
    api.get('/api/user/me/content')
      .then(setUserContent)
      .catch(() => {})
      .finally(() => setContentLoading(false));
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
              {copy.auth.lockIdentityHint || 'Create an account to track your judge score and badges.'}
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
        <div className="glass-card p-6 space-y-4 animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="relative w-20 h-20">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-pink)]
                flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[var(--accent-pink)]/10">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[var(--bg-primary)] p-1 rounded-full">
                <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)]" />
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/settings')}
              className="p-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] active:scale-90 transition-all"
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold">@{user.username}</h2>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-bold">
              {user.city && <span className="flex items-center gap-1"><MapPin size={10} /> {user.city}</span>}
              {scoreData && <span className="text-[var(--accent-purple)]">{scoreData.totalVerdicts} Verdicts</span>}
            </div>
          </div>

          {scoreData && (
            <div className="flex items-center gap-2">
              <JudgeBadgeIcon badge={scoreData.currentBadge} size="sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Rank #{scoreData.rank || 'N/A'}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {scoreData && (
          <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="glass-card p-3 text-center space-y-1">
              <p className="text-lg font-black text-[var(--accent-orange)]">{scoreData.score.toFixed(1)}</p>
              <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Score</p>
            </div>
            <div className="glass-card p-3 text-center space-y-1">
              <p className="text-lg font-black text-[var(--accent-cyan)]">{scoreData.fairRatings}</p>
              <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Fair</p>
            </div>
            <div className="glass-card p-3 text-center space-y-1">
              <p className="text-lg font-black text-white">{userContent.cases.length}</p>
              <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cases</p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[var(--border-subtle)] animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            { id: 'verdicts', label: 'My Verdicts', icon: BarChart2 },
            { id: 'cases', label: 'My Cases', icon: UserCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold transition-all relative
                ${activeTab === tab.id ? 'text-white' : 'text-[var(--text-muted)]'}`}
            >
              <tab.icon size={16} /> {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]" />
              )}
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
          {contentLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'verdicts' ? (
            userContent.verdicts.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <BarChart2 size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
                <p className="text-sm font-bold text-[var(--text-secondary)]">No verdicts yet</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Start judging cases to build your score!</p>
              </div>
            ) : (
              userContent.verdicts.map((v, i) => (
                <div 
                  key={v._id} 
                  className="glass-card p-4 flex items-center justify-between hover:border-[var(--border-glow)] transition-all cursor-pointer group active:scale-[0.98]"
                  onClick={() => router.push(`/case/${v.caseId?.shareSlug}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded
                        ${v.side === 'teri_galti' ? 'bg-orange-500/10 text-orange-400' : 
                          v.side === 'uski_galti' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                        {v.side.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold line-clamp-1">{v.caseId?.title || 'Case not found'}</p>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 italic">&ldquo;{v.reason}&rdquo;</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                </div>
              ))
            )
          ) : (
            userContent.cases.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <UserCircle size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
                <p className="text-sm font-bold text-[var(--text-secondary)]">No cases posted</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Submit your first dilemma now!</p>
                <button 
                  onClick={() => router.push('/submit')}
                  className="mt-4 px-6 py-2 rounded-full bg-[var(--accent-purple)] text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Post Case
                </button>
              </div>
            ) : (
              userContent.cases.map((c, i) => (
                <div 
                  key={c._id} 
                  className="glass-card p-4 flex items-center justify-between hover:border-[var(--border-glow)] transition-all cursor-pointer group active:scale-[0.98]"
                  onClick={() => router.push(`/case/${c.shareSlug}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold line-clamp-1">{c.title}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                      <span>{c.voteCount || 0} votes</span>
                      <span className={new Date(c.expiresAt) > new Date() ? 'text-green-400' : 'text-red-400'}>
                        {new Date(c.expiresAt) > new Date() ? 'Live' : 'Expired'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                </div>
              ))
            )
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
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
