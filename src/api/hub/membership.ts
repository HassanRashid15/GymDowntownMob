import { apiRequest } from './client';

export type MembershipMe = {
  hasGym: boolean;
  gymName?: string | null;
  gymOwnerId?: string | null;
  daysLeft?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  feeLabel?: string | null;
  dueSoon?: boolean;
  overdue?: boolean;
  membershipStatus?: string | null;
  preferredTrainerId?: string | null;
  pendingTrainerId?: string | null;
  trainerRequestPending?: boolean;
  feeConcession?: string | null;
  hasTrainer?: boolean;
};

export async function getMembershipMe() {
  return apiRequest<MembershipMe>('membership', 'me');
}
