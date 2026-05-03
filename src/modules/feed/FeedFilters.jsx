'use client';

import { Flame, Sparkles, Clock, Heart, Briefcase, Users, GraduationCap, Wallet, Home, Smartphone, Globe, HelpCircle, HandHeart } from 'lucide-react';

const FILTERS = [
  { key: 'trending', label: 'Trending', icon: Flame },
  { key: 'latest', label: 'Latest', icon: Sparkles },
  { key: 'expiring', label: 'Expiring', icon: Clock },
];

const CATEGORIES = [
  { slug: '', label: 'All', icon: Globe },
  { slug: 'politics', label: 'Politics', icon: Globe },
  { slug: 'relationship', label: 'Relationship', icon: Heart },
  { slug: 'tv-shows', label: 'TV Shows', icon: Smartphone },
  { slug: 'family', label: 'Family', icon: Users },
  { slug: 'friendship', label: 'Friendship', icon: HandHeart },
  { slug: 'college', label: 'College', icon: GraduationCap },
  { slug: 'workplace', label: 'Workplace', icon: Briefcase },
  { slug: 'money', label: 'Money', icon: Wallet },
  { slug: 'roommate', label: 'Roommate', icon: Home },
  { slug: 'desi', label: 'Desi', icon: Globe },
];

/**
 * Feed filters — sort + category selection.
 * Horizontally scrollable chips (mobile-first).
 */
export default function FeedFilters({ sort, category, onSortChange, onCategoryChange }) {
  return (
    <div className="space-y-3">
      {/* Sort buttons */}
      <div className="flex gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              onClick={() => onSortChange(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap
                ${sort === f.key
                  ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)] text-white shadow-lg shadow-[var(--accent-pink)]/20'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <Icon size={14} /> {f.label}
            </button>
          );
        })}
      </div>

      {/* Category chips — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.slug}
              id={`cat-${c.slug || 'all'}`}
              onClick={() => onCategoryChange(c.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap
                ${category === c.slug
                  ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border border-[var(--accent-purple)]/30'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-secondary)]'}`}
            >
              <Icon size={12} /> {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
