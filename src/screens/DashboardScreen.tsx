import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Polyline,
  Rect,
  G,
} from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import GradientText from '../components/GradientText';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useGymPlanAccess } from '../context/SubscriptionContext';
import { useNotifications } from '../context/NotificationsContext';

const { width } = Dimensions.get('window');
const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#1E1E1E';

// ─── SVG Icon Library ────────────────────────────────────────────────────────

const GearIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const DashboardHeaderActions = ({ navigation, iconColor }: { navigation: any; iconColor: string }) => {
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.headerActions}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Notifications')}
        style={styles.headerActionButton}
      >
        <BellIcon color={iconColor} />
        {unreadCount > 0 ? (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerActionButton}>
        <GearIcon color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const CalendarIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const TrendUpIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <Polyline points="17 6 23 6 23 12" />
  </Svg>
);

const FlagIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <Line x1="4" y1="22" x2="4" y2="15" />
  </Svg>
);

const FireIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Svg>
);

const TimerIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const RunIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="13" cy="4" r="2" />
    <Path d="m15 9-2 6-4 2-3 5" />
    <Path d="m9 11 4-2 3 5" />
    <Path d="m6 20 1-4 3-2" />
  </Svg>
);

const WeightIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 12h3m14 0h3M5 12l1-3h12l1 3M6 9V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
    <Rect x="9" y="12" width="6" height="6" rx="1" />
  </Svg>
);

const LotusIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 21c0 0-7-4-7-9a7 7 0 0 1 14 0c0 5-7 9-7 9z" />
    <Path d="M12 12c0 0-3-4-3-7a3 3 0 0 1 6 0c0 3-3 7-3 7z" />
  </Svg>
);

const ClockIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const PlusCircleIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="16" />
    <Line x1="8" y1="12" x2="16" y2="12" />
  </Svg>
);

const XIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const AlertTriangleIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const ChevronRightIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

// ─── USER DATA ────────────────────────────────────────────────────────────────

const USER_UPCOMING = [
  {
    id: '1',
    name: 'NEON SPIN SURGE',
    instructor: 'Marcus T.',
    time: '18:00 – 18:45',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fit=crop&w=400&h=260&q=80',
    isToday: true,
  },
  {
    id: '2',
    name: 'IRON FORGE',
    instructor: 'Sarah M.',
    time: '07:00 – 08:00',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?fit=crop&w=400&h=260&q=80',
    isToday: false,
  },
  {
    id: '3',
    name: 'POWER HIIT',
    instructor: 'James W.',
    time: '06:00 – 06:45',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?fit=crop&w=400&h=260&q=80',
    isToday: false,
  },
];

const USER_RECENT = [
  {
    id: '1',
    name: 'TREADMILL SPRINT INTERVALS',
    tag: 'Yesterday · HIIT',
    duration: '32m',
    kcal: '412 kcal',
    icon: 'run',
  },
  {
    id: '2',
    name: 'UPPER BODY POWER',
    tag: 'Mon, 14 Oct · Strength',
    duration: '45m',
    kcal: '320 kcal',
    icon: 'weight',
  },
  {
    id: '3',
    name: 'RECOVERY FLOW',
    tag: 'Sun, 13 Oct · Mobility',
    duration: '20m',
    kcal: '85 kcal',
    icon: 'lotus',
  },
];

// ─── ADMIN DATA ───────────────────────────────────────────────────────────────

const WEEKLY_ATTENDANCE = [
  { day: 'M', value: 0.82 },
  { day: 'T', value: 0.68 },
  { day: 'W', value: 0.91 },
  { day: 'T', value: 0.74 },
  { day: 'F', value: 0.88 },
  { day: 'S', value: 0.35 },
  { day: 'S', value: 0.28 },
];

const ADMIN_TRAINERS = [
  {
    id: '1',
    name: 'Marcus Vance',
    role: 'HIIT Specialist',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?fit=crop&w=80&h=80&q=80',
  },
  {
    id: '2',
    name: 'Sarah Connor',
    role: 'Powerlifting',
    status: 'Off Duty',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?fit=crop&w=80&h=80&q=80',
  },
  {
    id: '3',
    name: 'James Wilson',
    role: 'Endurance Coach',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?fit=crop&w=80&h=80&q=80',
  },
];

