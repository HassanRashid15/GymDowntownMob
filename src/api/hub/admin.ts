import { apiRequest } from './client';

export type AdminUser = {
  id?: string;
  user_id?: string;
  userId?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  membership_status?: string | null;
  membership_type?: string | null;
  admin_approved?: boolean | null;
  avatar_url?: string | null;
  [key: string]: unknown;
};

export async function listAdminUsers(q?: string) {
  return apiRequest<{ users: AdminUser[]; isSuperAdmin?: boolean; gymOwnerId?: string | null }>(
    'admin',
    'listUsers',
    { query: { q } }
  );
}

export async function createAdminUser(body: Record<string, unknown>) {
  return apiRequest<{ user: AdminUser; message?: string }>('admin', 'createUser', { body });
}

export async function updateAdminUser(body: Record<string, unknown>) {
  return apiRequest<{ user: AdminUser; action?: string }>('admin', 'updateUser', { body });
}

export async function deleteAdminUser(userId: string) {
  return apiRequest<{ ok: boolean }>('admin', 'deleteUser', { body: { userId } });
}

export type MonthlyMember = {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  membershipStatus?: string | null;
  membershipType?: string | null;
  monthlyFee?: string | null;
  daysLeft?: number | null;
  hasTrainer?: boolean;
  periodEnd?: string | null;
};

export async function getMonthlyMembers() {
  return apiRequest<{
    monthlyFee?: string | null;
    trainerFee?: string | null;
    gymName?: string | null;
    members: MonthlyMember[];
  }>('admin', 'monthlyMembers');
}

export async function getPlatformSettings() {
  return apiRequest<{
    platformFacilityFee?: number | string | null;
    updatedAt?: string | null;
    stored?: boolean;
  }>('admin', 'platformSettings');
}

export async function updatePlatformSettings(platformFacilityFee: number) {
  return apiRequest<{ platformFacilityFee: number }>('admin', 'updatePlatformSettings', {
    body: { platformFacilityFee },
  });
}

export async function getPendingAdmins() {
  return apiRequest<{
    pending: AdminUser[];
    approved?: AdminUser[];
    rejected?: AdminUser[];
    admins?: AdminUser[];
  }>('admin', 'pending');
}

export async function pendingAdminAction(userId: string, action: 'approve' | 'reject') {
  return apiRequest<{ success?: boolean }>('admin', 'pendingAction', {
    body: { userId, action },
  });
}
