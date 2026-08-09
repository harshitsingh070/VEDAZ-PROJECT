import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useChat } from '../context/ChatContext';
import { colors } from '../theme';

const TYPING_THROTTLE_MS = 1200;

export default function MessageInput() {
  const { sendMessage, emitTyping } = useChat();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [lastTypingAt, setLastTypingAt] = useState(0);
  const [sending, setSending] = useState(false);

  function handleChange(value) {
    setText(value);
    const now = Date.now();
    if (value.trim() && now - lastTypingAt > TYPING_THROTTLE_MS) {
      setLastTypingAt(now);
      emitTyping(true);
    }
  }

  async function handleSend() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    emitTyping(false);
    try {
      await sendMessage(content);
      setText('');
    } catch {
      // error surfaced via the context banner
    } finally {
      setSending(false);
    }
  }

  function handleKeyPress(event) {
    const key = (event.nativeEvent && event.nativeEvent.key) || event.key;
    const shiftKey =
      (event.nativeEvent && event.nativeEvent.shiftKey) || event.shiftKey;
    const isComposing =
      event.nativeEvent && event.nativeEvent.isComposing === true;

    if (key === 'Enter' && !shiftKey && !isComposing) {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      handleSend();
    }
  }

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
          blurOnSubmit={false}
          accessibilityLabel="Message input"
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
          pressed && canSend && styles.sendButtonPressed,
        ]}
        onPress={handleSend}
        disabled={!canSend}
        accessibilityLabel="Send message"
      >
        <Text style={styles.sendIcon}>{'\u2192'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#f1f4fb',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 11,
    justifyContent: 'center',
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  input: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccd6ee',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 1,
  },
});
