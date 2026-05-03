'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, CheckCheck, MessageSquare, Award, Clock, Flame } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';
import { timeAgo } from '@/shared/utils/timeAgo';

const TYPE_CONFIG = {
  verdict_on_case: { icon: MessageSquare, color: 'text-[var(--accent-purple)] bg-[var(--accent-purple)]/10' },
  fairness_rating: { icon: Award, color: 'text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10' },
  badge_earned:    { icon: Award, color: 'text-yellow-400 bg-yellow-500/10' },
  case_expired:    { icon: Clock, color: 'text-[var(--accent-orange)] bg-[var(--accent-orange)]/10' },
  case_trending:   { icon: Flame, color: 'text-[var(--accent-pink)] bg-[var(--accent-pink)]/10' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.get('/api/notifications?limit=30')
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const markAllRead = async () => {
    try {
      const data = await api.patch('/api/notifications', { markAll: true });
      setUnreadCount(data.unreadCount);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      api.patch('/api/notifications', { notificationIds: [notif._id] }).catch(() => {});
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) router.push(notif.link);
  };

  if (!isLoggedIn) return (
    <div className="min-h-dvh bg-[var(--bg-primary)]"><TopBar />
      <main className="max-w-lg mx-auto px-4 pt-20 text-center">
        <BellOff size={48} className="mx-auto text-[var(--text-muted)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)] font-bold">Login karo notifications dekhne ke liye</p>
      </main><BottomNav /></div>
  );

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Bell size={20} /> Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[var(--accent-pink)] text-white">{unreadCount}</span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-bold text-[var(--accent-purple)] hover:underline">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)]" />
                <div className="flex-1 space-y-2"><div className="h-3 w-3/4 rounded bg-[var(--bg-elevated)]" /><div className="h-3 w-1/2 rounded bg-[var(--bg-elevated)]" /></div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-10 text-center animate-slide-up">
            <Bell size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] font-bold">Koi notification nahi hai</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Jab koi tumhare case pe vote karega, yahan dikhega</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.verdict_on_case;
              const Icon = config.icon;
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full glass-card p-4 flex items-start gap-3 text-left transition-all animate-slide-up active:scale-[0.98]
                    ${!n.read ? 'border-l-2 border-l-[var(--accent-purple)]' : 'opacity-70'}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${config.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{n.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--accent-purple)] shrink-0 mt-1.5" />}
                </button>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
