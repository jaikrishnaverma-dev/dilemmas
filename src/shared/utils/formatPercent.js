/**
 * Format a decimal as percentage string.
 */
export function formatPercent(value, total) {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Calculate vote split percentages for 3 sides.
 * Returns { teri_galti, uski_galti, situation_galat } as numbers (0-100).
 */
export function calculateSplit(teriCount, uskiCount, situationCount) {
  const total = teriCount + uskiCount + situationCount;
  if (total === 0) return { teri_galti: 0, uski_galti: 0, situation_galat: 0 };

  return {
    teri_galti:       Math.round((teriCount / total) * 100),
    uski_galti:       Math.round((uskiCount / total) * 100),
    situation_galat:  Math.round((situationCount / total) * 100),
  };
}

/**
 * Format large numbers with K/L suffix (Indian style).
 */
export function formatCount(num) {
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
