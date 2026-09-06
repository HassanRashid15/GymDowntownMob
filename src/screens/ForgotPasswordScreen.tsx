import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DesignedAlert from '../components/DesignedAlert';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAuthCooldown } from '../hooks/useAuthCooldown';
import { formatCooldownTime } from '../api/auth';

const SALMON_COLOR = '#E88E83';

const ForgotPasswordScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { resetPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const { isCoolingDown, formattedTime, triggerCooldownFromError } = useAuthCooldown();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
  } | null>(null);
  const [sent, setSent] = useState(false);

  const handleRecover = async () => {
    setEmailError('');

    if (isCoolingDown) {
      setAlert({
        title: 'COOLDOWN ACTIVE',
        message: `Please wait ${formattedTime} before trying again.`,
        icon: 'time-outline',
      });
      return;
    }

    if (!email.trim()) {
      setEmailError('Email Address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      setAlert({
        title: 'CHECK YOUR INBOX',
        message: 'Password reset instructions have been sent to your email.',
        icon: 'mail-outline',
      });
    } catch (error: any) {
      const cooldown = await triggerCooldownFromError(error);
      if (cooldown) {
        setAlert({
          title: 'COOLDOWN ACTIVE',
          message: `Too many attempts. Try again in ${formatCooldownTime(cooldown.durationSeconds)}.`,
          icon: 'time-outline',
        });
        return;
      }
      setAlert({
        title: 'RESET FAILED',
        message: error.message || 'Failed to send reset instructions. Please try again.',
        icon: 'alert-circle-outline',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/mob_app.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={[styles.title, { color: colors.foreground }]}>RECOVER ACCESS</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Enter your email and we&apos;ll send reset instructions.
              </Text>
            </View>

            {sent ? (
              <View style={styles.sentBox}>
                <View style={styles.sentIconWrap}>
                  <Ionicons name="checkmark-circle" size={48} color={SALMON_COLOR} />
                </View>
                <Text style={[styles.sentTitle, { color: colors.foreground }]}>
                  INSTRUCTIONS SENT
                </Text>
                <Text style={[styles.sentBody, { color: colors.mutedForeground }]}>
                  Check {email.trim()} for the reset link. You can close this screen and sign in
                  once you&apos;ve set a new password.
                </Text>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: '#1C1C1E',
                      borderColor: emailError ? colors.primary : '#2E2E2E',
                    },
                  ]}
                >
                  <View style={styles.fieldIconWrapper}>
                    <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="athlete@forge.com"
                    placeholderTextColor="#555555"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailError ? (
                  <Text style={[styles.errorText, { color: colors.primary }]}>{emailError}</Text>
                ) : null}
              </View>
            )}

            {!sent && (
              <TouchableOpacity
                onPress={handleRecover}
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
                  {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </Text>
                <View style={styles.buttonArrowWrapper}>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                </View>
              </TouchableOpacity>
            )}

            {sent && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={[styles.actionButton, { backgroundColor: SALMON_COLOR }]}
              >
                <Text style={styles.actionButtonText}>BACK TO SIGN IN</Text>
                <View style={styles.buttonArrowWrapper}>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footerSection}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DesignedAlert
        visible={!!alert}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        icon={alert?.icon ?? 'mail-outline'}
        buttonLabel="GOT IT"
        onClose={() => setAlert(null)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
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
    paddingTop: 28,
    paddingBottom: 12,
  },
  logoImage: {
    width: 280,
    height: 80,
  },
  formContainer: {
    paddingHorizontal: 28,
    paddingTop: 16,
    flex: 1,
  },
  formHeader: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  inputGroup: {
    marginBottom: 24,
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
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },
  actionButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
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
  },
  sentBox: {
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 12,
  },
  sentIconWrap: {
    marginBottom: 16,
  },
  sentTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sentBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: SALMON_COLOR,
  },
});

export default ForgotPasswordScreen;
