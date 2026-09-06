import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatChannel,
  ChatMessage,
  LIVE_SUPPORT_CHANNEL_ID,
  SUPPORT_AGENT_ID,
  SUPPORT_AGENT_NAME,
  liveSupportChannel,
  liveSupportParticipant,
  seedMessages,
  supportReplyTemplates,
} from '../data/messaging';

const STORAGE_KEY = 'gym_messaging_v2';

interface MessagingContextValue {
  supportChannel: ChatChannel;
  messages: ChatMessage[];
  isSupportTyping: boolean;
  isLiveSupportConnected: boolean;
  connectLiveSupport: () => void;
  sendMessage: (text: string) => void;
  getSupportMessages: () => ChatMessage[];
}

const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const buildMessage = (
  text: string,
  options: {
    isOutgoing: boolean;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    kind?: ChatMessage['kind'];
  }
): ChatMessage => {
  const now = new Date();
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    channelId: LIVE_SUPPORT_CHANNEL_ID,
    text: text.trim(),
    kind: options.kind ?? 'text',
    isOutgoing: options.isOutgoing,
    senderId: options.senderId,
    senderName: options.senderName,
    senderAvatar: options.senderAvatar,
    createdAt: now.getTime(),
    timeLabel: formatTimeLabel(now),
  };
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supportChannel, setSupportChannel] = useState<ChatChannel>(liveSupportChannel);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const [isLiveSupportConnected, setIsLiveSupportConnected] = useState(false);
  const replyIndexRef = useRef(0);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored) as {
          messages: ChatMessage[];
          supportChannel?: ChatChannel;
          isLiveSupportConnected?: boolean;
        };
        if (parsed.messages?.length) {
          setMessages(
            parsed.messages.filter((message) => message.channelId === LIVE_SUPPORT_CHANNEL_ID)
          );
        }
        if (parsed.supportChannel) setSupportChannel(parsed.supportChannel);
        if (parsed.isLiveSupportConnected) setIsLiveSupportConnected(true);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    void loadMessages();
  }, []);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  const persist = async (
    nextMessages: ChatMessage[],
    nextChannel: ChatChannel,
    connected = isLiveSupportConnected
  ) => {
    setMessages(nextMessages);
    setSupportChannel(nextChannel);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages: nextMessages,
        supportChannel: nextChannel,
        isLiveSupportConnected: connected,
      })
    );
  };

  const connectLiveSupport = useCallback(() => {
    if (isLiveSupportConnected) return;

    const nextChannel = {
      ...supportChannel,
      lastActivity: 'Now',
      unread: 0,
      participant: { ...liveSupportParticipant, status: 'online' as const },
    };

    setIsLiveSupportConnected(true);
    void persist(messages, nextChannel, true);
  }, [isLiveSupportConnected, messages, supportChannel]);

  const queueSupportReply = useCallback(
    (currentMessages: ChatMessage[], currentChannel: ChatChannel) => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);

      setIsSupportTyping(true);
      replyTimeoutRef.current = setTimeout(() => {
        const replyText =
          supportReplyTemplates[replyIndexRef.current % supportReplyTemplates.length] ??
          supportReplyTemplates[0];
        replyIndexRef.current += 1;

        const reply = buildMessage(replyText, {
          isOutgoing: false,
          senderId: SUPPORT_AGENT_ID,
          senderName: SUPPORT_AGENT_NAME,
          senderAvatar: liveSupportParticipant.avatar,
        });

        const nextMessages = [...currentMessages, reply];
        const nextChannel = {
          ...currentChannel,
          lastMessage: reply.text,
          lastActivity: 'Now',
          unread: 0,
        };

        setIsSupportTyping(false);
        void persist(nextMessages, nextChannel, true);
      }, 1400);
    },
    []
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const outgoing = buildMessage(trimmed, {
        isOutgoing: true,
        senderId: 'user',
        senderName: 'You',
      });

      const nextMessages = [...messages, outgoing];
      const nextChannel = {
        ...supportChannel,
        lastMessage: trimmed,
        lastActivity: 'Now',
        unread: 0,
      };

      void persist(nextMessages, nextChannel);
      queueSupportReply(nextMessages, nextChannel);
    },
    [messages, queueSupportReply, supportChannel]
  );

  const getSupportMessages = useCallback(
    () =>
      messages
        .filter((message) => message.channelId === LIVE_SUPPORT_CHANNEL_ID)
        .sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );

  const value = useMemo(
    () => ({
      supportChannel,
      messages,
      isSupportTyping,
      isLiveSupportConnected,
      connectLiveSupport,
      sendMessage,
      getSupportMessages,
    }),
    [
      connectLiveSupport,
      getSupportMessages,
      isLiveSupportConnected,
      isSupportTyping,
      messages,
      sendMessage,
      supportChannel,
    ]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return context;
};
