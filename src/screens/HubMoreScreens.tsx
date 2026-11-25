import React, { useEffect, useState } from 'react';
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
  getAdminTraffic,
  listMembershipFees,
  updateMembershipFee,
  type MembershipFeeAdmin,
  type TrafficHit,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

function Shell({
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

export const TrafficScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [hits, setHits] = useState<TrafficHit[]>([]);

  useEffect(() => {
    getAdminTraffic(80)
      .then((data) => setHits(data.hits || data.rows || []))
      .catch((e) => Alert.alert('Error', e?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell title="TRAFFIC" loading={loading}>
      <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>
        {hits.length} recent public visits
      </Text>
      {hits.map((h, i) => (
        <View
          key={String(h.id || i)}
          style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}
        >
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
            {String(h.path || '/')}
          </Text>
          <Text style={{ color: colors.mutedForeground, marginTop: 4, fontSize: 12 }}>
            {h.created_at ? new Date(String(h.created_at)).toLocaleString() : '—'}
            {h.city || h.country ? ` · ${h.city || ''} ${h.country || ''}` : ''}
          </Text>
        </View>
      ))}
      {hits.length === 0 ? <Text style={{ color: colors.mutedForeground }}>No traffic yet.</Text> : null}
    </Shell>
  );
};

export const MembershipFeesScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<MembershipFeeAdmin[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fee, setFee] = useState('');

  const load = async () => {
    try {
      const data = await listMembershipFees();
      setAdmins(data.admins || []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Shell title="MEMBERSHIP SET" loading={loading}>
      <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>
        Platform monthly fees for approved gym owners
      </Text>
      {admins.map((a) => (
        <View key={a.user_id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>
            {a.gym_name || a.full_name || a.email}
          </Text>
          <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>
            {a.email} · {a.gym_city || '—'}
          </Text>
          <Text style={{ color: SALMON, marginTop: 6 }}>
            Fee: {a.platform_monthly_fee || '—'}
            {a.trial_days_left != null ? ` · trial ${a.trial_days_left}d` : ''}
          </Text>
          {editingId === a.user_id ? (
            <View style={{ marginTop: 10 }}>
              <TextInput
                value={fee}
                onChangeText={setFee}
                keyboardType="decimal-pad"
                placeholder="Monthly fee"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
              />
              <TouchableOpacity
                onPress={async () => {
                  await updateMembershipFee({
                    userId: a.user_id,
                    platformMonthlyFee: fee,
                  });
                  setEditingId(null);
                  await load();
                }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setEditingId(a.user_id);
                setFee(String(a.platform_monthly_fee || ''));
              }}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>EDIT FEE</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {admins.length === 0 ? (
        <Text style={{ color: colors.mutedForeground }}>No approved gym owners.</Text>
      ) : null}
    </Shell>
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
  primaryBtn: { backgroundColor: SALMON, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  primaryText: { color: '#0D0D0D', fontFamily: 'Inter_700Bold' },
});
