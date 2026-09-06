import React, { useState } from 'react';
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
import Svg, { Path, Circle, Polyline, Rect, Line } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTrainers } from '../context/TrainersContext';

let LinearGradient: any;
if (Platform.OS !== 'web') {
  LinearGradient = require('react-native-linear-gradient').default;
}

const SALMON = '#E88E83';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

const HeartIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const DumbbellIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6.5 6.5h11v11h-11z" />
    <Path d="M3 8v8M21 8v8M6 6V4M18 6V4M6 20v-2M18 20v-2" />
  </Svg>
);

const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const ChevronRightIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

const SectionTitle = ({ title, colors }: { title: string; colors: any }) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  </View>
);

const TrainerDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { getTrainerById } = useTrainers();
  const params = route.params as { trainerId?: string; id?: string };
  const trainer = getTrainerById(params.trainerId ?? params.id ?? '');

  const [favorited, setFavorited] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!trainer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Trainer not found</Text>
      </View>
    );
  }

  const availability = trainer.availability ?? [];
  const visibleDays = availability.slice(dayOffset, dayOffset + 3);
  const certTags = trainer.certTags ?? [...trainer.certifications, ...trainer.specialties];
  const experienceStat = trainer.experience.replace(/\s*years?/i, ' YEARS EXP').toUpperCase();
  const isFullyBooked = trainer.status === 'booked';

  const handleBook = () => {
    if (isFullyBooked) {
      Alert.alert('Fully Booked', 'This trainer has no available sessions right now.');
      return;
    }
    Alert.alert(
      'Book Session',
      selectedSlot
        ? `Request booking for ${selectedSlot}?`
        : 'Select a time slot to continue.',
    );
  };

  const renderBookButton = () => {
    const label = isFullyBooked ? 'FULLY BOOKED' : 'BOOK SESSION';
    const inner = (
      <View style={styles.bookButtonInner}>
        {!isFullyBooked && <CalendarIcon color="#FFFFFF" />}
        <Text style={styles.bookButtonText}>{label}</Text>
      </View>
    );

    if (isFullyBooked) {
      return (
        <View style={[styles.bookButton, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {inner}
        </View>
      );
    }

    if (LinearGradient && Platform.OS !== 'web') {
      return (
        <TouchableOpacity onPress={handleBook} activeOpacity={0.85} style={styles.bookButtonWrap}>
          <LinearGradient
            colors={['#FA1818', '#FF6633']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButton}
          >
            {inner}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={handleBook}
        activeOpacity={0.85}
        style={[styles.bookButton, { backgroundColor: colors.primary }]}
      >
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
        <Text style={[styles.headerTitle, { color: SALMON }]}>TRAINER PROFILE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: trainer.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroFade} />
        </View>

        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <View style={[styles.titleBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.titleBadgeText, { color: SALMON }]}>
                {(trainer.titleBadge ?? trainer.tagline ?? 'COACH').toUpperCase()}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={[styles.ratingText, { color: colors.foreground }]}>
                {trainer.rating}
              </Text>
              <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>
                ({trainer.reviewCount ?? 0} Reviews)
              </Text>
            </View>
          </View>

          <Text style={[styles.trainerName, { color: colors.foreground }]}>
            {trainer.name.toUpperCase()}
          </Text>
          <Text style={[styles.shortBio, { color: colors.mutedForeground }]}>
            {trainer.shortBio ?? trainer.bio}
          </Text>

          <View style={styles.actionRow}>
            <View style={styles.bookButtonFlex}>{renderBookButton()}</View>
            <TouchableOpacity
              onPress={() => setFavorited((v) => !v)}
              style={[styles.favoriteButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <HeartIcon color={favorited ? colors.primary : colors.mutedForeground} filled={favorited} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ClockIcon color={SALMON} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{experienceStat}</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <DumbbellIcon color={SALMON} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{trainer.clients} CLIENTS</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ShieldIcon color={SALMON} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>CERTIFIED</Text>
            </View>
          </View>

          {trainer.philosophy ? (
            <View style={styles.section}>
              <SectionTitle title="THE PHILOSOPHY" colors={colors} />
              <View style={[styles.quoteCard, { backgroundColor: colors.card, borderColor: `${SALMON}55` }]}>
                <Text style={[styles.quoteText, { color: colors.foreground }]}>{trainer.philosophy}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="CERTIFICATIONS & SPECIALTIES" colors={colors} />
            <View style={styles.certList}>
              {certTags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.certPill, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.certIconWrap, { backgroundColor: `${colors.primary}22` }]}>
                    <CheckIcon color={colors.primary} />
                  </View>
                  <Text style={[styles.certText, { color: colors.foreground }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {availability.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.availabilityHeader}>
                <SectionTitle title="AVAILABILITY" colors={colors} />
                <View style={styles.dayNav}>
                  <TouchableOpacity
                    onPress={() => setDayOffset((o) => Math.max(0, o - 1))}
                    disabled={dayOffset === 0}
                    style={[styles.dayNavBtn, { opacity: dayOffset === 0 ? 0.3 : 1 }]}
                  >
                    <ChevronLeftIcon color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDayOffset((o) => Math.min(availability.length - 3, o + 1))}
                    disabled={dayOffset >= availability.length - 3}
                    style={[styles.dayNavBtn, { opacity: dayOffset >= availability.length - 3 ? 0.3 : 1 }]}
                  >
                    <ChevronRightIcon color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.calendarRow}>
                {visibleDays.map((day) => (
                  <View key={`${day.label}-${day.date}`} style={styles.dayColumn}>
                    <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{day.label}</Text>
                    <Text style={[styles.dayDate, { color: colors.foreground }]}>{day.date}</Text>
                    {day.slots.map((slot) => {
                      const slotKey = `${day.label}-${slot.time}`;
                      const isSelected = selectedSlot === slotKey;
                      if (slot.booked) {
                        return (
                          <View
                            key={slotKey}
                            style={[styles.slotBooked, { backgroundColor: colors.muted, borderColor: colors.border }]}
                          >
                            <Text style={[styles.slotBookedText, { color: colors.mutedForeground }]}>Booked</Text>
                          </View>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={slotKey}
                          onPress={() => setSelectedSlot(slotKey)}
                          style={[
                            styles.slotAvailable,
                            {
                              borderColor: isSelected ? colors.primary : `${SALMON}88`,
                              backgroundColor: isSelected ? `${colors.primary}18` : 'transparent',
                            },
                          ]}
                        >
                          <Text style={[styles.slotTime, { color: isSelected ? colors.primary : SALMON }]}>
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {trainer.featuredProgram ? (
            <View style={styles.section}>
              <SectionTitle title="FEATURED PROGRAM" colors={colors} />
              <TouchableOpacity activeOpacity={0.9} style={styles.programCard}>
                <Image
                  source={{ uri: trainer.featuredProgram.image }}
                  style={styles.programImage}
                  resizeMode="cover"
                />
                <View style={styles.programOverlay} />
                <View style={styles.programContent}>
                  <View style={[styles.programBadge, { backgroundColor: `${colors.primary}33`, borderColor: colors.primary }]}>
                    <Text style={[styles.programBadgeText, { color: colors.primary }]}>
                      {trainer.featuredProgram.badge}
                    </Text>
                  </View>
                  <Text style={styles.programTitle}>{trainer.featuredProgram.title}</Text>
                  <View style={styles.programFooter}>
                    <Text style={styles.programDescription}>{trainer.featuredProgram.description}</Text>
                    <ChevronRightIcon color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
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
    width: '100%',
    height: SCREEN_WIDTH * 0.95,
    maxHeight: 420,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroFade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  titleBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    color: '#FACC15',
    fontSize: 13,
  },
  ratingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  reviewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  trainerName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  shortBio: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  bookButtonFlex: {
    flex: 1,
  },
  bookButtonWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bookButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  favoriteButton: {
    width: 54,
    height: 54,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statTile: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
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
  quoteCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 18,
  },
  quoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  certList: {
    gap: 10,
  },
  certPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  certIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    flex: 1,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayNav: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 14,
  },
  dayNavBtn: {
    padding: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  dayDate: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    marginBottom: 4,
  },
  slotAvailable: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  slotTime: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  slotBooked: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  slotBookedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  programCard: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 160,
    justifyContent: 'flex-end',
  },
  programImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  programOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  programContent: {
    padding: 18,
    zIndex: 1,
  },
  programBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
  },
  programBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  programTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  programFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  programDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default TrainerDetailScreen;
