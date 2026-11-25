import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  bookClassSession,
  createClass,
  createClassSession,
  getMembershipMe,
  isHubApiConfigured,
  listClasses,
  type ClassSession,
  type GymClass,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const LiveClassesScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { isAdmin, isSuperAdmin } = useAuth();

  const [gymOwnerId, setGymOwnerId] = useState<string>(String(route.params?.gymOwnerId || ''));
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [tab, setTab] = useState<'classes' | 'schedule'>('schedule');
  const [className, setClassName] = useState('');
  const [sessionClassId, setSessionClassId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classMap = useMemo(() => {
    const map = new Map<string, GymClass>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setError('Set EXPO_PUBLIC_API_BASE_URL to your hub URL.');
      setLoading(false);
      return;
    }
    try {
      let owner = gymOwnerId;
      if (!owner) {
        const me = await getMembershipMe();
        owner = me.gymOwnerId || '';
        setGymOwnerId(owner);
      }
      if (!owner) {
        setError('Join a gym to see live classes.');
        setLoading(false);
        return;
      }
      const data = await listClasses(owner);
      setClasses(data.classes || []);
      setSessions(
        (data.sessions || []).sort(
          (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        )
      );
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load classes');
    } finally {
      setLoading(false);
    }
  }, [gymOwnerId]);

  useEffect(() => {
    load();
  }, [load]);

  const onBook = async (sessionId: string) => {
    setBusy(true);
    try {
      await bookClassSession(sessionId);
      Alert.alert('Booked', 'Session booked successfully');
    } catch (e: any) {
      Alert.alert('Booking failed', e?.message || 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const onCreateClass = async () => {
    if (!className.trim()) return;
    setBusy(true);
    try {
      await createClass({ name: className.trim() });
      setClassName('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create class');
    } finally {
      setBusy(false);
    }
  };

  const onCreateSession = async () => {
    if (!sessionClassId || !startsAt.trim()) {
      Alert.alert('Missing', 'Pick a class and ISO datetime (e.g. 2026-09-20T18:00:00)');
      return;
    }
    setBusy(true);
    try {
      await createClassSession({ classId: sessionClassId, startsAt: startsAt.trim() });
      setStartsAt('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not schedule session');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })}>
          <Text style={[styles.backText, { color: SALMON }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>LIVE CLASSES</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={styles.tabs}>
        {(['schedule', 'classes'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { borderBottomColor: SALMON }]}
          >
            <Text style={{ color: tab === t ? SALMON : colors.mutedForeground, fontFamily: 'Inter_700Bold' }}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          {error ? (
            <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>{error}</Text>
          ) : null}

          {tab === 'schedule'
            ? sessions.map((s) => (
                <View key={s.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
                  <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>
                    {classMap.get(s.class_id)?.name || 'Class'}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>
                    {new Date(s.starts_at).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onBook(s.id)}
                    disabled={busy}
                    style={[styles.bookBtn, { opacity: busy ? 0.7 : 1 }]}
                  >
                    <Text style={styles.bookText}>BOOK</Text>
                  </TouchableOpacity>
                </View>
              ))
            : classes.map((c) => (
                <View key={c.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
                  <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{c.name}</Text>
                  {c.description ? (
                    <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>{c.description}</Text>
                  ) : null}
                  <Text style={{ color: SALMON, marginTop: 6, fontSize: 12 }}>
                    {c.duration_minutes ? `${c.duration_minutes} min` : ''}
                    {c.capacity ? ` · cap ${c.capacity}` : ''}
                  </Text>
                </View>
              ))}

          {(isAdmin || isSuperAdmin) && !isSuperAdmin ? (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER, marginTop: 16 }]}>
              <Text style={[styles.section, { color: colors.mutedForeground }]}>ADMIN · NEW CLASS</Text>
              <TextInput
                value={className}
                onChangeText={setClassName}
                placeholder="Class name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
              />
              <TouchableOpacity onPress={onCreateClass} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>CREATE CLASS</Text>
              </TouchableOpacity>

              <Text style={[styles.section, { color: colors.mutedForeground, marginTop: 16 }]}>
                SCHEDULE SESSION
              </Text>
              {classes.map((c) => (
                <TouchableOpacity key={c.id} onPress={() => setSessionClassId(c.id)}>
                  <Text style={{ color: sessionClassId === c.id ? SALMON : colors.mutedForeground, marginBottom: 6 }}>
                    {sessionClassId === c.id ? '● ' : '○ '}
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TextInput
                value={startsAt}
                onChangeText={setStartsAt}
                placeholder="2026-09-20T18:00:00"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
              />
              <TouchableOpacity onPress={onCreateSession} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>ADD SESSION</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {sessions.length === 0 && tab === 'schedule' && !error ? (
            <Text style={{ color: colors.mutedForeground }}>No upcoming sessions.</Text>
          ) : null}
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
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginBottom: 8 },
  tab: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  bookBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: SALMON,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bookText: { fontFamily: 'Inter_700Bold', color: '#0D0D0D' },
  section: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  primaryBtn: { backgroundColor: SALMON, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryText: { fontFamily: 'Inter_700Bold', color: '#0D0D0D' },
});

export default LiveClassesScreen;
