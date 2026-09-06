import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { getNameInitials } from '../utils/nameInitials';
import { getRoleLabel } from '../types/user';

const SALMON = '#E88E83';
const BRONZE_BORDER = '#C5A059';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

interface ProfileFormState {
  name: string;
  phone: string;
  avatar: string;
}

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, colors, children }) => (
  <View style={styles.field}>
    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
      {label}
      {required ? <Text style={{ color: SALMON }}> *</Text> : null}
    </Text>
    {children}
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, updateProfile, isAuthenticated, isSuperAdmin } = useAuth();
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: '',
    phone: '',
    avatar: '',
  });
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name,
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
    });
  }, [user]);

  const handleBack = () => {
    navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Settings' } });
  };

  const updateField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    if (profileErrors[key]) {
      setProfileErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (saved) setSaved(false);
  };

  const validateForm = (): ProfileFormErrors => {
    const errors: ProfileFormErrors = {};
    if (!profileForm.name.trim()) errors.name = 'Name is required.';
    return errors;
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateField('avatar', result.assets[0].uri);
    }
  };

  const removeProfileImage = () => {
    updateField('avatar', '');
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        avatar: profileForm.avatar,
      });
      setSaved(true);
    } catch {
      setProfileErrors({ email: 'Could not save profile. Try again.' });
    } finally {
      setIsSaving(false);
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
          <Text style={[styles.headerTitle, { color: SALMON }]}>PROFILE</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.lockedWrap}>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>SIGN IN REQUIRED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Sign in to view and edit your profile.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[styles.saveButton, { backgroundColor: SALMON }]}
          >
            <Text style={styles.saveButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasAvatar = !!profileForm.avatar.trim();
  const initials = getNameInitials(profileForm.name || user.name);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>PROFILE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarGlowContainer}>
            <View style={[styles.avatarContainer, { borderColor: BRONZE_BORDER }]}>
              {hasAvatar ? (
                <Image source={{ uri: profileForm.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.initialsWrap, { backgroundColor: `${SALMON}22` }]}>
                  <Text style={[styles.initialsText, { color: SALMON }]}>{initials}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.avatarActions}>
            <TouchableOpacity onPress={pickProfileImage} style={[styles.avatarActionBtn, { backgroundColor: SALMON }]}>
              <Text style={styles.avatarActionTextDark}>CHANGE</Text>
            </TouchableOpacity>
            {hasAvatar ? (
              <TouchableOpacity
                onPress={removeProfileImage}
                style={[styles.avatarActionBtn, styles.avatarRemoveBtn]}
              >
                <Text style={styles.avatarActionTextLight}>REMOVE</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={[styles.profileName, { color: colors.foreground }]}>{profileForm.name.toUpperCase()}</Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          <Text style={[styles.memberBadge, { color: isSuperAdmin ? '#FA1818' : SALMON }]}>{getRoleLabel(user?.role)}</Text>
        </View>

        {saved ? (
          <View style={[styles.successBanner, { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.12)' }]}>
            <Text style={styles.successBannerText}>Profile updated successfully.</Text>
          </View>
        ) : null}

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>EDIT PROFILE</Text>
          <Text style={[styles.formHint, { color: colors.mutedForeground }]}>
            Update your personal details below.
          </Text>

          <FormField label="Full Name" required error={profileErrors.name} colors={colors}>
            <TextInput
              value={profileForm.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle(!!profileErrors.name)}
            />
          </FormField>

          <FormField label="Phone No" error={profileErrors.phone} colors={colors}>
            <TextInput
              value={profileForm.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+1 555 123 4567"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              style={inputStyle(!!profileErrors.phone)}
            />
          </FormField>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveButton, { backgroundColor: SALMON, opacity: isSaving ? 0.7 : 1 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#0D0D0D" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE PROFILE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScreenScrollView>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarGlowContainer: {
    position: 'relative',
    marginBottom: 14,
    borderRadius: 55,
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: BRONZE_BORDER,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
          elevation: 8,
        }
      : {}),
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,142,131,0.12)',
  },
  initialsText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 40,
    letterSpacing: 2,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  avatarActionBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  avatarRemoveBtn: {
    backgroundColor: 'rgba(127,29,29,0.35)',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  avatarActionTextDark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
  avatarActionTextLight: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#FCA5A5',
  },
  profileName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 1,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 6,
  },
  memberBadge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1,
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
  formCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  formTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  formHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: -6,
    marginBottom: 4,
  },
  field: { gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
});

export default ProfileScreen;
