import React, { useCallback, useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUser,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

function userIdOf(u: AdminUser) {
  return String(u.userId || u.user_id || u.id || '');
}

function nameOf(u: AdminUser) {
  return String(u.fullName || u.full_name || u.email || userIdOf(u));
}

const LiveUsersScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'trainer'>('user');

  const load = useCallback(async () => {
    try {
      const data = await listAdminUsers(q || undefined);
      setUsers(data.users || []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required', 'Name and email are required');
      return;
    }
    try {
      await createAdminUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password: password || undefined,
        role,
      });
      setFullName('');
      setEmail('');
      setPassword('');
      await load();
      Alert.alert('Created', 'User created');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Create failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })}>
          <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.foreground, fontFamily: 'BebasNeue_400Regular', fontSize: 22 }}>
          LIVE USERS
        </Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            onSubmitEditing={load}
          />

          {users.map((u) => {
            const id = userIdOf(u);
            return (
              <View key={id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{nameOf(u)}</Text>
                <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>
                  {String(u.email || '')} · {String(u.role || 'user')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={async () => {
                      await updateAdminUser({ userId: id, action: 'approve' });
                      await load();
                    }}
                  >
                    <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      await deleteAdminUser(id);
                      await load();
                    }}
                  >
                    <Text style={{ color: '#FA1818', fontFamily: 'Inter_600SemiBold' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', marginTop: 16, marginBottom: 8 }}>
            CREATE MEMBER / TRAINER
          </Text>
          <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password (optional)"
              secureTextEntry
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
              {(['user', 'trainer'] as const).map((r) => (
                <TouchableOpacity key={r} onPress={() => setRole(r)}>
                  <Text style={{ color: role === r ? SALMON : colors.mutedForeground }}>
                    {role === r ? '● ' : '○ '}
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={create} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>CREATE</Text>
            </TouchableOpacity>
          </View>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  primaryBtn: { backgroundColor: SALMON, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#0D0D0D', fontFamily: 'Inter_700Bold' },
});

export default LiveUsersScreen;
