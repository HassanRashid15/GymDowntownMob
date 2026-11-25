import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import ScreenScrollView from '../components/ScreenScrollView';
import HorizontalScrollView from '../components/HorizontalScrollView';
import DottedBackground from '../components/DottedBackground';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { allClasses, categories } from '../data/classes';

const SALMON = '#E88E83';
const { width } = Dimensions.get('window');
const H_PAD = 24;
const GRID_GAP = 14;
const CARD_WIDTH = (width - H_PAD * 2 - GRID_GAP) / 2;

const ClassesScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [view, setView] = useState<'classes' | 'schedule'>('classes');

  const filteredClasses =
    activeCategory === 'ALL'
      ? allClasses
      : allClasses.filter((c) => c.category === activeCategory);

  const scheduleData = [
    { time: '6:00 AM', mon: 'TITAN LIFT', tue: 'RECOVERY', wed: 'TITAN LIFT', thu: 'RECOVERY', fri: 'TITAN LIFT', sat: 'INFERNO' },
    { time: '7:00 AM', mon: 'ENDURANCE', tue: 'RECOVERY', wed: 'ENDURANCE', thu: 'RECOVERY', fri: 'ENDURANCE', sat: 'INFERNO' },
    { time: '12:00 PM', mon: 'INFERNO', tue: 'TITAN LIFT', wed: 'INFERNO', thu: 'TITAN LIFT', fri: 'INFERNO', sat: '-' },
    { time: '5:30 PM', mon: 'ENDURANCE', tue: '-', wed: 'ENDURANCE', thu: '-', fri: '-', sat: 'ENDURANCE' },
    { time: '6:00 PM', mon: 'RECOVERY', tue: 'TITAN LIFT', wed: 'RECOVERY', thu: 'TITAN LIFT', fri: 'RECOVERY', sat: '-' },
  ];

  const renderBookButton = (classId: string) => {
    const onPress = () => navigation.navigate('ClassDetail', { classId });

    if (Platform.OS !== 'web') {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#FF6633', SALMON]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>BOOK</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={onPress} style={[styles.bookButton, { backgroundColor: SALMON }]} activeOpacity={0.85}>
        <Text style={styles.bookButtonText}>BOOK</Text>
      </TouchableOpacity>
    );
  };

  const renderClassItem = ({ item }: { item: typeof allClasses[0] }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ClassDetail', { classId: item.id })}
      style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.92}
    >
      <Image source={{ uri: item.image }} style={styles.classImage} resizeMode="cover" />
      {Platform.OS !== 'web' ? (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
          style={styles.imageGradient}
        />
      ) : (
        <View style={styles.imageGradientFallback} />
      )}
      <View style={styles.classContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        <View style={styles.classTextBlock}>
          <Text style={styles.className} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.classDescription} numberOfLines={3}>{item.description}</Text>
          {renderBookButton(item.id)}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderScheduleRow = (row: (typeof scheduleData)[0], index: number) => (
    <View key={index} style={[styles.scheduleRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.scheduleTime, { color: SALMON }]}>{row.time}</Text>
      <Text style={[styles.scheduleCell, { color: colors.foreground }]}>{row.mon}</Text>
      <Text style={[styles.scheduleCell, { color: colors.foreground }]}>{row.tue}</Text>
      <Text style={[styles.scheduleCell, { color: colors.foreground }]}>{row.wed}</Text>
      <Text style={[styles.scheduleCell, { color: colors.foreground }]}>{row.thu}</Text>
      <Text style={[styles.scheduleCell, { color: colors.foreground }]}>{row.fri}</Text>
      <Text style={[styles.scheduleCell, { color: colors.foreground }]}>{row.sat}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <DottedBackground />
      <ScreenScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>OUR CLASSES</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LiveClasses')} style={{ marginTop: 8 }}>
            <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', letterSpacing: 1 }}>
              LIVE SCHEDULE & BOOKING →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Classes / Schedule toggle */}
        <View style={[styles.toggleTrack, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {(['classes', 'schedule'] as const).map((tab) => {
            const isActive = view === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setView(tab)}
                style={[styles.toggleSegment, isActive && { backgroundColor: SALMON }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.toggleText, { color: isActive ? '#0D0D0D' : colors.mutedForeground }]}>
                  {tab === 'classes' ? 'CLASSES' : 'SCHEDULE'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {view === 'classes' && (
          <>
            <HorizontalScrollView style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setActiveCategory(category)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive ? SALMON : colors.secondary,
                        borderColor: isActive ? SALMON : colors.border,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.filterChipText, { color: isActive ? '#0D0D0D' : colors.mutedForeground }]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </HorizontalScrollView>

            <View style={styles.grid}>
              <FlatList
                data={filteredClasses}
                renderItem={renderClassItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                scrollEnabled={false}
              />
            </View>
          </>
        )}

        {view === 'schedule' && (
          <View style={styles.scheduleSection}>
            <HorizontalScrollView>
              <View>
                <View style={[styles.scheduleHeader, { borderBottomColor: colors.border }]}>
                  {['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                    <Text key={label} style={[styles.scheduleHeaderText, { color: colors.foreground }]}>
                      {label}
                    </Text>
                  ))}
                </View>
                {scheduleData.map(renderScheduleRow)}
              </View>
            </HorizontalScrollView>
          </View>
        )}
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 20,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
    paddingTop: 12,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    letterSpacing: 2,
    lineHeight: 44,
  },
  toggleTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginBottom: 22,
  },
  toggleSegment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  filterScroll: {
    marginBottom: 22,
  },
  filterRow: {
    gap: 10,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  grid: {
    marginTop: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
    gap: GRID_GAP,
  },
  classCard: {
    width: CARD_WIDTH,
    height: 268,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  classImage: {
    ...StyleSheet.absoluteFill,
  },
  imageGradient: {
    ...StyleSheet.absoluteFill,
  },
  imageGradientFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  classContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1,
  },
  classTextBlock: {
    gap: 6,
  },
  className: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    lineHeight: 24,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  classDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
    minHeight: 42,
  },
  bookButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#0D0D0D',
  },
  scheduleSection: {
    marginTop: 12,
    paddingBottom: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  scheduleHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    width: 76,
    letterSpacing: 0.5,
  },
  scheduleRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  scheduleTime: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    width: 76,
  },
  scheduleCell: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    width: 76,
  },
});

export default ClassesScreen;
