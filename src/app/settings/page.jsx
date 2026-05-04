'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, ShieldAlert, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';

export default function SettingsPage() {
  const router = useRouter();
  const { user, copy, changeLanguage, currentLanguage } = useAuth();
  
  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Naya password match nahi ho raha bhai ❌');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/api/auth/change-password', { oldPassword, newPassword });
      setSuccess('Password update ho gaya! ✅');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-dvh bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-extrabold uppercase tracking-tight">Settings</h2>
        </div>

        {/* Language Selector */}
        <section className="glass-card p-6 space-y-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
              <Globe size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)]">
              {copy?.settings?.selectLanguage || 'SELECT LANGUAGE'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'english', label: copy?.settings?.english || 'English' },
              { id: 'hinglish', label: copy?.settings?.hinglish || 'Hinglish' },
              { id: 'hindi', label: copy?.settings?.hindi || 'Hindi' },
              { id: 'telugu', label: copy?.settings?.telugu || 'Telugu' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => changeLanguage(lang.id)}
                className={`py-4 rounded-xl text-xs font-bold transition-all border
                  ${currentLanguage === lang.id
                    ? 'bg-[var(--accent-purple)]/10 border-[var(--accent-purple)] text-[var(--accent-purple)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </section>

        {/* Change Password Section */}
        <section className="glass-card p-6 space-y-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
              <Lock size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)]">Change Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Purana password daalo"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-sm
                  focus:outline-none focus:border-[var(--accent-purple)] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Naya wala password"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-sm
                  focus:outline-none focus:border-[var(--accent-purple)] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Phir se naya password"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-sm
                  focus:outline-none focus:border-[var(--accent-purple)] transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/20 animate-shake">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/5 p-3 rounded-xl border border-green-400/20 animate-slide-up">
                <CheckCircle2 size={14} /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-extrabold text-white
                bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]
                active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Account Deletion (Mocked for UI completeness) */}
        <section className="glass-card p-6 space-y-4 border-red-500/10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)]">Danger Zone</h3>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
            Deleting your account will permanently remove all your verdicts, cases, and judge score. This action cannot be undone.
          </p>
          <button
            className="w-full py-3.5 rounded-xl text-xs font-bold text-red-400 border border-red-400/20 hover:bg-red-400/5 transition-all"
          >
            Delete Account
          </button>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
