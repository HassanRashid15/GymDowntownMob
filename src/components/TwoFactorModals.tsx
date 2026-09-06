import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { generateTotpCode, getTotpRemainingSeconds } from '../utils/totp';

const SALMON = '#E88E83';

interface TwoFactorSetupModalProps {
  visible: boolean;
  secret: string;
  accountEmail: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  visible,
  secret,
  accountEmail,
  onClose,
  onVerify,
}) => {
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [remaining, setRemaining] = useState(30);

  useEffect(() => {
    if (!visible || !secret) return;

    let active = true;
    const refresh = async () => {
      const nextCode = await generateTotpCode(secret);
      if (active) {
        setPreviewCode(nextCode);
        setRemaining(getTotpRemainingSeconds());
      }
    };

    refresh();
    const timer = setInterval(refresh, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [visible, secret]);

  useEffect(() => {
    if (!visible) {
      setCode('');
      setError('');
      setIsVerifying(false);
    }
  }, [visible]);

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);
    const result = await onVerify(code);
    setIsVerifying(false);
    if (!result.success) {
      setError(result.error ?? 'Verification failed.');
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>SET UP AUTHENTICATOR</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Add this account to Google Authenticator, Authy, or 1Password using the secret below.
          </Text>

          <View style={[styles.secretBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.secretLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
            <Text style={[styles.secretValue, { color: colors.foreground }]}>{accountEmail}</Text>
            <Text style={[styles.secretLabel, { color: colors.mutedForeground, marginTop: 10 }]}>SECRET KEY</Text>
            <Text style={[styles.secretValue, { color: SALMON }]} selectable>
              {secret}
            </Text>
          </View>

          <View style={[styles.previewBox, { borderColor: colors.border }]}>
            <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>CURRENT CODE</Text>
            <Text style={[styles.previewCode, { color: colors.foreground }]}>{previewCode || '------'}</Text>
            <Text style={[styles.previewTimer, { color: colors.mutedForeground }]}>Refreshes in {remaining}s</Text>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>ENTER 6-DIGIT CODE</Text>
          <TextInput
            value={code}
            onChangeText={(value) => {
              setCode(value.replace(/\D/g, '').slice(0, 6));
              if (error) setError('');
            }}
            placeholder="000000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={6}
            style={[
              styles.input,
              {
                color: colors.foreground,
                borderColor: error ? '#FA1818' : colors.border,
                backgroundColor: colors.background,
              },
            ]}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.secondaryBtn, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={isVerifying || code.length !== 6}
              style={[styles.primaryBtn, { backgroundColor: SALMON, opacity: code.length === 6 ? 1 : 0.6 }]}
            >
              {isVerifying ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={styles.primaryBtnText}>ENABLE 2FA</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface TwoFactorVerifyModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export const TwoFactorVerifyModal: React.FC<TwoFactorVerifyModalProps> = ({
  visible,
  title = 'TWO-FACTOR VERIFICATION',
  subtitle = 'Enter the 6-digit code from your authenticator app.',
  onClose,
  onVerify,
}) => {
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCode('');
      setError('');
      setIsVerifying(false);
    }
  }, [visible]);

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);
    const result = await onVerify(code);
    setIsVerifying(false);
    if (!result.success) {
      setError(result.error ?? 'Verification failed.');
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>

          <TextInput
            value={code}
            onChangeText={(value) => {
              setCode(value.replace(/\D/g, '').slice(0, 6));
              if (error) setError('');
            }}
            placeholder="000000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={6}
            style={[
              styles.input,
              {
                color: colors.foreground,
                borderColor: error ? '#FA1818' : colors.border,
                backgroundColor: colors.background,
              },
            ]}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.secondaryBtn, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={isVerifying || code.length !== 6}
              style={[styles.primaryBtn, { backgroundColor: SALMON, opacity: code.length === 6 ? 1 : 0.6 }]}
            >
              {isVerifying ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={styles.primaryBtnText}>VERIFY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  secretBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  secretLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  secretValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  previewLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  previewCode: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 4,
  },
  previewTimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FA1818',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#0D0D0D',
  },
});

export default TwoFactorSetupModal;
