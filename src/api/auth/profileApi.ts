import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../client';
import type { AuthUser, ProfileUpdateInput } from './types';
import type { UserRole } from '../../types/user';

export const isBrokenProfilesPolicy = (error?: { code?: string; message?: string } | null) =>
  error?.code === '42P17' || error?.message?.includes('infinite recursion');

export const buildAuthUser = (authUser: SupabaseUser, profile?: Record<string, any> | null): AuthUser => {
  const metadata = (authUser.user_metadata ?? {}) as Record<string, any>;
  const appMeta = (authUser.app_metadata ?? {}) as Record<string, any>;

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: profile?.full_name ?? metadata.full_name ?? 'User',
    role: (profile?.role ?? metadata.role ?? appMeta.role ?? 'customer') as UserRole,
    avatar: profile?.avatar_url ?? metadata.avatar_url,
    phone: profile?.phone ?? metadata.phone,
    gymName: profile?.gym_name ?? metadata.gym_name,
    age: profile?.age ?? metadata.age,
    gender: profile?.gender ?? metadata.gender,
    height: profile?.height ?? metadata.height,
    weight: profile?.weight ?? metadata.weight,
    isApproved: profile?.is_approved ?? metadata.is_approved ?? false,
    approvedBy: profile?.approved_by ?? undefined,
    approvedAt: profile?.approved_at ?? undefined,
  };
};

export const fetchProfileByUserId = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error && !isBrokenProfilesPolicy(error)) {
    throw error;
  }

  return profile;
};

export const upsertProfileOnSignup = async (input: {
  userId: string;
  fullName: string;
  role: 'customer' | 'admin';
  isApproved: boolean;
  phone?: string;
  gymName?: string;
}) => {
  const now = new Date().toISOString();

  const { error } = await supabase.from('profiles').upsert(
    {
      id: input.userId,
      full_name: input.fullName,
      role: input.role,
      phone: input.phone?.trim() || null,
      gym_name: input.gymName?.trim() || null,
      avatar_url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?fit=crop&w=300&h=300&q=80',
      is_approved: input.isApproved,
      approved_by: input.isApproved ? input.userId : null,
      approved_at: input.isApproved ? now : null,
      updated_at: now,
    },
    { onConflict: 'id' }
  );

  if (error) {
    // Recursion / RLS misconfig — surface clearly so signup isn't "silent success"
    if (isBrokenProfilesPolicy(error)) {
      throw new Error(
        'Profiles table RLS is misconfigured. Run supabase/profiles_rls_fix.sql in the Supabase SQL Editor.'
      );
    }
    throw new Error(error.message || 'Failed to create profile in database');
  }
};

export const markCustomerApprovedIfEmailConfirmed = async (authUser: SupabaseUser) => {
  const role = ((authUser.user_metadata as { role?: string } | undefined)?.role === 'admin'
    ? 'admin'
    : 'customer') as 'customer' | 'admin';

  if (role !== 'customer') return;
  if (!authUser.email_confirmed_at) return;

  const profile = await fetchProfileByUserId(authUser.id);
  if (!profile || profile.is_approved) return;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('profiles')
    .update({
      is_approved: true,
      approved_by: authUser.id,
      approved_at: now,
      updated_at: now,
    })
    .eq('id', authUser.id);

  if (error && !isBrokenProfilesPolicy(error)) {
    console.error('Failed to mark customer approved after email confirm:', error.message);
  }
};

/** Create profile from auth metadata when missing (e.g. after email confirm). */
export const ensureProfileFromAuthUser = async (authUser: SupabaseUser) => {
  const existing = await fetchProfileByUserId(authUser.id);
  if (existing) {
    await markCustomerApprovedIfEmailConfirmed(authUser);
    return fetchProfileByUserId(authUser.id);
  }

  const metadata = (authUser.user_metadata ?? {}) as Record<string, any>;
  const role = (metadata.role === 'admin' ? 'admin' : 'customer') as 'customer' | 'admin';
  const emailConfirmed = Boolean(authUser.email_confirmed_at);

  await upsertProfileOnSignup({
    userId: authUser.id,
    fullName: metadata.full_name || 'User',
    role,
    // Customer only after email confirm; admin stays pending
    isApproved: role === 'customer' && emailConfirmed,
    phone: metadata.phone,
    gymName: metadata.gym_name,
  });

  return fetchProfileByUserId(authUser.id);
};

export const updateUserProfile = async (userId: string, input: ProfileUpdateInput) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.name.trim(),
      phone: input.phone?.trim() || null,
      avatar_url: input.avatar || null,
      age: input.age || null,
      gender: input.gender || null,
      height: input.height || null,
      weight: input.weight || null,
    })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update profile');
  }
};

export const fetchPendingAdmins = async () => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .eq('is_approved', false);

  if (error) {
    throw new Error('Failed to fetch pending admins');
  }

  return profiles ?? [];
};

export const approveAdminProfile = async (adminId: string, approvedBy: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_approved: true,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', adminId);

  if (error) {
    throw new Error('Failed to approve admin');
  }
};

export const fetchAdminProfile = async (adminId: string) => {
  const { data: adminProfile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', adminId)
    .single();

  if (error || !adminProfile) {
    throw new Error('Failed to fetch admin details');
  }

  return adminProfile;
};

export const deleteAdminProfile = async (adminId: string) => {
  const { error } = await supabase.from('profiles').delete().eq('id', adminId);

  if (error) {
    throw new Error('Failed to reject admin');
  }
};

export const fetchSuperAdmins = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('role', 'super_admin')
    .eq('is_approved', true);

  return data ?? [];
};