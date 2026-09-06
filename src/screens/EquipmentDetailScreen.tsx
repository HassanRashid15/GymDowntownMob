import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Polyline,
  Rect,
  Line,
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getEquipmentById } from '../data/equipment';

const SALMON = '#E88E83';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const TimerIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="13" r="8" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="15" y1="16" x2="12" y2="13" />
    <Line x1="9" y1="3" x2="15" y2="3" />
    <Line x1="12" y1="1" x2="12" y2="3" />
  </Svg>
);

const AlertIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const SparkleIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </Svg>
);

const BoltIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1}>
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

const DumbbellIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6.5 6.5h11v11h-11z" />
    <Path d="M3 8v8M21 8v8M6 6V4M18 6V4M6 20v-2M18 20v-2" />
  </Svg>
);

const HandIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <Path d="M14 10V4a2 2 0 0 0-4 0v6" />
    <Path d="M10 10V5a2 2 0 0 0-4 0v9a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-3a2 2 0 0 0-4 0v1" />
  </Svg>
);

const PlayIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

const SectionTitle = ({ title, colors, rightLabel }: { title: string; colors: any; rightLabel?: string }) => (
  <View style={styles.sectionTitleWrap}>
    <View style={styles.sectionTitleRow}>
      <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
    </View>
    {rightLabel ? (
      <Text style={[styles.sectionRightLabel, { color: SALMON }]}>{rightLabel}</Text>
    ) : null}
  </View>
);

