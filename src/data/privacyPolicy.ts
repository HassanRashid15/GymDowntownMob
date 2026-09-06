export interface PrivacySection {
  title: string;
  body?: string;
  bullets?: string[];
}

export const privacyPolicyMeta = {
  lastUpdated: 'September 1, 2026',
  effectiveDate: 'September 1, 2026',
  contactEmail: 'privacy@forgegym.com',
};

export const privacyPolicyIntro =
  'At Forge Gym, we respect your privacy and are committed to protecting the personal information you share with us. This policy explains what we collect, how we use it, and the choices you have when using our mobile app, website, and gym services.';

export const privacyPolicySections: PrivacySection[] = [
  {
    title: 'INFORMATION WE COLLECT',
    body: 'We collect information to provide and improve your fitness experience:',
    bullets: [
      'Account details: name, email, phone number, and membership tier',
      'Profile data: fitness goals, class bookings, trainer sessions, and workout preferences',
      'Payment information: processed securely through our payment partners (we do not store full card numbers)',
      'Device & usage data: app interactions, crash logs, and anonymized analytics',
      'Gym access data: check-in times and facility usage for safety and capacity management',
    ],
  },
  {
    title: 'HOW WE USE YOUR DATA',
    body: 'Your information helps us deliver a personalized, safe training environment:',
    bullets: [
      'Manage memberships, class reservations, and trainer bookings',
      'Send workout reminders, class updates, and account notifications',
      'Improve app performance, features, and gym operations',
      'Respond to support requests and resolve disputes',
      'Comply with legal obligations and enforce our terms of service',
    ],
  },
  {
    title: 'DATA SHARING',
    body: 'We do not sell your personal data. We may share limited information with:',
    bullets: [
      'Payment processors to complete transactions',
      'Cloud hosting and analytics providers under strict data agreements',
      'Trainers and staff only when needed to deliver your booked services',
      'Law enforcement when required by law or to protect member safety',
    ],
  },
  {
    title: 'YOUR RIGHTS & CHOICES',
    bullets: [
      'Access or update your profile information in the app at any time',
      'Opt out of marketing emails via unsubscribe links or app settings',
      'Request a copy or deletion of your data by emailing privacy@forgegym.com',
      'Disable push notifications through your device or app preferences',
      'Withdraw consent for optional data collection where applicable',
    ],
  },
  {
    title: 'DATA SECURITY',
    body:
      'We use industry-standard encryption, secure authentication, and access controls to protect your data. While no system is 100% secure, we continuously monitor and improve our safeguards. Report suspicious activity to support@forgegym.com immediately.',
  },
  {
    title: 'DATA RETENTION',
    body:
      'We retain account data while your membership is active and for a reasonable period afterward for legal, billing, and dispute-resolution purposes. Anonymized analytics may be kept longer to improve our services.',
  },
  {
    title: 'CHILDREN\'S PRIVACY',
    body:
      'Forge Gym services are intended for users aged 16 and older. Minors under 18 require parental consent for membership. We do not knowingly collect data from children under 13.',
  },
  {
    title: 'POLICY UPDATES',
    body:
      'We may update this policy from time to time. Material changes will be communicated via the app or email. Continued use after updates constitutes acceptance of the revised policy.',
  },
];
