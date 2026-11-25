import { apiRequest } from './client';

export async function getNewsletterMe() {
  return apiRequest<{ subscribed: boolean; email?: string }>('newsletter', 'me');
}

export async function setNewsletterMe(subscribe: boolean) {
  return apiRequest<{ success: boolean; subscribed: boolean }>('newsletter', 'setMe', {
    body: { subscribe },
  });
}

export type NewsletterSub = {
  email: string;
  created_at?: string;
  status?: string;
};

export async function listNewsletterSubs() {
  return apiRequest<{ success: boolean; subscriptions: NewsletterSub[]; total: number }>(
    'admin',
    'newsletter'
  );
}

export async function removeNewsletterSub(email: string, reason?: string) {
  return apiRequest<{ success: boolean; message?: string }>('admin', 'newsletterRemove', {
    body: { email, reason },
  });
}
