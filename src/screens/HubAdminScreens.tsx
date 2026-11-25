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
import { useAuth } from '../context/AuthContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  createPromotion,
  deletePromotion,
  getMonthlyMembers,
  getPendingAdmins,
  getPlatformSettings,
  isHubApiConfigured,
  listAdminPromotions,
  listAdminUsers,
  listNewsletterSubs,
  listPublicPromotions,
  pendingAdminAction,
  removeNewsletterSub,
  updatePlatformSettings,
  type AdminUser,
  type MonthlyMember,
  type HubPromotion,
  type NewsletterSub,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

function ScreenShell({
  title,
  children,
  loading,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })}>
          <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.foreground, fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1.5 }}>
          {title}
        </Text>
        <View style={{ width: 56 }} />
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>{children}</ScreenScrollView>
      )}
    </View>
  );
}

export const MonthlyFeeScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MonthlyMember[]>([]);
  const [meta, setMeta] = useState<{ gymName?: string | null; monthlyFee?: string | null; trainerFee?: string | null }>({});

  useEffect(() => {
    getMonthlyMembers()
      .then((data) => {
        setMembers(data.members || []);
        setMeta({ gymName: data.gymName, monthlyFee: data.monthlyFee, trainerFee: data.trainerFee });
      })
      .catch((e) => Alert.alert('Error', e?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenShell title="MONTHLY FEE" loading={loading}>
      <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', marginBottom: 8 }}>
        {meta.gymName || 'Your gym'}
      </Text>
      <Text style={{ color: colors.mutedForeground, marginBottom: 16 }}>
        Fee {meta.monthlyFee || '—'} · Trainer {meta.trainerFee || '—'}
      </Text>
      {members.map((m) => (
        <View key={m.userId} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{m.fullName || m.email}</Text>
          <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>
            {m.monthlyFee || '—'} · {m.daysLeft ?? '—'} days left
            {m.hasTrainer ? ' · trainer' : ''}
          </Text>
        </View>
      ))}
      {members.length === 0 ? (
        <Text style={{ color: colors.mutedForeground }}>No members found.</Text>
      ) : null}
    </ScreenShell>
  );
};

export const StatisticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, users: 0, fee: '—' as string | number });

  useEffect(() => {
    Promise.all([getPendingAdmins().catch(() => null), listAdminUsers().catch(() => null), getPlatformSettings().catch(() => null)])
      .then(([pending, users, settings]) => {
        setStats({
          pending: pending?.pending?.length || 0,
          users: users?.users?.length || 0,
          fee: settings?.platformFacilityFee ?? '—',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenShell title="STATISTICS" loading={loading}>
      <View style={styles.statsRow}>
        {[
          { label: 'PENDING', value: stats.pending },
          { label: 'USERS', value: stats.users },
          { label: 'FACILITY FEE', value: stats.fee },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: 'Inter_700Bold' }}>{s.label}</Text>
            <Text style={{ color: colors.foreground, fontFamily: 'BebasNeue_400Regular', fontSize: 26, marginTop: 6 }}>
              {String(s.value)}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>
        Live platform snapshot from Hub APIs (pending + users + settings).
      </Text>
    </ScreenShell>
  );
};

export const PendingApprovalsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<AdminUser[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await getPendingAdmins();
      setPending(data.pending || []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await pendingAdminAction(userId, action);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Action failed');
    }
  };

  return (
    <ScreenShell title="APPROVALS" loading={loading}>
      {pending.map((p) => {
        const id = String(p.userId || p.user_id || p.id || '');
        return (
          <View key={id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>
              {String(p.fullName || p.full_name || p.email || id)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity onPress={() => act(id, 'approve')} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => act(id, 'reject')} style={styles.secondaryBtn}>
                <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>REJECT</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      {pending.length === 0 ? <Text style={{ color: colors.mutedForeground }}>No pending admins.</Text> : null}
    </ScreenShell>
  );
};

export const PromotionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HubPromotion[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const load = useCallback(async () => {
    try {
      if (!isHubApiConfigured()) return;
      const data = isSuperAdmin ? await listAdminPromotions() : await listPublicPromotions();
      setItems(data.promotions || []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!title.trim()) return;
    try {
      await createPromotion({ title: title.trim(), body: body.trim(), isPublished: true, showOnHome: true });
      setTitle('');
      setBody('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Create failed');
    }
  };

  return (
    <ScreenShell title="PROMOTIONS" loading={loading}>
      {items.map((p) => (
        <View key={p.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{p.title}</Text>
          {p.body ? <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>{p.body}</Text> : null}
          {isSuperAdmin ? (
            <TouchableOpacity
              onPress={async () => {
                await deletePromotion(p.id);
                await load();
              }}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: '#FA1818', fontFamily: 'Inter_600SemiBold' }}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      {isSuperAdmin ? (
        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Body"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
          />
          <TouchableOpacity onPress={create} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>CREATE</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScreenShell>
  );
};

export const NewsletterScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<NewsletterSub[]>([]);
  const [fee, setFee] = useState('');

  useEffect(() => {
    Promise.all([listNewsletterSubs().catch(() => ({ subscriptions: [] })), getPlatformSettings().catch(() => null)])
      .then(([list, settings]) => {
        setSubs(list.subscriptions || []);
        if (settings?.platformFacilityFee != null) setFee(String(settings.platformFacilityFee));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenShell title="NEWSLETTER" loading={loading}>
      <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>{subs.length} subscribers</Text>
      {subs.slice(0, 50).map((s) => (
        <View key={s.email} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={{ color: colors.foreground }}>{s.email}</Text>
          <TouchableOpacity
            onPress={async () => {
              await removeNewsletterSub(s.email);
              setSubs((prev) => prev.filter((x) => x.email !== s.email));
            }}
          >
            <Text style={{ color: '#FA1818', marginTop: 6 }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[styles.section, { color: colors.mutedForeground }]}>PLATFORM FACILITY FEE</Text>
      <TextInput
        value={fee}
        onChangeText={setFee}
        keyboardType="decimal-pad"
        placeholder="Fee amount"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
      />
      <TouchableOpacity
        onPress={async () => {
          try {
            await updatePlatformSettings(Number(fee));
            Alert.alert('Saved', 'Platform fee updated');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Save failed');
          }
        }}
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryText}>SAVE FEE</Text>
      </TouchableOpacity>
    </ScreenShell>
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
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  primaryBtn: {
    backgroundColor: SALMON,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#0D0D0D', fontFamily: 'Inter_700Bold' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  section: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, marginTop: 16, marginBottom: 8 },
});
