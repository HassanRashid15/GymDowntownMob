import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import HorizontalScrollView from '../components/HorizontalScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationsContext';
import { useNavigation } from '@react-navigation/native';
import {
  AppNotification,
  NotificationFilter,
  matchesNotificationFilter,
  notificationFilters,
} from '../data/notifications';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const AlertIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const BoltIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

const SystemIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const NotificationIcon = ({ notification, muted }: { notification: AppNotification; muted: boolean }) => {
  const color = muted ? '#8C8C8C' : SALMON;
  if (notification.category === 'confirmation') return <CalendarIcon color={color} />;
  if (notification.category === 'facility') return <AlertIcon color={muted ? color : '#FA1818'} />;
  if (notification.category === 'directive') return <BoltIcon color={color} />;
  return <SystemIcon color={color} />;
};

const NotificationCard = ({
  notification,
  colors,
  onPress,
}: {
  notification: AppNotification;
  colors: any;
  onPress: () => void;
}) => {
  const muted = notification.read;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.notificationCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: muted ? 0.72 : 1,
        },
      ]}
    >
      {!notification.read ? <View style={[styles.unreadBar, { backgroundColor: SALMON }]} /> : null}
      <View style={styles.notificationContent}>
        <View style={styles.notificationTop}>
          <View style={[styles.iconCircle, { backgroundColor: muted ? '#1A1A1A' : `${SALMON}18` }]}>
            <NotificationIcon notification={notification} muted={muted} />
          </View>
          <View style={styles.notificationMeta}>
            <View style={styles.labelRow}>
              <Text style={[styles.notificationLabel, { color: muted ? colors.mutedForeground : SALMON }]}>
                {notification.label}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                {notification.time}
              </Text>
            </View>
            <Text style={[styles.notificationTitle, { color: colors.foreground }]} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationBody, { color: colors.mutedForeground }]} numberOfLines={2}>
              {notification.body}
            </Text>
            {notification.quote ? (
              <View style={[styles.quoteBox, { backgroundColor: '#0D0D0D', borderColor: colors.border }]}>
                <Text style={[styles.quoteText, { color: colors.mutedForeground }]}>{notification.quote}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { notifications, unreadCount, acknowledgeAll, markAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => matchesNotificationFilter(notification, activeFilter)),
    [notifications, activeFilter]
  );

  const todayNotifications = filteredNotifications.filter((notification) => notification.group === 'today');
  const yesterdayNotifications = filteredNotifications.filter((notification) => notification.group === 'yesterday');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>NOTIFICATIONS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>SYSTEM PROTOCOLS</Text>
          <View style={styles.heroRow}>
            <Text style={[styles.unreadText, { color: colors.mutedForeground }]}>
              {unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}
            </Text>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={acknowledgeAll}>
                <Text style={[styles.acknowledgeAll, { color: SALMON }]}>ACKNOWLEDGE ALL</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <HorizontalScrollView contentContainerStyle={styles.filterRow}>
          {notificationFilters.map((filter) => {
            const selected = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? SALMON : colors.card,
                    borderColor: selected ? SALMON : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selected ? '#0D0D0D' : colors.foreground },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </HorizontalScrollView>

        <View style={styles.listSection}>
          {todayNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              colors={colors}
              onPress={() => markAsRead(notification.id)}
            />
          ))}

          {yesterdayNotifications.length > 0 ? (
            <View style={styles.dayDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>YESTERDAY</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
          ) : null}

          {yesterdayNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              colors={colors}
              onPress={() => markAsRead(notification.id)}
            />
          ))}

          {filteredNotifications.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No alerts in this category.
              </Text>
            </View>
          ) : null}
        </View>
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
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
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 48,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 1,
    marginBottom: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  unreadText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  acknowledgeAll: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  filterRow: {
    paddingHorizontal: 24,
    gap: 10,
    paddingBottom: 22,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  listSection: {
    paddingHorizontal: 24,
    gap: 14,
    paddingBottom: 8,
  },
  notificationCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  unreadBar: {
    width: 4,
  },
  notificationContent: {
    flex: 1,
    padding: 16,
  },
  notificationTop: {
    flexDirection: 'row',
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMeta: {
    flex: 1,
    minWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  notificationTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  notificationTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    marginBottom: 4,
  },
  notificationBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  quoteBox: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  quoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  dayDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
});

export default NotificationsScreen;
