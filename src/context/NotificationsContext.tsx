import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppNotification, initialNotifications } from '../data/notifications';
import { useAuth } from './AuthContext';
import { supabase } from '../api/client/supabase';
import {
  isHubApiConfigured,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type HubNotification,
} from '../api/hub';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  acknowledgeAll: () => void;
  markAsRead: (id: string) => void;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
}

function mapCategory(type?: string): AppNotification['category'] {
  const t = (type || '').toLowerCase();
  if (t.includes('book') || t.includes('confirm')) return 'confirmation';
  if (t.includes('facility') || t.includes('maint')) return 'facility';
  if (t.includes('directive') || t.includes('motivat')) return 'directive';
  return 'system';
}

function mapHubNotification(n: HubNotification): AppNotification {
  const created = new Date(n.created_at);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return {
    id: n.id,
    category: mapCategory(n.type),
    label: (n.type || 'SYSTEM').replace(/_/g, ' ').toUpperCase(),
    title: n.title,
    body: n.message || '',
    time: relativeTime(n.created_at),
    group: created >= start ? 'today' : 'yesterday',
    read: n.unread === false,
  };
}

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [hubMode, setHubMode] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !isHubApiConfigured()) {
      setHubMode(false);
      return;
    }
    try {
      const data = await listNotifications({ limit: 50 });
      setHubMode(true);
      setNotifications((data.notifications || []).map(mapHubNotification));
    } catch {
      // keep current list (mock fallback)
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated || !isHubApiConfigured()) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            refresh();
          }
        )
        .subscribe();
    };

    setup();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isAuthenticated, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const acknowledgeAll = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    if (hubMode) {
      markAllNotificationsRead().catch(() => undefined);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    if (hubMode) {
      markNotificationRead(id).catch(() => undefined);
    }
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, acknowledgeAll, markAsRead, refresh }),
    [notifications, unreadCount, hubMode]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};
