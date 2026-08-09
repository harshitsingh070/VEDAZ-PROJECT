import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDay } from '../utils/format';
import { colors } from '../theme';

export default function DayDivider({ date }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{formatDay(date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    backgroundColor: '#e2e8f4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
