import { apiRequest } from './client';

export type HubNotification = {
  id: string;
  user_id?: string;
  type?: string;
  title: string;
  message?: string;
  metadata?: Record<string, unknown> | null;
  unread?: boolean;
  dismissed?: boolean;
  created_at: string;
  updated_at?: string;
};

export async function listNotifications(options?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) {
  return apiRequest<{ notifications: HubNotification[]; unreadCount: number }>(
    'notifications',
    'list',
    {
      query: {
        limit: options?.limit ?? 50,
        offset: options?.offset ?? 0,
        unread_only: options?.unreadOnly ? true : undefined,
      },
    }
  );
}

export async function markAllNotificationsRead() {
  return apiRequest<{ success: boolean }>('notifications', 'markAllRead', {
    body: { action: 'mark_all_read' },
  });
}

export async function markNotificationRead(id: string) {
  return apiRequest<{ success: boolean }>('notifications', 'updateOne', {
    pathParams: { id },
    body: { action: 'mark_read' },
  });
}

export async function dismissNotification(id: string) {
  return apiRequest<{ success: boolean }>('notifications', 'updateOne', {
    pathParams: { id },
    body: { action: 'dismiss' },
  });
}

export async function deleteNotification(id: string) {
  return apiRequest<{ success: boolean }>('notifications', 'deleteOne', {
    pathParams: { id },
  });
}
