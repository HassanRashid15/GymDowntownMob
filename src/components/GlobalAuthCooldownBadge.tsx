import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthCooldownHeaderBadge from './AuthCooldownHeaderBadge';
import {
  formatCooldownTime,
  getActiveAuthCooldownProgress,
} from '../api/auth';

/** Approximate floating tab bar height so the badge sits above it. */
const TAB_BAR_CLEARANCE = 88;

const GlobalAuthCooldownBadge: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [source, setSource] = useState<'supabase' | 'client'>('supabase');

  const refresh = useCallback(async () => {
    const next = await getActiveAuthCooldownProgress();
    setRemainingSeconds(next.remainingSeconds);
    setProgress(next.progress);
    setSource(next.source ?? 'supabase');
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (remainingSeconds <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        Platform.OS === 'web' ? styles.overlayWeb : null,
        { bottom: Math.max(insets.bottom, 12) + TAB_BAR_CLEARANCE },
      ]}
    >
      <AuthCooldownHeaderBadge
        formattedTime={formatCooldownTime(remainingSeconds)}
        remainingSeconds={remainingSeconds}
        progress={progress}
        source={source}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    zIndex: 99999,
    elevation: 99999,
  },
  overlayWeb: {
    position: 'fixed' as 'absolute',
  },
});

export default GlobalAuthCooldownBadge;
