export interface FaqItem {
  question: string;
  answer: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
}

export const helpTopics: HelpTopic[] = [
  {
    id: 'membership',
    title: 'MEMBERSHIP & BILLING',
    description: 'Plans, freezes, upgrades, and payment issues',
  },
  {
    id: 'classes',
    title: 'CLASSES & BOOKINGS',
    description: 'Reserve, cancel, or waitlist for sessions',
  },
  {
    id: 'trainers',
    title: 'TRAINER SESSIONS',
    description: 'Book coaches and manage your schedule',
  },
  {
    id: 'account',
    title: 'ACCOUNT & LOGIN',
    description: 'Password reset, profile, and app access',
  },
  {
    id: 'facility',
    title: 'FACILITY & EQUIPMENT',
    description: 'Hours, amenities, and equipment guidance',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'How do I book a class?',
    answer: 'Open the Classes tab, pick your session, and tap BOOK. You\'ll get a confirmation and reminder before class starts.',
  },
  {
    question: 'Can I freeze my membership?',
    answer: 'Yes. Members can freeze for up to 3 months per year. Go to Settings → Membership Plan or contact support to start a freeze.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'On the login screen tap "Forgot password" or email support@forgegym.com from your registered address.',
  },
  {
    question: 'What should I bring to my first session?',
    answer: 'Athletic shoes, a water bottle, and comfortable workout clothes. Towels are available on-site.',
  },
  {
    question: 'How do I cancel a trainer booking?',
    answer: 'Open your dashboard, select the upcoming session, and tap Cancel. Please cancel at least 12 hours in advance.',
  },
  {
    question: 'Is there a guest pass policy?',
    answer: 'Elite members receive 2 guest passes per month. Pro members can purchase day passes at the front desk.',
  },
];

export const supportChannels = {
  phone: '(555) 123-4567',
  email: 'support@forgegym.com',
  hours: 'Mon–Fri 6am–10pm · Sat–Sun 7am–8pm',
  responseTime: 'We typically respond within 24 hours',
};
