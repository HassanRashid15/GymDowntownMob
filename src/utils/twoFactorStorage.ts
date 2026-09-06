import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateWithBiometrics, TwoFactorMethod } from './twoFactorAuth';
import { verifyTotpCode } from './totp';

export interface TwoFactorSettings {
  enabled: boolean;
  method: TwoFactorMethod;
  totpSecret?: string;
  enabledAt?: string;
}

const defaultSettings: TwoFactorSettings = {
  enabled: false,
  method: 'totp',
};

const storageKeyForUser = (userId: string) => `gym_two_factor_${userId}`;

export const loadTwoFactorSettingsForUser = async (userId: string): Promise<TwoFactorSettings> => {
  try {
    const stored = await AsyncStorage.getItem(storageKeyForUser(userId));
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load two-factor settings for user:', error);
  }
  return defaultSettings;
};

export const saveTwoFactorSettingsForUser = async (userId: string, settings: TwoFactorSettings) => {
  await AsyncStorage.setItem(storageKeyForUser(userId), JSON.stringify(settings));
};

export const verifyTwoFactorForUser = async (
  userId: string,
  verificationCode?: string
): Promise<{ success: boolean; error?: string }> => {
  const settings = await loadTwoFactorSettingsForUser(userId);
  if (!settings.enabled) return { success: true };

  if (settings.method === 'biometric') {
    if (verificationCode) {
      return { success: false, error: 'Use biometric verification to continue.' };
    }
    const auth = await authenticateWithBiometrics('Complete sign-in with biometrics');
    if (!auth.success) return { success: false, error: auth.error };
    return { success: true };
  }

  if (!settings.totpSecret) {
    return { success: false, error: 'Two-factor authentication is misconfigured.' };
  }

  if (!verificationCode) {
    return { success: false, error: 'Enter your 6-digit authenticator code.' };
  }

  const valid = await verifyTotpCode(settings.totpSecret, verificationCode);
  if (!valid) return { success: false, error: 'Invalid verification code.' };
  return { success: true };
};

export const disableTwoFactorForUser = async (userId: string) => {
  await AsyncStorage.removeItem(storageKeyForUser(userId));
};

export const getTwoFactorSummary = async (userId: string) => {
  const settings = await loadTwoFactorSettingsForUser(userId);
  return {
    enabled: settings.enabled,
    method: settings.method,
    label: settings.enabled
      ? settings.method === 'biometric'
        ? 'Biometrics'
        : 'Authenticator'
      : 'Off',
  };
};
