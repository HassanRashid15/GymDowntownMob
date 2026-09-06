export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular: boolean;
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    period: 'month',
    description: 'Perfect for getting started with your fitness journey.',
    features: [
      { name: 'Access to gym floor', included: true },
      { name: 'Locker room access', included: true },
      { name: 'Free parking', included: true },
      { name: 'Group classes', included: false },
      { name: 'Personal training sessions', included: false },
      { name: 'Sauna & spa access', included: false },
      { name: 'Nutrition coaching', included: false },
      { name: '24/7 gym access', included: false },
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    period: 'month',
    description: 'Our most popular plan for serious fitness enthusiasts.',
    features: [
      { name: 'Access to gym floor', included: true },
      { name: 'Locker room access', included: true },
      { name: 'Free parking', included: true },
      { name: 'Group classes', included: true },
      { name: 'Personal training sessions (2/month)', included: true },
      { name: 'Sauna & spa access', included: true },
      { name: 'Nutrition coaching', included: false },
      { name: '24/7 gym access', included: false },
    ],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    period: 'month',
    description: 'The ultimate fitness experience with unlimited access.',
    features: [
      { name: 'Access to gym floor', included: true },
      { name: 'Locker room access', included: true },
      { name: 'Free parking', included: true },
      { name: 'Unlimited group classes', included: true },
      { name: 'Personal training sessions (4/month)', included: true },
      { name: 'Sauna & spa access', included: true },
      { name: 'Nutrition coaching', included: true },
      { name: '24/7 gym access', included: true },
    ],
    popular: false,
  },
];

export const membershipFaqs = [
  {
    question: 'Can I freeze my membership?',
    answer: 'Yes, you can freeze your membership for up to 3 months per year. Contact our front desk to arrange this.',
  },
  {
    question: 'Is there a joining fee?',
    answer: "We occasionally waive the joining fee during promotions. Currently, we're offering $0 enrollment for all new members.",
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Absolutely! You can change your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'Do you offer corporate rates?',
    answer: 'Yes, we offer special rates for companies with 10+ employees. Contact us for a custom quote.',
  },
  {
    question: "What's your cancellation policy?",
    answer: 'You can cancel anytime with 30 days notice. No hidden fees or penalties.',
  },
];

export const memberBenefits = [
  'Free Towel Service',
  'Water Stations',
  'WiFi Access',
  'Mobile App',
];