const BodyMap = ({ zones, colors }: { zones: string[]; colors: any }) => {
  const isActive = (zone: string) =>
    zones.some((z) => z.toLowerCase().includes(zone) || zone.includes(z.toLowerCase()));

  const glow = (zone: string) => (isActive(zone) ? SALMON : colors.muted);

  return (
    <View style={[styles.bodyMapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Svg width={SCREEN_WIDTH - 80} height={200} viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={SALMON} stopOpacity="0.6" />
            <Stop offset="1" stopColor={SALMON} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {isActive('quad') || isActive('glute') ? (
          <Ellipse cx="100" cy="130" rx="55" ry="45" fill="url(#glow)" opacity={0.5} />
        ) : null}
        {isActive('core') || isActive('back') ? (
          <Ellipse cx="100" cy="85" rx="35" ry="30" fill="url(#glow)" opacity={0.4} />
        ) : null}
        <Circle cx="100" cy="28" r="14" fill={colors.muted} />
        <Path d="M88 42 L88 95 L75 130 L85 130 L92 100 L108 100 L115 130 L125 130 L112 95 L112 42 Z" fill={glow('core')} opacity={0.85} />
        <Path d="M88 100 L82 165 L95 165 L98 115 L102 115 L105 165 L118 165 L112 100 Z" fill={glow('quad')} opacity={0.9} />
        <Ellipse cx="78" cy="72" rx="10" ry="14" fill={glow('shoulder')} opacity={0.8} />
        <Ellipse cx="122" cy="72" rx="10" ry="14" fill={glow('shoulder')} opacity={0.8} />
        <Ellipse cx="88" cy="175" rx="12" ry="8" fill={glow('calf')} opacity={0.7} />
        <Ellipse cx="112" cy="175" rx="12" ry="8" fill={glow('calf')} opacity={0.7} />
      </Svg>
      <View style={styles.zoneTags}>
        {zones.map((zone) => (
          <View key={zone} style={[styles.zoneTag, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.zoneTagText, { color: colors.mutedForeground }]}>{zone}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const EquipmentDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { equipmentId?: string; id?: string };
  const equipment = getEquipmentById(params.equipmentId ?? params.id ?? '');

  if (!equipment) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Equipment not found</Text>
      </View>
    );
  }

  const displayName = (equipment.displayName ?? equipment.name).toUpperCase();
  const targetZones = equipment.targetZones ?? equipment.muscleGroups.slice(0, 4);
  const steps =
    equipment.executionSteps ??
    equipment.howToUse.slice(0, 3).map((step, i) => ({
      title: `STEP ${i + 1}`,
      description: step,
    }));
  const proTip = equipment.proTip ?? {
    quote: equipment.tips[0] ?? '',
    coach: 'COACH FORGE',
    coachAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop',
  };
  const handlingNotes = equipment.handlingNotes ?? equipment.howToUse.slice(0, 4);
  const exercises = equipment.exercises ?? [];
  const exerciseCount = equipment.exerciseCount ?? exercises.length;
  const extraExercises = Math.max(0, exerciseCount - exercises.length);

  const handleAddToRoutine = () => {
    Alert.alert('Added to Routine', `${displayName} has been added to your current routine.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>EQUIPMENT DETAIL</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: equipment.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroFade} />
          <View style={[styles.heroTag, { backgroundColor: 'rgba(0,0,0,0.7)', borderColor: colors.border }]}>
            <SparkleIcon color={SALMON} />
            <Text style={[styles.heroTagText, { color: colors.foreground }]}>
              {(equipment.tag ?? equipment.category.toUpperCase()).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={[styles.equipmentName, { color: colors.foreground }]}>{displayName}</Text>
          <Text style={[styles.shortDescription, { color: colors.mutedForeground }]}>
            {equipment.longDescription}
          </Text>

          <TouchableOpacity
            onPress={handleAddToRoutine}
            activeOpacity={0.85}
            style={[styles.routineButton, { backgroundColor: SALMON }]}
          >
            <TimerIcon color="#0D0D0D" />
            <Text style={styles.routineButtonText}>ADD TO CURRENT ROUTINE</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statHeader}>
                <AlertIcon color={SALMON} />
                <Text style={[styles.statLabel, { color: SALMON }]}>MAX LOAD</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {equipment.maxLoad ?? 'N/A'}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statHeader}>
                <ClockIcon color={SALMON} />
                <Text style={[styles.statLabel, { color: SALMON }]}>AVG TIME</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {equipment.avgTime ?? '15-30 MIN'}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statHeader}>
                <DumbbellIcon color={SALMON} />
                <Text style={[styles.statLabel, { color: SALMON }]}>EXERCISES</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {exerciseCount}+
              </Text>
            </View>
          </View>

          {equipment.youtubeVideoId ? (
            <View style={styles.section}>
              <SectionTitle title="DEMO VIDEO" colors={colors} />
              <View style={[styles.videoCard, { borderColor: colors.border }]}>
                <View style={styles.videoLabel}>
                  <PlayIcon color={SALMON} />
                  <Text style={[styles.videoLabelText, { color: colors.mutedForeground }]}>
                    {equipment.youtubeTitle ?? 'How to use this equipment'}
                  </Text>
                </View>
                <YouTubeEmbed
                  videoId={equipment.youtubeVideoId}
                  title={equipment.youtubeTitle}
                />
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="HOW TO HANDLE" colors={colors} />
            <View style={[styles.handlingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {handlingNotes.map((note) => (
                <View key={note} style={styles.handlingRow}>
                  <View style={[styles.handlingIcon, { backgroundColor: `${SALMON}22` }]}>
                    <HandIcon color={SALMON} />
                  </View>
                  <Text style={[styles.handlingText, { color: colors.foreground }]}>{note}</Text>
                </View>
              ))}
            </View>
          </View>

          {exercises.length > 0 ? (
            <View style={styles.section}>
              <SectionTitle
                title="EXERCISES YOU CAN DO"
                colors={colors}
                rightLabel={`${exerciseCount} TOTAL`}
              />
              <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {exercises.map((exercise, index) => (
                  <View
                    key={exercise.name}
                    style={[
                      styles.exerciseRow,
                      index < exercises.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                    ]}
                  >
                    <View style={styles.exerciseLeft}>
                      <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text>
                      <Text style={[styles.exerciseMuscle, { color: SALMON }]}>{exercise.muscle}</Text>
                    </View>
                    <View style={[styles.setsBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                      <Text style={[styles.setsText, { color: colors.mutedForeground }]}>{exercise.setsReps}</Text>
                    </View>
                  </View>
                ))}
                {extraExercises > 0 ? (
                  <Text style={[styles.moreExercises, { color: colors.mutedForeground }]}>
                    + {extraExercises} more exercises available with this equipment
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="TARGET ZONES" colors={colors} />
            <BodyMap zones={targetZones} colors={colors} />
          </View>

          <View style={styles.section}>
            <SectionTitle title="EXECUTION PROTOCOL" colors={colors} />
            <View style={styles.stepsWrap}>
              <View style={[styles.stepsLine, { backgroundColor: `${SALMON}44` }]} />
              {steps.map((step, index) => (
                <View key={step.title} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.stepAccent, { backgroundColor: SALMON }]} />
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                      <Text style={[styles.stepDescription, { color: SALMON }]}>{step.description}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.proTipCard, { backgroundColor: colors.card, borderColor: `${SALMON}66` }]}>
            <View style={styles.proTipHeader}>
              <BoltIcon color={colors.primary} />
              <Text style={[styles.proTipLabel, { color: colors.primary }]}>PRO TIP</Text>
            </View>
            <Text style={[styles.proTipQuote, { color: colors.foreground }]}>"{proTip.quote}"</Text>
            <View style={styles.proTipCoach}>
              <Image
                source={{ uri: proTip.coachAvatar }}
                style={[styles.coachAvatar, { borderColor: colors.border }]}
              />
              <Text style={[styles.coachName, { color: SALMON }]}>{proTip.coach}</Text>
            </View>
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroWrap: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heroTag: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  heroTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  equipmentName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  shortDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  routineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  routineButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionRightLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  videoCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  videoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoLabelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  handlingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  handlingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  handlingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  handlingText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  exerciseLeft: {
    flex: 1,
  },
  exerciseName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 3,
  },
  exerciseMuscle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  setsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  setsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  moreExercises: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textAlign: 'center',
    padding: 14,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 1,
  },
  bodyMapCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  zoneTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  zoneTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  zoneTagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  stepsWrap: {
    position: 'relative',
    gap: 16,
    paddingLeft: 4,
  },
  stepsLine: {
    position: 'absolute',
    left: 15,
    top: 20,
    bottom: 20,
    width: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 14,
    zIndex: 1,
  },
  stepNumberText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  stepCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  stepAccent: {
    width: 4,
  },
  stepContent: {
    flex: 1,
    padding: 14,
  },
  stepTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  stepDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  proTipCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  proTipLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  proTipQuote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  proTipCoach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coachAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  coachName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default EquipmentDetailScreen;
