import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthServiceError } from './errors';

export type AuthCooldownAction = 'login' | 'signup';

const STORAGE_KEY = '@forge/auth-cooldown';

type CooldownEntry = {
  expiresAt: number;
  totalSeconds: number;
  source: 'supabase';
};

export type AuthCooldownResult = {
  durationSeconds: number;
  source: 'supabase';
};

type CooldownStore = {
  auth?: CooldownEntry;
};

const readStore = async (): Promise<CooldownStore> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CooldownStore & Record<string, CooldownEntry>;

    if (parsed.auth) {
      return { auth: parsed.auth };
    }

    const legacy = parsed.login ?? parsed.signup;
    return legacy ? { auth: legacy } : {};
  } catch {
    return {};
  }
};

const writeStore = async (store: CooldownStore) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const formatCooldownTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getRemainingSeconds = (entry?: CooldownEntry) => {
  if (!entry) return 0;
  const remainingMs = entry.expiresAt - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
};

export const clearAuthCooldown = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export const startAuthCooldown = async (options: {
  durationSeconds: number;
}): Promise<AuthCooldownResult | null> => {
  const durationSeconds = Math.ceil(options.durationSeconds);
  if (!durationSeconds || durationSeconds <= 0) {
    return null;
  }

  const now = Date.now();
  const entry: CooldownEntry = {
    expiresAt: now + durationSeconds * 1000,
    totalSeconds: durationSeconds,
    source: 'supabase',
  };

  await writeStore({ auth: entry });
  return { durationSeconds, source: 'supabase' };
};

export const applyRateLimitCooldownFromError = async (
  error: unknown
): Promise<AuthCooldownResult | null> => {
  if (!(error instanceof AuthServiceError) || !error.isRateLimit) {
    return null;
  }

  if (!error.retryAfterSeconds || error.retryAfterSeconds <= 0) {
    return null;
  }

  return startAuthCooldown({ durationSeconds: error.retryAfterSeconds });
};

export const getActiveAuthCooldownProgress = async () => {
  const store = await readStore();
  const entry = store.auth;

  if (!entry) {
    return { remainingSeconds: 0, totalSeconds: 0, progress: 0, source: 'supabase' as const };
  }

  const remainingSeconds = getRemainingSeconds(entry);
  if (remainingSeconds <= 0) {
    await clearAuthCooldown();
    return { remainingSeconds: 0, totalSeconds: 0, progress: 0, source: 'supabase' as const };
  }

  const totalSeconds = entry.totalSeconds;
  const elapsed = totalSeconds - remainingSeconds;
  const progress = totalSeconds > 0 ? Math.min(Math.max(elapsed / totalSeconds, 0), 1) : 0;

  return { remainingSeconds, totalSeconds, progress, source: entry.source };
};

// Legacy exports kept for compatibility
export const getAuthCooldownProgress = async (_action?: AuthCooldownAction) =>
  getActiveAuthCooldownProgress();

export const getAuthCooldownRemaining = async (_action?: AuthCooldownAction) => {
  const progress = await getActiveAuthCooldownProgress();
  return progress.remainingSeconds;
};
