export * from './types';
export type { SignUpResult } from './types';
export * from './authApi';
export * from './profileApi';
export * from './metadata';
export {
  setAwaitingEmailVerification,
  isAwaitingEmailVerification,
  isEmailVerificationDeepLink,
  hasAuthCallbackTokens,
  getEmailVerificationRedirectTo,
  consumeAuthCallbackUrl,
  getCurrentUrlForAuthCallback,
  clearAuthCallbackUrlFromBrowser,
  markVerificationWelcomeSplashPlayed,
  consumeVerificationWelcomeSplashPlayed,
  markVerificationFlowCompleted,
  consumeVerificationFlowCompleted,
  peekVerificationFlowCompleted,
  peekFullNameFromAuthCallbackUrl,
  replaceBrowserPath,
  type AuthCallbackKind,
} from './emailVerification';
export {
  parseAuthError,
  isAuthRateLimitError,
  AuthServiceError,
  getAuthRateLimitCooldown,
  createAuthServiceError,
} from './errors';
export {
  type AuthCooldownAction,
  type AuthCooldownResult,
  formatCooldownTime,
  clearAuthCooldown,
  startAuthCooldown,
  applyRateLimitCooldownFromError,
  getActiveAuthCooldownProgress,
  getAuthCooldownProgress,
  getAuthCooldownRemaining,
} from './cooldown';
