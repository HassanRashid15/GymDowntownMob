import { apiRequest } from './client';

export type ReviewerRole = 'customer' | 'admin' | 'trainer';
export type ReviewType =
  | 'general'
  | 'service'
  | 'facilities'
  | 'trainer'
  | 'staff'
  | 'platform';

export type HubReview = {
  id: string;
  user_id?: string;
  gym_owner_id?: string | null;
  reviewer_name: string;
  reviewer_role?: ReviewerRole;
  rating: number;
  review_text: string;
  review_type?: ReviewType;
  is_approved?: boolean;
  is_featured?: boolean;
  created_at: string;
  gym_name?: string | null;
};

export async function listApprovedReviews(limit = 12, gymOwnerId?: string) {
  return apiRequest<{ reviews: HubReview[]; average?: number; count?: number }>('reviews', 'list', {
    query: { limit, gymOwnerId },
  });
}

export async function listMyReviews(limit = 20) {
  return apiRequest<{ reviews: HubReview[] }>('reviews', 'list', {
    query: { scope: 'mine', limit },
  });
}

export async function listPendingReviews(limit = 50) {
  return apiRequest<{ reviews: HubReview[] }>('reviews', 'list', {
    query: { scope: 'pending', limit },
  });
}

export async function submitFeedback(body: {
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewType?: ReviewType;
  gymOwnerId?: string;
}) {
  return apiRequest<{ success: boolean; review: HubReview; message?: string }>('reviews', 'submit', {
    body,
  });
}

export async function moderateFeedback(body: {
  id: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  reject?: boolean;
}) {
  return apiRequest<{ success: boolean }>('reviews', 'moderate', { body });
}
