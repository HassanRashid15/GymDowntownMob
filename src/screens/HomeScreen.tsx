import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polyline, Rect, Line } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import HorizontalScrollView from '../components/HorizontalScrollView';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import TypingText from '../components/TypingText';
import GradientText from '../components/GradientText';
import { allClasses } from '../data/classes';
import { allEquipment } from '../data/equipment';
import {
  HomeLiveStats,
  HomePromotionsStrip,
  HomeReviewsStrip,
} from '../components/HomeHubSections';

const SALMON = '#E88E83';
const HERO_RED = '#FA1818';

const { width } = Dimensions.get('window');

const HERO_PHRASES = [
  'Journey Starts Here',
  'Get Stronger Daily',
  'Build Real Strength',
  'Never Skip The Grind',
  'Train With Purpose',
  'Push Past Limits',
  'Own Your Progress',
  'Forge Your Future',
];

const DumbbellIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="8" width="3" height="8" rx="1" fill={color} />
    <Rect x="4" y="6" width="3" height="12" rx="1" fill={color} />
    <Rect x="7" y="10.5" width="10" height="3" rx="1" fill={color} />
    <Rect x="17" y="6" width="3" height="12" rx="1" fill={color} />
    <Rect x="20" y="8" width="3" height="8" rx="1" fill={color} />
  </Svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const ChartIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <Polyline points="16 7 22 7 22 13" />
  </Svg>
);

