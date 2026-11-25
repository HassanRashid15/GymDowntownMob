import { apiRequest } from './client';

export type HubGym = {
  ownerId?: string;
  gymOwnerId?: string;
  id?: string;
  gymName?: string;
  name?: string;
  city?: string | null;
  gymCity?: string | null;
  address?: string | null;
  description?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
  avatarUrl?: string | null;
  mainImageUrl?: string | null;
  gymMainImageUrl?: string | null;
  gymOptionalImagesUrls?: string[];
  facilities?: string[];
  services?: string[];
  peakHours?: string | null;
  capacity?: string | null;
  monthlyFee?: string | null;
  trainerFee?: string | null;
  ownerName?: string | null;
  [key: string]: unknown;
};

export type GymTrainer = {
  userId: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  specialization?: string | null;
  bio?: string | null;
  yearsExperience?: string | number | null;
  certifications?: string[] | string | null;
};

export type GymReview = {
  id: string;
  rating: number;
  body?: string | null;
  created_at: string;
  user_id?: string;
  authorName?: string | null;
};

export async function listGyms() {
  return apiRequest<{ gyms: HubGym[] }>('gyms', 'list');
}

export async function getGymDetail(ownerId: string) {
  return apiRequest<{ gym: HubGym }>('gyms', 'detail', {
    pathParams: { ownerId },
  });
}

export async function getGymTrainers(ownerId: string) {
  return apiRequest<{ trainers: GymTrainer[] }>('gyms', 'trainers', {
    pathParams: { ownerId },
  });
}

export async function getGymReviews(ownerId: string) {
  return apiRequest<{ reviews: GymReview[]; average?: number; count?: number }>(
    'gyms',
    'reviews',
    { pathParams: { ownerId } }
  );
}

export async function createGymReview(ownerId: string, rating: number, body?: string) {
  return apiRequest<{ review: GymReview }>('gyms', 'createReview', {
    pathParams: { ownerId },
    body: { rating, body },
  });
}

export function gymDisplayName(gym: HubGym) {
  return gym.gymName || gym.name || 'Gym';
}

export function gymOwnerKey(gym: HubGym) {
  return String(gym.ownerId || gym.gymOwnerId || gym.id || '');
}

export function gymCityLabel(gym: HubGym) {
  return gym.gymCity || gym.city || null;
}

export function gymImageUrl(gym: HubGym) {
  return gym.gymMainImageUrl || gym.mainImageUrl || gym.avatarUrl || gym.logoUrl || null;
}
