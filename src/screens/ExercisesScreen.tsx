import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { isHubApiConfigured, listExercises, type HubExercise } from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const BODY_PARTS = ['all', 'chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'cardio'];

const ExercisesScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [bodyPart, setBodyPart] = useState('all');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HubExercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setError('Set EXPO_PUBLIC_API_BASE_URL to your hub URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listExercises({
        bodyPart: bodyPart === 'all' ? undefined : bodyPart,
        limit: 30,
      });
      setItems(data.exercises || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load exercises');
    } finally {
      setLoading(false);
    }
  }, [bodyPart]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })}>
          <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>EXERCISES</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {BODY_PARTS.map((part) => (
          <TouchableOpacity
            key={part}
            onPress={() => setBodyPart(part)}
            style={[
              styles.chip,
              {
                backgroundColor: bodyPart === part ? SALMON : CARD_BG,
                borderColor: bodyPart === part ? SALMON : CARD_BORDER,
              },
            ]}
          >
            <Text
              style={{
                color: bodyPart === part ? '#0D0D0D' : colors.foreground,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {part}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          {error ? <Text style={{ color: colors.mutedForeground }}>{error}</Text> : null}
          <View style={styles.grid}>
            {items.map((ex) => (
              <View key={ex.id} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
                {ex.gifUrl ? (
                  <Image source={{ uri: ex.gifUrl }} style={styles.gif} resizeMode="cover" />
                ) : (
                  <View style={[styles.gif, { backgroundColor: '#1C1C1E' }]} />
                )}
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 13 }} numberOfLines={2}>
                  {ex.name}
                </Text>
                <Text style={{ color: SALMON, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                  {ex.target || ex.bodyPart}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                  {ex.equipment}
                </Text>
              </View>
            ))}
          </View>
          {!error && items.length === 0 ? (
            <Text style={{ color: colors.mutedForeground }}>No exercises found.</Text>
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
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1.5 },
  chips: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexGrow: 1,
    flexBasis: '46%',
  },
  gif: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
});

export default ExercisesScreen;
