import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PublicAppHeader, { PUBLIC_HEADER_OVERLAP } from '../components/PublicAppHeader';

type ScreenLayoutProps = {
  children: React.ReactElement;
  options: { headerShown?: boolean };
  route: { name: string };
};

const AUTH_ROUTES = new Set(['Login', 'Register', 'ForgotPassword', 'EmailVerification']);
/** Screens with their own top chrome — no shared PublicAppHeader */
const NO_PUBLIC_HEADER = new Set(['Notifications', ...AUTH_ROUTES]);

/**
 * Top safe-area + shared public header (logo | notifications).
 * Skips auth screens, Notifications, and the MainTabs stack shell.
 */
export const safeAreaScreenLayout = ({ children, options, route }: ScreenLayoutProps) => {
  if (route.name === 'MainTabs') {
    return children;
  }

  if (NO_PUBLIC_HEADER.has(route.name)) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        {children}
      </SafeAreaView>
    );
  }

  // Header is full-bleed (handles status bar). Page bg peeks through bottom corner curves.
  return (
    <View style={styles.flex}>
      <PublicAppHeader />
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  body: {
    flex: 1,
    marginTop: -PUBLIC_HEADER_OVERLAP,
    zIndex: 1,
  },
});
