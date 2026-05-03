/**
 * Human-readable relative time in Hinglish.
 */
export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'abhi abhi';
  if (diffMin < 60) return `${diffMin}m pehle`;
  if (diffHr < 24) return `${diffHr}h pehle`;
  if (diffDay < 7) return `${diffDay}d pehle`;
  return date.toLocaleDateString('en-IN');
}

/**
 * Time remaining until expiry, in human-readable format.
 */
export function timeLeft(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry - now;

  if (diffMs <= 0) return null; // expired

  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 60) return `${diffMin}m baaki`;
  if (diffHr < 24) return `${diffHr}h baaki`;
  return `${Math.floor(diffHr / 24)}d baaki`;
}

/**
 * Check if a case is expired.
 */
export function isExpired(expiresAt) {
  return new Date(expiresAt) <= new Date();
}
