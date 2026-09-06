import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  type AuthCooldownResult,
  applyRateLimitCooldownFromError,
  formatCooldownTime,
  getActiveAuthCooldownProgress,
} from '../api/auth/cooldown';

export const useAuthCooldown = () => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [source, setSource] = useState<'supabase' | 'client'>('supabase');

  const refreshCooldown = useCallback(async () => {
    const next = await getActiveAuthCooldownProgress();
    setRemainingSeconds(next.remainingSeconds);
    setTotalSeconds(next.totalSeconds);
    setProgress(next.progress);
    setSource(next.source ?? 'supabase');
  }, []);

  useEffect(() => {
    refreshCooldown();
    const interval = setInterval(refreshCooldown, 1000);
    return () => clearInterval(interval);
  }, [refreshCooldown]);

  useFocusEffect(
    useCallback(() => {
      refreshCooldown();
    }, [refreshCooldown])
  );

  const triggerCooldownFromError = useCallback(
    async (error: unknown): Promise<AuthCooldownResult | null> => {
      try {
        if (typeof applyRateLimitCooldownFromError !== 'function') {
          return null;
        }
        const result = await applyRateLimitCooldownFromError(error);
        if (result) {
          await refreshCooldown();
        }
        return result;
      } catch {
        return null;
      }
    },
    [refreshCooldown]
  );

  const isCoolingDown = remainingSeconds > 0;

  return {
    remainingSeconds,
    totalSeconds,
    progress,
    source,
    isCoolingDown,
    formattedTime: formatCooldownTime(remainingSeconds),
    triggerCooldownFromError,
    refreshCooldown,
  };
};
