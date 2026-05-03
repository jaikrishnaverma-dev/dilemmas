'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, MapPin, UserPlus, UserCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthContext';

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Chandigarh', 'Indore', 'Bhopal', 'Noida', 'Gurgaon', 'Other'];

/**
 * Signup sheet component with city selection.
 */
export default function SignupSheet({ onSuccess, onSwitch }) {
  const { signup, copy } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', city: '', gender: 'prefer_not_to_say', ageBracket: '18-24' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-5 animate-slide-up">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
          <UserPlus size={20} />
        </div>
        <h3 className="text-xl font-black">{copy.auth.signupTitle}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <User size={18} />
          </div>
          <input
            type="text"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            placeholder="Username (e.g. naya_judge)"
            maxLength={30}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-4
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-purple)] transition-all"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-12 py-4
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-purple)] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* City picker */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <MapPin size={18} />
          </div>
          <select
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-4
              text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] transition-all
              appearance-none"
          >
            <option value="">{copy.auth.cityPlaceholder}</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
            <UserCircle size={12} /> {copy.auth.gender}
          </p>
          <div className="flex gap-2">
            {[
              { id: 'male', label: copy.auth.male },
              { id: 'female', label: copy.auth.female },
              { id: 'other', label: copy.auth.other }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => update('gender', g.id)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border
                  ${form.gender === g.id
                    ? 'bg-[var(--accent-purple)]/10 border-[var(--accent-purple)] text-[var(--accent-purple)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age Selection */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
            <Calendar size={12} /> {copy.auth.ageBracket}
          </p>
          <div className="flex gap-2">
            {['13-17', '18-24', '25-34', '35+'].map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => update('ageBracket', age)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border
                  ${form.ageBracket === age
                    ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)] text-[var(--accent-cyan)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'}`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-[var(--accent-orange)] font-bold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
            bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
            disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20 shake-cta"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><UserPlus size={18} /> {copy.buttons.signup}</>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-muted)] font-medium">
        {copy.auth.hasAccount}{' '}
        <button onClick={onSwitch} className="text-[var(--accent-purple)] font-bold hover:underline">{copy.buttons.login}</button>
      </p>
    </div>
  );
}
