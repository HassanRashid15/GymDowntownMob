import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { authenticateWithBiometrics } from '../utils/twoFactorAuth';
import { generateTotpSecret, verifyTotpCode } from '../utils/totp';
import {
  loadTwoFactorSettingsForUser,
  saveTwoFactorSettingsForUser,
  TwoFactorSettings,
} from '../utils/twoFactorStorage';

export type { TwoFactorSettings } from '../utils/twoFactorStorage';

const defaultSettings: TwoFactorSettings = {
  enabled: false,
  method: 'totp',
};

interface TwoFactorContextValue {
  settings: TwoFactorSettings;
  isLoading: boolean;
  enableTwoFactor: (verificationCode?: string, pendingSecret?: string) => Promise<{ success: boolean; error?: string }>;
  disableTwoFactor: (verificationCode?: string) => Promise<{ success: boolean; error?: string }>;
  verifyTwoFactor: (verificationCode?: string) => Promise<{ success: boolean; error?: string }>;
  createTotpSetup: () => Promise<string>;
}

const TwoFactorContext = createContext<TwoFactorContextValue | undefined>(undefined);

export const TwoFactorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TwoFactorSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const stored = await loadTwoFactorSettingsForUser(user.id);
        setSettings(stored);
      } catch (error) {
        console.error('Failed to load two-factor settings:', error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const persist = async (next: TwoFactorSettings) => {
    if (!user) return;
    setSettings(next);
    await saveTwoFactorSettingsForUser(user.id, next);
  };

  const createTotpSetup = async () => generateTotpSecret();

  const enableTwoFactor = async (verificationCode?: string, pendingSecret?: string) => {
    if (!user) return { success: false, error: 'Sign in required.' };

    const { getTwoFactorCapabilities } = await import('../utils/twoFactorAuth');
    const capabilities = await getTwoFactorCapabilities();

    if (capabilities.method === 'biometric') {
      const auth = await authenticateWithBiometrics('Verify your identity to enable two-factor authentication');
      if (!auth.success) return { success: false, error: auth.error };
      await persist({
        enabled: true,
        method: 'biometric',
        enabledAt: new Date().toISOString(),
      });
      return { success: true };
    }

    if (!pendingSecret || !verificationCode) {
      return { success: false, error: 'Enter the 6-digit code from your authenticator app.' };
    }

    const valid = await verifyTotpCode(pendingSecret, verificationCode);
    if (!valid) {
      return { success: false, error: 'Invalid verification code. Try again.' };
    }

    await persist({
      enabled: true,
      method: 'totp',
      totpSecret: pendingSecret,
      enabledAt: new Date().toISOString(),
    });
    return { success: true };
  };

  const disableTwoFactor = async (verificationCode?: string) => {
    if (!user || !settings.enabled) return { success: true };

    if (settings.method === 'biometric') {
      const auth = await authenticateWithBiometrics('Verify your identity to disable two-factor authentication');
      if (!auth.success) return { success: false, error: auth.error };
    } else {
      if (!settings.totpSecret || !verificationCode) {
        return { success: false, error: 'Enter your current authenticator code.' };
      }
      const valid = await verifyTotpCode(settings.totpSecret, verificationCode);
      if (!valid) return { success: false, error: 'Invalid verification code.' };
    }

    await persist({ ...defaultSettings });
    return { success: true };
  };

  const verifyTwoFactor = async (verificationCode?: string) => {
    if (!settings.enabled) return { success: true };

    if (settings.method === 'biometric') {
      const auth = await authenticateWithBiometrics('Complete sign-in with biometrics');
      if (!auth.success) return { success: false, error: auth.error };
      return { success: true };
    }

    if (!settings.totpSecret || !verificationCode) {
      return { success: false, error: 'Enter your 6-digit authenticator code.' };
    }

    const valid = await verifyTotpCode(settings.totpSecret, verificationCode);
    if (!valid) return { success: false, error: 'Invalid verification code.' };
    return { success: true };
  };

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      enableTwoFactor,
      disableTwoFactor,
      verifyTwoFactor,
      createTotpSetup,
    }),
    [settings, isLoading, user?.id]
  );

  return <TwoFactorContext.Provider value={value}>{children}</TwoFactorContext.Provider>;
};

export const useTwoFactor = () => {
  const context = useContext(TwoFactorContext);
  if (!context) {
    throw new Error('useTwoFactor must be used within TwoFactorProvider');
  }
  return context;
};
