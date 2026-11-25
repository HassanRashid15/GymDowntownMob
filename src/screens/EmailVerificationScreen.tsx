import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  consumeAuthCallbackUrl,
  consumeVerificationFlowCompleted,
  consumeVerificationWelcomeSplashPlayed,
  getAuthUser,
  getCurrentUrlForAuthCallback,
  getSession,
  hasAuthCallbackTokens,
  markVerificationFlowCompleted,
  normalizeEmail,
  onAuthStateChange,
  peekVerificationFlowCompleted,
  replaceBrowserPath,
  setAwaitingEmailVerification,
  signOut,
} from '../api/auth';
import DesignedAlert from '../components/DesignedAlert';
import CustomSplashScreen from '../components/CustomSplashScreen';

const SALMON_COLOR = '#E88E83';

interface EmailVerificationScreenProps {
  route: {
    params?: {
      email?: string;
      role?: 'customer' | 'admin';
    };
  };
  navigation: any;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { resendVerificationEmail } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(route.params?.email?.trim() ?? '');
  const [role, setRole] = useState<'customer' | 'admin'>(route.params?.role ?? 'customer');
  const normalizedEmail = email ? normalizeEmail(email) : '';

  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'verified'>('waiting');
  const [welcomeName, setWelcomeName] = useState('');
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const finishingRef = useRef(false);
  const pendingNavRef = useRef<{ email: string; role: 'customer' | 'admin' } | null>(null);

  const resolveFullName = async (hint?: string | null) => {
    if (hint?.trim()) return hint.trim();
    try {
      const user = await getAuthUser();
      const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
      if (typeof meta.full_name === 'string' && meta.full_name.trim()) return meta.full_name.trim();
      if (typeof meta.fullName === 'string' && meta.fullName.trim()) return meta.fullName.trim();
      const first =
        (typeof meta.first_name === 'string' && meta.first_name.trim()) ||
        (typeof meta.firstName === 'string' && meta.firstName.trim()) ||
        '';
      const last =
        (typeof meta.last_name === 'string' && meta.last_name.trim()) ||
        (typeof meta.lastName === 'string' && meta.lastName.trim()) ||
        '';
      return `${first} ${last}`.trim();
    } catch {
      return '';
    }
  };

