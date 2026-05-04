'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';

/**
 * Login bottom sheet component.
 */
export default function LoginSheet({ onSuccess, onSwitch }) {
  const { login, copy } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: resetEmail });
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div className="glass-card p-6 space-y-5 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
            <Lock size={20} />
          </div>
          <h3 className="text-xl font-black">Reset Password</h3>
        </div>

        {resetSent ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              Reset link bhej diya gaya hai! Check your inbox 📧
            </p>
            <button
              onClick={() => { setShowForgot(false); setResetSent(false); }}
              className="text-xs font-bold text-[var(--accent-purple)] hover:underline"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Apna registered email daalo, hum reset link bhej denge.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-4
                text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent-purple)] transition-all"
              required
            />
            {error && <p className="text-xs text-[var(--accent-orange)] font-bold">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-extrabold text-white
                bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]
                disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20"
            >
              {loading ? 'Bhej rahe hain...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-5 animate-slide-up">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]">
          <LogIn size={20} />
        </div>
        <h3 className="text-xl font-black">{copy.auth.loginTitle}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <User size={18} />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={copy.auth.username}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-4
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-orange)] transition-all"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={copy.auth.password}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-12 py-4
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-orange)] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-[10px] font-bold text-[var(--accent-purple)] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-xs text-[var(--accent-orange)] font-bold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
            bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
            disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><LogIn size={18} /> {copy.buttons.login}</>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-muted)] font-medium">
        {copy.auth.noAccount}{' '}
        <button onClick={onSwitch} className="text-[var(--accent-purple)] font-bold hover:underline">{copy.buttons.signup}</button>
      </p>
    </div>
  );
}
