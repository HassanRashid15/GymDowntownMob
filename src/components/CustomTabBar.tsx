import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getNameInitials } from '../utils/nameInitials';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';

const SALMON = '#E88E83';
const CENTER_SIZE = 56;
const BUMP_SIZE = 68;

const HomeIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const DumbbellIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6.5 6.5l11 11" />
    <Path d="M21 21l-1-1" />
    <Path d="M3 3l1 1" />
    <Path d="M18 22l4-4" />
    <Path d="M2 6l4-4" />
    <Path d="M3 10l7-7" />
    <Path d="M14 21l7-7" />
  </Svg>
);

const UsersIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const ZapIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

const UserIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  const CENTER_INDEX = 2;

  const tabs = useMemo(
    () => [
      { name: 'Home', icon: HomeIcon, label: 'Home' },
      { name: 'Classes', icon: DumbbellIcon, label: 'Classes' },
      isSuperAdmin
        ? { name: 'Users', icon: UsersIcon, label: 'Users' }
        : { name: 'Trainers', icon: UsersIcon, label: 'Trainers' },
      { name: 'Join', icon: ZapIcon, label: 'Join' },
      { name: 'Settings', icon: UserIcon, label: 'Profile' },
    ],
    [isSuperAdmin]
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.floatingBar,
          {
            backgroundColor: colors.card,
            paddingBottom: 8 + insets.bottom,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Center bump — full-width row + alignItems center (reliable on devices) */}
        <View style={styles.bumpRow} pointerEvents="none">
          <View style={[styles.bumpCircle, { backgroundColor: colors.card }]} />
        </View>

        <View style={styles.tabBarContent}>
          {tabs.map((tab, index) => {
            const isFocused = state.index === index;
            const isCenter = index === CENTER_INDEX;
            const isProfileTab = tab.name === 'Settings';
            const hasAvatar = isProfileTab && !!user?.avatar?.trim();
            const profileInitials = user ? getNameInitials(user.name) : '';
            const IconComponent = tab.icon;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[index].key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(state.routes[index].name);
              }
            };

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconSlot,
                    isCenter && styles.centerIconSlot,
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      isCenter && styles.centerIconContainer,
                      isCenter && { backgroundColor: SALMON },
                    ]}
                  >
                    {hasAvatar ? (
                      <View
                        style={[
                          styles.avatarRing,
                          { borderColor: isFocused ? SALMON : 'transparent' },
                        ]}
                      >
                        <Image source={{ uri: user!.avatar }} style={styles.avatarImage} />
                      </View>
                    ) : isProfileTab && user ? (
                      <View
                        style={[
                          styles.initialsRing,
                          {
                            borderColor: isFocused ? SALMON : '#C5A059',
                            backgroundColor: `${SALMON}22`,
                          },
                        ]}
                      >
                        <Text style={[styles.initialsText, { color: SALMON }]}>
                          {profileInitials}
                        </Text>
                      </View>
                    ) : (
                      <IconComponent
                        size={isCenter ? 26 : 22}
                        color={
                          isCenter
                            ? '#000000'
                            : isFocused
                              ? SALMON
                              : colors.mutedForeground
                        }
                      />
                    )}
                  </View>
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused
                        ? isProfileTab
                          ? SALMON
                          : isCenter
                            ? SALMON
                            : colors.primary
                        : colors.mutedForeground,
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                >
                  {tab.name === 'Join'
                    ? isSuperAdmin
                      ? 'Subscription'
                      : isAdmin
                        ? 'Plan'
                        : tab.label
                    : tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  floatingBar: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    overflow: 'visible',
  },
  bumpRow: {
    position: 'absolute',
    top: -(BUMP_SIZE / 2 - 8),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  bumpCircle: {
    width: BUMP_SIZE,
    height: BUMP_SIZE,
    borderRadius: BUMP_SIZE / 2,
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 6,
  },
  iconSlot: {
    width: 44,
    height: 44,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIconSlot: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    marginTop: -28,
    marginBottom: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIconContainer: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  avatarRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    padding: 1,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  initialsRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 13,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
});

export default CustomTabBar;
