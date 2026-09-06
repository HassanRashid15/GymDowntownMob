import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { faqItems, helpTopics, supportChannels } from '../data/helpSupport';
import { navigateBackOrTo } from '../navigation/navigationHelpers';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ChevronDownIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

const HelpIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

const MailIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const MessageIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const SectionTitle = ({ title, colors }: { title: string; colors: any }) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  </View>
);

const HelpSupportScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleCall = () => {
    Linking.openURL(`tel:${supportChannels.phone.replace(/\D/g, '')}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${supportChannels.email}?subject=Forge%20Gym%20Support`);
  };

  const handleLiveChat = () => {
    navigation.navigate('Messaging', {
      channelId: 'live-support',
      returnTo: 'HelpSupport',
    });
  };

  const handleTopicPress = (topicId: string) => {
    const topic = helpTopics.find((t) => t.id === topicId);
    if (!topic) return;
    const relatedFaq = faqItems.findIndex((f) =>
      f.question.toLowerCase().includes(topicId === 'membership' ? 'freeze' : topicId.slice(0, 4))
    );
    if (relatedFaq >= 0) setExpandedFaq(relatedFaq);
    else navigation.navigate('Contact');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Settings' } })}
          style={styles.backButton}
        >
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>HELP & SUPPORT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${SALMON}22` }]}>
            <HelpIcon color={SALMON} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>HOW CAN WE HELP?</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            Find answers fast or reach our support team directly.
          </Text>
          <Text style={[styles.responseTime, { color: SALMON }]}>{supportChannels.responseTime}</Text>
        </View>

        <View style={styles.body}>
          <SectionTitle title="QUICK CONTACT" colors={colors} />
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={handleCall}
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${SALMON}22` }]}>
                <PhoneIcon color={SALMON} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>CALL</Text>
              <Text style={[styles.quickValue, { color: colors.foreground }]}>{supportChannels.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEmail}
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${SALMON}22` }]}>
                <MailIcon color={SALMON} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>EMAIL</Text>
              <Text style={[styles.quickValue, { color: colors.foreground }]} numberOfLines={1}>
                {supportChannels.email}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLiveChat}
            style={[styles.chatCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: `${SALMON}22` }]}>
              <MessageIcon color={SALMON} />
            </View>
            <View style={styles.chatText}>
              <Text style={[styles.chatTitle, { color: colors.foreground }]}>LIVE CHAT</Text>
              <Text style={[styles.chatSubtitle, { color: colors.mutedForeground }]}>
                Chat with support during gym hours
              </Text>
            </View>
            <ChevronDownIcon color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={[styles.hoursCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ClockIcon color={SALMON} />
            <Text style={[styles.hoursText, { color: colors.mutedForeground }]}>
              Support hours: {supportChannels.hours}
            </Text>
          </View>

          <View style={styles.section}>
            <SectionTitle title="BROWSE TOPICS" colors={colors} />
            {helpTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                onPress={() => handleTopicPress(topic.id)}
                style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.topicAccent, { backgroundColor: SALMON }]} />
                <View style={styles.topicContent}>
                  <Text style={[styles.topicTitle, { color: colors.foreground }]}>{topic.title}</Text>
                  <Text style={[styles.topicDescription, { color: colors.mutedForeground }]}>
                    {topic.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <SectionTitle title="FREQUENTLY ASKED" colors={colors} />
            {faqItems.map((item, index) => {
              const isOpen = expandedFaq === index;
              return (
                <TouchableOpacity
                  key={item.question}
                  onPress={() => setExpandedFaq(isOpen ? null : index)}
                  activeOpacity={0.9}
                  style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{item.question}</Text>
                    <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                      <ChevronDownIcon color={SALMON} />
                    </View>
                  </View>
                  {isOpen ? (
                    <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{item.answer}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.ctaCard, { backgroundColor: colors.card, borderColor: `${SALMON}66` }]}>
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>STILL NEED HELP?</Text>
            <Text style={[styles.ctaBody, { color: colors.mutedForeground }]}>
              Send us a message and our team will get back to you.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Contact')}
              style={[styles.ctaButton, { backgroundColor: SALMON }]}
            >
              <Text style={styles.ctaButtonText}>CONTACT US</Text>
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
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  responseTime: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  quickValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  chatText: {
    flex: 1,
  },
  chatTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  chatSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 28,
  },
  hoursText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    marginBottom: 28,
  },
  topicCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  topicAccent: {
    width: 4,
  },
  topicContent: {
    flex: 1,
    padding: 14,
  },
  topicTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  topicDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  faqCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  faqAnswer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  ctaCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ctaBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
});

export default HelpSupportScreen;
