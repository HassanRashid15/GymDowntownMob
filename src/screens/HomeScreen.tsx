import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
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

const SALMON = '#E88E83';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();

  const phrases = ['FUTURE', 'STRENGTH', 'LEGACY', 'GREATNESS', 'POWER'];

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
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={[styles.heroOverlay, { backgroundColor: colors.background }]} />
        {/* Fire glow effects */}
        <View style={[styles.glowBlob1, { backgroundColor: `${colors.primary}30` }]} />
        <View style={[styles.glowBlob2, { backgroundColor: `${colors.accent}25` }]} />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTagline, { color: colors.primary }]}>
            UNLEASH. IGNITE. DOMINATE.
          </Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            FORGE YOUR
          </Text>
          <TypingText words={phrases} />
          <Text style={[styles.heroDescription, { color: colors.mutedForeground }]}>
            Sweat is your fuel. Every rep, every drop, every breath — this is where champions are built.
          </Text>
          <View style={styles.heroButtons}>
            <Button
              title="Start Your Journey"
              onPress={() => navigation.navigate(isAuthenticated ? 'Dashboard' : 'Membership')}
              size="large"
            />
            <Button
              title="Explore Classes"
              onPress={() => navigation.navigate('Classes')}
              variant="outline"
              size="large"
            />
          </View>
        </View>
      </View>

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
    height: 600,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.65,
  },
  glowBlob1: {
    position: 'absolute',
    top: '20%',
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  glowBlob2: {
    position: 'absolute',
    bottom: '15%',
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.5,
  },
  heroContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    padding: 24,
  },
  heroTagline: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 48,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 400,
  },
  heroButtons: {
    gap: 12,
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