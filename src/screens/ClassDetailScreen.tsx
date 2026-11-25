import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Polyline,
  Rect,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getClassById } from '../data/classes';

const SALMON = '#E88E83';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 40;
const GRAPH_HEIGHT = 110;

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const FlameIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-1-3-1-4.5 1.5 0 2.5 1 3 2.5.5-2 2-3.5 4-3.5 0 3 2 4.5 2 7a6 6 0 0 1-12 0c0-2 1-3 1.5-3.5z" />
  </Svg>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const BuildingIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 21h18" />
    <Path d="M5 21V7l7-4 7 4v14" />
    <Path d="M9 21v-6h6v6" />
  </Svg>
);

const SectionLabel = ({ children, color }: { children: string; color: string }) => (
  <Text style={[styles.sectionLabel, { color }]}>{children}</Text>
);

const buildCurvePaths = (points: number[], width: number, height: number) => {
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const step = innerW / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: padding + i * step,
    y: padding + innerH - p * innerH,
  }));

  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  coords.slice(1).forEach((c) => {
    linePath += ` L ${c.x} ${c.y}`;
  });

  const fillPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;
  const peakIndex = points.indexOf(Math.max(...points));
  const peak = coords[peakIndex];

  return { linePath, fillPath, peak };
};

const IntensityCurve = ({ points, colors }: { points: number[]; colors: any }) => {
  const { linePath, fillPath, peak } = buildCurvePaths(points, GRAPH_WIDTH, GRAPH_HEIGHT);

  return (
    <View style={[styles.graphCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        <Defs>
          <SvgLinearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={SALMON} stopOpacity="0.35" />
            <Stop offset="1" stopColor={SALMON} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <Line
            key={ratio}
            x1={0}
            y1={GRAPH_HEIGHT * ratio}
            x2={GRAPH_WIDTH}
            y2={GRAPH_HEIGHT * ratio}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}
        <Path d={fillPath} fill="url(#curveFill)" />
        <Path d={linePath} fill="none" stroke={SALMON} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={peak.x} cy={peak.y} r={5} fill="#FFFFFF" />
        <Circle cx={peak.x} cy={peak.y} r={8} fill="none" stroke="#FFFFFF" strokeWidth={1.5} strokeOpacity={0.6} />
      </Svg>
    </View>
  );
};

const ClassDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as { classId?: string; id?: string };
  const gymClass = getClassById(params.classId ?? params.id ?? '');

  if (!gymClass) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Class not found</Text>
      </View>
    );
  }

  const tags = gymClass.tags ?? [gymClass.category, gymClass.intensityLabel ?? gymClass.intensity.toUpperCase()];
  const instructor = gymClass.instructorDetail ?? {
    name: gymClass.trainer.toUpperCase(),
    role: 'LEAD INSTRUCTOR',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=120&h=120&fit=crop',
  };
  const gear = gymClass.gear ?? gymClass.requirements.map((r, i) => ({ label: r, checked: i < 2 }));
  const squadAvatars = gymClass.squadAvatars ?? [];
  const extraSquad = Math.max(0, gymClass.spots - squadAvatars.length);
  const isFull = gymClass.spots >= gymClass.maxSpots;

  const handleBook = () => {
    if (isFull) {
      Alert.alert('Class Full', 'This class is currently at capacity.');
      return;
    }
    Alert.alert('Booking', `Reserve your spot for ${gymClass.name}?`);
  };

  const renderCta = () => {
    const label = isFull ? 'CLASS FULL' : (gymClass.ctaLabel ?? 'SECURE SPOT ⚡');
    const inner = (
      <Text style={[styles.ctaText, { color: isFull ? colors.mutedForeground : '#0D0D0D' }]}>{label}</Text>
    );

    if (isFull) {
      return (
        <View style={[styles.ctaButton, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {inner}
        </View>
      );
    }

    if (Platform.OS !== 'web') {
      return (
        <TouchableOpacity onPress={handleBook} activeOpacity={0.85} style={styles.ctaWrap}>
          <LinearGradient colors={['#E88E83', '#FA1818']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaButton}>
            {inner}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={handleBook} activeOpacity={0.85} style={[styles.ctaButton, { backgroundColor: SALMON }]}>
        {inner}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>CLASS DETAIL</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        <View style={styles.heroWrap}>
          <Image source={{ uri: gymClass.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.heroTag}>
                  <Text style={styles.heroTagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.heroTitle}>{gymClass.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaItem}>
                <ClockIcon color="#FFFFFF" />
                <Text style={styles.metaText}>{gymClass.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <FlameIcon color="#FFFFFF" />
                <Text style={styles.metaText}>{gymClass.calories}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={[styles.description, { color: SALMON }]}>{gymClass.longDescription}</Text>

          <SectionLabel color={SALMON}>LEAD INSTRUCTOR</SectionLabel>
          <View style={[styles.instructorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: instructor.avatar }} style={styles.instructorAvatar} />
            <View style={styles.instructorInfo}>
              <Text style={[styles.instructorName, { color: colors.foreground }]}>{instructor.name}</Text>
              <Text style={[styles.instructorRole, { color: SALMON }]}>{instructor.role}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoCard, styles.infoCardAccent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.infoAccent, { backgroundColor: SALMON }]} />
              <View style={styles.infoCardInner}>
                <View style={styles.infoCardHeader}>
                  <CalendarIcon color={SALMON} />
                  <Text style={[styles.infoCardLabel, { color: colors.mutedForeground }]}>
                    {gymClass.sessionLabel ?? 'NEXT SESSION'}
                  </Text>
                </View>
                <Text style={[styles.infoCardValue, { color: colors.foreground }]}>
                  {gymClass.sessionTime ?? gymClass.schedule[0]}
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoCardInner}>
                <View style={styles.infoCardHeader}>
                  <BuildingIcon color={SALMON} />
                  <Text style={[styles.infoCardLabel, { color: colors.mutedForeground }]}>STUDIO</Text>
                </View>
                <Text style={[styles.infoCardValue, { color: colors.foreground }]}>
                  {gymClass.studio ?? 'Main Floor'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <SectionLabel color={SALMON}>INTENSITY CURVE</SectionLabel>
            <Text style={[styles.zoneTarget, { color: SALMON }]}>
              {gymClass.zoneTarget ?? 'ZONE 4 TARGET'}
            </Text>
          </View>
          <IntensityCurve points={gymClass.intensityCurve ?? [0.25, 0.5, 0.75, 0.9, 0.6]} colors={colors} />

          <SectionLabel color={SALMON}>GEAR PROTOCOL</SectionLabel>
          <View style={[styles.gearCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {gear.map((item) => (
              <View key={item.label} style={styles.gearRow}>
                <View
                  style={[
                    styles.gearCheck,
                    item.checked
                      ? { backgroundColor: SALMON, borderColor: SALMON }
                      : { backgroundColor: 'transparent', borderColor: colors.border },
                  ]}
                >
                  {item.checked ? (
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth={3}>
                      <Polyline points="20 6 9 17 4 12" />
                    </Svg>
                  ) : null}
                </View>
                <Text style={[styles.gearLabel, { color: item.checked ? colors.foreground : colors.mutedForeground }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <SectionLabel color={SALMON}>
              {`SQUAD (${gymClass.spots}/${gymClass.maxSpots})`}
            </SectionLabel>
            <Text style={[styles.zoneTarget, { color: SALMON }]}>
              {gymClass.squadStatus ?? 'FILLING FAST'}
            </Text>
          </View>
          <View style={styles.squadRow}>
            {squadAvatars.map((uri, index) => (
              <Image
                key={uri}
                source={{ uri }}
                style={[
                  styles.squadAvatar,
                  { borderColor: colors.background, marginLeft: index === 0 ? 0 : -12 },
                ]}
              />
            ))}
            {extraSquad > 0 ? (
              <View style={[styles.squadMore, { backgroundColor: colors.secondary, borderColor: colors.background }]}>
                <Text style={[styles.squadMoreText, { color: colors.foreground }]}>+{extraSquad}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScreenScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {renderCta()}
      </View>
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
    flexGrow: 1,
  },
  heroWrap: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  heroTag: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroTagText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  instructorRole: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoCardAccent: {
    flexDirection: 'row',
  },
  infoAccent: {
    width: 4,
  },
  infoCardInner: {
    flex: 1,
    padding: 14,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoCardLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  infoCardValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneTarget: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
  },
  graphCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 8,
  },
  gearCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  gearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gearCheck: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    flex: 1,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  squadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  squadMore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadMoreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ctaWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ctaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default ClassDetailScreen;
