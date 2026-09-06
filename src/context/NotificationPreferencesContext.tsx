import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationPreferences,
  defaultNotificationPreferences,
} from '../data/notificationPreferences';

const STORAGE_KEY = 'gym_notification_preferences';

interface NotificationPreferencesContextValue {
  preferences: NotificationPreferences;
  isLoading: boolean;
  updatePreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const NotificationPreferencesContext = createContext<
  NotificationPreferencesContextValue | undefined
>(undefined);

export const NotificationPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPreferences({ ...defaultNotificationPreferences, ...JSON.parse(stored) });
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persist = async (next: NotificationPreferences) => {
    setPreferences(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updatePreference = async <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    const next = { ...preferences, [key]: value };

    if (key !== 'pushEnabled' && !next.pushEnabled) {
      await persist(next);
      return;
    }

    if (key === 'pushEnabled' && !value) {
      const disabled = Object.keys(next).reduce((acc, prefKey) => {
        acc[prefKey as keyof NotificationPreferences] = false;
        return acc;
      }, {} as NotificationPreferences);
      await persist(disabled);
      return;
    }

    await persist(next);
  };

  const resetPreferences = async () => {
    await persist(defaultNotificationPreferences);
  };

  const value = useMemo(
    () => ({ preferences, isLoading, updatePreference, resetPreferences }),
    [preferences, isLoading]
  );

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
};

export const useNotificationPreferences = () => {
  const context = useContext(NotificationPreferencesContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within NotificationPreferencesProvider');
  }
  return context;
};
