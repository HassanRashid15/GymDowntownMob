import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TwoFactorVerifyModal } from '../components/TwoFactorModals';
import DesignedAlert from '../components/DesignedAlert';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAuthCooldown } from '../hooks/useAuthCooldown';
import { formatCooldownTime } from '../api/auth';

const { height } = Dimensions.get('window');

// Design Constants
const SALMON_COLOR = '#E88E83';

type LoginStatusBanner =
  | { type: 'email_not_verified'; email: string }
  | { type: 'user_not_found' };

const LoginScreen: React.FC = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { login, resendVerificationEmail } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [statusBanner, setStatusBanner] = useState<LoginStatusBanner | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);
  const { isCoolingDown, formattedTime, triggerCooldownFromError } = useAuthCooldown();
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);
  const scrollViewRef = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const hasFieldErrors = Boolean(errors.email || errors.password);
  const hasStatusBanner = Boolean(statusBanner);
  const [comingSoon, setComingSoon] = useState<{ title: string; message: string; icon: 'logo-google' | 'logo-apple' } | null>(null);
  const [verifiedNotice, setVerifiedNotice] = useState<{ title: string; message: string } | null>(
    route?.params?.emailVerified
      ? {
          title: 'EMAIL VERIFIED',
          message:
            route?.params?.role === 'admin'
              ? 'Your email is verified. Sign in after a super admin approves your admin account.'
              : 'Your email is verified. Sign in to continue.',
        }
      : null
  );

  useEffect(() => {
    if (route?.params?.email) {
      setEmail(route.params.email);
    }
    if (route?.params?.emailVerified) {
      setVerifiedNotice({
        title: 'EMAIL VERIFIED',
        message:
          route?.params?.role === 'admin'
            ? 'Your email is verified. Sign in after a super admin approves your admin account.'
            : 'Your email is verified. Sign in to continue.',
      });
    }
  }, [route?.params?.email, route?.params?.emailVerified, route?.params?.role]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsScrollEnabled(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsScrollEnabled(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasFieldErrors && !hasStatusBanner) return;
    const id = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => cancelAnimationFrame(id);
  }, [hasFieldErrors, hasStatusBanner, errors.email, errors.password, statusBanner?.type]);

  const showComingSoon = (provider: 'Google' | 'Apple') => {
    setComingSoon({
      title: 'COMING SOON',
      message: `${provider} sign-in will be available soon.`,
      icon: provider === 'Google' ? 'logo-google' : 'logo-apple',
    });
  };

  const clearStatusBanner = () => setStatusBanner(null);

  const isUserNotFoundError = (error: any) => {
    const code = String(error?.code ?? '').toLowerCase();
    const message = String(error?.message ?? '').toLowerCase();
    return (
      code === 'invalid_credentials' ||
      code === 'user_not_found' ||
      message.includes('invalid login credentials') ||
      message.includes('invalid email or password') ||
      message.includes('user not found') ||
      message.includes('no user found')
    );
  };

  const handleResendFromBanner = async () => {
    if (!statusBanner || statusBanner.type !== 'email_not_verified') return;
    setResendingVerification(true);
    try {
      await resendVerificationEmail(statusBanner.email);
      Alert.alert('Email Sent', 'Verification email sent. Open the link to verify your account.');
    } catch (error: any) {
      Alert.alert('Resend Failed', error?.message || 'Failed to resend verification email.');
    } finally {
      setResendingVerification(false);
    }
  };

  const completeLogin = async (loginEmail: string, loginPassword: string, verificationCode?: string) => {
    await login(loginEmail, loginPassword, verificationCode);
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleLogin = async (verificationCode?: string) => {
    setErrors({});
    setStatusBanner(null);

    if (isCoolingDown) {
      setErrors({ email: `Cooldown active. Try again in ${formattedTime}.` });
      return;
    }

    const loginEmail = pendingCredentials?.email ?? email;
    const loginPassword = pendingCredentials?.password ?? password;

    const nextErrors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) {
      nextErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!loginPassword) {
      nextErrors.password = 'Password is required';
    }
    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await completeLogin(loginEmail.trim(), loginPassword, verificationCode);
      setShowTwoFactorModal(false);
      setPendingCredentials(null);
    } catch (error: any) {
      if (error?.code === 'TWO_FACTOR_REQUIRED' && !verificationCode) {
        setPendingCredentials({ email: loginEmail.trim(), password: loginPassword });
        setShowTwoFactorModal(true);
      } else if (error?.code === 'EMAIL_NOT_CONFIRMED') {
        setStatusBanner({ type: 'email_not_verified', email: loginEmail.trim() });
      } else if (error?.code === 'ADMIN_APPROVAL_PENDING') {
        Alert.alert(
          'Admin Approval Pending',
          'Your admin account is pending approval from a super admin. You will be notified once approved.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else if (isUserNotFoundError(error)) {
        setStatusBanner({ type: 'user_not_found' });
      } else {
        try {
          const cooldown = await triggerCooldownFromError(error);
          if (cooldown) {
            setErrors({
              email: `Rate limit reached. Cooldown active for ${formatCooldownTime(cooldown.durationSeconds)}.`,
            });
            return;
          }
        } catch {
          // ignore cooldown helper failures
        }
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={[styles.container, { backgroundColor: '#0D0D0D' }]}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={isScrollEnabled || hasFieldErrors || hasStatusBanner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/mob_app.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Input Form Section Card */}
          <View style={[styles.formContainer]}>
            <View style={styles.formHeader}>
              <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
                WELCOME BACK
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
                Sign in to access your training regimen.
              </Text>
            </View>

          <View style={styles.form}>
            {/* Transmission ID (Email) Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Email Address
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: '#1C1C1E', 
                  borderColor: errors.email ? colors.primary : '#2E2E2E' 
                }
              ]}>
                <View style={styles.fieldIconWrapper}>
                  <Ionicons name="person-outline" size={20} color={colors.mutedForeground} />
                </View>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground }]}
                  placeholder="athlete@forge.com"
                  placeholderTextColor="#555555"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                    if (statusBanner) clearStatusBanner();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.primary }]}>{errors.email}</Text>
              )}
            </View>

            {/* Access Code (Password) Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Password
              </Text>
              <View style={[
                styles.inputWrapper, 
                { 
                  backgroundColor: '#1C1C1E', 
                  borderColor: errors.password ? colors.primary : '#2E2E2E' 
                }
              ]}>
                <View style={styles.fieldIconWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
                </View>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                    if (statusBanner) clearStatusBanner();
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggleWrapper}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.mutedForeground} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.primary }]}>{errors.password}</Text>
              )}
            </View>

            {/* Recover Access Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')} 
              style={styles.recoverLink}
            >
              <Text style={[styles.recoverText, { color: SALMON_COLOR }]}>RECOVER ACCESS?</Text>
            </TouchableOpacity>

            {statusBanner?.type === 'email_not_verified' && (
              <View style={styles.statusBanner}>
                <View style={styles.statusBannerHeader}>
                  <Ionicons name="mail-unread-outline" size={18} color={SALMON_COLOR} />
                  <Text style={styles.statusBannerTitle}>VERIFY YOUR EMAIL</Text>
                </View>
                <Text style={styles.statusBannerMessage}>
                  Confirm {statusBanner.email} before signing in. Check your inbox, then try again.
                </Text>
                <View style={styles.statusBannerActions}>
                  <TouchableOpacity
                    onPress={handleResendFromBanner}
                    disabled={resendingVerification}
                    style={styles.statusBannerAction}
                  >
                    <Text style={styles.statusBannerActionText}>
                      {resendingVerification ? 'SENDING…' : 'RESEND EMAIL'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('EmailVerification', {
                        email: statusBanner.email,
                        role: 'customer',
                      })
                    }
                    style={styles.statusBannerAction}
                  >
                    <Text style={styles.statusBannerActionText}>OPEN VERIFY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {statusBanner?.type === 'user_not_found' && (
              <View style={[styles.statusBanner, styles.statusBannerDanger]}>
                <View style={styles.statusBannerHeader}>
                  <Ionicons name="person-remove-outline" size={18} color="#F87171" />
                  <Text style={[styles.statusBannerTitle, styles.statusBannerTitleDanger]}>
                    NO USER FOUND
                  </Text>
                </View>
                <Text style={styles.statusBannerMessage}>
                  No account matches these credentials. Check your email and password, or sign up.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  style={styles.statusBannerAction}
                >
                  <Text style={[styles.statusBannerActionText, styles.statusBannerActionTextDanger]}>
                    CREATE ACCOUNT
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Main Action Button */}
            <TouchableOpacity
              onPress={() => handleLogin()}
              disabled={loading || isCoolingDown}
              style={[
                styles.actionButton,
                {
                  backgroundColor: SALMON_COLOR,
                  opacity: loading || isCoolingDown ? 0.6 : 1,
                },
              ]}
            >
              <Text style={styles.actionButtonText}>
                {loading ? 'INITIATING...' : 'INITIATE SEQUENCE'}
              </Text>
              <View style={styles.buttonArrowWrapper}>
                <Ionicons name="arrow-forward" size={18} color="#000" />
              </View>
            </TouchableOpacity>

            {/* Social Login Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: '#2E2E2E' }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: '#2E2E2E' }]} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => showComingSoon('Google')}
              >
                <Image
                  source={require('../../assets/google-logo.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => showComingSoon('Apple')}
              >
                <Ionicons name="logo-apple" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sign Up Link — stays reachable when validation errors grow the form */}
        <View style={styles.signupSection}>
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>
            Don't have any account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.signupLink, { color: SALMON_COLOR }]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>

      <DesignedAlert
        visible={!!comingSoon}
        title={comingSoon?.title ?? 'COMING SOON'}
        message={comingSoon?.message ?? ''}
        icon={comingSoon?.icon ?? 'time-outline'}
        buttonLabel="GOT IT"
        onClose={() => setComingSoon(null)}
      />
      <DesignedAlert
        visible={!!verifiedNotice}
        title={verifiedNotice?.title ?? 'EMAIL VERIFIED'}
        message={verifiedNotice?.message ?? ''}
        icon="checkmark-circle-outline"
        buttonLabel="GOT IT"
        onClose={() => setVerifiedNotice(null)}
      />

      <TwoFactorVerifyModal
        visible={showTwoFactorModal}
        title="VERIFY SIGN-IN"
        subtitle="Enter the 6-digit code from your authenticator app to complete sign-in."
        onClose={() => {
          setShowTwoFactorModal(false);
          setPendingCredentials(null);
        }}
        onVerify={async (code) => {
          if (!pendingCredentials) {
            return { success: false, error: 'Session expired. Sign in again.' };
          }
          setLoading(true);
          try {
            await completeLogin(pendingCredentials.email, pendingCredentials.password, code);
            setShowTwoFactorModal(false);
            setPendingCredentials(null);
            return { success: true };
          } catch (error: any) {
            return { success: false, error: error.message ?? 'Verification failed.' };
          } finally {
            setLoading(false);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 25,
    paddingBottom: 15,
  },
  logoContainer: {
    width: 220,
    height: 85,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 320,
    height: 85,
  },
  formContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 16,
  },
  formHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fieldIconWrapper: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  eyeToggleWrapper: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },
  recoverLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  recoverText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  statusBanner: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 142, 131, 0.35)',
    backgroundColor: 'rgba(232, 142, 131, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  statusBannerDanger: {
    borderColor: 'rgba(248, 113, 113, 0.35)',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
  },
  statusBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusBannerTitle: {
    color: SALMON_COLOR,
    fontSize: 13,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  statusBannerTitleDanger: {
    color: '#F87171',
  },
  statusBannerMessage: {
    color: '#A1A1AA',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
    marginBottom: 12,
  },
  statusBannerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statusBannerAction: {
    alignSelf: 'flex-start',
  },
  statusBannerActionText: {
    color: SALMON_COLOR,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  statusBannerActionTextDanger: {
    color: '#F87171',
  },
  actionButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  buttonArrowWrapper: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  signupText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  signupLink: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2E2E2E',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonPressed: {
    backgroundColor: '#1C1C1E',
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
});

export default LoginScreen;