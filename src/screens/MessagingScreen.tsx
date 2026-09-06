import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import Svg, { Path, Polyline, Line } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';
import { ChatMessage } from '../data/messaging';
import { navigateBackOrTo } from '../navigation/navigationHelpers';

const SALMON = '#E88E83';
const PRIMARY_RED = '#FA1818';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="22" y1="2" x2="11" y2="13" />
    <Path d="M22 2L15 22 11 13 2 9l20-7z" />
  </Svg>
);

const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const BoltIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

const MessageBubble = ({ message, colors }: { message: ChatMessage; colors: ReturnType<typeof useTheme>['colors'] }) => {
  if (message.kind === 'system') {
    return (
      <View style={styles.systemRow}>
        <View style={[styles.systemPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <BoltIcon color={SALMON} />
          <Text style={[styles.systemText, { color: colors.mutedForeground }]}>{message.text}</Text>
        </View>
      </View>
    );
  }

  if (message.isOutgoing) {
    return (
      <View style={styles.outgoingRow}>
        <View style={styles.outgoingContent}>
          <Text style={[styles.metaTextRight, { color: colors.mutedForeground }]}>You · {message.timeLabel}</Text>
          <View style={[styles.outgoingBubble, { backgroundColor: PRIMARY_RED }]}>
            <Text style={styles.outgoingText}>{message.text}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.incomingRow}>
      {message.senderAvatar ? (
        <Image source={{ uri: message.senderAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarSpacer} />
      )}
      <View style={styles.incomingContent}>
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          {message.senderName} · {message.timeLabel}
        </Text>
        <View style={[styles.incomingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.incomingText, { color: colors.foreground }]}>{message.text}</Text>
        </View>
      </View>
    </View>
  );
};

const MessagingScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const {
    supportChannel,
    isSupportTyping,
    connectLiveSupport,
    sendMessage,
    getSupportMessages,
  } = useMessaging();

  const channelMessages = useMemo(() => getSupportMessages(), [getSupportMessages]);
  const participant = supportChannel.participant;

  useEffect(() => {
    connectLiveSupport();
  }, [connectLiveSupport]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [channelMessages.length, isSupportTyping]);

  const handleBack = useCallback(() => {
    const returnTo = route.params?.returnTo ?? 'HelpSupport';
    navigateBackOrTo(navigation, { name: returnTo });
  }, [navigation, route.params?.returnTo]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [handleBack]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: SALMON }]}>LIVE SUPPORT</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
            Talking with admin support team
          </Text>
        </View>
        <Image source={{ uri: participant.avatar }} style={styles.headerAvatar} />
      </View>

      <View style={[styles.participantCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
        <View style={styles.participantInfo}>
          <Text style={[styles.participantName, { color: colors.foreground }]}>{participant.name}</Text>
          <Text style={[styles.participantRole, { color: colors.mutedForeground }]}>{participant.role}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
            <Text style={[styles.statusText, { color: '#22C55E' }]}>Online · Live support</Text>
          </View>
        </View>
        <View style={[styles.youBadge, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.youBadgeLabel, { color: colors.mutedForeground }]}>YOU</Text>
          <Text style={[styles.youBadgeName, { color: colors.foreground }]} numberOfLines={1}>
            {user?.name ?? 'Member'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...(Platform.OS === 'web' ? { dataSet: { hideScrollbar: 'true' } } : {})}
      >
        {channelMessages.map((message) => (
          <MessageBubble key={message.id} message={message} colors={colors} />
        ))}

        {isSupportTyping ? (
          <View style={styles.incomingRow}>
            <Image source={{ uri: participant.avatar }} style={styles.avatar} />
            <View style={styles.incomingContent}>
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {participant.name} · typing...
              </Text>
              <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.typingText, { color: colors.mutedForeground }]}>...</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.composer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity style={[styles.attachButton, { borderColor: colors.border }]}>
          <PlusIcon color={colors.mutedForeground} />
        </TouchableOpacity>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message ${participant.name}...`}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.composerInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!draft.trim()}
          style={[
            styles.sendButton,
            { backgroundColor: draft.trim() ? SALMON : `${SALMON}55` },
          ]}
        >
          <SendIcon color="#0D0D0D" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  participantCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  participantInfo: {
    flex: 1,
    minWidth: 0,
  },
  participantName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  participantRole: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  youBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 96,
    alignItems: 'center',
  },
  youBadgeLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  youBadgeName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textAlign: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 14,
  },
  incomingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  outgoingRow: {
    alignItems: 'flex-end',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginTop: 18,
  },
  avatarSpacer: {
    width: 34,
  },
  incomingContent: {
    flex: 1,
    minWidth: 0,
  },
  outgoingContent: {
    maxWidth: '82%',
    alignItems: 'flex-end',
  },
  metaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 6,
  },
  metaTextRight: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 6,
    textAlign: 'right',
  },
  incomingBubble: {
    borderWidth: 1,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  incomingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  outgoingBubble: {
    borderRadius: 14,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  outgoingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  systemRow: {
    alignItems: 'center',
  },
  systemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  systemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  typingBubble: {
    borderWidth: 1,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 2,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});

export default MessagingScreen;
