import { apiRequest } from './client';

export type HubProfile = {
  user_id?: string;
  full_name?: string | null;
  preferred_trainer_id?: string | null;
  gym_owner_id?: string | null;
  gym_monthly_fee?: string | number | null;
  gym_trainer_fee?: string | number | null;
  membership_status?: string | null;
  membership_type?: string | null;
  [key: string]: unknown;
};

export async function getHubProfile() {
  return apiRequest<{ profile: HubProfile }>('profiles', 'get');
}

export async function updateHubProfile(body: Record<string, unknown>) {
  return apiRequest<{ profile: HubProfile }>('profiles', 'update', { body });
}
