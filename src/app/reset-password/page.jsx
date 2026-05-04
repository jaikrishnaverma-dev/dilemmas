'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import { api } from '@/shared/api/apiClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token 🔒');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords match nahi ho rahe ❌');
      return;
    }
    if (password.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Reset failed. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-[var(--bg-primary)]">
        <TopBar />
        <main className="max-w-lg mx-auto px-4 pt-20 text-center space-y-6">
          <div className="animate-slide-up">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 size={64} />
              </div>
            </div>
            <h2 className="text-xl font-extrabold">Password Reset Successful! ✅</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Aapka password update ho gaya hai. Ab aap login kar sakte hain.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="w-full mt-8 py-4 rounded-xl text-sm font-extrabold text-white
                bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20"
            >
              Go to Login
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-12 pb-nav space-y-6">
        <div className="text-center space-y-3 animate-slide-up">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
              <ShieldCheck size={48} />
            </div>
          </div>
          <h2 className="text-xl font-extrabold">Naya Password Banaiye</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Apna naya secure password chunye.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">New Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Naya password"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-4
                  text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Phir se wahi password"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-4
                  text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-4 rounded-xl text-sm font-extrabold text-white
              bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]
              active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
