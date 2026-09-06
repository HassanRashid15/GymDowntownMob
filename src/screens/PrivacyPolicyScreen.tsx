import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import {
  privacyPolicyMeta,
  privacyPolicyIntro,
  privacyPolicySections,
} from '../data/privacyPolicy';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const SectionTitle = ({ title, colors }: { title: string; colors: any }) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  </View>
);

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>PRIVACY POLICY</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${SALMON}22` }]}>
            <ShieldIcon color={SALMON} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>YOUR DATA. YOUR CONTROL.</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            How Forge Gym collects, uses, and protects your information.
          </Text>
          <View style={[styles.metaBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.metaText, { color: SALMON }]}>
              Last updated: {privacyPolicyMeta.lastUpdated}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>{privacyPolicyIntro}</Text>

          {privacyPolicySections.map((section) => (
            <View key={section.title} style={styles.section}>
              <SectionTitle title={section.title} colors={colors} />
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {section.body ? (
                  <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{section.body}</Text>
                ) : null}
                {section.bullets?.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: SALMON }]} />
                    <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: `${SALMON}66` }]}>
            <Text style={[styles.contactTitle, { color: colors.foreground }]}>QUESTIONS?</Text>
            <Text style={[styles.contactBody, { color: colors.mutedForeground }]}>
              Contact our privacy team for data requests or policy questions.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${privacyPolicyMeta.contactEmail}`)}>
              <Text style={[styles.contactLink, { color: SALMON }]}>{privacyPolicyMeta.contactEmail}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('HelpSupport')}
              style={[styles.contactButton, { borderColor: SALMON }]}
            >
              <Text style={[styles.contactButtonText, { color: SALMON }]}>VISIT HELP CENTER</Text>
            </TouchableOpacity>
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
  heroCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
  },
  metaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  metaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  intro: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    letterSpacing: 0.8,
    flex: 1,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  contactCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  contactTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  contactBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  contactLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 16,
  },
  contactButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contactButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
});

export default PrivacyPolicyScreen;
