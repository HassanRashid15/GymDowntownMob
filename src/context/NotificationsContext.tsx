import React, { createContext, useContext, useMemo, useState } from 'react';
import { AppNotification, initialNotifications } from '../data/notifications';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  acknowledgeAll: () => void;
  markAsRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const acknowledgeAll = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, acknowledgeAll, markAsRead }),
    [notifications, unreadCount]
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
