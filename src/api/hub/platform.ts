import { apiRequest } from './client';

export type PlatformPublicStats = {
  memberCount: number;
  trainerCount: number;
  classCount: number;
  gymCount: number;
  maxYearsOperating?: number;
};

export async function getPublicPlatformStats() {
  return apiRequest<{ success: boolean; stats: PlatformPublicStats }>('platform', 'publicStats');
}

export type TrafficHit = {
  id?: string;
  path?: string;
  referrer?: string | null;
  created_at?: string;
  country?: string | null;
  city?: string | null;
  [key: string]: unknown;
};

export async function getAdminTraffic(limit = 100) {
  return apiRequest<{ success: boolean; hits?: TrafficHit[]; rows?: TrafficHit[]; total?: number }>(
    'admin',
    'traffic',
    { query: { limit } }
  );
}

export type MembershipFeeAdmin = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  gym_name: string | null;
  gym_city: string | null;
  admin_approved: boolean;
  platform_monthly_fee: string | null;
  trial_status?: string;
  trial_ends_at?: string | null;
  trial_days_left?: number | null;
};

export async function listMembershipFees() {
  return apiRequest<{ admins: MembershipFeeAdmin[] }>('admin', 'membershipFees');
}

export async function updateMembershipFee(body: {
  userId: string;
  platformMonthlyFee?: string | number | null;
  trialDays?: number | null;
}) {
  return apiRequest<{ success?: boolean }>('admin', 'updateMembershipFee', { body });
}
