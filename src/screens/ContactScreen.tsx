import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { supportChannels } from '../data/helpSupport';
import { navigateBackOrTo } from '../navigation/navigationHelpers';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const MailIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const MapPinIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

const MessageIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

const SectionTitle = ({ title, colors }: { title: string; colors: ReturnType<typeof useTheme>['colors'] }) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionAccent, { backgroundColor: SALMON }]} />
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
  </View>
);

type FormFieldKey = 'name' | 'email' | 'phone' | 'subject' | 'message';

type FormData = Record<FormFieldKey, string>;

type FormErrors = Partial<Record<FormFieldKey, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = (): FormData => ({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
});

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, colors, children }) => (
  <View style={styles.field}>
    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
      {label}
      {required ? <Text style={{ color: SALMON }}> *</Text> : null}
    </Text>
    {children}
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

const ContactScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const contactCards = useMemo(
    () => [
      {
        id: 'visit',
        title: 'VISIT US',
        lines: ['123 Fitness Street', 'Downtown, CA 90210'],
        icon: MapPinIcon,
        onPress: undefined,
      },
      {
        id: 'call',
        title: 'CALL US',
        lines: [supportChannels.phone],
        icon: PhoneIcon,
        onPress: () => Linking.openURL(`tel:${supportChannels.phone.replace(/\D/g, '')}`),
      },
      {
        id: 'email',
        title: 'EMAIL US',
        lines: [supportChannels.email, 'info@forgegym.com'],
        icon: MailIcon,
        onPress: () => Linking.openURL(`mailto:${supportChannels.email}?subject=Forge%20Gym%20Inquiry`),
      },
      {
        id: 'hours',
        title: 'HOURS',
        lines: [supportChannels.hours],
        icon: ClockIcon,
        onPress: undefined,
      },
    ],
    []
  );

  const updateField = (key: FormFieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (submitSuccess) setSubmitSuccess(false);
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = 'Name is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_PATTERN.test(formData.email.trim())) errors.email = 'Enter a valid email address.';
    if (!formData.subject.trim()) errors.subject = 'Subject is required.';
    if (!formData.message.trim()) errors.message = 'Message is required.';
    else if (formData.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setFormData(emptyForm());
    setFormErrors({});
    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  const inputStyle = (hasError: boolean) => [
    styles.input,
    {
      color: colors.foreground,
      borderColor: hasError ? '#FA1818' : colors.border,
      backgroundColor: colors.background,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Settings' } })}
          style={styles.backButton}
        >
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>CONTACT US</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${SALMON}22` }]}>
            <MailIcon color={SALMON} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>GET IN TOUCH</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            Questions about memberships, classes, or facilities? Our team is ready to help.
          </Text>
          <Text style={[styles.responseTime, { color: SALMON }]}>{supportChannels.responseTime}</Text>
        </View>

        <View style={styles.body}>
          <SectionTitle title="REACH US" colors={colors} />
          <View style={styles.contactGrid}>
            {contactCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <>
                  <View style={[styles.contactIconWrap, { backgroundColor: `${SALMON}22` }]}>
                    <Icon color={SALMON} />
                  </View>
                  <Text style={[styles.contactCardTitle, { color: colors.foreground }]}>{card.title}</Text>
                  {card.lines.map((line) => (
                    <Text key={line} style={[styles.contactCardLine, { color: colors.mutedForeground }]}>
                      {line}
                    </Text>
                  ))}
                </>
              );

              if (card.onPress) {
                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={card.onPress}
                    style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    {content}
                  </TouchableOpacity>
                );
              }

              return (
                <View
                  key={card.id}
                  style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {content}
                </View>
              );
            })}
          </View>

          <SectionTitle title="SEND A MESSAGE" colors={colors} />
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
            Fill out the form and we will get back to you shortly.
          </Text>

          {submitSuccess ? (
            <View style={[styles.successBanner, { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: '#22C55E' }]}>
              <Text style={styles.successTitle}>Message sent</Text>
              <Text style={[styles.successText, { color: colors.mutedForeground }]}>
                Thanks for reaching out. Our team will reply within 24 hours.
              </Text>
            </View>
          ) : null}

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FormField label="Full Name" required error={formErrors.name} colors={colors}>
              <TextInput
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle(!!formErrors.name)}
              />
            </FormField>

            <FormField label="Email Address" required error={formErrors.email} colors={colors}>
              <TextInput
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="you@email.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                style={inputStyle(!!formErrors.email)}
              />
            </FormField>

            <FormField label="Phone No" error={formErrors.phone} colors={colors}>
              <TextInput
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="+1 555 123 4567"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                style={inputStyle(!!formErrors.phone)}
              />
            </FormField>

            <FormField label="Subject" required error={formErrors.subject} colors={colors}>
              <TextInput
                value={formData.subject}
                onChangeText={(value) => updateField('subject', value)}
                placeholder="How can we help?"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle(!!formErrors.subject)}
              />
            </FormField>

            <FormField label="Message" required error={formErrors.message} colors={colors}>
              <TextInput
                value={formData.message}
                onChangeText={(value) => updateField('message', value)}
                placeholder="Tell us more about your inquiry..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[inputStyle(!!formErrors.message), styles.textArea]}
              />
            </FormField>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitButton, { backgroundColor: SALMON, opacity: isSubmitting ? 0.7 : 1 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={styles.submitButtonText}>SEND MESSAGE</Text>
              )}
            </TouchableOpacity>
          </View>

          <SectionTitle title="QUICK ACTIONS" colors={colors} />
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${supportChannels.phone.replace(/\D/g, '')}`)}
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${SALMON}22` }]}>
                <PhoneIcon color={SALMON} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>CALL</Text>
              <Text style={[styles.quickValue, { color: colors.foreground }]}>{supportChannels.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Messaging', {
                  channelId: 'live-support',
                  returnTo: 'Contact',
                })
              }
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${SALMON}22` }]}>
                <MessageIcon color={SALMON} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>LIVE CHAT</Text>
              <Text style={[styles.quickValue, { color: colors.foreground }]}>Support team</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.ctaCard, { backgroundColor: colors.card, borderColor: `${SALMON}66` }]}>
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>READY TO START?</Text>
            <Text style={[styles.ctaBody, { color: colors.mutedForeground }]}>
              Book a free tour and trial workout. No commitment required.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Join' })}
              style={[styles.ctaButton, { backgroundColor: SALMON }]}
            >
              <Text style={styles.ctaButtonText}>VIEW MEMBERSHIP PLANS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${supportChannels.phone.replace(/\D/g, '')}`)}
              style={[styles.ctaButtonOutline, { borderColor: colors.border }]}
            >
              <Text style={[styles.ctaButtonOutlineText, { color: colors.foreground }]}>CALL US NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerSpacer: { width: 40 },
  scrollContent: { paddingBottom: 40 },
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
    fontSize: 28,
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
  sectionHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  contactCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  contactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  contactCardLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  successBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 4,
  },
  successTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#22C55E',
  },
  successText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 28,
  },
  field: { gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldError: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FA1818',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
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
  ctaCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  ctaTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  ctaBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
  ctaButtonOutline: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonOutlineText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});

export default ContactScreen;
