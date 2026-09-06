import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenScrollView from '../components/ScreenScrollView';
import Card from '../components/Card';
import TwoFactorSetupModal, { TwoFactorVerifyModal } from '../components/TwoFactorModals';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTwoFactor } from '../context/TwoFactorContext';
import { useNavigation } from '@react-navigation/native';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { getTwoFactorCapabilities, TwoFactorCapabilities } from '../utils/twoFactorAuth';

const SALMON = '#E88E83';
const STORAGE_KEY = 'gym_account_settings';

interface AccountSecuritySettings {
  loginAlerts: boolean;
  passwordLastChanged: string | null;
}

const defaultSettings: AccountSecuritySettings = {
  loginAlerts: true,
  passwordLastChanged: null,
};

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordFormErrors = Partial<Record<keyof PasswordFormState, string>>;

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const LockIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const AccountSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();
  const { settings: twoFactorSettings, isLoading: twoFactorLoading, enableTwoFactor, disableTwoFactor, createTotpSetup } = useTwoFactor();
  const [settings, setSettings] = useState<AccountSecuritySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [capabilities, setCapabilities] = useState<TwoFactorCapabilities | null>(null);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        }
        const caps = await getTwoFactorCapabilities();
        setCapabilities(caps);
      } catch (error) {
        console.error('Failed to load account settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persistSettings = async (next: AccountSecuritySettings) => {
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSecuritySaved(true);
    setTimeout(() => setSecuritySaved(false), 2000);
  };

  const handleTwoFactorToggle = async (value: boolean) => {
    setTwoFactorError('');
    if (value) {
      setTwoFactorBusy(true);
      try {
        const caps = capabilities ?? (await getTwoFactorCapabilities());
        if (caps.method === 'totp') {
          const secret = await createTotpSetup();
          setSetupSecret(secret);
          setShowSetupModal(true);
        } else {
          const result = await enableTwoFactor();
          if (!result.success) setTwoFactorError(result.error ?? 'Could not enable two-factor authentication.');
        }
      } finally {
        setTwoFactorBusy(false);
      }
      return;
    }

    if (twoFactorSettings.method === 'totp') {
      setShowDisableModal(true);
      return;
    }

    setTwoFactorBusy(true);
    const result = await disableTwoFactor();
    setTwoFactorBusy(false);
    if (!result.success) setTwoFactorError(result.error ?? 'Could not disable two-factor authentication.');
  };

  const handleSetupVerify = async (code: string) => {
    const result = await enableTwoFactor(code, setupSecret);
    if (!result.success) return result;
    setSetupSecret('');
    setShowSetupModal(false);
    return result;
  };

  const handleDisableVerify = async (code: string) => {
    const result = await disableTwoFactor(code);
    if (!result.success) return result;
    setShowDisableModal(false);
    return result;
  };

  const handleBack = () => {
    navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Settings' } });
  };

  const updatePasswordField = (key: keyof PasswordFormState, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    if (passwordErrors[key]) {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (passwordSaved) setPasswordSaved(false);
  };

  const validatePasswordForm = (): PasswordFormErrors => {
    const errors: PasswordFormErrors = {};
    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required.';
    }
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required.';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.';
    }
    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSavingPassword(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const next = {
        ...settings,
        passwordLastChanged: new Date().toISOString(),
      };
      await persistSettings(next);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSaved(true);
    } catch {
      setPasswordErrors({ currentPassword: 'Could not update password. Try again.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const inputStyle = (hasError: boolean) => [
    styles.input,
    {
      color: colors.foreground,
      borderColor: hasError ? '#FA1818' : colors.border,
      backgroundColor: colors.background,
    },
  ];

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON }]}>ACCOUNT</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.lockedWrap}>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>SIGN IN REQUIRED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Sign in to manage your account security settings.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[styles.primaryButton, { backgroundColor: SALMON }]}
          >
            <Text style={styles.primaryButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const twoFactorMethodLabel =
    twoFactorSettings.method === 'biometric'
      ? capabilities?.authTypeLabel ?? 'Biometrics'
      : 'Authenticator App';

  const lastChangedLabel = settings.passwordLastChanged
    ? new Date(settings.passwordLastChanged).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>ACCOUNT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${SALMON}22` }]}>
            <ShieldIcon color={SALMON} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>ACCOUNT SECURITY</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            Protect your Forge account and manage sign-in options.
          </Text>
          <Text style={[styles.accountEmail, { color: SALMON }]}>{user.email}</Text>
        </View>

        {(passwordSaved || securitySaved) ? (
          <View style={[styles.successBanner, { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.12)' }]}>
            <Text style={styles.successBannerText}>
              {passwordSaved ? 'Password updated successfully.' : 'Security settings saved.'}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CHANGE PASSWORD</Text>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.formHeader}>
              <LockIcon color={SALMON} />
              <Text style={[styles.formHint, { color: colors.mutedForeground }]}>
                Last changed: {lastChangedLabel}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>CURRENT PASSWORD</Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(value) => updatePasswordField('currentPassword', value)}
                placeholder="Enter current password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={inputStyle(!!passwordErrors.currentPassword)}
              />
              {passwordErrors.currentPassword ? (
                <Text style={styles.fieldError}>{passwordErrors.currentPassword}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>NEW PASSWORD</Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(value) => updatePasswordField('newPassword', value)}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={inputStyle(!!passwordErrors.newPassword)}
              />
              {passwordErrors.newPassword ? (
                <Text style={styles.fieldError}>{passwordErrors.newPassword}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>CONFIRM PASSWORD</Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(value) => updatePasswordField('confirmPassword', value)}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={inputStyle(!!passwordErrors.confirmPassword)}
              />
              {passwordErrors.confirmPassword ? (
                <Text style={styles.fieldError}>{passwordErrors.confirmPassword}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isSavingPassword}
              style={[styles.saveButton, { backgroundColor: SALMON, opacity: isSavingPassword ? 0.7 : 1 }]}
            >
              {isSavingPassword ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={styles.saveButtonText}>UPDATE PASSWORD</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SECURITY OPTIONS</Text>
          {isLoading || twoFactorLoading ? (
            <ActivityIndicator color={SALMON} />
          ) : (
            <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleTitle, { color: colors.foreground }]}>Two-Factor Authentication</Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.mutedForeground }]}>
                    {twoFactorSettings.enabled
                      ? `Enabled via ${twoFactorMethodLabel}`
                      : Platform.OS === 'web'
                        ? 'Use an authenticator app for extra sign-in protection'
                        : `Use ${capabilities?.authTypeLabel ?? 'biometrics'} when signing in`}
                  </Text>
                </View>
                {twoFactorBusy ? (
                  <ActivityIndicator color={SALMON} />
                ) : (
                  <Switch
                    value={twoFactorSettings.enabled}
                    onValueChange={handleTwoFactorToggle}
                    trackColor={{ false: '#3A3A3C', true: `${SALMON}88` }}
                    thumbColor={twoFactorSettings.enabled ? SALMON : '#8E8E93'}
                    ios_backgroundColor="#3A3A3C"
                  />
                )}
              </View>
              {twoFactorError ? (
                <Text style={[styles.twoFactorError, { color: '#FA1818' }]}>{twoFactorError}</Text>
              ) : null}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleTitle, { color: colors.foreground }]}>Login Alerts</Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.mutedForeground }]}>
                    Email when a new device signs in
                  </Text>
                </View>
                <Switch
                  value={settings.loginAlerts}
                  onValueChange={(value) => persistSettings({ ...settings, loginAlerts: value })}
                  trackColor={{ false: '#3A3A3C', true: `${SALMON}88` }}
                  thumbColor={settings.loginAlerts ? SALMON : '#8E8E93'}
                  ios_backgroundColor="#3A3A3C"
                />
              </View>
            </Card>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>TWO-FACTOR METHOD</Text>
          <Text style={[styles.infoBody, { color: colors.mutedForeground }]}>
            {Platform.OS === 'web'
              ? 'On web, Forge uses authenticator-app codes (TOTP). On mobile devices with Face ID, Touch ID, or fingerprint enrolled, biometric verification is used instead.'
              : twoFactorSettings.enabled
                ? `Your account requires ${twoFactorMethodLabel} verification every time you sign in.`
                : `Enable two-factor authentication to require ${capabilities?.authTypeLabel ?? 'biometric'} verification at sign-in.`}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>ACTIVE SESSION</Text>
          <Text style={[styles.infoBody, { color: colors.mutedForeground }]}>
            You are currently signed in on this device. For demo accounts, password changes are stored locally.
          </Text>
        </View>
      </ScreenScrollView>

      <TwoFactorSetupModal
        visible={showSetupModal}
        secret={setupSecret}
        accountEmail={user.email}
        onClose={() => {
          setShowSetupModal(false);
          setSetupSecret('');
        }}
        onVerify={handleSetupVerify}
      />

      <TwoFactorVerifyModal
        visible={showDisableModal}
        title="DISABLE TWO-FACTOR"
        subtitle="Enter your current authenticator code to turn off two-factor authentication."
        onClose={() => setShowDisableModal(false)}
        onVerify={handleDisableVerify}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  headerSpacer: { width: 40 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 8,
  },
  accountEmail: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  successBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  successBannerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#22C55E',
    textAlign: 'center',
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  formHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  field: { gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  fieldError: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FA1818',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  toggleText: { flex: 1 },
  toggleTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  divider: { height: 1, marginLeft: 16 },
  twoFactorError: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  infoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  infoBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  lockedWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  lockedTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
  },
  lockedBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
});

export default AccountSettingsScreen;
