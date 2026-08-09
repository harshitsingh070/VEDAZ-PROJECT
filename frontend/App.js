import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import { ChatProvider } from './src/context/ChatContext';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoginScreen onLogin={setUser} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ChatProvider user={user}>
        <ChatScreen user={user} onLogout={() => setUser(null)} />
      </ChatProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
});
