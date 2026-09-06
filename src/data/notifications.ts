export type NotificationCategory = 'confirmation' | 'facility' | 'directive' | 'system';

export type NotificationFilter = 'all' | 'confirmations' | 'maintenance';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  label: string;
  title: string;
  body: string;
  time: string;
  group: 'today' | 'yesterday';
  read: boolean;
  quote?: string;
}

export const notificationFilters: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'ALL ALERTS' },
  { id: 'confirmations', label: 'CONFIRMATIONS' },
  { id: 'maintenance', label: 'MAINTENANCE' },
];

export const initialNotifications: AppNotification[] = [
  {
    id: '1',
    category: 'confirmation',
    label: 'CONFIRMATION',
    title: 'Hypertrophy Clinic Booking Confirmed',
    body: 'Your slot for the 18:00 Hypertrophy Clinic is secured. Arrive 10 minutes early for warm-up.',
    time: '2m ago',
    group: 'today',
    read: false,
  },
  {
    id: '2',
    category: 'facility',
    label: 'FACILITY ALERT',
    title: 'Squat Rack Alpha Offline',
    body: 'Squat Rack Alpha is currently undergoing structural maintenance. Use Rack Beta on the east floor.',
    time: '1h ago',
    group: 'today',
    read: false,
  },
  {
    id: '3',
    category: 'directive',
    label: 'DAILY DIRECTIVE',
    title: 'Embrace the Resistance',
    body: 'Your daily motivation from the Forge coaching team.',
    quote:
      '"The iron never lies to you. You can walk outside and listen to all kinds of talk, get told that you\'re a god or a total bastard. The iron will always kick you the real deal."',
    time: '4h ago',
    group: 'today',
    read: false,
  },
  {
    id: '4',
    category: 'confirmation',
    label: 'CONFIRMATION',
    title: 'NEON SPIN SURGE Reserved',
    body: 'You are booked for tonight\'s 18:00 NEON SPIN SURGE with Marcus T. Bring a towel and water.',
    time: '6h ago',
    group: 'today',
    read: false,
  },
  {
    id: '5',
    category: 'confirmation',
    label: 'CONFIRMATION',
    title: 'Recovery Chamber Booked',
    body: 'Cryotherapy session completed. Your recovery window is logged in your activity feed.',
    time: 'Yesterday',
    group: 'yesterday',
    read: true,
  },
  {
    id: '6',
    category: 'system',
    label: 'SYSTEM',
    title: 'Protocol V2.4 Installed',
    body: 'New macro tracking features are live. Update your goals in the dashboard.',
    time: 'Yesterday',
    group: 'yesterday',
    read: true,
  },
];

export const matchesNotificationFilter = (
  notification: AppNotification,
  filter: NotificationFilter
): boolean => {
  if (filter === 'all') return true;
  if (filter === 'confirmations') return notification.category === 'confirmation';
  return notification.category === 'facility';
};
