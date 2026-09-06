export interface NotificationPreferences {
  pushEnabled: boolean;
  emailDigest: boolean;
  classReminders: boolean;
  workoutUpdates: boolean;
  trainerMessages: boolean;
  promotions: boolean;
  gymNews: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  pushEnabled: true,
  emailDigest: true,
  classReminders: true,
  workoutUpdates: true,
  trainerMessages: true,
  promotions: false,
  gymNews: true,
};

export interface NotificationPreferenceGroup {
  title: string;
  items: {
    key: keyof NotificationPreferences;
    title: string;
    subtitle: string;
  }[];
}

export const notificationPreferenceGroups: NotificationPreferenceGroup[] = [
  {
    title: 'GENERAL',
    items: [
      {
        key: 'pushEnabled',
        title: 'Push Notifications',
        subtitle: 'Receive alerts on this device',
      },
      {
        key: 'emailDigest',
        title: 'Email Digest',
        subtitle: 'Weekly summary sent to your inbox',
      },
    ],
  },
  {
    title: 'ACTIVITY',
    items: [
      {
        key: 'classReminders',
        title: 'Class Reminders',
        subtitle: 'Alerts before booked sessions',
      },
      {
        key: 'workoutUpdates',
        title: 'Workout Updates',
        subtitle: 'Progress and streak milestones',
      },
      {
        key: 'trainerMessages',
        title: 'Trainer Messages',
        subtitle: 'Direct messages from your coach',
      },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      {
        key: 'promotions',
        title: 'Promotions & Offers',
        subtitle: 'Deals on memberships and gear',
      },
      {
        key: 'gymNews',
        title: 'Gym News',
        subtitle: 'Events, hours, and facility updates',
      },
    ],
  },
];
