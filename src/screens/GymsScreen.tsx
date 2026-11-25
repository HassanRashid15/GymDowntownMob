import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  gymCityLabel,
  gymDisplayName,
  gymImageUrl,
  gymOwnerKey,
  isHubApiConfigured,
  listGyms,
  type HubGym,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const GymsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<HubGym[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setError('Set EXPO_PUBLIC_API_BASE_URL to your gym-journey-hub URL.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await listGyms();
      setGyms(data.gyms || []);
    } catch (e: any) {
      setError(e?.message || 'Could not load gyms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })} hitSlop={12}>
          <Text style={[styles.backText, { color: SALMON }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>GYMS</Text>
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
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                {error}
              </Text>
            </View>
          ) : null}

          {gyms.length === 0 && !error ? (
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
              No approved gyms yet.
            </Text>
          ) : (
            gyms.map((gym) => {
              const key = gymOwnerKey(gym) || gymDisplayName(gym);
              const image = gymImageUrl(gym);
              const city = gymCityLabel(gym);
              const desc = gym.bio || gym.description;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => navigation.navigate('GymDetail', { ownerId: key })}
                  style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}
                  activeOpacity={0.9}
                >
                  {image ? (
                    <Image source={{ uri: String(image) }} style={styles.image} resizeMode="cover" />
                  ) : null}
                  <Text style={[styles.gymName, { color: colors.foreground }]}>
                    {gymDisplayName(gym)}
                  </Text>
                  {city ? (
                    <Text style={[styles.city, { color: SALMON }]}>{String(city)}</Text>
                  ) : null}
                  {desc ? (
                    <Text
                      style={[styles.desc, { color: colors.mutedForeground }]}
                      numberOfLines={3}
                    >
                      {String(desc)}
                    </Text>
                  ) : null}
                </TouchableOpacity>
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
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#1C1C1E',
  },
  gymName: { fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1 },
  city: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 4 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 8, lineHeight: 18 },
});

export default GymsScreen;
