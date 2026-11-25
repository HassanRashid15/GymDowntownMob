import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import {
  ENERGY_OPTIONS,
  FOCUS_PRESETS,
  MOOD_OPTIONS,
  addProgressExercise,
  getExerciseCatalog,
  getProgress,
  isHubApiConfigured,
  localDateISO,
  recommendFromMoodEnergy,
  upsertProgressDay,
  type CatalogExercise,
  type EnergyId,
  type MoodId,
  type ProgressDayView,
  type ProgressStats,
} from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

const emptyStats: ProgressStats = {
  trainedDays: 0,
  totalExercises: 0,
  totalSets: 0,
  totalDuration: 0,
  totalCalories: 0,
  streak: 0,
};

function moodStorageKey(date: string) {
  return `progress-mood-energy:${date}`;
}

type MoodResult = {
  mood: MoodId;
  energy: EnergyId;
  focus: string;
  exercises: string[];
  headline: string;
  blurb: string;
};

const ProgressScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ProgressStats>(emptyStats);
  const [days, setDays] = useState<ProgressDayView[]>([]);
  const [focus, setFocus] = useState<string>(FOCUS_PRESETS[0]);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const [moodGateOpen, setMoodGateOpen] = useState(false);
  const [moodStep, setMoodStep] = useState<'mood' | 'energy' | 'result'>('mood');
  const [mood, setMood] = useState<MoodId | ''>('');
  const [energy, setEnergy] = useState<EnergyId | ''>('');
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);

  const [catalog, setCatalog] = useState<CatalogExercise[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [pickerTab, setPickerTab] = useState<'mood' | 'catalog' | 'custom'>('custom');

  const today = localDateISO();
  const todayDay = days.find((d) => d.date === today);

  const recommendation = useMemo(() => {
    if (!mood || !energy) return null;
    return recommendFromMoodEnergy(mood, energy);
  }, [mood, energy]);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setError('Set EXPO_PUBLIC_API_BASE_URL to your gym-journey-hub URL.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await getProgress({ days: 30 });
      setStats(data.stats || emptyStats);
      setDays(data.days || []);
    } catch (e: any) {
      setError(e?.message || 'Could not load progress');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(moodStorageKey(today));
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as MoodResult;
          setMoodResult(parsed);
          if (parsed.focus) setFocus(parsed.focus);
          setPickerTab('mood');
          setMoodGateOpen(false);
        } else {
          setMoodGateOpen(true);
          setMoodStep('mood');
        }
      } catch {
        if (!cancelled) setMoodGateOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!focus || focus === 'Rest') {
        setCatalog([]);
        return;
      }
      setCatalogLoading(true);
      try {
        const res = await getExerciseCatalog(focus);
        if (!cancelled) setCatalog(res.exercises || []);
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [focus]);

  const applyMoodResult = async () => {
    if (!mood || !energy || !recommendation) return;
    const result: MoodResult = {
      mood,
      energy,
      focus: recommendation.focus,
      exercises: recommendation.exercises,
      headline: recommendation.headline,
      blurb: recommendation.blurb,
    };
    setMoodResult(result);
    setFocus(recommendation.focus);
    setPickerTab('mood');
    setMoodGateOpen(false);
    try {
      await AsyncStorage.setItem(moodStorageKey(today), JSON.stringify(result));
      await upsertProgressDay({ day_date: today, focus: recommendation.focus });
      await load();
    } catch {
      /* still show local result */
    }
  };

  const retakeMood = () => {
    setMood('');
    setEnergy('');
    setMoodStep('mood');
    setMoodGateOpen(true);
  };

  const logFocus = async () => {
    setSaving(true);
    try {
      await upsertProgressDay({ day_date: today, focus });
      await load();
      Alert.alert('Saved', `Today’s focus: ${focus}`);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save focus');
    } finally {
      setSaving(false);
    }
  };

  const addNamedExercise = async (name: string, setsN = 3, repsN = 10) => {
    if (!name.trim()) {
      Alert.alert('Exercise', 'Enter an exercise name');
      return;
    }
    setSaving(true);
    try {
      let dayId = todayDay?.id;
      if (!dayId) {
        const created = await upsertProgressDay({ day_date: today, focus });
        dayId = created.day.id;
      }
      await addProgressExercise({
        workout_day_id: dayId!,
        exercise_name: name.trim(),
        sets: Math.max(1, setsN),
        reps: Math.max(1, repsN),
      });
      setExerciseName('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not add exercise');
    } finally {
      setSaving(false);
    }
  };

  const setSessionFromMood = async () => {
    if (!moodResult?.exercises?.length) return;
    setSaving(true);
    try {
      let dayId = todayDay?.id;
      if (!dayId) {
        const created = await upsertProgressDay({
          day_date: today,
          focus: moodResult.focus || focus,
        });
        dayId = created.day.id;
      } else if (moodResult.focus) {
        await upsertProgressDay({ day_date: today, focus: moodResult.focus });
      }
      for (const name of moodResult.exercises) {
        await addProgressExercise({
          workout_day_id: dayId!,
          exercise_name: name,
          sets: Math.max(1, Number(sets) || 3),
          reps: Math.max(1, Number(reps) || 10),
        });
      }
      await load();
      Alert.alert('Session set', `${moodResult.exercises.length} exercises added for today.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not set session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })} hitSlop={12}>
          <Text style={[styles.backText, { color: SALMON }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>PROGRESS</Text>
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
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>STREAK</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.streak}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>DAYS</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.trainedDays}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>SETS</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.totalSets}</Text>
            </View>
          </View>

          {moodResult ? (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.moodHeadline, { color: colors.foreground }]}>
                {moodResult.headline}
              </Text>
              <Text style={[styles.moodBlurb, { color: colors.mutedForeground }]}>
                {moodResult.blurb}
              </Text>
              <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold', marginTop: 8 }}>
                Focus: {moodResult.focus}
              </Text>
              <View style={styles.moodActions}>
                <TouchableOpacity onPress={setSessionFromMood} disabled={saving} style={styles.primaryBtn}>
                  {saving ? (
                    <ActivityIndicator color="#0D0D0D" />
                  ) : (
                    <Text style={styles.primaryBtnText}>SET SESSION</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={retakeMood}>
                  <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', letterSpacing: 1 }}>
                    RETAKE MOOD CHECK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={retakeMood} style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                Start with a mood & energy check →
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TODAY’S FOCUS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {FOCUS_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => setFocus(preset)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: focus === preset ? SALMON : CARD_BG,
                    borderColor: focus === preset ? SALMON : CARD_BORDER,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: focus === preset ? '#0D0D0D' : colors.foreground },
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={logFocus}
            disabled={saving}
            style={[styles.primaryBtn, { opacity: saving ? 0.7 : 1 }]}
          >
            {saving ? (
              <ActivityIndicator color="#0D0D0D" />
            ) : (
              <Text style={styles.primaryBtnText}>SAVE FOCUS</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ADD EXERCISE</Text>
          <View style={styles.tabRow}>
            {(['mood', 'catalog', 'custom'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setPickerTab(tab)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: pickerTab === tab ? SALMON : CARD_BG,
                    borderColor: pickerTab === tab ? SALMON : CARD_BORDER,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 11,
                    letterSpacing: 0.8,
                    color: pickerTab === tab ? '#0D0D0D' : colors.foreground,
                  }}
                >
                  {tab === 'mood' ? 'MOOD' : tab === 'catalog' ? 'CATALOG' : 'CUSTOM'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {pickerTab === 'mood' ? (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              {(moodResult?.exercises || []).length === 0 ? (
                <Text style={{ color: colors.mutedForeground }}>Complete the mood check for suggestions.</Text>
              ) : (
                moodResult!.exercises.map((name) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => addNamedExercise(name, Number(sets) || 3, Number(reps) || 10)}
                    style={styles.pickRow}
                  >
                    <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', flex: 1 }}>
                      {name}
                    </Text>
                    <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>ADD</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : null}

          {pickerTab === 'catalog' ? (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              {catalogLoading ? (
                <ActivityIndicator color={SALMON} />
              ) : catalog.length === 0 ? (
                <Text style={{ color: colors.mutedForeground }}>
                  No catalog exercises for this focus.
                </Text>
              ) : (
                catalog.slice(0, 12).map((ex) => (
                  <TouchableOpacity
                    key={ex.name}
                    onPress={() => addNamedExercise(ex.name, Number(sets) || 3, Number(reps) || 10)}
                    style={styles.pickRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                        {ex.name}
                      </Text>
                      {ex.primaryMuscles?.length ? (
                        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
                          {ex.primaryMuscles.join(', ')}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold' }}>ADD</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : null}

          {pickerTab === 'custom' ? (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <TextInput
                value={exerciseName}
                onChangeText={setExerciseName}
                placeholder="Exercise name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: CARD_BORDER }]}
              />
              <View style={styles.row}>
                <TextInput
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                  placeholder="Sets"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.inputHalf, { color: colors.foreground, borderColor: CARD_BORDER }]}
                />
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="Reps"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.inputHalf, { color: colors.foreground, borderColor: CARD_BORDER }]}
                />
              </View>
              <TouchableOpacity
                onPress={() => addNamedExercise(exerciseName, Number(sets) || 3, Number(reps) || 10)}
                disabled={saving}
                style={styles.secondaryBtn}
              >
                <Text style={[styles.secondaryBtnText, { color: SALMON }]}>ADD TO TODAY</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECENT DAYS</Text>
          {days.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
              No workouts logged yet.
            </Text>
          ) : (
            days.slice(0, 10).map((day) => (
              <View
                key={day.date}
                style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER, marginBottom: 10 }]}
              >
                <Text style={[styles.dayDate, { color: colors.foreground }]}>{day.date}</Text>
                <Text style={[styles.dayFocus, { color: SALMON }]}>{day.focus || '—'}</Text>
                {(day.exercises || []).slice(0, 4).map((ex) => (
                  <Text key={ex.id} style={[styles.exLine, { color: colors.mutedForeground }]}>
                    {ex.exercise_name} · {ex.sets}×{ex.reps}
                  </Text>
                ))}
              </View>
            ))
          )}
        </ScreenScrollView>
      )}

      <Modal visible={moodGateOpen} animationType="slide" transparent>
        <View style={[styles.modalBackdrop, { paddingTop: insets.top + 40 }]}>
          <View style={[styles.modalCard, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
            {moodStep === 'mood' ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  What’s your mood today?
                </Text>
                <Text style={[styles.moodBlurb, { color: colors.mutedForeground }]}>
                  Pick one — then we’ll ask about energy and suggest exercises.
                </Text>
                {MOOD_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setMood(opt.id)}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: mood === opt.id ? SALMON : CARD_BORDER,
                        backgroundColor: mood === opt.id ? `${SALMON}22` : '#1C1C1E',
                      },
                    ]}
                  >
                    <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                      {opt.emoji}  {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  disabled={!mood}
                  onPress={() => setMoodStep('energy')}
                  style={[styles.primaryBtn, { opacity: mood ? 1 : 0.4, marginTop: 12 }]}
                >
                  <Text style={styles.primaryBtnText}>NEXT — ENERGY</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMoodGateOpen(false)} style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }}>Skip for now</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {moodStep === 'energy' ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>How’s your energy?</Text>
                {ENERGY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setEnergy(opt.id)}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: energy === opt.id ? SALMON : CARD_BORDER,
                        backgroundColor: energy === opt.id ? `${SALMON}22` : '#1C1C1E',
                      },
                    ]}
                  >
                    <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>
                      {opt.emoji}  {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.moodActions}>
                  <TouchableOpacity onPress={() => setMoodStep('mood')}>
                    <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold' }}>BACK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={!energy}
                    onPress={() => setMoodStep('result')}
                    style={[styles.primaryBtn, { flex: 1, opacity: energy ? 1 : 0.4 }]}
                  >
                    <Text style={styles.primaryBtnText}>SEE SUGGESTIONS</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}

            {moodStep === 'result' && recommendation ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {recommendation.headline}
                </Text>
                <Text style={[styles.moodBlurb, { color: colors.mutedForeground }]}>
                  {recommendation.blurb}
                </Text>
                <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', marginVertical: 10 }}>
                  {recommendation.focus}
                </Text>
                {recommendation.exercises.map((name) => (
                  <Text key={name} style={{ color: colors.foreground, marginBottom: 4, fontFamily: 'Inter_400Regular' }}>
                    • {name}
                  </Text>
                ))}
                <TouchableOpacity onPress={applyMoodResult} style={[styles.primaryBtn, { marginTop: 16 }]}>
                  <Text style={styles.primaryBtnText}>USE THIS SESSION</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
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
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  statValue: { fontFamily: 'BebasNeue_400Regular', fontSize: 28 },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
  },
  chips: { gap: 8, paddingBottom: 12 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  primaryBtn: {
    backgroundColor: SALMON,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnText: { fontFamily: 'Inter_700Bold', color: '#0D0D0D', letterSpacing: 1 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontFamily: 'Inter_400Regular',
  },
  row: { flexDirection: 'row', gap: 10 },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontFamily: 'Inter_400Regular',
  },
  secondaryBtn: { alignItems: 'center', paddingVertical: 8 },
  secondaryBtnText: { fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  dayDate: { fontFamily: 'Inter_700Bold', fontSize: 13, marginBottom: 4 },
  dayFocus: { fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  exLine: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  moodHeadline: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  moodBlurb: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, marginTop: 6 },
  moodActions: { marginTop: 12, gap: 12 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CARD_BORDER,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    maxHeight: '88%',
  },
  modalTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 1,
    marginBottom: 6,
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
});

export default ProgressScreen;
