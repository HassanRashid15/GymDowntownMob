import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGymPlanById, revenueTierDetails, GymSubscription } from '../data/gymSubscription';
import { useAuth } from './AuthContext';
import {
  cancelGymOwnerSubscription,
  getGymSubscriptionByOwnerId,
  upsertGymOwnerSubscription,
} from '../data/gymSubscriptionsRegistry';

export type { GymSubscription } from '../data/gymSubscription';

interface SubscribeInput {
  gymName: string;
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
}

interface SubscriptionContextValue {
  gymSubscription: GymSubscription | null;
  hasGymSubscription: boolean;
  subscribe: (input: SubscribeInput) => Promise<void>;
  changePlan: (planId: string, billingPeriod: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const STORAGE_KEY = 'gym_owner_subscription';

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [gymSubscription, setGymSubscription] = useState<GymSubscription | null>(null);

  const loadForUser = async (ownerId?: string) => {
    if (!ownerId) {
      setGymSubscription(null);
      return;
    }

    try {
      const fromRegistry = await getGymSubscriptionByOwnerId(ownerId);
      if (fromRegistry) {
        const { ownerId: _ownerId, ownerName: _ownerName, ownerEmail: _ownerEmail, status: _status, ...subscription } =
          fromRegistry;
        setGymSubscription({
          ...subscription,
          activeTrainerCount: subscription.activeTrainerCount ?? 1,
          equipmentCheckedCount: subscription.equipmentCheckedCount ?? 0,
          locationCount: subscription.locationCount ?? 1,
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
        return;
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GymSubscription;
        setGymSubscription({
          ...parsed,
          activeTrainerCount: parsed.activeTrainerCount ?? 1,
          equipmentCheckedCount: parsed.equipmentCheckedCount ?? 18,
          locationCount: parsed.locationCount ?? 1,
        });
      } else {
        setGymSubscription(null);
      }
    } catch (error) {
      console.error('Failed to load gym subscription:', error);
    }
  };

  useEffect(() => {
    loadForUser(user?.id);
  }, [user?.id]);

  const persist = async (subscription: GymSubscription | null) => {
    setGymSubscription(subscription);
    if (subscription) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const subscribe = async ({ gymName, planId, billingPeriod }: SubscribeInput) => {
    if (!user) return;

    const now = new Date();
    const renewsAt = billingPeriod === 'yearly' ? addMonths(now, 12) : addMonths(now, 1);

    const subscription: GymSubscription = {
      gymId: `gym_${Date.now()}`,
      gymName: gymName.trim(),
      planId,
      billingPeriod,
      subscribedAt: now.toISOString(),
      renewsAt: renewsAt.toISOString(),
      activeMemberCount: 42,
      activeTrainerCount: 1,
      equipmentCheckedCount: 18,
      locationCount: 1,
    };

    await persist(subscription);
    await upsertGymOwnerSubscription({
      ...subscription,
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
      status: 'active',
    });
  };

  const changePlan = async (planId: string, billingPeriod: 'monthly' | 'yearly') => {
    if (!gymSubscription || !user) return;

    const renewsAt = billingPeriod === 'yearly' ? addMonths(new Date(), 12) : addMonths(new Date(), 1);
    const next = {
      ...gymSubscription,
      planId,
      billingPeriod,
      renewsAt: renewsAt.toISOString(),
    };
    await persist(next);
    await upsertGymOwnerSubscription({
      ...next,
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
      status: 'active',
    });
  };

  const cancelSubscription = async () => {
    if (user) {
      await cancelGymOwnerSubscription(user.id);
    }
    await persist(null);
  };

  const value = useMemo(
    () => ({
      gymSubscription,
      hasGymSubscription: !!gymSubscription,
      subscribe,
      changePlan,
      cancelSubscription,
    }),
    [gymSubscription]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const useGymPlanAccess = () => {
  const { gymSubscription, hasGymSubscription } = useSubscription();
  const plan = gymSubscription ? getGymPlanById(gymSubscription.planId) : null;
  const capabilities = plan?.capabilities;
  const revenueTier = capabilities?.revenueAnalyticsTier ?? 1;
  const revenueDetails = revenueTierDetails[revenueTier];

  return {
    hasGymSubscription,
    plan,
    capabilities,
    gymSubscription,
    canManageMembers: hasGymSubscription,
    canManageTrainers: hasGymSubscription,
    canCheckEquipment:
      capabilities?.equipmentAccess === 'limited' || capabilities?.equipmentAccess === 'full',
    canViewAnalytics: hasGymSubscription,
    hasLimitedEquipment: capabilities?.equipmentAccess === 'limited',
    revenueAnalyticsTier: revenueTier,
    revenueDetails,
    canUseMultiLocation: capabilities?.locationLimit === 'unlimited',
    locationLimit: capabilities?.locationLimit ?? 0,
    equipmentCheckLimit: capabilities?.equipmentCheckLimit ?? 0,
  };
};
