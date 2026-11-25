import { apiRequest } from './client';

export type HubPromotion = {
  id: string;
  title: string;
  body?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_published?: boolean;
  show_on_home?: boolean;
  created_at?: string;
};

export async function listPublicPromotions() {
  return apiRequest<{ promotions: HubPromotion[] }>('promotions', 'public');
}

export async function listAdminPromotions() {
  return apiRequest<{ promotions: HubPromotion[] }>('admin', 'promotions');
}

export async function createPromotion(body: {
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  isPublished?: boolean;
  showOnHome?: boolean;
  sendEmail?: boolean;
}) {
  return apiRequest<{ promotion: HubPromotion }>('admin', 'createPromotion', { body });
}

export async function updatePromotion(body: {
  id: string;
  title?: string;
  body?: string;
  isPublished?: boolean;
  showOnHome?: boolean;
  sendEmail?: boolean;
}) {
  return apiRequest<{ promotion: HubPromotion }>('admin', 'updatePromotion', { body });
}

export async function deletePromotion(id: string) {
  return apiRequest<{ success: boolean }>('admin', 'deletePromotion', {
    query: { id },
  });
}
