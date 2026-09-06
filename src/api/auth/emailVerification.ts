import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../client';
import { normalizeEmail } from './metadata';

export type AuthCallbackKind = 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | 'other';

export type AuthCallbackResult = {
  kind: AuthCallbackKind;
  email: string | null;
  fullName: string | null;
};

let awaitingEmailVerification = false;
/** Set when App already showed the verification welcome splash (cold-start from email link). */
let verificationWelcomeSplashPlayed = false;

export const setAwaitingEmailVerification = (value: boolean) => {
  awaitingEmailVerification = value;
};

export const isAwaitingEmailVerification = () => awaitingEmailVerification;

export const markVerificationWelcomeSplashPlayed = () => {
  verificationWelcomeSplashPlayed = true;
};

/** Returns true once if App already played the welcome splash; clears the flag. */
export const consumeVerificationWelcomeSplashPlayed = () => {
  if (!verificationWelcomeSplashPlayed) return false;
  verificationWelcomeSplashPlayed = false;
  return true;
};

const fullNameFromUser = (user: { user_metadata?: Record<string, unknown> } | null | undefined): string | null => {
  const meta = user?.user_metadata ?? {};
  if (typeof meta.full_name === 'string' && meta.full_name.trim()) return meta.full_name.trim();
  if (typeof meta.fullName === 'string' && meta.fullName.trim()) return meta.fullName.trim();

  const first =
    (typeof meta.first_name === 'string' && meta.first_name.trim()) ||
    (typeof meta.firstName === 'string' && meta.firstName.trim()) ||
    '';
  const last =
    (typeof meta.last_name === 'string' && meta.last_name.trim()) ||
    (typeof meta.lastName === 'string' && meta.lastName.trim()) ||
    '';
  const combined = `${first} ${last}`.trim();
  return combined || null;
};

/** Read full name from auth callback URL JWT before AuthProvider mounts (verification splash). */
export const peekFullNameFromAuthCallbackUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const params = parseParamsFromUrl(url);
    const accessToken = params.get('access_token');
    if (!accessToken) return null;

    const payloadPart = accessToken.split('.')[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    if (typeof atob !== 'function') return null;
    const payload = JSON.parse(atob(padded)) as {
      user_metadata?: Record<string, unknown>;
      full_name?: string;
    };

    return (
      fullNameFromUser({ user_metadata: payload.user_metadata }) ||
      (typeof payload.full_name === 'string' ? payload.full_name.trim() : null) ||
      null
    );
  } catch {
    return null;
  }
};

/** True when the current URL is an email-verification / auth callback deep link */
export const isEmailVerificationDeepLink = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('email-verification') ||
    lower.includes('access_token=') ||
    lower.includes('type=signup') ||
    lower.includes('token_hash=') ||
    (lower.includes('code=') && lower.includes('email'))
  );
};

/** Redirect target for Supabase confirmation emails */
export const getEmailVerificationRedirectTo = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/email-verification`;
  }

  const appUrl = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (appUrl) {
    return `${appUrl}/email-verification`;
  }

  return Linking.createURL('email-verification');
};

const parseParamsFromUrl = (url: string): URLSearchParams => {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const merged = new URLSearchParams();

  if (queryIndex >= 0) {
    const query = url.slice(queryIndex + 1).split('#')[0];
    const queryParams = new URLSearchParams(query);
    queryParams.forEach((value, key) => merged.set(key, value));
  }

  if (hashIndex >= 0) {
    const hashParams = new URLSearchParams(url.slice(hashIndex + 1));
    hashParams.forEach((value, key) => merged.set(key, value));
  }

  return merged;
};

const resolveCallbackKind = (type: string | null): AuthCallbackKind => {
  if (type === 'signup' || type === 'email') return 'signup';
  if (type === 'recovery') return 'recovery';
  if (type === 'invite') return 'invite';
  if (type === 'magiclink') return 'magiclink';
  if (type === 'email_change') return 'email_change';
  return 'other';
};

/**
 * Consumes Supabase auth tokens from a deep link or browser URL.
 * Email confirmation links that use PKCE `code=` often open in another browser
 * without the code verifier — in that case the email is already confirmed
 * server-side, so we return signup success without exchanging the code.
 */
export const consumeAuthCallbackUrl = async (
  url: string | null | undefined
): Promise<AuthCallbackResult | null> => {
  if (!url) return null;

  const params = parseParamsFromUrl(url);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  const errorDescription = params.get('error_description') ?? params.get('error');

  if (errorDescription) {
    throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
  }

  // Implicit flow tokens (hash) — works across browsers
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;

    return {
      kind: resolveCallbackKind(type),
      email: data.user?.email ? normalizeEmail(data.user.email) : null,
      fullName: fullNameFromUser(data.user),
    };
  }

  // token_hash + type (verifyOtp) — preferred for email confirm when present
  if (tokenHash && type) {
    const otpType =
      type === 'signup' || type === 'email'
        ? 'signup'
        : type === 'recovery'
          ? 'recovery'
          : type === 'invite'
            ? 'invite'
            : type === 'magiclink'
              ? 'magiclink'
              : type === 'email_change'
                ? 'email_change'
                : 'signup';

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as 'signup',
    });
    if (error) throw error;

    return {
      kind: resolveCallbackKind(type),
      email: data.user?.email ? normalizeEmail(data.user.email) : null,
      fullName: fullNameFromUser(data.user),
    };
  }

  // PKCE `code=` — only exchange if verifier exists in this browser.
  // Otherwise signup confirmation already happened on the server when the link was opened.
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        return {
          kind: resolveCallbackKind(type),
          email: data.user.email ? normalizeEmail(data.user.email) : null,
          fullName: fullNameFromUser(data.user),
        };
      }

      const message = error?.message?.toLowerCase() ?? '';
      const isPkceMiss =
        message.includes('code verifier') ||
        message.includes('pkce') ||
        error?.status === 400;

      if (isPkceMiss && (type === 'signup' || type === 'email' || !type || url.includes('email-verification'))) {
        // Email is confirmed in Auth; skip session exchange and send user to login.
        return { kind: 'signup', email: null, fullName: null };
      }

      if (error) throw error;
    } catch (error: any) {
      const message = String(error?.message ?? '').toLowerCase();
      if (
        message.includes('code verifier') ||
        message.includes('pkce') ||
        url.includes('email-verification')
      ) {
        return { kind: 'signup', email: null, fullName: null };
      }
      throw error;
    }
  }

  return null;
};

export const getCurrentUrlForAuthCallback = (): string | null => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.href;
  }
  return null;
};

/** Strip auth tokens from the URL while keeping the current path */
export const clearAuthCallbackUrlFromBrowser = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const { pathname } = window.location;
  window.history.replaceState({}, document.title, pathname);
};

/** Force the browser path (used after verification → login so linking does not remount EmailVerification) */
export const replaceBrowserPath = (path: string) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const clean = path.startsWith('/') ? path : `/${path}`;
  window.history.replaceState({}, document.title, clean);
};