const RECENT_SIGNUPS = [
  { id: '1', name: 'Alex R.', plan: 'Pro Membership', time: 'Just now' },
  { id: '2', name: 'Jamie T.', plan: 'Basic Access', time: '2 hrs ago' },
  { id: '3', name: 'Priya P.', plan: 'Elite Tier', time: 'Yesterday' },
];

const RevenueSparkline = () => (
  <Svg width={88} height={36} viewBox="0 0 88 36">
    <Polyline
      points="0,28 14,24 28,26 42,18 56,20 70,10 88,6"
      fill="none"
      stroke={SALMON}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={88} cy={6} r={3} fill={SALMON} />
  </Svg>
);

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────

const UserDashboard: React.FC<{ navigation: any; user: any }> = ({ navigation, user }) => {
  const { colors } = useTheme();
  const firstName = user?.name?.split(' ')[0]?.toUpperCase() || 'ATHLETE';

  const activityIcon = (icon: string) => {
    if (icon === 'run') return <RunIcon color={SALMON} size={18} />;
    if (icon === 'weight') return <WeightIcon color={SALMON} size={18} />;
    return <LotusIcon color={SALMON} size={18} />;
  };

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: 12, backgroundColor: '#0D0D0D' }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarRing, { borderColor: SALMON }]}>
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?fit=crop&w=80&h=80&q=80' }}
              style={styles.avatarSmall}
            />
          </View>
        </View>
        <Text style={[styles.headerTitle, { color: SALMON }]}>USER DASHBOARD</Text>
        <DashboardHeaderActions navigation={navigation} iconColor={colors.mutedForeground} />
      </View>

      {/* ── Greeting ── */}
      <View style={styles.greetingSection}>
        <Text style={[styles.greetingLabel, { color: colors.foreground }]}>
          WELCOME BACK,
        </Text>
        <Text style={[styles.greetingName, { color: colors.foreground }]}>{firstName}</Text>
        <Text style={[styles.greetingSubtitle, { color: SALMON }]}>
          Your energy levels are peaking. Time to crush today's goals.
        </Text>
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.quickActions}>
        {[
          { label: 'BOOK', icon: <CalendarIcon color={SALMON} size={24} />, onPress: () => navigation.navigate('Classes') },
          { label: 'PROGRESS', icon: <TrendUpIcon color={SALMON} size={24} />, onPress: () => Alert.alert('Progress', 'Progress tracker coming soon!') },
          { label: 'GOALS', icon: <FlagIcon color={SALMON} size={24} />, onPress: () => Alert.alert('Goals', 'Goal-setting coming soon!') },
        ].map((a) => (
          <TouchableOpacity key={a.label} onPress={a.onPress} style={styles.quickActionBtn}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#1C1C1E', borderColor: CARD_BORDER }]}>
              {a.icon}
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.mutedForeground }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Stats: This Month ── */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>THIS MONTH</Text>

        {/* Streak Banner */}
        <View style={[styles.streakBanner, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <View>
            <Text style={[styles.streakMeta, { color: colors.mutedForeground }]}>CURRENT STREAK</Text>
            <Text style={[styles.streakValue, { color: colors.foreground }]}>5 Days</Text>
          </View>
          <View style={[styles.streakIconWrap, { backgroundColor: 'rgba(232,142,131,0.12)' }]}>
            <FireIcon color={SALMON} size={28} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <View style={styles.statCardHeader}>
              <Text style={[styles.statCardLabel, { color: colors.mutedForeground }]}>WORKOUTS</Text>
              <TrendUpIcon color={SALMON} size={16} />
            </View>
            <Text style={[styles.statCardValue, { color: colors.foreground }]}>12</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <View style={styles.statCardHeader}>
              <Text style={[styles.statCardLabel, { color: colors.mutedForeground }]}>HOURS ACTIVE</Text>
              <TimerIcon color={SALMON} size={16} />
            </View>
            <Text style={[styles.statCardValue, { color: colors.foreground }]}>18.5</Text>
          </View>
        </View>
      </View>

      {/* ── Upcoming Classes ── */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionRowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>UPCOMING CLASSES</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Classes')} style={styles.seeAllBtn}>
            <Text style={[styles.seeAllText, { color: SALMON }]}>SEE ALL</Text>
            <ChevronRightIcon color={SALMON} size={12} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classScroll}>
          {USER_UPCOMING.map((cls) => (
            <View key={cls.id} style={styles.classCard}>
              <Image source={{ uri: cls.image }} style={styles.classCardImage} />
              <View style={[styles.classCardOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
              {cls.isToday && (
                <View style={[styles.todayBadge, { backgroundColor: SALMON }]}>
                  <Text style={styles.todayBadgeText}>TODAY</Text>
                </View>
              )}
              <View style={styles.classCardContent}>
                <View style={styles.classCardTimeRow}>
                  <ClockIcon color="rgba(255,255,255,0.7)" size={12} />
                  <Text style={styles.classCardTime}>{cls.time}</Text>
                </View>
                <Text style={styles.classCardName}>{cls.name}</Text>
                <Text style={styles.classCardInstructor}>Instructor: {cls.instructor}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Recent Activity ── */}
      <View style={[styles.sectionBlock, { marginBottom: 32 }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECENT ACTIVITY</Text>
        <View style={[styles.activityList, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          {USER_RECENT.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.activityRow}>
                <View style={[styles.activityIconCircle, { backgroundColor: 'rgba(232,142,131,0.1)', borderColor: 'rgba(232,142,131,0.2)' }]}>
                  {activityIcon(item.icon)}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.activityTag, { color: colors.mutedForeground }]}>{item.tag}</Text>
                </View>
                <View style={styles.activityStats}>
                  <Text style={[styles.activityDuration, { color: SALMON }]}>{item.duration}</Text>
                  <Text style={[styles.activityKcal, { color: colors.mutedForeground }]}>{item.kcal}</Text>
                </View>
              </View>
              {idx < USER_RECENT.length - 1 && (
                <View style={[styles.divider, { backgroundColor: CARD_BORDER }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
};

// ─── SUPER ADMIN DASHBOARD ────────────────────────────────────────────────────

const PLATFORM_GYMS = [
  { id: '1', name: 'Forge Downtown', members: '4.2K', admins: 3, status: 'Healthy' },
  { id: '2', name: 'Forge Westside', members: '2.8K', admins: 2, status: 'Healthy' },
  { id: '3', name: 'Forge North', members: '1.9K', admins: 2, status: 'Attention' },
  { id: '4', name: 'Forge East', members: '1.3K', admins: 1, status: 'Healthy' },
];

const SuperAdminDashboard: React.FC<{ navigation: any; user: any }> = ({ navigation, user }) => {
  const { colors } = useTheme();

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.adminScrollContent}>
      <View style={[styles.header, { paddingTop: 12, backgroundColor: '#0D0D0D' }]}>
        <View style={styles.headerLeft} />
        <Text style={[styles.adminHeaderTitle, { color: '#FA1818' }]}>SUPER ADMIN</Text>
        <DashboardHeaderActions navigation={navigation} iconColor={colors.mutedForeground} />
      </View>

      <View style={styles.adminHeroSection}>
        <GradientText style={styles.commandCenterTitle}>PLATFORM COMMAND</GradientText>
        <Text style={[styles.commandCenterSubtitle, { color: colors.mutedForeground }]}>
          Global oversight across all Forge gyms, admins, and members.
        </Text>
      </View>

      <View style={styles.adminMetricsRow}>
        <View style={[styles.adminMetricCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>TOTAL GYMS</Text>
          <Text style={[styles.adminMetricValue, { color: colors.foreground }]}>24</Text>
          <Text style={[styles.adminMetricTrend, { color: SALMON }]}>+3 this quarter</Text>
        </View>
        <View style={[styles.adminMetricCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>PLATFORM USERS</Text>
          <Text style={[styles.adminMetricValue, { color: colors.foreground }]}>10.2K</Text>
          <Text style={[styles.adminMetricSub, { color: colors.mutedForeground }]}>All roles</Text>
        </View>
      </View>

      <View style={styles.adminMetricsRow}>
        <View style={[styles.adminMetricCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>GYM ADMINS</Text>
          <Text style={[styles.adminMetricValue, { color: colors.foreground }]}>18</Text>
          <Text style={[styles.adminMetricSub, { color: colors.mutedForeground }]}>Active operators</Text>
        </View>
        <View style={[styles.adminMetricCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>PLATFORM ARR</Text>
          <Text style={[styles.adminMetricValue, { color: colors.foreground }]}>$2.4M</Text>
          <Text style={[styles.adminMetricTrend, { color: SALMON }]}>+14.8% YoY</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        {[
          { label: 'USERS', onPress: () => navigation.navigate('Users') },
          { label: 'REVENUE', onPress: () => navigation.navigate('Revenue') },
          { label: 'PLAN', onPress: () => navigation.navigate('Join') },
        ].map((action) => (
          <TouchableOpacity key={action.label} onPress={action.onPress} style={styles.quickActionBtn}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(250,24,24,0.12)', borderColor: 'rgba(250,24,24,0.25)' }]}>
              <Text style={[styles.quickActionIconText, { color: '#FA1818' }]}>{action.label[0]}</Text>
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.mutedForeground }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Revenue')}
        style={[styles.adminRevenueCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>PLATFORM REVENUE</Text>
          <Text style={[styles.adminRevenueValue, { color: colors.foreground }]}>$2.4M</Text>
          <Text style={[styles.adminMetricTrend, { color: SALMON }]}>+14.8% vs last year</Text>
          <Text style={[styles.revenueTapHint, { color: SALMON }]}>Tap for full breakdown →</Text>
        </View>
        <RevenueSparkline />
      </TouchableOpacity>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionRowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>GYM NETWORK</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Users')}>
            <Text style={[styles.detailsLink, { color: SALMON }]}>MANAGE</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.activityList, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          {PLATFORM_GYMS.map((gym, idx) => (
            <View key={gym.id}>
              <View style={styles.adminTrainerRow}>
                <View style={[styles.activityIconCircle, { backgroundColor: 'rgba(250,24,24,0.1)', borderColor: 'rgba(250,24,24,0.2)' }]}>
                  <Text style={{ color: '#FA1818', fontFamily: 'BebasNeue_400Regular', fontSize: 16 }}>F</Text>
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={[styles.trainerName, { color: colors.foreground }]}>{gym.name}</Text>
                  <Text style={[styles.trainerRole, { color: colors.mutedForeground }]}>
                    {gym.members} members · {gym.admins} admins
                  </Text>
                </View>
                <View
                  style={[
                    styles.adminStatusBadge,
                    {
                      backgroundColor: gym.status === 'Healthy' ? 'rgba(34,197,94,0.12)' : 'rgba(250,24,24,0.12)',
                      borderColor: gym.status === 'Healthy' ? 'rgba(34,197,94,0.35)' : 'rgba(250,24,24,0.35)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.adminStatusText,
                      { color: gym.status === 'Healthy' ? '#22C55E' : '#FA1818' },
                    ]}
                  >
                    {gym.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              {idx < PLATFORM_GYMS.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: CARD_BORDER }]} />
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.locationBanner, { backgroundColor: CARD_BG, borderColor: CARD_BORDER, marginBottom: 32 }]}>
        <Text style={[styles.locationBannerText, { color: colors.mutedForeground }]}>
          Signed in as {user?.name ?? 'Super Admin'} · Full platform access
        </Text>
      </View>
    </ScreenScrollView>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

const AdminDashboard: React.FC<{ navigation: any; user: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [showAlert, setShowAlert] = useState(true);
  const {
    hasGymSubscription,
    canCheckEquipment,
    canViewAnalytics,
    hasLimitedEquipment,
    revenueAnalyticsTier,
    revenueDetails,
    equipmentCheckLimit,
    locationLimit,
    gymSubscription,
  } = useGymPlanAccess();

  const equipmentUsed = gymSubscription?.equipmentCheckedCount ?? 18;
  const equipmentLimit =
    equipmentCheckLimit === 'unlimited' ? 'unlimited' : Number(equipmentCheckLimit) || 25;
  const revenueLabel = `REV · TIER ${revenueAnalyticsTier}`;
  const revenueValue = revenueDetails.sampleRevenue;
  const revenueGrowth = revenueDetails.growth;

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.adminScrollContent}>
      <View style={[styles.header, { paddingTop: 12, backgroundColor: '#0D0D0D' }]}>
        <View style={styles.headerLeft} />
        <Text style={[styles.adminHeaderTitle, { color: SALMON }]}>ADMIN DASHBOARD</Text>
        <DashboardHeaderActions navigation={navigation} iconColor={colors.mutedForeground} />
      </View>

      <View style={styles.adminHeroSection}>
        <GradientText style={styles.commandCenterTitle}>COMMAND CENTER</GradientText>
        <Text style={[styles.commandCenterSubtitle, { color: colors.mutedForeground }]}>
          Live overview of facility performance and operational status.
        </Text>
      </View>

      {showAlert && canCheckEquipment ? (
        <View style={styles.adminAlertCard}>
          <View style={styles.adminAlertTopBar} />
          <View style={styles.adminAlertContent}>
            <View style={styles.adminAlertHeader}>
              <View style={styles.adminAlertTitleRow}>
                <AlertTriangleIcon color="#FA1818" />
                <Text style={styles.adminAlertLabel}>ACTION REQUIRED</Text>
                {hasLimitedEquipment ? (
                  <View style={styles.limitedBadge}>
                    <Text style={styles.limitedBadgeText}>LIMITED</Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => setShowAlert(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <XIcon color="#B8B8B8" size={18} />
              </TouchableOpacity>
            </View>
            <Text style={styles.adminAlertBody}>
              Equipment Maintenance Due: 3 Treadmills (Zone B)
            </Text>
            {hasLimitedEquipment ? (
              <Text style={styles.adminAlertMeta}>
                Tracking {equipmentUsed}/{equipmentLimit} assets · single location only
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.adminMetricsRow}>
        <View style={[styles.adminMetricCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>TOTAL MEMBERS</Text>
          <Text style={[styles.adminMetricValue, { color: colors.foreground }]}>10.2K</Text>
          <Text style={[styles.adminMetricTrend, { color: SALMON }]}>+6.2% vs last month</Text>
        </View>
        <View style={[styles.adminMetricCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>ACTIVE SESSIONS</Text>
          <Text style={[styles.adminMetricValue, { color: colors.foreground }]}>42</Text>
          <Text style={[styles.adminMetricSub, { color: colors.mutedForeground }]}>Live Now</Text>
        </View>
      </View>

      {canViewAnalytics ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Revenue')}
          style={[styles.adminRevenueCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.revenueLabelRow}>
              <Text style={[styles.adminMetricLabel, { color: colors.mutedForeground }]}>{revenueLabel}</Text>
              <View style={styles.limitedBadge}>
                <Text style={styles.limitedBadgeText}>TIER {revenueAnalyticsTier}</Text>
              </View>
            </View>
            <Text style={[styles.adminRevenueValue, { color: colors.foreground }]}>{revenueValue}</Text>
            <Text style={[styles.adminMetricTrend, { color: SALMON }]}>{revenueGrowth} vs last month</Text>
            <Text style={[styles.adminMetricSub, { color: colors.mutedForeground }]}>
              {revenueDetails.description}
            </Text>
            <Text style={[styles.revenueTapHint, { color: SALMON }]}>Tap for breakdown →</Text>
          </View>
          <RevenueSparkline />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate('Join')}
          style={[styles.lockedCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}
        >
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>REVENUE ANALYTICS LOCKED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Subscribe to a gym plan to view revenue insights.
          </Text>
        </TouchableOpacity>
      )}

      {hasGymSubscription && locationLimit === 1 ? (
        <View style={[styles.locationBanner, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={[styles.locationBannerText, { color: colors.mutedForeground }]}>
            SINGLE LOCATION PLAN · {gymSubscription?.gymName ?? 'Your gym'}
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionBlock}>
        <View style={styles.sectionRowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>WEEKLY ATTENDANCE</Text>
          <TouchableOpacity onPress={() => Alert.alert('Attendance', 'Detailed attendance report coming soon!')}>
            <Text style={[styles.detailsLink, { color: SALMON }]}>DETAILS</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.attendanceCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <View style={styles.attendanceBars}>
            {WEEKLY_ATTENDANCE.map((item, index) => (
              <View key={`${item.day}-${index}`} style={styles.attendanceBarCol}>
                <View style={styles.attendanceBarTrack}>
                  <View
                    style={[
                      styles.attendanceBarFill,
                      {
                        height: `${Math.round(item.value * 100)}%`,
                        backgroundColor: index >= 5 ? '#2A2A2A' : SALMON,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.attendanceDay, { color: colors.mutedForeground }]}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionRowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>MANAGE TRAINERS</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Trainers')}
            style={[styles.addTrainerBtn, { borderColor: CARD_BORDER, backgroundColor: '#1A1A1A' }]}
          >
            <PlusCircleIcon color={SALMON} size={18} />
          </TouchableOpacity>
        </View>
        <View style={[styles.activityList, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          {ADMIN_TRAINERS.map((trainer, idx) => (
            <View key={trainer.id}>
              <TouchableOpacity
                style={styles.adminTrainerRow}
                onPress={() => navigation.navigate('TrainerDetail', { trainerId: trainer.id })}
                activeOpacity={0.85}
              >
                <Image source={{ uri: trainer.image }} style={styles.trainerAvatar} />
                <View style={styles.trainerInfo}>
                  <Text style={[styles.trainerName, { color: colors.foreground }]}>{trainer.name}</Text>
                  <Text style={[styles.trainerRole, { color: colors.mutedForeground }]}>{trainer.role}</Text>
                </View>
                <View
                  style={[
                    styles.adminStatusBadge,
                    {
                      backgroundColor: trainer.status === 'Active' ? `${SALMON}22` : '#1F1F1F',
                      borderColor: trainer.status === 'Active' ? `${SALMON}55` : '#333333',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.adminStatusText,
                      { color: trainer.status === 'Active' ? SALMON : '#8C8C8C' },
                    ]}
                  >
                    {trainer.status}
                  </Text>
                </View>
              </TouchableOpacity>
              {idx < ADMIN_TRAINERS.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: CARD_BORDER }]} />
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.sectionBlock, { marginBottom: 32 }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECENT SIGNUPS</Text>
        <View style={[styles.signupCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          {RECENT_SIGNUPS.map((signup, idx) => (
            <View key={signup.id} style={styles.signupRow}>
              <View style={styles.signupTimeline}>
                <View style={[styles.signupDot, { backgroundColor: SALMON, borderColor: CARD_BG }]} />
                {idx < RECENT_SIGNUPS.length - 1 ? (
                  <View style={[styles.signupLine, { backgroundColor: CARD_BORDER }]} />
                ) : null}
              </View>
              <View style={styles.signupContent}>
                <View style={styles.signupHeader}>
                  <Text style={[styles.signupName, { color: colors.foreground }]}>{signup.name}</Text>
                  <Text style={[styles.signupTime, { color: colors.mutedForeground }]}>{signup.time}</Text>
                </View>
                <Text style={[styles.signupPlan, { color: colors.mutedForeground }]}>{signup.plan}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

const DashboardScreen: React.FC = ({ navigation }: any) => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  if (isSuperAdmin) {
    return <SuperAdminDashboard navigation={navigation} user={user} />;
  }
  return isAdmin
    ? <AdminDashboard navigation={navigation} user={user} />
    : <UserDashboard navigation={navigation} user={user} />;
};

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerLeft: { width: 40, alignItems: 'flex-start' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
    justifyContent: 'flex-end',
  },
  headerActionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FA1818',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    lineHeight: 11,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarSmall: { width: '100%', height: '100%' },

  // Greeting
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  greetingLabel: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  greetingName: {
    fontSize: 30,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 2,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickActionBtn: { flex: 1, alignItems: 'center' },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Section
  sectionBlock: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },

  // Streak Banner
  streakBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
  },
  streakMeta: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.5, marginBottom: 6 },
  streakValue: { fontSize: 28, fontFamily: 'BebasNeue_400Regular', letterSpacing: 1 },
  streakIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Row
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statCardLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },
  statCardValue: { fontSize: 32, fontFamily: 'BebasNeue_400Regular', letterSpacing: 1 },

  // Class Scroll
  classScroll: { paddingRight: 20, gap: 12 },
  classCard: {
    width: width * 0.58,
    height: 170,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  classCardImage: { ...StyleSheet.absoluteFill },
  classCardOverlay: { ...StyleSheet.absoluteFill },
  todayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  todayBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#000', letterSpacing: 0.5 },
  classCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  classCardTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  classCardTime: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_500Medium' },
  classCardName: { fontSize: 14, fontFamily: 'BebasNeue_400Regular', color: '#FFFFFF', letterSpacing: 1, marginBottom: 2 },
  classCardInstructor: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium' },

  // Activity / shared list card
  activityList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  activityTag: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  activityStats: { alignItems: 'flex-end' },
  activityDuration: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  activityKcal: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  divider: { height: 1, marginHorizontal: 16 },

  // Admin: Pending
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  pendingInitialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInitials: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  pendingInfo: { flex: 1 },
  pendingName: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  pendingMeta: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  pendingActions: { flexDirection: 'row', gap: 8 },
  pendingActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Admin: Trainers
  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  trainerAvatarWrap: { position: 'relative' },
  trainerAvatar: { width: 44, height: 44, borderRadius: 22 },
  trainerStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  trainerInfo: { flex: 1 },
  trainerName: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 1 },
  trainerRole: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  trainerNext: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  trainerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  trainerStatusText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // Admin Command Center
  adminScrollContent: {
    paddingBottom: 24,
  },
  adminHeaderTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  adminHeroSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  commandCenterTitle: {
    fontSize: 42,
    lineHeight: 44,
    marginBottom: 8,
  },
  commandCenterSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },
  adminAlertCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A0F0F',
    borderWidth: 1,
    borderColor: '#3A1515',
  },
  adminAlertTopBar: {
    height: 3,
    backgroundColor: '#FA1818',
  },
  adminAlertContent: {
    padding: 16,
  },
  adminAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adminAlertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminAlertLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: '#FA1818',
  },
  adminAlertBody: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#F0E0E0',
  },
  adminAlertMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#B8A0A0',
    marginTop: 6,
  },
  limitedBadge: {
    backgroundColor: 'rgba(232,142,131,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232,142,131,0.35)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  limitedBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    color: SALMON,
  },
  revenueLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueTapHint: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.3,
    marginTop: 10,
  },
  lockedCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  lockedTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  lockedBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  locationBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  locationBannerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  adminMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  adminMetricCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  adminMetricLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  adminMetricValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 1,
    marginBottom: 4,
  },
  adminMetricTrend: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  adminMetricSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  adminRevenueCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminRevenueValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 38,
    letterSpacing: 1,
    marginTop: 4,
  },
  detailsLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  attendanceCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },
  attendanceBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    height: 120,
  },
  attendanceBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  attendanceBarTrack: {
    width: '100%',
    maxWidth: 28,
    height: 88,
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1F1F1F',
  },
  attendanceBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  attendanceDay: {
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  addTrainerBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminTrainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  adminStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  adminStatusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  signupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  signupRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
  },
  signupTimeline: {
    width: 14,
    alignItems: 'center',
  },
  signupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginTop: 4,
  },
  signupLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -4,
  },
  signupContent: {
    flex: 1,
    paddingBottom: 14,
  },
  signupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  signupName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  signupTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  signupPlan: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
});

export default DashboardScreen;