  const navigateToLogin = useCallback(
    (verifiedEmail: string, verifiedRole: 'customer' | 'admin') => {
      consumeVerificationFlowCompleted();
      setAwaitingEmailVerification(false);
      // Must leave /email-verification or React Navigation remounts this screen
      replaceBrowserPath('/login');
      const go = () => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
              params: {
                email: verifiedEmail || undefined,
                emailVerified: true,
                role: verifiedRole,
              },
            },
          ],
        });
      };
      // Double-schedule so web linking cannot snap us back to EmailVerification
      requestAnimationFrame(go);
      setTimeout(go, 50);
    },
    [navigation]
  );

  const finishVerified = useCallback(
    async (verifiedEmail: string, verifiedRole: 'customer' | 'admin', fullNameHint?: string | null) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      pendingNavRef.current = { email: verifiedEmail, role: verifiedRole };
      // Survive remounts if linking briefly re-opens this route
      markVerificationFlowCompleted(verifiedEmail, verifiedRole);

      const resolvedName = await resolveFullName(fullNameHint);
      if (resolvedName) setWelcomeName(resolvedName);

      try {
        await signOut();
      } catch {
        // Still send them to login even if sign-out fails
      } finally {
        setAwaitingEmailVerification(false);
      }

      const alreadyPlayedWelcome = consumeVerificationWelcomeSplashPlayed();
      // App cold-start already showed the welcome splash — go straight to Login
      if (alreadyPlayedWelcome) {
        navigateToLogin(verifiedEmail, verifiedRole);
        return;
      }

      setStatus('verified');
    },
    [navigateToLogin]
  );

  const goToLoginAfterSplash = useCallback(() => {
    const pending = pendingNavRef.current ?? peekVerificationFlowCompleted();
    navigateToLogin(pending?.email ?? normalizedEmail, pending?.role ?? role);
  }, [navigateToLogin, normalizedEmail, role]);

  // Hard fallback so success never leaves the user stuck on this screen
  useEffect(() => {
    if (status !== 'verified') return;
    const timer = setTimeout(() => {
      goToLoginAfterSplash();
    }, 7000);
    return () => clearTimeout(timer);
  }, [status, goToLoginAfterSplash]);

  const tryConsumeUrl = useCallback(
    async (url: string | null | undefined) => {
      if (!url || finishingRef.current) return;
      if (!hasAuthCallbackTokens(url)) return;

      setStatus((prev) => (prev === 'waiting' ? 'verifying' : prev));
      try {
        const result = await consumeAuthCallbackUrl(url);
        if (!result) {
          setStatus((prev) => (prev === 'verifying' ? 'waiting' : prev));
          return;
        }

        if (result.kind === 'signup' || result.kind === 'other' || result.kind === 'magiclink') {
          const sessionEmail = result.email ?? normalizedEmail;
          if (normalizedEmail && result.email && result.email !== normalizedEmail) {
            setAlert({
              title: 'Wrong Account',
              message: `This link verified ${result.email}. Use the inbox for ${normalizedEmail}.`,
            });
            setStatus('waiting');
            finishingRef.current = false;
            await signOut().catch(() => undefined);
            return;
          }

          if (sessionEmail) setEmail(sessionEmail);
          await finishVerified(sessionEmail || normalizedEmail, role, result.fullName);
        }
      } catch (error: any) {
        setStatus('waiting');
        finishingRef.current = false;
        setAlert({
          title: 'Verification Failed',
          message: error?.message ?? 'Could not verify your email. Resend the link and try again.',
        });
      }
    },
    [finishVerified, normalizedEmail, role]
  );

  useEffect(() => {
    // Remount after success → leave to Login (or finish welcome splash once)
    const alreadyDone = peekVerificationFlowCompleted();
    if (alreadyDone) {
      finishingRef.current = true;
      pendingNavRef.current = alreadyDone;
      if (email !== alreadyDone.email && alreadyDone.email) setEmail(alreadyDone.email);
      if (role !== alreadyDone.role) setRole(alreadyDone.role);
      const alreadyPlayedWelcome = consumeVerificationWelcomeSplashPlayed();
      if (alreadyPlayedWelcome) {
        navigateToLogin(alreadyDone.email, alreadyDone.role);
      } else {
        setStatus('verified');
      }
      return;
    }

    setAwaitingEmailVerification(true);

    const bootstrap = async () => {
      const url = getCurrentUrlForAuthCallback();
      if (hasAuthCallbackTokens(url)) {
        await tryConsumeUrl(url);
        return;
      }

      // Tokens already stripped / detectSessionInUrl already signed in
      try {
        const session = await getSession();
        const user = session?.user;
        if (!user) return;
        const confirmed = Boolean(
          (user as { email_confirmed_at?: string | null }).email_confirmed_at ||
            (user as { confirmed_at?: string | null }).confirmed_at
        );
        if (!confirmed) return;
        const sessionEmail = user.email ? normalizeEmail(user.email) : null;
        if (normalizedEmail && sessionEmail && sessionEmail !== normalizedEmail) return;
        if (sessionEmail) setEmail(sessionEmail);
        const metaRole = (user.user_metadata as { role?: string } | undefined)?.role;
        if (metaRole === 'admin' || metaRole === 'customer') setRole(metaRole);
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const sessionName =
          (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
          (typeof meta.fullName === 'string' && meta.fullName.trim()) ||
          null;
        await finishVerified(
          sessionEmail || normalizedEmail,
          metaRole === 'admin' ? 'admin' : role,
          sessionName
        );
      } catch {
        // stay on waiting UI
      }
    };

    bootstrap();
    Linking.getInitialURL()
      .then((url) => {
        if (hasAuthCallbackTokens(url)) tryConsumeUrl(url);
      })
      .catch(() => undefined);

    const linkingSub = Linking.addEventListener('url', ({ url }) => {
      tryConsumeUrl(url);
    });

    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      if (finishingRef.current) return;
      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') &&
        session?.user
      ) {
        const sessionEmail = session.user.email ? normalizeEmail(session.user.email) : null;
        const confirmed = Boolean(
          (session.user as { email_confirmed_at?: string | null }).email_confirmed_at ||
            (session.user as { confirmed_at?: string | null }).confirmed_at
        );
        const metaRole = (session.user.user_metadata as { role?: string } | undefined)?.role;
        if (metaRole === 'admin' || metaRole === 'customer') {
          setRole(metaRole);
        }
        if (confirmed && (!normalizedEmail || !sessionEmail || sessionEmail === normalizedEmail)) {
          if (sessionEmail) setEmail(sessionEmail);
          const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
          const sessionName =
            (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
            (typeof meta.fullName === 'string' && meta.fullName.trim()) ||
            null;
          await finishVerified(
            sessionEmail || normalizedEmail,
            metaRole === 'admin' ? 'admin' : role,
            sessionName
          );
        }
      }
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        tryConsumeUrl(getCurrentUrlForAuthCallback());
      }
    });

    return () => {
      linkingSub.remove();
      subscription?.unsubscribe?.();
      appStateSub.remove();
    };
  }, [finishVerified, navigateToLogin, normalizedEmail, role, tryConsumeUrl]);

  const handleResendEmail = async () => {
    if (!normalizedEmail) {
      setAlert({
        title: 'Email Required',
        message: 'Open this screen from signup, or enter the same email you registered with.',
      });
      return;
    }
    setIsResending(true);
    try {
      await resendVerificationEmail(normalizedEmail);
      setAlert({
        title: 'Email Sent',
        message: 'Verification email sent. Open the new link in this browser.',
      });
    } catch (error: any) {
      setAlert({
        title: 'Resend Failed',
        message: error?.message || 'Failed to resend verification email',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Success: welcome splash (WELCOME {name} TO + logo) → Login
  if (status === 'verified') {
    return (
      <CustomSplashScreen
        logoOnly
        welcomeName={welcomeName}
        onComplete={goToLoginAfterSplash}
      />
    );
  }

  const isVerifying = status === 'verifying';

  return (
    <View style={[styles.container, { backgroundColor: '#0D0D0D' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/mob_app.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.verificationContainer}>
            <View style={styles.iconCircle}>
              {isVerifying ? (
                <ActivityIndicator size="large" color={SALMON_COLOR} />
              ) : (
                <Ionicons name="mail-outline" size={48} color={SALMON_COLOR} />
              )}
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>
              {isVerifying ? 'CONFIRMING…' : 'VERIFY YOUR EMAIL'}
            </Text>

            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {role === 'admin'
                ? 'We need to verify your admin account before you can access the dashboard.'
                : 'We need to verify your email address before you can start your fitness journey.'}
            </Text>

            <View style={[styles.emailBox, { backgroundColor: '#1C1C1E', borderColor: '#2E2E2E' }]}>
              <Text style={[styles.emailLabel, { color: colors.mutedForeground }]}>Email Address</Text>
              <Text style={[styles.emailText, { color: colors.foreground }]}>
                {normalizedEmail || 'Waiting for confirmation link…'}
              </Text>
            </View>

            <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
              Open the verification link in this same browser. When confirmation succeeds, you will
              see the logo briefly, then go to login.
            </Text>

            <TouchableOpacity
              onPress={handleResendEmail}
              disabled={isResending || isVerifying}
              style={styles.resendButton}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={SALMON_COLOR} />
              ) : (
                <Text style={[styles.resendButtonText, { color: SALMON_COLOR }]}>
                  Resend Verification Email
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {role === 'admin'
                  ? 'After email verification, your admin account still needs super admin approval before dashboard access.'
                  : 'Customers are approved automatically after email verification. Admins need super admin approval.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <DesignedAlert
        visible={!!alert}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        icon="mail-outline"
        buttonLabel="GOT IT"
        onClose={() => setAlert(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
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
  verificationContainer: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emailBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  emailLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  resendButton: {
    marginBottom: 20,
    minHeight: 24,
    justifyContent: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
});

export default EmailVerificationScreen;
