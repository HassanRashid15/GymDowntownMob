import AsyncStorage from '@react-native-async-storage/async-storage';
import { GymOwnerSubscriptionRecord } from './gymSubscription';

export const GYM_SUBSCRIPTIONS_REGISTRY_KEY = 'gym_platform_subscriptions';

export const INITIAL_GYM_OWNER_SUBSCRIPTIONS: GymOwnerSubscriptionRecord[] = [
  {
    ownerId: '1',
    ownerName: 'Admin User',
    ownerEmail: 'admin@gym.com',
    status: 'active',
    gymId: 'gym_forge_downtown',
    gymName: 'Forge Downtown',
    planId: 'growth',
    billingPeriod: 'monthly',
    subscribedAt: '2024-03-15T00:00:00.000Z',
    renewsAt: '2026-04-15T00:00:00.000Z',
    activeMemberCount: 186,
    activeTrainerCount: 4,
    equipmentCheckedCount: 52,
    locationCount: 1,
  },
];

export const loadGymOwnerSubscriptions = async (): Promise<GymOwnerSubscriptionRecord[]> => {
  try {
    const stored = await AsyncStorage.getItem(GYM_SUBSCRIPTIONS_REGISTRY_KEY);
    if (stored) {
      return JSON.parse(stored) as GymOwnerSubscriptionRecord[];
    }
  } catch (error) {
    console.error('Failed to load gym owner subscriptions:', error);
  }
  return INITIAL_GYM_OWNER_SUBSCRIPTIONS;
};

export const saveGymOwnerSubscriptions = async (records: GymOwnerSubscriptionRecord[]) => {
  await AsyncStorage.setItem(GYM_SUBSCRIPTIONS_REGISTRY_KEY, JSON.stringify(records));
};

export const getGymSubscriptionByOwnerId = async (ownerId: string) => {
  const records = await loadGymOwnerSubscriptions();
  return records.find((entry) => entry.ownerId === ownerId && entry.status === 'active') ?? null;
};

export const upsertGymOwnerSubscription = async (
  record: Omit<GymOwnerSubscriptionRecord, 'status'> & { status?: GymOwnerSubscriptionRecord['status'] }
) => {
  const records = await loadGymOwnerSubscriptions();
  const index = records.findIndex((entry) => entry.ownerId === record.ownerId);
  const nextRecord: GymOwnerSubscriptionRecord = {
    ...record,
    status: record.status ?? 'active',
  };

  if (index === -1) {
    await saveGymOwnerSubscriptions([nextRecord, ...records]);
    return nextRecord;
  }

  const next = [...records];
  next[index] = { ...next[index], ...nextRecord };
  await saveGymOwnerSubscriptions(next);
  return next[index];
};

export const cancelGymOwnerSubscription = async (ownerId: string) => {
  const records = await loadGymOwnerSubscriptions();
  const next = records.map((entry) =>
    entry.ownerId === ownerId ? { ...entry, status: 'cancelled' as const } : entry
  );
  await saveGymOwnerSubscriptions(next);
};
