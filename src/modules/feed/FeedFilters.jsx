import { useAuth } from '@/modules/auth/AuthContext';
import { Flame, Sparkles, Clock, Heart, Briefcase, Users, GraduationCap, Wallet, Home, Smartphone, Globe, HandHeart } from 'lucide-react';

const FILTERS = [
  { key: 'latest', icon: Sparkles },
  { key: 'trending', icon: Flame },
  { key: 'expiring', icon: Clock },
];

const CATEGORIES = [
  { slug: '', key: 'all', icon: Globe },
  { slug: 'politics', key: 'politics', icon: Globe },
  { slug: 'relationship', key: 'relationship', icon: Heart },
  { slug: 'tv-shows', key: 'tv-shows', icon: Smartphone },
  { slug: 'family', key: 'family', icon: Users },
  { slug: 'friendship', key: 'friendship', icon: HandHeart },
  { slug: 'college', key: 'college', icon: GraduationCap },
  { slug: 'workplace', key: 'workplace', icon: Briefcase },
  { slug: 'money', key: 'money', icon: Wallet },
  { slug: 'roommate', key: 'roommate', icon: Home },
  { slug: 'desi', key: 'desi', icon: Globe },
];

/**
 * Feed filters — sort + category selection.
 * Horizontally scrollable chips (mobile-first).
 */
export default function FeedFilters({ sort, category, onSortChange, onCategoryChange }) {
  const { copy } = useAuth();

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
              <Icon size={14} /> {copy.feed[f.key]}
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
              <Icon size={12} /> {copy.categories[c.key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
