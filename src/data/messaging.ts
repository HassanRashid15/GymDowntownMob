export type MessageKind = 'text' | 'system';

export type ChannelType = 'support';

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timeLabel: string;
  createdAt: number;
  kind: MessageKind;
  isOutgoing: boolean;
}

export interface ChatChannel {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  type: ChannelType;
  participant: ChatParticipant;
  lastMessage: string;
  lastActivity: string;
  unread: number;
}

export const LIVE_SUPPORT_CHANNEL_ID = 'live-support';

export const liveSupportParticipant: ChatParticipant = {
  id: 'admin-support',
  name: 'Live Support Team',
  role: 'Admin · Forge Gym',
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
  status: 'online',
};

export const liveSupportChannel: ChatChannel = {
  id: LIVE_SUPPORT_CHANNEL_ID,
  title: 'Live Support',
  subtitle: 'Admin support team',
  avatar: liveSupportParticipant.avatar,
  type: 'support',
  participant: liveSupportParticipant,
  lastMessage: 'You are connected to our admin live support team.',
  lastActivity: 'Now',
  unread: 0,
};

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const seedTime = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return {
    createdAt: date.getTime(),
    timeLabel: formatTimeLabel(date),
  };
};

export const seedMessages: ChatMessage[] = [
  {
    id: 'msg-support-system',
    channelId: LIVE_SUPPORT_CHANNEL_ID,
    senderId: 'system',
    senderName: 'System',
    text: 'Connected to Live Support Team (Admin)',
    kind: 'system',
    isOutgoing: false,
    ...seedTime(8, 30),
  },
  {
    id: 'msg-support-welcome',
    channelId: LIVE_SUPPORT_CHANNEL_ID,
    senderId: liveSupportParticipant.id,
    senderName: liveSupportParticipant.name,
    senderAvatar: liveSupportParticipant.avatar,
    text: 'Hi! You are chatting with the Forge admin live support team. How can we help with your membership, bookings, or account?',
    kind: 'text',
    isOutgoing: false,
    ...seedTime(8, 31),
  },
];

export const supportReplyTemplates = [
  'Thanks for waiting — our admin team is reviewing this now. Can you share a few more details?',
  'Got it. I have noted this on your account and a support specialist will follow up shortly.',
  'Happy to help. Is there anything else you need while we sort this out?',
  'Our live support team is checking this for you. You will get an update here in just a moment.',
  'Thanks for reaching Forge admin support. A team member is looking into this for you.',
];

export const SUPPORT_AGENT_NAME = liveSupportParticipant.name;
export const SUPPORT_AGENT_ID = liveSupportParticipant.id;
