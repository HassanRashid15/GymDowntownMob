import { supabase, consumeCapturedRateLimit } from '../client';
import { createAuthServiceError } from './errors';
import { getEmailVerificationRedirectTo } from './emailVerification';
import { buildSignupMetadata, normalizeEmail } from './metadata';
import type { RegisterInput, SignUpResult } from './types';

const throwAuthError = (error: unknown): never => {
  throw createAuthServiceError(error, consumeCapturedRateLimit());
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throwAuthError(error);
  return data.session;
};

export const getAuthUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throwAuthError(error);
  return data.user;
};

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    throwAuthError(error);
  }

  if (!data.user) {
    throw new Error('Login failed');
  }

  return data;
};

export const signUp = async (input: RegisterInput): Promise<SignUpResult> => {
  const email = normalizeEmail(input.email);
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: getEmailVerificationRedirectTo(),
      data: buildSignupMetadata(
        fullName,
        input.firstName,
        input.lastName,
        input.role,
        {
          fitnessProfile: input.fitnessProfile,
          gymName: input.gymName,
          phone: input.phone,
        }
      ),
    },
  });

  if (error) {
    console.error('[auth.signUp]', error.message, error.status, error.code);
    throwAuthError(error);
  }

  // Supabase returns a user with empty identities when the email is already
  // registered and "Confirm email" is enabled (anti-enumeration). Treat as conflict.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw createAuthServiceError({
      message: 'User already registered',
      status: 400,
      code: 'user_already_exists',
    });
  }

  if (!data.user) {
    throw new Error('Registration failed. Please try again.');
  }

  return { user: data.user, session: data.session, email, fullName };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throwAuthError(error);
};

export const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: `${process.env.EXPO_PUBLIC_APP_URL || 'https://yourapp.com'}/reset-password`,
  });

  if (error) {
    throwAuthError(error);
  }
};

export const resendVerificationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizeEmail(email),
    options: {
      emailRedirectTo: getEmailVerificationRedirectTo(),
    },
  });

  if (error) {
    throwAuthError(error);
  }
};

export const onAuthStateChange = (
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
) => supabase.auth.onAuthStateChange(callback);
