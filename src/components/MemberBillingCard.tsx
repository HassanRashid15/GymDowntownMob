import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getMembershipMe, isHubApiConfigured, type MembershipMe } from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getCountdown(periodEnd: string | null | undefined): CountdownParts | null {
  if (!periodEnd) return null;
  const end = new Date(periodEnd).getTime();
  if (Number.isNaN(end)) return null;
  const ms = Math.max(0, end - Date.now());
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86_400),
    hours: Math.floor((totalSec % 86_400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    done: totalSec === 0,
  };
}

const Unit = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <View style={styles.unit}>
    <Text style={[styles.unitValue, { color }]}>{String(value).padStart(2, '0')}</Text>
    <Text style={styles.unitLabel}>{label}</Text>
  </View>
);

type Props = {
  billing?: MembershipMe | null;
  compact?: boolean;
};

const MemberBillingCard: React.FC<Props> = ({ billing: billingProp, compact }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [data, setData] = useState<MembershipMe | null>(billingProp ?? null);
  const [loading, setLoading] = useState(!billingProp);
  const [countdown, setCountdown] = useState<CountdownParts | null>(null);

  const load = useCallback(async () => {
    if (billingProp) {
      setData(billingProp);
      setLoading(false);
      return;
    }
    if (!isHubApiConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const me = await getMembershipMe();
      setData(me);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [billingProp]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCountdown(getCountdown(data?.periodEnd));
    if (!data?.periodEnd) return;
    const id = setInterval(() => setCountdown(getCountdown(data.periodEnd)), 1000);
    return () => clearInterval(id);
  }, [data?.periodEnd]);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
        <ActivityIndicator color={SALMON} />
      </View>
    );
  }

  if (!data?.hasGym) return null;

  const urgent = Boolean(countdown?.done || data.overdue);
  const warn = Boolean(data.dueSoon && !urgent);
  const accent = urgent ? '#FA1818' : warn ? '#F5A623' : SALMON;

  return (
    <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>MONTHLY FEE</Text>
        {countdown ? (
          <View
            style={[
              styles.countdownBox,
              {
                borderColor: urgent ? '#FA181844' : warn ? '#F5A62344' : CARD_BORDER,
                backgroundColor: urgent ? '#FA181818' : warn ? '#F5A62318' : '#1C1C1E',
              },
            ]}
          >
            {countdown.done ? (
              <Text style={[styles.dueNow, { color: '#FA1818' }]}>DUE NOW</Text>
            ) : (
              <View style={styles.countdownRow}>
                <Unit value={countdown.days} label="d" color={accent} />
                <Text style={styles.colon}>:</Text>
                <Unit value={countdown.hours} label="h" color={accent} />
                <Text style={styles.colon}>:</Text>
                <Unit value={countdown.minutes} label="m" color={accent} />
                <Text style={styles.colon}>:</Text>
                <Unit value={countdown.seconds} label="s" color={accent} />
              </View>
            )}
          </View>
        ) : null}
      </View>

      <Text style={[styles.gymName, { color: colors.foreground }]}>
        {data.gymName || 'Your gym'}
      </Text>
      <Text style={[styles.feeLine, { color: accent }]}>
        {data.feeLabel || 'Fee'}
        {data.overdue
          ? ' · Overdue'
          : data.dueSoon
            ? ` · ${data.daysLeft ?? '—'} days left (due soon)`
            : data.daysLeft != null
              ? ` · ${data.daysLeft} days left`
              : ''}
      </Text>

      {data.periodEnd ? (
        <Text style={[styles.periodHint, { color: colors.mutedForeground }]}>
          Period ends {new Date(data.periodEnd).toLocaleDateString()}
        </Text>
      ) : null}

      {!compact ? (
        <View style={styles.links}>
          <TouchableOpacity onPress={() => navigation.navigate('Attendance')}>
            <Text style={styles.link}>CHECK IN →</Text>
          </TouchableOpacity>
          {data.gymOwnerId ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('GymDetail', { ownerId: data.gymOwnerId })}
            >
              <Text style={styles.link}>VIEW GYM →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  countdownBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  countdownRow: { flexDirection: 'row', alignItems: 'flex-start' },
  unit: { minWidth: 28, alignItems: 'center' },
  unitValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  unitLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colon: {
    fontFamily: 'Inter_600SemiBold',
    color: '#555',
    paddingTop: 2,
    marginHorizontal: 2,
  },
  dueNow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  gymName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  feeLine: {
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
  },
  periodHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  links: { marginTop: 12, gap: 8 },
  link: {
    color: SALMON,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
});

export default MemberBillingCard;
