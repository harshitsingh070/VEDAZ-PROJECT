import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as api from '../services/api';
import { createSocket } from '../services/socket';

const ChatContext = createContext(null);

export function ChatProvider({ user, children }) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);

  const upsertMessage = useCallback((message) => {
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === message.id);
      if (index === -1) return [...prev, message];
      const copy = prev.slice();
      copy[index] = message;
      return copy;
    });
  }, []);

  const acknowledgeRead = useCallback(
    (messageId) => {
      socketRef.current?.emit('message:read', { messageId });
    },
    []
  );

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers({});
    setError(null);

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('user:join', { userId: user.userId, username: user.username });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      setOnlineUsers([]);
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
      setError('Could not connect to the realtime server.');
    });

    socket.on('auth:error', ({ error: message }) => setError(message));

    socket.on('message:error', ({ error: message }) => setError(message));

    socket.on('message:new', (message) => {
      upsertMessage(message);
      if (message.senderId !== user.userId) {
        setTimeout(() => socket.emit('message:read', { messageId: message.id }), 400);
      }
    });

    socket.on('message:read', (message) => upsertMessage(message));

    socket.on('user:list', (list) => setOnlineUsers(list));

    socket.on('typing', ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) return { ...prev, [username]: true };
        const next = { ...prev };
        delete next[username];
        return next;
      });
    });

    socket.connect();

    api
      .fetchMessages()
      .then((history) => {
        setMessages(history);
        history
          .filter((m) => m.senderId !== user.userId)
          .forEach((m) => socket.emit('message:read', { messageId: m.id }));
      })
      .catch((err) => setError(err.message));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user.userId, user.username, upsertMessage]);

  const sendMessage = useCallback(
    async (text) => {
      setError(null);
      socketRef.current?.emit('typing:stop');
      try {
        const created = await api.sendMessage({
          senderId: user.userId,
          senderName: user.username,
          text,
        });
        upsertMessage(created);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user.userId, user.username, upsertMessage]
  );

  const emitTyping = useCallback(
    (isTyping) => {
      socketRef.current?.emit(isTyping ? 'typing:start' : 'typing:stop');
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  const value = {
    messages,
    onlineUsers,
    typingUsers,
    connectionStatus,
    error,
    sendMessage,
    emitTyping,
    acknowledgeRead,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside a ChatProvider');
  }
  return context;
}
