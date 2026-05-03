'use client';

import { useAuth } from '@/modules/auth/AuthContext';
import { Share2, MessageCircle, Copy, ExternalLink } from 'lucide-react';

/**
 * Share button — one-tap sharing to WhatsApp, Instagram, or copy link.
 * The share card is identity-first: "Maine kaha X — Y% India agrees"
 */
export default function ShareButton({ shareData, variant = 'default' }) {
  const { copy } = useAuth();
  const { caseTitle, side, agreePercent, fullUrl, caseSlug } = shareData || {};

  // Ensure we have a clean URL for sharing/copying
  const cleanUrl = fullUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/case/${caseSlug}` 
    : '');

  // Construct a punchy, Gen-Z friendly share message
  const sideText = side ? `${copy.share.cardTitle} ${side}` : 'Maine verdict diya';
  const shareText = `${sideText} \u2014 ${agreePercent}% ${copy.share.agreesWith}!\n\nKya tu agree karta hai? Check kar \uD83D\uDC47`;

  const handleWhatsApp = () => {
    // Social platforms need the URL and Text combined in the 'text' parameter
    const whatsappText = `${shareText}\n${cleanUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cleanUrl);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = cleanUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: `Dilemmas: ${caseTitle}`, 
          text: shareText, 
          url: cleanUrl 
        });
      } catch { /* User cancelled */ }
    } else {
      handleWhatsApp();
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
          bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/25
          transition-all duration-200 active:scale-95"
      >
        <Share2 size={12} /> Share
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleWhatsApp}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
          bg-green-600 text-white hover:bg-green-500 transition-all duration-200 active:scale-95 shake-cta"
      >
        <MessageCircle size={16} /> WhatsApp
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold
          bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]
          hover:border-[var(--accent-purple)] transition-all duration-200 active:scale-95"
      >
        <Copy size={16} /> Link
      </button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold
            bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]
            hover:border-[var(--accent-cyan)] transition-all duration-200 active:scale-95"
        >
          <ExternalLink size={16} />
        </button>
      )}
    </div>
  );
}
