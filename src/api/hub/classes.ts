import { apiRequest } from './client';

export type GymClass = {
  id: string;
  name: string;
  description?: string | null;
  duration_minutes?: number | null;
  capacity?: number | null;
  trainer_user_id?: string | null;
  gym_owner_id?: string;
  is_active?: boolean;
};

export type ClassSession = {
  id: string;
  class_id: string;
  starts_at: string;
  ends_at?: string | null;
  status?: string;
};

export async function listClasses(gymOwnerId: string) {
  return apiRequest<{ classes: GymClass[]; sessions: ClassSession[] }>('classes', 'list', {
    query: { gymOwnerId },
  });
}

export async function createClass(body: {
  name: string;
  description?: string;
  durationMinutes?: number;
  capacity?: number;
  trainerUserId?: string;
}) {
  return apiRequest<{ class: GymClass }>('classes', 'create', { body });
}

export async function createClassSession(body: { classId: string; startsAt: string }) {
  return apiRequest<{ session: ClassSession }>('classes', 'createSession', { body });
}

export async function bookClassSession(sessionId: string) {
  return apiRequest<{ booking: { session_id: string; user_id: string; status: string } }>(
    'classes',
    'book',
    { body: { sessionId } }
  );
}
