import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const SALMON = '#E88E83';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ChevronRightIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

const DumbbellIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6.5 6.5h11v11h-11z" />
    <Path d="M3 8v8M21 8v8M6 6V4M18 6V4M6 20v-2M18 20v-2" />
  </Svg>
);

const FlameIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-1-3-1-4.5 1.5 0 2.5 1 3 2.5.5-2 2-3.5 4-3.5 0 3 2 4.5 2 7a6 6 0 0 1-12 0c0-2 1-3 1.5-3.5z" />
  </Svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const ChartIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <Polyline points="17 6 23 6 23 12" />
  </Svg>
);

const SectionTitle = ({ title, colors }: { title: string; colors: any }) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  </View>
);

const values = [
  { icon: DumbbellIcon, title: 'DISCIPLINE', description: 'Consistency over inspiration.' },
  { icon: FlameIcon, title: 'STRENGTH', description: 'Physical and mental fortitude.' },
  { icon: UsersIcon, title: 'COMMUNITY', description: 'Suffering shared is power multiplied.' },
  { icon: ChartIcon, title: 'RESULTS', description: 'Data-driven performance.' },
];

const timeline = [
  {
    year: '2009',
    title: 'FOUNDATION',
    description: 'The first iron was lifted. A raw space dedicated to pure strength and conditioning.',
  },
  {
    year: '2015',
    title: 'EXPANSION',
    description: '5 new locations opened. Our methodology begins to dominate the regional circuit.',
  },
  {
    year: '2020',
    title: 'THE STANDARD',
    description: 'Launch of the digital platform, bringing elite coaching to athletes worldwide.',
  },
  {
    year: '2024',
    title: 'GLOBAL ELITE',
    description: '15 locations, 50+ trainers. The evolution continues.',
  },
];

const AboutScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const goToMembership = () => {
    navigation.navigate('MainTabs', { screen: 'Join' });
  };

  const renderCtaButton = () => {
    const inner = (
      <View style={styles.ctaButtonInner}>
        <Text style={styles.ctaButtonText}>VIEW MEMBERSHIP</Text>
        <ChevronRightIcon color="#0D0D0D" />
      </View>
    );

    if (Platform.OS !== 'web') {
      return (
        <TouchableOpacity onPress={goToMembership} activeOpacity={0.85} style={styles.ctaButtonWrap}>
          <LinearGradient colors={['#E88E83', '#FA1818']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaButton}>
            {inner}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={goToMembership} activeOpacity={0.85} style={[styles.ctaButton, { backgroundColor: SALMON }]}>
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
        <Text style={[styles.headerTitle, { color: SALMON }]}>ABOUT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=600&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroBrand}>FORGE</Text>
            <Text style={styles.heroTitle}>FORGING THE ELITE</Text>
            <Text style={[styles.heroTitleAccent, { color: SALMON }]}>ATHLETES OF TOMORROW.</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>50+</Text>
              <Text style={[styles.statLabel, { color: SALMON }]}>TRAINERS</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>15</Text>
              <Text style={[styles.statLabel, { color: SALMON }]}>LOCATIONS</Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle title="CORE VALUES" colors={colors} />
            <View style={styles.valuesGrid}>
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <View
                    key={value.title}
                    style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Icon color={SALMON} />
                    <Text style={[styles.valueTitle, { color: colors.foreground }]}>{value.title}</Text>
                    <Text style={[styles.valueDescription, { color: colors.mutedForeground }]}>
                      {value.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle title="THE LEGACY" colors={colors} />
            <View style={styles.timelineWrap}>
              <View style={[styles.timelineLine, { backgroundColor: `${SALMON}55` }]} />
              {timeline.map((item, index) => (
                <View key={item.year} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                    <View style={[styles.timelineDotInner, { backgroundColor: colors.primary }]} />
                  </View>
                  <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.timelineYearRow}>
                      <Text style={[styles.timelineYear, { color: colors.foreground }]}>{item.year}</Text>
                      <Text style={[styles.timelineCardTitle, { color: SALMON }]}>{item.title}</Text>
                    </View>
                    <Text style={[styles.timelineDescription, { color: colors.mutedForeground }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.ctaSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>READY TO FORGE?</Text>
            <Text style={[styles.ctaSubtitle, { color: colors.mutedForeground }]}>
              Join the elite. No excuses. Just results.
            </Text>
            {renderCtaButton()}
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
};

const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

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
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  heroBrand: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    lineHeight: 38,
  },
  heroTitleAccent: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    minHeight: 130,
  },
  valueTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  valueDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  timelineWrap: {
    position: 'relative',
    paddingLeft: 8,
    gap: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 12,
    bottom: 12,
    width: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    zIndex: 1,
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  timelineYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  timelineYear: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  timelineCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  timelineDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  ctaSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButtonWrap: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
});

export default AboutScreen;
