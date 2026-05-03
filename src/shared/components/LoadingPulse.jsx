'use client';

/**
 * Loading pulse skeleton — used during data fetch.
 * Provides visual continuity and perceived performance.
 */
export default function LoadingPulse({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-[var(--bg-elevated)] animate-pulse"
          style={{ width: `${90 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Full card skeleton for feed loading.
 */
export function CaseCardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-20 rounded-full bg-[var(--bg-elevated)]" />
        <div className="h-5 w-16 rounded-full bg-[var(--bg-elevated)]" />
      </div>
      <div className="h-5 w-3/4 rounded bg-[var(--bg-elevated)]" />
      <div className="h-4 w-full rounded bg-[var(--bg-elevated)]" />
      <div className="h-3 w-full rounded-full bg-[var(--bg-elevated)]" />
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]" />
        <div className="h-4 w-16 rounded bg-[var(--bg-elevated)]" />
      </div>
    </div>
  );
}

/**
 * Feed-level skeleton — multiple card skeletons stacked.
 */
export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <CaseCardSkeleton key={i} />
      ))}
    </div>
  );
}
