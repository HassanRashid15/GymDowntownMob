import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SALMON_COLOR = '#E88E83';

type AuthCooldownHeaderBadgeProps = {
  formattedTime: string;
  remainingSeconds: number;
  progress: number;
  source?: 'supabase' | 'client';
};

const AuthCooldownHeaderBadge: React.FC<AuthCooldownHeaderBadgeProps> = ({
  formattedTime,
  remainingSeconds,
  progress,
  source = 'client',
}) => {
  if (remainingSeconds <= 0) {
    return null;
  }

  return (
    <View
      style={styles.badge}
      accessibilityLabel={`Wait ${formattedTime} before trying again`}
    >
      <Text style={styles.label}>
        {source === 'supabase' ? 'SUPABASE WAIT' : 'COOLDOWN'}
      </Text>
      <Text style={styles.timer}>{formattedTime}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(232, 142, 131, 0.55)',
    backgroundColor: 'rgba(18, 18, 18, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
    shadowColor: SALMON_COLOR,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  label: {
    color: SALMON_COLOR,
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginBottom: 2,
    textAlign: 'center',
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    lineHeight: 22,
    textAlign: 'center',
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: 999,
    backgroundColor: '#2C2C2E',
    overflow: 'hidden',
    marginTop: 5,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: SALMON_COLOR,
  },
});

export default AuthCooldownHeaderBadge;
