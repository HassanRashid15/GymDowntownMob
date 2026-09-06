import type { CapturedRateLimit } from '../client';

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'User already registered': 'An account with this email already exists. Sign in or use a different email.',
  'Invalid login credentials': 'Invalid email or password. Use a Supabase account or run `npm run seed:users` to create demo users.',
  'Email not confirmed': 'Please confirm your email before signing in.',
  'Signup requires a valid password': 'Password must be at least 8 characters.',
  'Password should be at least 6 characters': 'Password must be at least 8 characters.',
  'Unable to validate email address: invalid format': 'Enter a valid email address.',
  'Email rate limit exceeded': 'Too many signup emails were sent. Wait about an hour, or disable Confirm email in Supabase Auth settings while testing.',
  'Signups not allowed for this instance': 'Registration is currently disabled. Contact support.',
  'Database error saving new user':
    'Could not create your account in the database. Run supabase/profiles_rls_fix.sql in the Supabase SQL Editor, then try again with a new email.',
  'EMAIL_NOT_CONFIRMED': 'Please confirm your email before signing in.',
};

const RATE_LIMIT_CODES = new Set([
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'over_sms_send_rate_limit',
]);

const RATE_LIMIT_DEFAULT_SECONDS: Record<string, number> = {
  over_email_send_rate_limit: 3600,
  over_request_rate_limit: 60,
  over_sms_send_rate_limit: 60,
};

export type AuthServiceErrorOptions = {
  code?: string;
  status?: number;
  retryAfterSeconds?: number;
  rateLimitSource?: 'supabase' | 'client';
  isRateLimit?: boolean;
};

export class AuthServiceError extends Error {
  code?: string;
  status?: number;
  retryAfterSeconds?: number;
  rateLimitSource: 'supabase' | 'client';
  isRateLimit: boolean;

  constructor(message: string, options: AuthServiceErrorOptions = {}) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = options.code;
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.rateLimitSource = options.rateLimitSource ?? 'client';
    this.isRateLimit = options.isRateLimit ?? false;
  }
}

export const parseAuthError = (error: AuthErrorLike): string => {
  if (error.code === 'email_address_invalid') {
    return 'Supabase rejected this email. With the default email provider, only addresses on your Supabase org team work — or turn on Custom SMTP (Brevo) / disable Confirm email while testing.';
  }
  if (error.code === 'email_address_not_authorized') {
    return 'This email is not allowed by Supabase’s default mailer. Add Custom SMTP (Brevo) in Authentication → Emails, or use an email that is on your Supabase organization team.';
  }
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') {
    return AUTH_ERROR_MESSAGES['Email rate limit exceeded'];
  }
  if (error.code === 'user_already_exists') {
    return AUTH_ERROR_MESSAGES['User already registered'];
  }

  const message = error.message?.trim();
  if (!message) return 'Authentication failed. Please try again.';

  if (AUTH_ERROR_MESSAGES[message]) {
    return AUTH_ERROR_MESSAGES[message];
  }

  const lower = message.toLowerCase();
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return AUTH_ERROR_MESSAGES['User already registered'];
  }
  if (lower.includes('password') && (lower.includes('weak') || lower.includes('least'))) {
    return 'Password must be at least 8 characters.';
  }
  if (
    (lower.includes('email address') && lower.includes('invalid')) ||
    (lower.includes('invalid') && lower.includes('email')) ||
    lower.includes('not authorized')
  ) {
    return 'Supabase rejected this email. With the default email provider, only addresses on your Supabase org team work — or turn on Custom SMTP (Brevo) / disable Confirm email while testing.';
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return AUTH_ERROR_MESSAGES['Email rate limit exceeded'];
  }
  if (lower.includes('database error saving new user') || lower.includes('error creating user')) {
    return AUTH_ERROR_MESSAGES['Database error saving new user'];
  }

  return message;
};

export const resolveRetryAfterSeconds = (
  error: AuthErrorLike,
  rateLimit?: CapturedRateLimit | null
): number | undefined => {
  if (rateLimit?.retryAfterSeconds && rateLimit.retryAfterSeconds > 0) {
    return rateLimit.retryAfterSeconds;
  }

  if (rateLimit?.rateLimitReset && rateLimit.rateLimitReset > 0) {
    return rateLimit.rateLimitReset;
  }

  if (error.code && RATE_LIMIT_DEFAULT_SECONDS[error.code]) {
    return RATE_LIMIT_DEFAULT_SECONDS[error.code];
  }

  if (error.status === 429) {
    return 60;
  }

  return undefined;
};

export const isAuthRateLimitError = (error?: AuthErrorLike | string | AuthServiceError | null): boolean => {
  if (error instanceof AuthServiceError) {
    return error.isRateLimit;
  }

  if (typeof error === 'object' && error !== null) {
    if (error.status === 429) return true;
    if (error.code && RATE_LIMIT_CODES.has(error.code)) return true;
  }

  const message = typeof error === 'string' ? error : error?.message;
  if (!message) return false;

  const lower = message.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('too many') ||
    lower.includes('email rate limit exceeded') ||
    lower.includes('over_email_send_rate_limit')
  );
};

export const createAuthServiceError = (
  error: unknown,
  rateLimit?: CapturedRateLimit | null
): AuthServiceError => {
  const authError = (typeof error === 'object' && error !== null ? error : {}) as AuthErrorLike;
  const message = parseAuthError(authError);
  const code = authError.code;
  const status = authError.status;
  const isRateLimit = isAuthRateLimitError(authError);
  const retryAfterSeconds = isRateLimit ? resolveRetryAfterSeconds(authError, rateLimit) : undefined;
  const rateLimitSource: 'supabase' | 'client' =
    isRateLimit &&
    (rateLimit?.retryAfterSeconds ||
      rateLimit?.rateLimitReset ||
      authError.code ||
      authError.status === 429)
      ? 'supabase'
      : 'client';

  return new AuthServiceError(message, {
    code,
    status,
    retryAfterSeconds,
    isRateLimit,
    rateLimitSource,
  });
};

export const getAuthRateLimitCooldown = (error: unknown): {
  retryAfterSeconds?: number;
  rateLimitSource: 'supabase' | 'client';
} => {
  if (error instanceof AuthServiceError && error.isRateLimit) {
    return {
      retryAfterSeconds: error.retryAfterSeconds,
      rateLimitSource: error.rateLimitSource,
    };
  }

  if (isAuthRateLimitError(error as AuthErrorLike)) {
    return { rateLimitSource: 'client' };
  }

  return { rateLimitSource: 'client' };
};
