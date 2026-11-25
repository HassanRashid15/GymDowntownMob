import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  checkIn,
  checkOut,
  getOpenCheckin,
  isCheckedInToday,
  isHubApiConfigured,
  listAttendance,
  type AttendanceCheckin,
} from '../api/hub';
import { getCurrentCoords } from '../utils/location';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const AttendanceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isAdmin, isSuperAdmin } = useAuth();

  const scope: 'me' | 'gym' = isAdmin || isSuperAdmin ? 'gym' : 'me';
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [checkins, setCheckins] = useState<AttendanceCheckin[]>([]);
  const [meCheckins, setMeCheckins] = useState<AttendanceCheckin[]>([]);
  const [doneToday, setDoneToday] = useState(false);
  const [openSession, setOpenSession] = useState<AttendanceCheckin | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setError('Set EXPO_PUBLIC_API_BASE_URL to your gym-journey-hub URL.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const me = await listAttendance('me');
      const mine = me.checkins || [];
      setMeCheckins(mine);
      setDoneToday(isCheckedInToday(mine));
      setOpenSession(getOpenCheckin(mine));
      if (scope === 'gym') {
        const gym = await listAttendance('gym');
        setCheckins(gym.checkins || []);
      } else {
        setCheckins(mine);
      }
    } catch (e: any) {
      setError(e?.message || 'Could not load attendance');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const onCheckIn = async () => {
    setBusy(true);
    try {
      const coords = await getCurrentCoords();
      const res = await checkIn(coords ? 'gps' : 'manual', coords || undefined);
      if (res.needsCheckout) {
        Alert.alert(
          'Still checked in',
          'You have an open session. Check out first, then check in again.'
        );
      } else {
        Alert.alert(
          'Check-in',
          res.alreadyCheckedIn
            ? 'Already checked in today'
            : coords
              ? 'Checked in with GPS!'
              : 'Checked in! (location optional — enable GPS next time for gym pin)'
        );
      }
      await load();
    } catch (e: any) {
      Alert.alert('Check-in failed', e?.message || 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const onCheckOut = async () => {
    setBusy(true);
    try {
      await checkOut(openSession?.id);
      Alert.alert('Check-out', 'Session closed. Nice work.');
      await load();
    } catch (e: any) {
      Alert.alert('Check-out failed', e?.message || 'Try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })} hitSlop={12}>
          <Text style={[styles.backText, { color: SALMON }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>ATTENDANCE</Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          {error ? (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{error}</Text>
            </View>
          ) : null}

          {!isAdmin && !isSuperAdmin ? (
            <View style={{ marginBottom: 20 }}>
              {openSession ? (
                <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: SALMON }]}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>OPEN SESSION</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground, marginBottom: 12 }]}>
                    Since {new Date(openSession.checked_in_at).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={onCheckOut}
                    disabled={busy}
                    style={[styles.checkInBtn, { backgroundColor: SALMON, borderColor: SALMON }]}
                  >
                    {busy ? (
                      <ActivityIndicator color="#0D0D0D" />
                    ) : (
                      <Text style={[styles.checkInText, { color: '#0D0D0D' }]}>CHECK OUT</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={onCheckIn}
                  disabled={busy}
                  style={[
                    styles.checkInBtn,
                    {
                      backgroundColor: SALMON,
                      borderColor: SALMON,
                      opacity: busy ? 0.7 : 1,
                    },
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color="#0D0D0D" />
                  ) : (
                    <Text style={[styles.checkInText, { color: '#0D0D0D' }]}>
                      {doneToday ? 'CHECK IN AGAIN (GPS)' : 'CHECK IN WITH GPS'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {doneToday && !openSession ? (
                <Text style={[styles.meta, { color: colors.mutedForeground, marginTop: 8, textAlign: 'center' }]}>
                  You already checked in today ({meCheckins.filter((c) => isCheckedInToday([c])).length} session
                  {meCheckins.filter((c) => isCheckedInToday([c])).length === 1 ? '' : 's'}).
                </Text>
              ) : null}
            </View>
          ) : null}

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            {scope === 'gym' ? 'GYM CHECK-INS' : 'YOUR CHECK-INS'}
          </Text>

          {checkins.length === 0 ? (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>No check-ins yet.</Text>
          ) : (
            checkins.map((row) => {
              const open = row.open === true || (row.checked_in_at && !row.checked_out_at);
              return (
                <View
                  key={row.id}
                  style={[styles.card, { backgroundColor: CARD_BG, borderColor: open ? SALMON : CARD_BORDER }]}
                >
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                    In {new Date(row.checked_in_at).toLocaleString()}
                  </Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {row.checked_out_at
                      ? `Out ${new Date(row.checked_out_at).toLocaleString()}`
                      : open
                        ? 'Still open'
                        : '—'}
                    {' · '}
                    {scope === 'gym' ? `${(row.full_name || row.user_id || '').toString().slice(0, 24)} · ` : ''}
                    {row.source}
                  </Text>
                </View>
              );
            })
          )}
        </ScreenScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  checkInBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkInText: { fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 4 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
});

export default AttendanceScreen;
