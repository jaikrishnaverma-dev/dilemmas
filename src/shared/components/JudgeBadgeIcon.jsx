'use client';

import { getBadgeLabel } from '@/shared/utils/hinglishCopy';
import { Scale, Brain, Heart, Zap, UserPlus } from 'lucide-react';

const BADGE_CONFIG = {
  none:             { icon: UserPlus, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  nyayadhish:       { icon: Scale,    color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  street_smart:     { icon: Brain,    color: 'text-blue-400', bg: 'bg-blue-500/10' },
  dil_se:           { icon: Heart,    color: 'text-pink-400', bg: 'bg-pink-500/10' },
  devils_advocate:  { icon: Zap,      color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

/**
 * Judge badge icon — identity marker shown on profiles and share cards.
 */
export default function JudgeBadgeIcon({ badge = 'none', size = 'md', showLabel = true }) {
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG.none;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bg} ${config.color} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} strokeWidth={2} />
      {showLabel && <span>{getBadgeLabel(badge)}</span>}
    </span>
  );
}
