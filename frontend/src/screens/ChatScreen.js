import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../context/ChatContext';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import OnlineUsers from '../components/OnlineUsers';
import TypingIndicator from '../components/TypingIndicator';
import DayDivider from '../components/DayDivider';
import { avatarColor, initials } from '../utils/avatar';
import { colors } from '../theme';

const RUN_GAP_MS = 5 * 60 * 1000;

function sameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatScreen({ user, onLogout }) {
  const { messages, onlineUsers, typingUsers, connectionStatus, error, clearError } = useChat();
  const listRef = useRef(null);
  const [autoscroll, setAutoscroll] = useState(true);

  const typingNames = Object.keys(typingUsers);
  const isConnected = connectionStatus === 'connected';

  const data = useMemo(() => {
    const reversed = messages.slice().reverse();
    return reversed.map((message, index) => {
      const older = reversed[index + 1];
      const isNewRun =
        !older ||
        older.senderId !== message.senderId ||
        new Date(message.createdAt) - new Date(older.createdAt) > RUN_GAP_MS;
      return {
        key: message.id,
        message,
        isOwn: message.senderId === user.userId,
        showAvatar: isNewRun,
        showDay: !older || !sameDay(message.createdAt, older.createdAt),
      };
    });
  }, [messages, user.userId]);

  useEffect(() => {
    if (autoscroll && messages.length > 0) {
      const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      return () => clearTimeout(timer);
    }
  }, [messages.length, autoscroll]);

  const renderItem = ({ item }) => (
    <View>
      {item.showDay ? <DayDivider date={item.message.createdAt} /> : null}
      <MessageBubble
        message={item.message}
        isOwn={item.isOwn}
        showAvatar={item.showAvatar}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerAvatar, { backgroundColor: avatarColor(user.username) }]}>
            <Text style={styles.headerAvatarText}>{initials(user.username)}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Vedaz Chat</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? colors.success : '#b8c1d2' },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? 'Online' : connectionStatus}
              </Text>
            </View>
          </View>
        </View>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Leave</Text>
        </Pressable>
      </View>

      {error ? (
        <Pressable style={styles.banner} onPress={clearError}>
          <Text style={styles.bannerText}>{error} (tap to dismiss)</Text>
        </Pressable>
      ) : null}

      <OnlineUsers users={onlineUsers} currentUsername={user.username} />

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        inverted
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        onScrollBeginDrag={() => setAutoscroll(false)}
        onEndReached={() => setAutoscroll(true)}
        onEndReachedThreshold={0.2}
        ListHeaderComponent={<TypingIndicator usernames={typingNames} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>{'\u2726'}</Text>
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Say hello to everyone in the room!</Text>
          </View>
        }
      />

      <MessageInput />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'web' ? 18 : 54,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#fdecec',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: colors.danger,
    fontSize: 13,
  },
  listContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIconText: {
    fontSize: 28,
    color: colors.primary,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
