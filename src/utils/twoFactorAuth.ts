import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export type TwoFactorMethod = 'biometric' | 'totp';

export interface TwoFactorCapabilities {
  isSupported: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  method: TwoFactorMethod;
  authTypeLabel: string;
}

export const getTwoFactorCapabilities = async (): Promise<TwoFactorCapabilities> => {
  if (Platform.OS === 'web') {
    return {
      isSupported: true,
      hasHardware: false,
      isEnrolled: false,
      method: 'totp',
      authTypeLabel: 'Authenticator App',
    };
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let authTypeLabel = 'Biometrics';
  if (authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    authTypeLabel = Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
  } else if (authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    authTypeLabel = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  }

  return {
    isSupported: hasHardware,
    hasHardware,
    isEnrolled,
    method: hasHardware && isEnrolled ? 'biometric' : 'totp',
    authTypeLabel,
  };
};

export const authenticateWithBiometrics = async (promptMessage: string) => {
  if (Platform.OS === 'web') {
    return { success: false as const, error: 'Biometrics are not available on web.' };
  }

  const capabilities = await getTwoFactorCapabilities();
  if (!capabilities.hasHardware) {
    return { success: false as const, error: 'This device does not support biometric authentication.' };
  }
  if (!capabilities.isEnrolled) {
    return { success: false as const, error: 'No biometrics are enrolled on this device.' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use Passcode',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
  });

  if (result.success) {
    return { success: true as const };
  }

  const errorMessage =
    result.error === 'user_cancel'
      ? 'Authentication was cancelled.'
      : result.error === 'authentication_failed'
        ? 'Authentication failed. Try again.'
        : 'Could not verify your identity.';

  return { success: false as const, error: errorMessage };
};
