import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import Card from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotificationPreferences } from '../context/NotificationPreferencesContext';
import { useNavigation } from '@react-navigation/native';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { notificationPreferenceGroups } from '../data/notificationPreferences';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const NotificationPreferencesScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const { preferences, isLoading, updatePreference, resetPreferences } = useNotificationPreferences();
  const [saved, setSaved] = useState(false);

  const handleBack = () => {
    navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Settings' } });
  };

  const handleToggle = async (key: keyof typeof preferences, value: boolean) => {
    await updatePreference(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON }]}>NOTIFICATIONS</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.lockedWrap}>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>SIGN IN REQUIRED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Sign in to manage your notification preferences.
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>NOTIFICATIONS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${SALMON}22` }]}>
            <BellIcon color={SALMON} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>STAY IN THE LOOP</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            Choose what updates you receive. Changes save automatically.
          </Text>
        </View>

        {saved ? (
          <View style={[styles.successBanner, { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.12)' }]}>
            <Text style={styles.successBannerText}>Preferences updated.</Text>
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={SALMON} style={{ marginTop: 24 }} />
        ) : (
          notificationPreferenceGroups.map((group) => (
            <View key={group.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{group.title}</Text>
              <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {group.items.map((item, index) => {
                  const isDisabled = !preferences.pushEnabled && item.key !== 'pushEnabled';
                  return (
                    <View key={item.key}>
                      <View style={[styles.toggleRow, isDisabled && styles.toggleRowDisabled]}>
                        <View style={styles.toggleText}>
                          <Text style={[styles.toggleTitle, { color: colors.foreground }]}>{item.title}</Text>
                          <Text style={[styles.toggleSubtitle, { color: colors.mutedForeground }]}>
                            {item.subtitle}
                          </Text>
                        </View>
                        <Switch
                          value={preferences[item.key]}
                          onValueChange={(value) => handleToggle(item.key, value)}
                          disabled={isDisabled}
                          trackColor={{ false: '#3A3A3C', true: `${SALMON}88` }}
                          thumbColor={preferences[item.key] ? SALMON : '#8E8E93'}
                          ios_backgroundColor="#3A3A3C"
                        />
                      </View>
                      {index < group.items.length - 1 ? (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      ) : null}
                    </View>
                  );
                })}
              </Card>
            </View>
          ))
        )}

        <TouchableOpacity
          onPress={resetPreferences}
          style={[styles.resetButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.resetButtonText, { color: colors.mutedForeground }]}>
            RESET TO DEFAULTS
          </Text>
        </TouchableOpacity>
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
  toggleRowDisabled: { opacity: 0.45 },
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
  resetButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  resetButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.8,
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

export default NotificationPreferencesScreen;
