'use client';

import { useAuth } from '@/modules/auth/AuthContext';
import { Flame, Radio } from 'lucide-react';

/**
 * Top bar — app name + branding.
 */
export default function TopBar() {
  const { copy } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)]"
      style={{
        background: 'rgba(10, 10, 15, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        <h1 className="text-lg font-extrabold tracking-tight">
          <span className="gradient-text"> {copy.general.appName}</span>
        </h1>
        <div className="flex items-center gap-1.5">
          <Radio size={10} className="text-green-500 pulse-live" />
          <span className="text-xs text-[var(--text-secondary)] font-medium">Live</span>
        </div>
      </div>
    </header>
  );
}
