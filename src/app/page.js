'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import CaseCard from '@/modules/feed/CaseCard';
import FeedFilters from '@/modules/feed/FeedFilters';
import { FeedSkeleton } from '@/shared/components/LoadingPulse';
import { api } from '@/shared/api/apiClient';
import { COPY } from '@/shared/utils/hinglishCopy';

export default function FeedPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('trending');
  const [category, setCategory] = useState('');

  // Accordion: which case card is expanded
  const [expandedId, setExpandedId] = useState(null);

  // New feed polling
  const [newCaseCount, setNewCaseCount] = useState(0);
  const newestTimestamp = useRef(null);
  const pollInterval = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // ── Load feed ──
  const loadFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        sort,
      });
      if (category) params.set('category', category);

      const data = await api.get(`/api/feed?${params}`);

      if (append) {
        setCases(prev => [...prev, ...data.cases]);
      } else {
        setCases(data.cases);
        // Track newest case timestamp for polling
        if (data.cases.length > 0) {
          newestTimestamp.current = data.cases[0].createdAt;
        }
        setNewCaseCount(0);
      }

      setHasMore(data.pagination.hasMore);
    } catch {}

    setLoading(false);
    setLoadingMore(false);
  }, [sort, category]);

  // Initial load + reload on filter change
  useEffect(() => {
    setPage(1);
    setExpandedId(null);
    loadFeed(1, false);
  }, [loadFeed]);

  // ── Infinite scroll via IntersectionObserver ──
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadFeed(nextPage, true);
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, loadFeed]);

  // ── Poll for new cases every 15s ──
  useEffect(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      if (!newestTimestamp.current) return;
      try {
        const data = await api.get(
          `/api/feed?since=${encodeURIComponent(newestTimestamp.current)}&countOnly=true`
        );
        if (data.newCount > 0) {
          setNewCaseCount(data.newCount);
        }
      } catch {}
    }, 15000);

    return () => clearInterval(pollInterval.current);
  }, [sort, category]);

  // ── Scroll to top & load new cases ──
  const handleNewCasesClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay for smooth scroll to finish, then reload
    setTimeout(() => {
      setPage(1);
      setExpandedId(null);
      loadFeed(1, false);
    }, 400);
  };

  // ── Accordion toggle ──
  const handleToggleExpand = (caseId) => {
    setExpandedId(prev => (prev === caseId ? null : caseId));
  };

  // ── Filter handlers ──
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setExpandedId(null);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setExpandedId(null);
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-nav space-y-4">

        {/* Tagline */}
        <p className="text-center text-sm text-[var(--text-secondary)] font-medium">
          {COPY.general.tagline}
        </p>

        {/* Filters */}
        <FeedFilters
          sort={sort}
          category={category}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />

        {/* Feed */}
        {loading ? (
          <FeedSkeleton />
        ) : cases.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-sm text-[var(--text-secondary)] font-bold">Koi case nahi mila</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c, i) => (
              <CaseCard
                key={c.id}
                caseData={c}
                index={i}
                isExpanded={expandedId === c.id}
                onToggleExpand={() => handleToggleExpand(c.id)}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && cases.length > 0 && (
          <p className="text-center text-xs text-[var(--text-muted)] py-4 font-medium">
            Bas itne hi cases hain abhi 🤷‍♂️
          </p>
        )}
      </main>

      {/* ── Floating "New Cases" button ── */}
      {newCaseCount > 0 && (
        <button
          onClick={handleNewCasesClick}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-full
            bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)] text-white text-xs font-bold
            shadow-xl shadow-[var(--accent-pink)]/30 animate-slide-up active:scale-95 transition-all
            hover:shadow-2xl hover:shadow-[var(--accent-pink)]/40"
        >
          <ArrowUp size={14} />
          {newCaseCount} new {newCaseCount === 1 ? 'case' : 'cases'}
        </button>
      )}

      <BottomNav />
    </div>
  );
}
