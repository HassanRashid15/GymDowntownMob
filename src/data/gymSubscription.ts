export interface GymSubscription {
  gymId: string;
  gymName: string;
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
  subscribedAt: string;
  renewsAt: string;
  activeMemberCount: number;
  activeTrainerCount: number;
  equipmentCheckedCount: number;
  locationCount: number;
}

export interface GymOwnerSubscriptionRecord extends GymSubscription {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: 'active' | 'cancelled';
}

export interface GymPlanFeature {
  name: string;
  included: boolean;
  limited?: boolean;
}

export type AccessTier = 'none' | 'limited' | 'full';
export type RevenueAnalyticsTier = 1 | 2 | 3;

export interface GymPlanCapabilities {
  equipmentAccess: AccessTier;
  locationLimit: number | 'unlimited';
  equipmentCheckLimit: number | 'unlimited';
  revenueAnalyticsTier: RevenueAnalyticsTier;
}

export interface GymSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  memberLimit: number | 'unlimited';
  trainerLimit: number | 'unlimited';
  capabilities: GymPlanCapabilities;
  features: GymPlanFeature[];
  popular: boolean;
}

export const revenueTierDetails: Record<
  RevenueAnalyticsTier,
  { label: string; growth: string; sampleRevenue: string; description: string }
> = {
  1: {
    label: 'Tier 1 revenue trend',
    growth: '+2.5%',
    sampleRevenue: '$12.4K',
    description: 'See if revenue is moving up or down',
  },
  2: {
    label: 'Tier 2 revenue insights',
    growth: '+6.2%',
    sampleRevenue: '$58K',
    description: 'Monthly trends and class revenue breakdowns',
  },
  3: {
    label: 'Tier 3 revenue intelligence',
    growth: '+9.8%',
    sampleRevenue: '$124K',
    description: 'Forecasts, exports, and multi-location rollups',
  },
};

export const gymSubscriptionPlans: GymSubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Forge Starter',
    price: 149,
    period: 'month',
    description: 'Launch your gym on Forge with essential owner tools and limited ops insight.',
    memberLimit: 100,
    trainerLimit: 1,
    capabilities: {
      equipmentAccess: 'limited',
      locationLimit: 1,
      equipmentCheckLimit: 25,
      revenueAnalyticsTier: 1,
    },
    features: [
      { name: 'Admin command center', included: true },
      { name: 'Member check-in & profiles', included: true },
      { name: 'Class scheduling', included: true },
      { name: 'Up to 100 active members', included: true },
      { name: '1 trainer', included: true },
      { name: 'Equipment checking (up to 25 assets)', included: true, limited: true },
      { name: 'Revenue analytics · Tier 1', included: true, limited: true },
      { name: 'Single location only', included: true },
    ],
    popular: false,
  },
  {
    id: 'growth',
    name: 'Forge Growth',
    price: 299,
    period: 'month',
    description: 'Scale operations with deeper analytics and complete facility control.',
    memberLimit: 500,
    trainerLimit: 10,
    capabilities: {
      equipmentAccess: 'full',
      locationLimit: 1,
      equipmentCheckLimit: 'unlimited',
      revenueAnalyticsTier: 2,
    },
    features: [
      { name: 'Everything in Starter', included: true },
      { name: 'Up to 500 active members', included: true },
      { name: 'Up to 10 trainers', included: true },
      { name: 'Full equipment & maintenance tracking', included: true },
      { name: 'Revenue analytics · Tier 2', included: true },
      { name: 'Member CRM & waitlists', included: true },
      { name: 'Branded member app access', included: true },
      { name: 'Single location', included: true },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Forge Enterprise',
    price: 599,
    period: 'month',
    description: 'Unlimited scale for gym chains and premium facilities.',
    memberLimit: 'unlimited',
    trainerLimit: 'unlimited',
    capabilities: {
      equipmentAccess: 'full',
      locationLimit: 'unlimited',
      equipmentCheckLimit: 'unlimited',
      revenueAnalyticsTier: 3,
    },
    features: [
      { name: 'Everything in Growth', included: true },
      { name: 'Unlimited members & trainers', included: true },
      { name: 'Revenue analytics · Tier 3', included: true },
      { name: 'Multi-location management', included: true },
      { name: 'Custom roles & permissions', included: true },
      { name: 'API & integrations', included: true },
      { name: 'Priority support', included: true },
      { name: 'White-label branding', included: true },
    ],
    popular: false,
  },
];

export const gymSubscriptionFaqs = [
  {
    question: 'Who is this subscription for?',
    answer:
      'Forge platform subscriptions are for gym owners and operators. Your members continue to use member plans managed inside your facility dashboard.',
  },
  {
    question: 'What does limited equipment checking include?',
    answer:
      'Starter plans can track status for up to 25 pieces of equipment at one location. Upgrade to Growth for unlimited assets and maintenance workflows.',
  },
  {
    question: 'How do revenue analytics tiers work?',
    answer:
      'Tier 1 (Starter) shows basic revenue direction. Tier 2 (Growth) adds monthly trends and breakdowns. Tier 3 (Enterprise) unlocks forecasts, exports, and multi-location revenue rollups.',
  },
  {
    question: 'Can I run multiple locations on Starter?',
    answer:
      'No. Starter and Growth are limited to one gym location. Enterprise supports multi-location management.',
  },
  {
    question: 'Can I upgrade mid-cycle?',
    answer:
      'Upgrades apply immediately with prorated billing. Downgrades take effect at the next renewal date.',
  },
];

export const formatLimit = (limit: number | 'unlimited') =>
  limit === 'unlimited' ? 'Unlimited' : limit.toLocaleString();

export const formatTrainerLimit = (limit: number | 'unlimited') =>
  limit === 'unlimited' ? 'Unlimited trainers' : limit === 1 ? '1 trainer' : `${limit} trainers`;

export const getGymPlanById = (planId: string) =>
  gymSubscriptionPlans.find((plan) => plan.id === planId);

export const formatAccessTier = (tier: AccessTier) => {
  if (tier === 'full') return 'Full access';
  if (tier === 'limited') return 'Limited';
  return 'Not included';
};

export const formatLocationLimit = (limit: number | 'unlimited') =>
  limit === 'unlimited' ? 'Multi-location' : `${limit} location`;

export const formatRevenueTier = (tier: RevenueAnalyticsTier) =>
  `Tier ${tier} · ${revenueTierDetails[tier].label.replace(`Tier ${tier} `, '')}`;
