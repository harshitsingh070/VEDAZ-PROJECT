import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { avatarColor, initials } from '../utils/avatar';
import { colors } from '../theme';

export default function OnlineUsers({ users, currentUsername }) {
  const others = users.filter((user) => user.username !== currentUsername);
  const count = users.length;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {others.length === 0 ? (
          <Text style={styles.empty}>No one else online right now</Text>
        ) : (
          others.map((user) => (
            <View key={user.socketId} style={styles.user}>
              <View>
                <View style={[styles.avatar, { backgroundColor: avatarColor(user.username) }]}>
                  <Text style={styles.avatarText}>{initials(user.username)}</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {user.username}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <View style={[styles.badgeDot, count > 1 && styles.badgeDotActive]} />
          <Text style={[styles.badgeText, count > 1 && styles.badgeTextActive]}>
            {count} online
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  user: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 54,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
    maxWidth: 54,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 12,
    alignSelf: 'center',
    paddingTop: 12,
  },
  badgeRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6f2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#b8c1d2',
  },
  badgeDotActive: {
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: colors.success,
  },
});
