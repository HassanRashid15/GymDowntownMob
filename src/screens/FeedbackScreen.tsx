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
  isHubApiConfigured,
  listMyReviews,
  listPendingReviews,
  moderateFeedback,
  submitFeedback,
  type HubReview,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const FeedbackScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, isAdmin, isSuperAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState<HubReview[]>([]);
  const [pending, setPending] = useState<HubReview[]>([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const my = await listMyReviews();
      setMine(my.reviews || []);
      if (isAdmin || isSuperAdmin) {
        const p = await listPendingReviews();
        setPending(p.reviews || []);
      }
    } catch {
      /* keep empty */
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!text.trim()) {
      Alert.alert('Feedback', 'Write a short review');
      return;
    }
    setSaving(true);
    try {
      await submitFeedback({
        reviewerName: user?.name || 'Member',
        rating,
        reviewText: text.trim(),
        reviewType: 'general',
      });
      setText('');
      Alert.alert('Submitted', 'Thanks — pending approval');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not submit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })}>
          <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>FEEDBACK</Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.section, { color: colors.mutedForeground }]}>LEAVE A REVIEW</Text>
          <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={{ fontSize: 28, color: n <= rating ? SALMON : '#3A3A3A' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="How is Forge working for you?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            />
            <TouchableOpacity onPress={submit} disabled={saving} style={styles.primaryBtn}>
              {saving ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={styles.primaryText}>SUBMIT</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.section, { color: colors.mutedForeground }]}>YOUR REVIEWS</Text>
          {mine.map((r) => (
            <View key={r.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={{ color: SALMON }}>{'★'.repeat(r.rating)}</Text>
              <Text style={{ color: colors.foreground, marginTop: 6 }}>{r.review_text}</Text>
              <Text style={{ color: colors.mutedForeground, marginTop: 6, fontSize: 12 }}>
                {r.is_approved ? 'Approved' : 'Pending'}
              </Text>
            </View>
          ))}
          {mine.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>No reviews yet.</Text>
          ) : null}

          {(isAdmin || isSuperAdmin) && (
            <>
              <Text style={[styles.section, { color: colors.mutedForeground }]}>PENDING MODERATION</Text>
              {pending.map((r) => (
                <View key={r.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
                  <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>
                    {r.reviewer_name} · {'★'.repeat(r.rating)}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, marginTop: 6 }}>{r.review_text}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        await moderateFeedback({ id: r.id, isApproved: true });
                        await load();
                      }}
                    >
                      <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>APPROVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        await moderateFeedback({ id: r.id, reject: true });
                        await load();
                      }}
                    >
                      <Text style={{ color: '#FA1818', fontFamily: 'Inter_700Bold' }}>REJECT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {pending.length === 0 ? (
                <Text style={{ color: colors.mutedForeground }}>No pending reviews.</Text>
              ) : null}
            </>
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
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 10, marginTop: 8 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  stars: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryBtn: { backgroundColor: SALMON, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#0D0D0D', fontFamily: 'Inter_700Bold', letterSpacing: 1 },
});

export default FeedbackScreen;
