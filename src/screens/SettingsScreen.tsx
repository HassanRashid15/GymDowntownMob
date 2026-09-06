import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getGymPlanById } from '../data/gymSubscription';
import Card from '../components/Card';
import { getNameInitials } from '../utils/nameInitials';
import { getRoleLabel } from '../types/user';

const SALMON_COLOR = '#E88E83';
const BRONZE_BORDER = '#C5A059';

const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const CardIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <Line x1="2" y1="10" x2="22" y2="10" />
  </Svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const EyeOffIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

const HelpIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ChevronRightIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

const LogOutIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Polyline points="16 17 21 12 16 7" />
    <Line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

const SettingsScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const { gymSubscription, hasGymSubscription } = useSubscription();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const gymPlan = gymSubscription ? getGymPlanById(gymSubscription.planId) : null;
  const renewDate = gymSubscription
    ? new Date(gymSubscription.renewsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  const accountItems = isAdmin
    ? [
        {
          icon: <UserIcon color={SALMON_COLOR} />,
          title: 'Profile',
          subtitle: user?.email,
          onPress: () => navigation.navigate('Profile'),
        },
        {
          icon: <ShieldIcon color={SALMON_COLOR} />,
          title: 'Account Security',
          onPress: () => navigation.navigate('AccountSettings'),
        },
        {
          icon: <CardIcon color={SALMON_COLOR} />,
          title: 'Manage Gym Subscription',
          subtitle: hasGymSubscription
            ? `${gymPlan?.name ?? 'Active plan'} · Renews ${renewDate}`
            : 'Subscribe to unlock your gym',
          onPress: () => navigation.navigate('Join'),
        },
      ]
    : [
        {
          icon: <UserIcon color={SALMON_COLOR} />,
          title: 'Profile',
          subtitle: user?.email,
          onPress: () => navigation.navigate('Profile'),
        },
        {
          icon: <ShieldIcon color={SALMON_COLOR} />,
          title: 'Account Security',
          onPress: () => navigation.navigate('AccountSettings'),
        },
        {
          icon: <CardIcon color={SALMON_COLOR} />,
          title: 'Membership Plan',
          subtitle: 'Pro Tier - Renews Oct 12',
          onPress: () => navigation.navigate('Join'),
        },
      ];

  const preferenceItems = [
    {
      icon: <BellIcon color={SALMON_COLOR} />,
      title: 'Notification Preferences',
      onPress: () => navigation.navigate('NotificationPreferences'),
    },
    {
      icon: <EyeOffIcon color={SALMON_COLOR} />,
      title: 'Privacy Settings',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
  ];

  const supportItems = [
    {
      icon: <HelpIcon color={SALMON_COLOR} />,
      title: 'Help & Support',
      onPress: () => navigation.navigate('HelpSupport'),
    },
  ];

  const platformItems = isSuperAdmin
    ? [
        {
          icon: <UserIcon color="#FA1818" />,
          title: 'User Management',
          subtitle: 'Roles, access, and account status',
          onPress: () => navigation.navigate('Users'),
        },
        {
          icon: <CardIcon color="#FA1818" />,
          title: 'Platform Revenue',
          subtitle: 'Cross-gym financial overview',
          onPress: () => navigation.navigate('Revenue'),
        },
      ]
    : [];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity onPress={item.onPress} style={styles.settingItem}>
      <View style={styles.settingItemContent}>
        <View style={styles.iconWrapper}>
          {item.icon}
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.foreground }]}>{item.title}</Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: SALMON_COLOR }]}>{item.subtitle}</Text>
          )}
        </View>
        <ChevronRightIcon color={SALMON_COLOR} />
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    const publicAccountItems = [
      {
        icon: <ShieldIcon color={SALMON_COLOR} />,
        title: 'Sign In',
        subtitle: 'Access your athlete dashboard',
        onPress: () => navigation.navigate('Login'),
      },
      {
        icon: <CardIcon color={SALMON_COLOR} />,
        title: 'Join Forge',
        subtitle: 'Start your fitness journey',
        onPress: () => navigation.navigate('Register'),
      },
    ];

    const publicAppItems = [
      {
        icon: <HelpIcon color={SALMON_COLOR} />,
        title: 'About Forge Gym',
        onPress: () => navigation.navigate('About'),
      },
      {
        icon: <EyeOffIcon color={SALMON_COLOR} />,
        title: 'Privacy Policy',
        onPress: () => navigation.navigate('PrivacyPolicy'),
      },
    ];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: 8 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON_COLOR }]}>SETTINGS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarGlowContainer}>
              <View style={[styles.avatarContainer, { borderColor: BRONZE_BORDER }]}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fit=crop&w=300&h=300&q=80' }}
                  style={styles.avatarImage}
                />
              </View>
            </View>
            <Text style={[styles.profileName, { color: colors.foreground }]}>WELCOME TO FORGE</Text>
            <Text style={[styles.memberBadgeText, { color: colors.mutedForeground, letterSpacing: 1 }]}>
              GUEST ACCESS
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT ACCESS</Text>
            <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              {publicAccountItems.map((item, index) => (
                <View key={index}>
                  {renderSettingItem(item)}
                  {index < publicAccountItems.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT APP</Text>
            <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              {publicAppItems.map((item, index) => (
                <View key={index}>
                  {renderSettingItem(item)}
                  {index < publicAppItems.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </Card>
          </View>

          <View style={[styles.versionSection, { marginTop: 40 }]}>
            <Text style={[styles.versionText, { color: colors.mutedForeground }]}>App Version 4.2.0.98</Text>
          </View>
        </ScreenScrollView>
      </View>
    );
  }

  const avatarSource = user?.avatar ? { uri: user.avatar } : null;
  const initials = getNameInitials(user?.name ?? 'Member');

  const memberLabel = getRoleLabel(user?.role);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON_COLOR }]}>SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarGlowContainer}>
            <View style={[styles.avatarContainer, { borderColor: BRONZE_BORDER }]}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatarImage} />
              ) : (
                <View style={styles.initialsWrap}>
                  <Text style={[styles.initialsText, { color: SALMON_COLOR }]}>{initials}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>
            {user?.name?.toUpperCase() || 'MEMBER'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          <Text style={[styles.memberBadgeText, { color: isSuperAdmin ? '#FA1818' : SALMON_COLOR }]}>{memberLabel}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            {accountItems.map((item, index) => (
              <View key={index}>
                {renderSettingItem(item)}
                {index < accountItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {platformItems.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PLATFORM</Text>
            <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              {platformItems.map((item, index) => (
                <View key={index}>
                  {renderSettingItem(item)}
                  {index < platformItems.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>
          <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            {preferenceItems.map((item, index) => (
              <View key={index}>
                {renderSettingItem(item)}
                {index < preferenceItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SUPPORT</Text>
          <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            {supportItems.map((item, index) => (
              <View key={index}>
                {renderSettingItem(item)}
                {index < supportItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={[styles.logoutButton, { borderColor: SALMON_COLOR }]} onPress={logout}>
            <LogOutIcon color={SALMON_COLOR} />
            <Text style={[styles.logoutButtonText, { color: SALMON_COLOR }]}>LOG OUT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>App Version 4.2.0.98</Text>
        </View>
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  profileSection: {
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatarGlowContainer: {
    borderRadius: 60,
    marginBottom: 16,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  initialsWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,142,131,0.12)',
  },
  initialsText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    letterSpacing: 2,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 6,
  },
  memberBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
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
    borderColor: '#1E1E1E',
  },
  settingItem: { paddingVertical: 14, paddingHorizontal: 16 },
  settingItemContent: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: { flex: 1 },
  settingTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  settingSubtitle: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 2 },
  divider: { height: 1, marginLeft: 72 },
  logoutSection: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16 },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  versionSection: { paddingTop: 8, paddingBottom: 20, alignItems: 'center' },
  versionText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});

export default SettingsScreen;
