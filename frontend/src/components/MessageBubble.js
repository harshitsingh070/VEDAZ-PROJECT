import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../utils/format';
import { avatarColor, initials } from '../utils/avatar';
import { colors } from '../theme';

const STATUS_ICON = {
  sent: '\u2713',
  delivered: '\u2713\u2713',
  read: '\u2713\u2713',
};

const STATUS_LABEL = {
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
};

function Avatar({ username }) {
  return (
    <View style={[styles.avatar, { backgroundColor: avatarColor(username) }]}>
      <Text style={styles.avatarText}>{initials(username)}</Text>
    </View>
  );
}

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const status = STATUS_LABEL[message.status] || 'Sent';
  const statusColor = message.status === 'read' ? colors.primary : colors.textMuted;

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      {!isOwn ? (
        showAvatar ? (
          <Avatar username={message.senderName} />
        ) : (
          <View style={styles.avatarSlot} />
        )
      ) : null}

      <View style={styles.body}>
        {!isOwn ? <Text style={styles.sender}>{message.senderName}</Text> : null}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
            {message.text}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.time, isOwn && styles.timeOwn]}>
              {formatTime(message.createdAt)}
            </Text>
            {isOwn ? (
              <Text style={[styles.status, { color: statusColor }]}>
                {STATUS_ICON[message.status]} {status}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingHorizontal: 12,
    gap: 8,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  avatarSlot: {
    width: 32,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  body: {
    maxWidth: '74%',
  },
  sender: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 3,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleOwn: {
    backgroundColor: colors.bubbleOwn,
    borderTopRightRadius: 5,
  },
  bubbleOther: {
    backgroundColor: colors.bubbleOther,
    borderTopLeftRadius: 5,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textOwn: {
    color: '#ffffff',
  },
  textOther: {
    color: colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 6,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  timeOwn: {
    color: '#c9dcff',
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
});
