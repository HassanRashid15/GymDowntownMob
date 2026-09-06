import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SALMON_COLOR = '#E88E83';

type AuthCooldownBannerProps = {
  formattedTime: string;
  remainingSeconds: number;
  progress: number;
  actionLabel: 'sign in' | 'sign up';
  source?: 'supabase' | 'client';
};

const AuthCooldownBanner: React.FC<AuthCooldownBannerProps> = ({
  formattedTime,
  remainingSeconds,
  progress,
  actionLabel,
  source = 'client',
}) => {
  if (remainingSeconds <= 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>COOLING DOWN</Text>
        <Text style={styles.timer}>{formattedTime}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.subtitle}>
        {source === 'supabase'
          ? `Supabase rate limit active. Wait ${formattedTime} before ${actionLabel} again.`
          : `Too many ${actionLabel} attempts. Wait for the cooldown before trying again.`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 142, 131, 0.35)',
    backgroundColor: 'rgba(232, 142, 131, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: SALMON_COLOR,
    fontSize: 13,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 2,
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#2C2C2E',
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: SALMON_COLOR,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
  },
});

export default AuthCooldownBanner;
