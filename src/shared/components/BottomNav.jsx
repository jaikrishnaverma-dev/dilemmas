'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Flame, PenSquare, Search, Bell, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';

export default function BottomNav() {
  const pathname = usePathname();
  const { isLoggedIn, copy } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const NAV_ITEMS = [
    { href: '/',              icon: Flame,     label: copy.nav.feed,    id: 'nav-feed' },
    { href: '/search',        icon: Search,    label: copy.nav.search,  id: 'nav-search' },
    { href: '/submit',        icon: PenSquare, label: copy.nav.post,    id: 'nav-submit' },
    { href: '/notifications', icon: Bell,      label: copy.nav.alerts,  id: 'nav-notifs', showBadge: true },
    { href: '/profile',       icon: User,      label: copy.nav.profile, id: 'nav-profile' },
  ];

  // Poll unread notifications count
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchCount = () => {
      api.get('/api/notifications?limit=1')
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-subtle)]"
      style={{
        background: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              id={item.id}
              href={item.href === '/submit' && !isLoggedIn ? '/profile' : item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-[var(--text-primary)] scale-105'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {/* Notification badge */}
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center
                    rounded-full bg-[var(--accent-pink)] text-[8px] font-black text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1.5 w-8 h-0.5 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
