import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  createGymReview,
  getGymDetail,
  getGymReviews,
  getGymTrainers,
  gymCityLabel,
  gymDisplayName,
  gymImageUrl,
  type GymReview,
  type GymTrainer,
  type HubGym,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const GymDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const ownerId = String(route.params?.ownerId || '');

  const [loading, setLoading] = useState(true);
  const [gym, setGym] = useState<HubGym | null>(null);
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [reviews, setReviews] = useState<GymReview[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [rating, setRating] = useState('5');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!ownerId) {
      setLoading(false);
      return;
    }
    try {
      const [detail, trainerRes, reviewRes] = await Promise.all([
        getGymDetail(ownerId),
        getGymTrainers(ownerId),
        getGymReviews(ownerId),
      ]);
      setGym(detail.gym);
      setTrainers(trainerRes.trainers || []);
      setReviews(reviewRes.reviews || []);
      setAverage(reviewRes.average ?? null);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load gym');
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    load();
  }, [load]);

  const gallery = (() => {
    if (!gym) return [] as string[];
    const main = gymImageUrl(gym);
    const extras = Array.isArray(gym.gymOptionalImagesUrls)
      ? gym.gymOptionalImagesUrls.filter((u): u is string => Boolean(u) && u !== main)
      : [];
    return [...(main ? [String(main)] : []), ...extras.map(String)];
  })();

  const submitReview = async () => {
    setSaving(true);
    try {
      await createGymReview(ownerId, Math.min(5, Math.max(1, Number(rating) || 5)), body.trim());
      setBody('');
      await load();
      Alert.alert('Thanks', 'Review submitted');
    } catch (e: any) {
      Alert.alert('Review failed', e?.message || 'Try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'Gyms' })} hitSlop={12}>
          <Text style={[styles.backText, { color: SALMON }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>GYM</Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : !gym ? (
        <Text style={{ color: colors.mutedForeground, padding: 20 }}>Gym not found.</Text>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          {gallery.length > 0 ? (
            <>
              <TouchableOpacity onPress={() => setGalleryIndex(0)} activeOpacity={0.9}>
                <Image source={{ uri: gallery[0] }} style={styles.hero} />
              </TouchableOpacity>
              {gallery.length > 1 ? (
                <>
                  <Text style={[styles.section, { color: colors.mutedForeground }]}>GALLERY</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryRow}
                  >
                    {gallery.map((uri, i) => (
                      <TouchableOpacity key={`${uri}-${i}`} onPress={() => setGalleryIndex(i)}>
                        <Image source={{ uri }} style={styles.galleryThumb} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </>
          ) : null}
          <Text style={[styles.gymName, { color: colors.foreground }]}>{gymDisplayName(gym)}</Text>
          {gymCityLabel(gym) ? (
            <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold', marginBottom: 8 }}>
              {String(gymCityLabel(gym))}
            </Text>
          ) : null}
          {gym.bio || gym.description ? (
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>
              {String(gym.bio || gym.description)}
            </Text>
          ) : null}

          <View style={styles.feeRow}>
            <View style={[styles.feeCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>MONTHLY</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>
                {gym.monthlyFee || '—'}
              </Text>
            </View>
            <View style={[styles.feeCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>TRAINER</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>
                {gym.trainerFee || '—'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('LiveClasses', { gymOwnerId: ownerId })}
            style={styles.linkBtn}
          >
            <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>VIEW CLASSES →</Text>
          </TouchableOpacity>

          <Text style={[styles.section, { color: colors.mutedForeground }]}>TRAINERS</Text>
          {trainers.length === 0 ? (
            <Text style={{ color: colors.mutedForeground }}>No trainers listed.</Text>
          ) : (
            trainers.map((t) => (
              <View key={t.userId} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>
                  {t.fullName || 'Trainer'}
                </Text>
                {t.specialization ? (
                  <Text style={{ color: SALMON, marginTop: 4 }}>{t.specialization}</Text>
                ) : null}
              </View>
            ))
          )}

          <Text style={[styles.section, { color: colors.mutedForeground }]}>
            REVIEWS {average != null ? `· ${average.toFixed(1)}★` : ''}
          </Text>
          {reviews.map((r) => (
            <View key={r.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                {'★'.repeat(r.rating)} {r.authorName || ''}
              </Text>
              {r.body ? (
                <Text style={{ color: colors.mutedForeground, marginTop: 6 }}>{r.body}</Text>
              ) : null}
            </View>
          ))}

          <Text style={[styles.section, { color: colors.mutedForeground }]}>LEAVE A REVIEW</Text>
          <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            <TextInput
              value={rating}
              onChangeText={setRating}
              keyboardType="number-pad"
              placeholder="Rating 1-5"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Optional comment"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
            />
            <TouchableOpacity onPress={submitReview} disabled={saving} style={styles.primaryBtn}>
              {saving ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={styles.primaryText}>SUBMIT</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScreenScrollView>
      )}

      <Modal visible={galleryIndex != null} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setGalleryIndex(null)}>
            <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold' }}>CLOSE</Text>
          </TouchableOpacity>
          {galleryIndex != null && gallery[galleryIndex] ? (
            <Image
              source={{ uri: gallery[galleryIndex] }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          ) : null}
          {gallery.length > 1 && galleryIndex != null ? (
            <View style={styles.lightboxNav}>
              <TouchableOpacity
                onPress={() =>
                  setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)
                }
              >
                <Text style={styles.lightboxNavText}>← Prev</Text>
              </TouchableOpacity>
              <Text style={{ color: '#aaa', fontFamily: 'Inter_400Regular' }}>
                {galleryIndex + 1} / {gallery.length}
              </Text>
              <TouchableOpacity
                onPress={() => setGalleryIndex((galleryIndex + 1) % gallery.length)}
              >
                <Text style={styles.lightboxNavText}>Next →</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
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
  hero: { width: '100%', height: 180, borderRadius: 14, marginBottom: 14, backgroundColor: '#1C1C1E' },
  galleryRow: { gap: 8, paddingBottom: 8 },
  galleryThumb: {
    width: 96,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
  },
  gymName: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 1 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  feeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  feeCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  feeLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 },
  feeValue: { fontFamily: 'BebasNeue_400Regular', fontSize: 22, marginTop: 4 },
  linkBtn: { marginBottom: 16 },
  section: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginTop: 10, marginBottom: 10 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10, fontFamily: 'Inter_400Regular' },
  primaryBtn: { backgroundColor: SALMON, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryText: { fontFamily: 'Inter_700Bold', color: '#0D0D0D', letterSpacing: 1 },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    padding: 16,
  },
  lightboxClose: { position: 'absolute', top: 48, right: 20, zIndex: 2 },
  lightboxImage: {
    width: Dimensions.get('window').width - 32,
    height: Dimensions.get('window').height * 0.65,
    alignSelf: 'center',
  },
  lightboxNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  lightboxNavText: { color: SALMON, fontFamily: 'Inter_700Bold', fontSize: 14 },
});

export default GymDetailScreen;
