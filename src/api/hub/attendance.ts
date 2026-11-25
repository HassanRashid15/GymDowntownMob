import { apiRequest } from './client';

export type AttendanceCheckin = {
  id: string;
  gym_owner_id?: string;
  user_id: string;
  checked_in_at: string;
  checked_out_at?: string | null;
  source: string;
  notes?: string | null;
  open?: boolean;
  full_name?: string | null;
};

export async function listAttendance(scope: 'me' | 'gym' = 'me') {
  return apiRequest<{ checkins: AttendanceCheckin[] }>('attendance', 'list', {
    query: { scope },
  });
}

export async function checkIn(
  source = 'manual',
  coords?: { lat?: number; lng?: number }
) {
  return apiRequest<{
    checkin?: AttendanceCheckin;
    alreadyCheckedIn?: boolean;
    needsCheckout?: boolean;
    error?: string;
  }>('attendance', 'checkIn', {
    body: {
      source,
      ...(coords?.lat != null ? { lat: coords.lat } : {}),
      ...(coords?.lng != null ? { lng: coords.lng } : {}),
    },
  });
}

export async function checkOut(id?: string) {
  return apiRequest<{ success?: boolean; checkin?: AttendanceCheckin }>('attendance', 'checkOut', {
    body: id ? { id } : {},
  });
}

export function isCheckedInToday(checkins: AttendanceCheckin[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return checkins.some((c) => new Date(c.checked_in_at) >= start);
}

export function getOpenCheckin(checkins: AttendanceCheckin[]) {
  return (
    checkins.find((c) => c.open === true || (c.checked_in_at && !c.checked_out_at)) || null
  );
}
