import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications } from '../context/NotificationsContext';
import { useTheme } from '../context/ThemeContext';
import { AppNotification } from '../data/notifications';

const SALMON = '#E88E83';
const HEADER_TOP = '#2A1C1C';
const HEADER_BOTTOM = '#1A1214';

export const PUBLIC_HEADER_OVERLAP = 18;

const DropdownItem = ({
  notification,
  onPress,
  colors,
}: {
  notification: AppNotification;
  onPress: () => void;
  colors: { foreground: string; mutedForeground: string; border: string };
}) => {
  const muted = notification.read;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
    >
      <View style={styles.dropdownItemRow}>
        {!notification.read ? <View style={styles.unreadDot} /> : <View style={styles.unreadDotSpacer} />}
        <View style={styles.dropdownItemText}>
          <View style={styles.dropdownItemMeta}>
            <Text
              style={[styles.dropdownLabel, { color: muted ? colors.mutedForeground : SALMON }]}
              numberOfLines={1}
            >
              {notification.label}
            </Text>
            <Text style={[styles.dropdownTime, { color: colors.mutedForeground }]}>
              {notification.time}
            </Text>
          </View>
          <Text
            style={[styles.dropdownTitle, { color: colors.foreground, opacity: muted ? 0.7 : 1 }]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={[styles.dropdownBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Tall branded header — large rounded bottom corners,
 * logo left · notifications right (aligned, no decorative orbs).
 */
const PublicAppHeader: React.FC = () => {
  const navigation = useNavigation<any>();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const headerPaddingTop = Math.max(insets.top, 12) + 10;

  const closeDropdown = () => setDropdownOpen(false);

  const openNotificationsScreen = () => {
    closeDropdown();
    navigation.navigate('Notifications');
  };

  const handleNotificationPress = (id: string) => {
    markAsRead(id);
    closeDropdown();
    navigation.navigate('Notifications');
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[HEADER_TOP, HEADER_BOTTOM]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop: headerPaddingTop,
          },
        ]}
      >
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            style={styles.logoHit}
            hitSlop={8}
          >
            <Image
              source={require('../../assets/mob_app.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDropdownOpen(true)}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <View style={styles.dropdownOverlay}>
          <Pressable style={styles.dropdownBackdrop} onPress={closeDropdown} />
          <View
            style={[
              styles.dropdownPanel,
              {
                top: headerPaddingTop + 64 + 8,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.dropdownHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dropdownHeaderTitle, { color: colors.foreground }]}>
                Notifications
              </Text>
              {unreadCount > 0 ? (
                <Text style={styles.dropdownHeaderCount}>{unreadCount} new</Text>
              ) : null}
            </View>

            <ScrollView
              style={styles.dropdownList}
              bounces={false}
              showsVerticalScrollIndicator={false}
              {...(Platform.OS === 'web' ? { dataSet: { hideScrollbar: 'true' } } : {})}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownItem
                    key={notification.id}
                    notification={notification}
                    colors={colors}
                    onPress={() => handleNotificationPress(notification.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No notifications yet
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openNotificationsScreen}
              style={[styles.viewAllButton, { borderTopColor: colors.border }]}
            >
              <Text style={styles.viewAllText}>View All Notifications</Text>
              <Ionicons name="chevron-forward" size={16} color={SALMON} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    zIndex: 20,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingLeft: 0,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    overflow: 'hidden',
    borderBottomWidth: 1.5,
    borderColor: 'rgba(232,142,131,0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logoHit: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    width: 188,
    height: 58,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SALMON,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: HEADER_BOTTOM,
  },
  badgeText: {
    color: '#0D0D0D',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    lineHeight: 11,
  },
  dropdownOverlay: {
    flex: 1,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dropdownPanel: {
    position: 'absolute',
    right: 16,
    width: 320,
    maxWidth: '92%',
    maxHeight: 420,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownHeaderTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  dropdownHeaderCount: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: SALMON,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SALMON,
    marginTop: 5,
    marginRight: 10,
  },
  unreadDotSpacer: {
    width: 8,
    height: 8,
    marginTop: 5,
    marginRight: 10,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    gap: 8,
  },
  dropdownLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  dropdownTime: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  dropdownTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  dropdownBody: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  emptyState: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: SALMON,
    letterSpacing: 0.2,
  },
});

export default PublicAppHeader;
