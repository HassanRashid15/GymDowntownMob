import { apiRequest } from './client';

export type ContactSubmitBody = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  recipientId?: string;
};

export async function submitContactMessage(body: ContactSubmitBody) {
  return apiRequest<{ success?: boolean; id?: string }>('contact', 'submit', { body });
}
