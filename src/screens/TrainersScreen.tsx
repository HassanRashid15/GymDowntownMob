import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import ScreenScrollView from '../components/ScreenScrollView';
import DottedBackground from '../components/DottedBackground';
import GradientText from '../components/GradientText';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTrainers } from '../context/TrainersContext';
import AdminTrainersTable from '../components/AdminTrainersTable';
import { LinearGradient } from 'expo-linear-gradient';
import { Trainer } from '../data/trainers';

const SALMON = '#E88E83';

const TrainersScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const { trainers } = useTrainers();

  if (isAdmin) {
    return <AdminTrainersTable navigation={navigation} />;
  }

  const renderRatingBadge = (rating: string) => (
    <View style={[styles.ratingBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <Text style={styles.ratingStar}>★</Text>
      <Text style={[styles.ratingText, { color: colors.foreground }]}>{rating}</Text>
    </View>
  );

  const renderSpecialtyTags = (specialties: string[], dimmed: boolean) => (
    <View style={styles.tagsRow}>
      {specialties.slice(0, 2).map((tag) => (
        <View
          key={tag}
          style={[
            styles.tag,
            {
              backgroundColor: dimmed ? colors.muted : colors.secondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.tagText, { color: dimmed ? colors.mutedForeground : colors.mutedForeground }]}>
            {tag.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderLeftAccent = (isBooked: boolean, isLive: boolean, isOffDuty: boolean) => {
    const accentColor = isBooked || isOffDuty ? '#5C5C5C' : isLive ? '#FF6633' : SALMON;
    return <View style={[styles.leftAccent, { backgroundColor: accentColor }]} />;
  };

  const renderCardButton = (trainer: Trainer) => {
    const status = trainer.status ?? 'available';

    if (status === 'booked' || status === 'off_duty') {
      return (
        <View style={[styles.cardButton, styles.bookedButton, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.cardButtonText, { color: colors.mutedForeground }]}>
            {status === 'off_duty' ? 'OFF DUTY' : '🔒  FULLY BOOKED'}
          </Text>
        </View>
      );
    }

    if (status === 'live') {
      const content = (
        <View style={styles.cardButtonInner}>
          <Text style={styles.joinButtonText}>JOIN SESSION  ⚡</Text>
        </View>
      );

      if (Platform.OS !== 'web') {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('TrainerDetail', { trainerId: trainer.id })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.cardButton, styles.joinButton]}
            >
              {content}
            </LinearGradient>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('TrainerDetail', { trainerId: trainer.id })}
          style={[styles.cardButton, styles.joinButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('TrainerDetail', { trainerId: trainer.id })}
        style={[styles.cardButton, styles.profileButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        activeOpacity={0.85}
      >
        <Text style={[styles.cardButtonText, { color: colors.foreground }]}>VIEW PROFILE  ›</Text>
      </TouchableOpacity>
    );
  };

  const renderTrainerCard = (trainer: Trainer) => {
    const isBooked = trainer.status === 'booked';
    const isLive = trainer.status === 'live';
    const isOffDuty = trainer.status === 'off_duty';

    return (
      <View
        key={trainer.id}
        style={[
          styles.trainerCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: isBooked || isOffDuty ? 0.55 : 1,
          },
        ]}
      >
        {renderLeftAccent(isBooked, isLive, isOffDuty)}
        <View style={styles.cardRow}>
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: trainer.image }}
              style={[styles.trainerImage, isBooked && styles.grayscaleImage]}
              resizeMode="cover"
            />
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <View style={styles.nameBlock}>
                <Text style={[styles.trainerName, { color: colors.foreground }]} numberOfLines={1}>
                  {trainer.name.split(' ')[0]}
                </Text>
                <Text style={[styles.trainerName, { color: colors.foreground }]} numberOfLines={1}>
                  {trainer.name.split(' ').slice(1).join(' ')}
                </Text>
              </View>
              {renderRatingBadge(trainer.rating)}
            </View>

            <Text style={[styles.trainerTagline, { color: SALMON }]}>
              {(trainer.tagline ?? trainer.role).toUpperCase()}
            </Text>

            {renderSpecialtyTags(trainer.specialties, isBooked || isOffDuty)}
            {renderCardButton(trainer)}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <DottedBackground />
      <ScreenScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: SALMON }]}>TRAINERS</Text>
          <View style={styles.titleRow}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>MEET OUR </Text>
            <GradientText style={styles.heroTitle}>TRAINERS</GradientText>
          </View>
          <Text style={[styles.heroSubtitle, { color: SALMON }]}>
            Elite coaching for elite results. Select your discipline.
          </Text>
        </View>

        <View style={styles.list}>
          {trainers.map(renderTrainerCard)}
        </View>
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 28,
    paddingTop: 8,
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: 1.5,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 300,
  },
  list: {
    gap: 16,
  },
  trainerCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 8,
    zIndex: 2,
  },
  cardRow: {
    flexDirection: 'row',
    minHeight: 180,
  },
  imageWrap: {
    width: 118,
    position: 'relative',
  },
  trainerImage: {
    width: '100%',
    height: '100%',
    minHeight: 168,
  },
  grayscaleImage: {
    opacity: 0.7,
  },
  liveBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FA1818',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  cardBody: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nameBlock: {
    flex: 1,
  },
  trainerName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  ratingStar: {
    color: '#FACC15',
    fontSize: 11,
  },
  ratingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  trainerTagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  cardButton: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    borderWidth: 1,
  },
  joinButton: {
    shadowColor: '#FA1818',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  bookedButton: {
    borderWidth: 1,
  },
  cardButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  joinButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
});

export default TrainersScreen;
