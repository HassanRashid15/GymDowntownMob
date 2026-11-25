import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import {
  getPublicPlatformStats,
  isHubApiConfigured,
  listApprovedReviews,
  listPublicPromotions,
  type HubPromotion,
  type HubReview,
  type PlatformPublicStats,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

export const HomePromotionsStrip: React.FC = () => {
  const [items, setItems] = useState<HubPromotion[]>([]);

  useEffect(() => {
    if (!isHubApiConfigured()) return;
    listPublicPromotions()
      .then((data) => setItems((data.promotions || []).slice(0, 6)))
      .catch(() => undefined);
  }, []);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>WHAT&apos;S NEW</Text>
      <Text style={styles.heading}>
        NEW <Text style={{ color: SALMON }}>OFFERS</Text>
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((p) => (
          <View key={p.id} style={styles.promoCard}>
            {p.image_url ? (
              <Image source={{ uri: p.image_url }} style={styles.promoImage} />
            ) : null}
            <Text style={styles.promoTitle} numberOfLines={2}>
              {p.title}
            </Text>
            {p.body ? (
              <Text style={styles.promoBody} numberOfLines={3}>
                {p.body}
              </Text>
            ) : null}
            {p.cta_href ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(String(p.cta_href))}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>
                  {(p.cta_label || 'Learn more').toUpperCase()} →
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export const HomeLiveStats: React.FC = () => {
  const [stats, setStats] = useState<PlatformPublicStats | null>(null);

  useEffect(() => {
    if (!isHubApiConfigured()) return;
    getPublicPlatformStats()
      .then((data) => setStats(data.stats))
      .catch(() => undefined);
  }, []);

  if (!stats) return null;

  const cells = [
    { label: 'MEMBERS', value: stats.memberCount },
    { label: 'TRAINERS', value: stats.trainerCount },
    { label: 'CLASSES', value: stats.classCount },
    { label: 'GYMS', value: stats.gymCount },
  ];

  return (
    <View style={styles.statsRow}>
      {cells.map((c) => (
        <View key={c.label} style={styles.statCell}>
          <Text style={styles.statValue}>{c.value}</Text>
          <Text style={styles.statLabel}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
};

export const HomeReviewsStrip: React.FC = () => {
  const [reviews, setReviews] = useState<HubReview[]>([]);

  useEffect(() => {
    if (!isHubApiConfigured()) return;
    listApprovedReviews(8)
      .then((data) => setReviews(data.reviews || []))
      .catch(() => undefined);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>SOCIAL PROOF</Text>
      <Text style={styles.heading}>
        WHAT MEMBERS <Text style={{ color: SALMON }}>SAY</Text>
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <Text style={{ color: SALMON, marginBottom: 6 }}>{'★'.repeat(r.rating || 5)}</Text>
            <Text style={styles.reviewText} numberOfLines={4}>
              {r.review_text}
            </Text>
            <Text style={styles.reviewAuthor}>{r.reviewer_name}</Text>
            {r.gym_name ? <Text style={styles.reviewGym}>{r.gym_name}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 28, marginBottom: 8 },
  eyebrow: {
    color: SALMON,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  heading: {
    color: '#FAFAFA',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    marginBottom: 14,
    paddingHorizontal: 24,
  },
  row: { paddingHorizontal: 24, gap: 12 },
  promoCard: {
    width: 260,
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  promoImage: { width: '100%', height: 110, borderRadius: 10, marginBottom: 10, backgroundColor: '#1C1C1E' },
  promoTitle: { color: '#FAFAFA', fontFamily: 'Inter_700Bold', fontSize: 16 },
  promoBody: { color: '#8E8E93', marginTop: 6, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 20,
    gap: 8,
  },
  statCell: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { color: '#FAFAFA', fontFamily: 'BebasNeue_400Regular', fontSize: 22 },
  statLabel: { color: '#8E8E93', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, marginTop: 4 },
  reviewCard: {
    width: 260,
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  reviewText: { color: '#FAFAFA', fontFamily: 'Inter_400Regular', lineHeight: 20 },
  reviewAuthor: { color: SALMON, fontFamily: 'Inter_700Bold', marginTop: 10 },
  reviewGym: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
});