const HERO_HIGHLIGHTS = [
  { title: 'Partner Gyms', detail: 'Real locations near you', Icon: DumbbellIcon },
  { title: 'Expert Trainers', detail: 'Coaches on the floor', Icon: UsersIcon },
  { title: 'Track Progress', detail: 'Log workouts in-app', Icon: ChartIcon },
];

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.round(windowHeight * 0.75);

  const features = [
    { icon: '⚡', title: 'High-Tech Equipment', description: 'State-of-the-art machines and free weights' },
    { icon: '👥', title: 'Expert Trainers', description: 'Certified professionals dedicated to your goals' },
    { icon: '🕐', title: '24/7 Access', description: 'Train on your schedule anytime' },
    { icon: '🏆', title: 'Results Driven', description: 'Proven programs for lasting results' },
  ];

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Member since 2022', content: 'Forge completely transformed my fitness journey. The trainers are incredible and the community is so supportive.', rating: 5 },
    { name: 'David Chen', role: 'Member since 2021', content: 'Best gym I\'ve ever been to. The equipment is top-notch and the classes are challenging but fun.', rating: 5 },
    { name: 'Emily Rodriguez', role: 'Member since 2023', content: 'I\'ve lost 30 pounds and gained so much confidence. Forge isn\'t just a gym, it\'s a lifestyle.', rating: 5 },
  ];

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }}>
      {/* Hub-style hero: 75vh — bottom fade blends into page */}
      <View style={[styles.hero, { height: heroHeight }]}>
        <Image
          source={require('../../assets/home_herosection.png')}
          style={[styles.heroImage, { height: heroHeight }]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View collapsable={false} style={styles.heroContent}>
          <View style={styles.heroCopy} collapsable={false}>
            <Text style={styles.heroTitleLine}>Your Fitness</Text>
            <TypingText
              words={HERO_PHRASES}
              solidColor={HERO_RED}
              typingSpeed={50}
              deletingSpeed={28}
              pauseDuration={2200}
              style={styles.heroTyping}
            />
            <Text style={styles.heroDescription}>
              Get personalized workout plans, expert guidance and track your progress — all in one
              place. Build a stronger, healthier and better you.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.heroCtaPrimary}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate(isAuthenticated ? 'Dashboard' : 'Register')
                }
              >
                <Text style={styles.heroCtaPrimaryText}>START YOUR JOURNEY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroCtaSecondary}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Classes')}
              >
                <Text style={styles.heroCtaSecondaryText}>EXPLORE FEATURES</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroHighlights}>
              {HERO_HIGHLIGHTS.map(({ title, detail, Icon }) => (
                <View key={title} style={styles.heroHighlightRow}>
                  <View style={styles.heroHighlightIcon}>
                    <Icon color={HERO_RED} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heroHighlightTitle}>{title}</Text>
                    <Text style={styles.heroHighlightDetail}>{detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        {/* Soft merge into page background */}
        <LinearGradient
          colors={[
            'transparent',
            `${colors.background}99`,
            colors.background,
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroBottomBlend}
          pointerEvents="none"
        />
      </View>

      <HomeLiveStats />
      <HomePromotionsStrip />

      {/* Features Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>WHY CHOOSE FORGE</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          We provide everything you need to achieve your fitness goals
        </Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={styles.featureIconText}>{feature.icon}</Text>
              </View>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>
                {feature.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Classes Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>POPULAR CLASSES</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All →</Text>
          </TouchableOpacity>
        </View>
        <HorizontalScrollView style={styles.horizontalScroll}>
          {allClasses.slice(0, 3).map((gymClass) => (
            <TouchableOpacity
              key={gymClass.id}
              onPress={() => navigation.navigate('ClassDetail', { classId: gymClass.id })}
              style={styles.classCard}
            >
              <Image source={{ uri: gymClass.image }} style={styles.classImage} />
              <View style={[styles.classOverlay, { backgroundColor: colors.background }]} />
              <View style={styles.classContent}>
                <View style={styles.classBadges}>
                  <Badge variant="primary" size="small">{gymClass.duration}</Badge>
                  <Badge variant="secondary" size="small">{gymClass.intensity}</Badge>
                </View>
                <Text style={[styles.className, { color: colors.foreground }]}>{gymClass.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </HorizontalScrollView>
      </View>

      {/* Equipment Preview */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 4 }]}>
              PREMIUM EQUIPMENT
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground, marginBottom: 0 }]}>
              State-of-the-art machines and free weights for every goal
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Equipment')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All →</Text>
          </TouchableOpacity>
        </View>
        <HorizontalScrollView style={styles.horizontalScroll}>
          {allEquipment.slice(0, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('EquipmentDetail', { equipmentId: item.id })}
              style={[styles.equipmentCard, { borderColor: colors.border }]}
            >
              <Image source={{ uri: item.image }} style={styles.equipmentImage} />
              <View style={[styles.equipmentOverlay, { backgroundColor: colors.background }]} />
              <View style={styles.equipmentContent}>
                <View style={styles.equipmentBadges}>
                  <Badge variant="primary" size="small">{item.category.toUpperCase()}</Badge>
                  <Badge variant="secondary" size="small">{item.quantity} UNITS</Badge>
                </View>
                <Text style={[styles.equipmentName, { color: colors.foreground }]} numberOfLines={2}>
                  {item.name.toUpperCase()}
                </Text>
                <Text style={[styles.equipmentDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {item.shortDescription}
                </Text>
                <View style={[styles.equipmentAccent, { backgroundColor: SALMON }]} />
              </View>
            </TouchableOpacity>
          ))}
        </HorizontalScrollView>
      </View>

      {/* Stats Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.statsGrid}>
          {[
            { value: '10K+', label: 'Active Members' },
            { value: '50+', label: 'Expert Trainers' },
            { value: '100+', label: 'Weekly Classes' },
            { value: '15', label: 'Years of Excellence' },
          ].map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <HomeReviewsStrip />

      <View style={[styles.section, { paddingTop: 8 }]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24 }}>
          {[
            { label: 'GYMS', route: 'Gyms' },
            { label: 'EXERCISES', route: 'Exercises' },
            { label: 'BLOG', route: 'Blog' },
            { label: 'LIVE CLASSES', route: 'LiveClasses' },
          ].map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              style={{
                borderWidth: 1,
                borderColor: '#2A2A2A',
                backgroundColor: '#141414',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1 }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>MEMBER STORIES</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          Real results from real people who chose to transform
        </Text>
        <HorizontalScrollView style={styles.horizontalScroll}>
          {testimonials.map((testimonial, index) => (
            <Card key={index} style={styles.testimonialCard}>
              <View style={styles.rating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Text key={i} style={styles.star}>⭐</Text>
                ))}
              </View>
              <Text style={[styles.testimonialContent, { color: colors.foreground }]}>
                "{testimonial.content}"
              </Text>
              <View>
                <Text style={[styles.testimonialName, { color: colors.foreground }]}>
                  {testimonial.name}
                </Text>
                <Text style={[styles.testimonialRole, { color: colors.mutedForeground }]}>
                  {testimonial.role}
                </Text>
              </View>
            </Card>
          ))}
        </HorizontalScrollView>
      </View>

      {/* CTA Section */}
      <View style={[styles.ctaSection, { backgroundColor: colors.card }]}>
        <View style={styles.ctaTitleRow}>
          <Text style={[styles.ctaTitle, { color: colors.foreground }]}>READY TO </Text>
          <GradientText style={styles.ctaTitle}>TRANSFORM</GradientText>
          <Text style={[styles.ctaTitle, { color: colors.foreground }]}>?</Text>
        </View>
        <Text style={[styles.ctaDescription, { color: colors.mutedForeground }]}>
          Join thousands of members who have already started their fitness journey
        </Text>
        <Button
          title="Get Started Free"
          onPress={() => isAuthenticated ? navigation.navigate('Dashboard') : navigation.navigate('Membership')}
          size="large"
        />
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>QUICK LINKS</Text>
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={[styles.quickLink, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={[styles.quickLinkText, { color: colors.foreground }]}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickLink, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Contact')}
          >
            <Text style={[styles.quickLinkText, { color: colors.foreground }]}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  heroContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: 'rgba(0,0,0,0.62)',
    zIndex: 2,
  },
  heroBottomBlend: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    zIndex: 3,
  },
  heroCopy: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'flex-start',
  },
  heroTitleLine: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    lineHeight: 48,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'left',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  heroTyping: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'left',
  },
  heroDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 340,
    marginTop: 8,
    marginBottom: 22,
    textAlign: 'left',
  },
  heroButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 22,
    alignItems: 'flex-start',
  },
  heroCtaPrimary: {
    height: 44,
    width: '100%',
    maxWidth: 320,
    borderRadius: 999,
    backgroundColor: HERO_RED,
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 28,
    shadowColor: HERO_RED,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  heroCtaPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  heroCtaSecondary: {
    height: 44,
    width: '100%',
    maxWidth: 320,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroCtaSecondaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  heroHighlights: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 18,
    gap: 14,
    alignItems: 'flex-start',
  },
  heroHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: 320,
  },
  heroHighlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(250,24,24,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(250,24,24,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHighlightTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  heroHighlightDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    textAlign: 'left',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 32,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    maxWidth: 400,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 72) / 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  classCard: {
    width: 200,
    height: 280,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  classImage: {
    ...StyleSheet.absoluteFill,
  },
  classOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.3,
  },
  classContent: {
    ...StyleSheet.absoluteFill,
    padding: 12,
    justifyContent: 'flex-end',
  },
  classBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  className: {
    fontSize: 24,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
  },
  equipmentCard: {
    width: 220,
    height: 300,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  equipmentImage: {
    ...StyleSheet.absoluteFill,
  },
  equipmentOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  equipmentContent: {
    ...StyleSheet.absoluteFill,
    padding: 12,
    justifyContent: 'flex-end',
  },
  equipmentBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 22,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  equipmentDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  equipmentAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 24,
    width: (width - 96) / 2,
  },
  statValue: {
    fontSize: 48,
    fontFamily: 'BebasNeue_400Regular',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  testimonialCard: {
    width: 280,
    marginRight: 12,
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 16,
  },
  testimonialContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 12,
  },
  ctaSection: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 36,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
  },
  ctaDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 400,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLink: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;