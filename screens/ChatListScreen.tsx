import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChatSession, getChatSessions, deleteChatSession, formatTimestamp } from '../utils/storage';
import { useProfile } from '../contexts/ProfileContext';

interface ChatListScreenProps {
  navigation: any;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { profile } = useProfile();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load sessions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const loadSessions = async () => {
    try {
      const chatSessions = await getChatSessions();
      // Sort sessions by last connected time (most recent first)
      const sortedSessions = chatSessions.sort((a, b) => 
        new Date(b.lastConnected).getTime() - new Date(a.lastConnected).getTime()
      );
      setSessions(sortedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleSessionPress = (session: ChatSession) => {
    navigation.navigate('Chat', {
      device: {
        name: session.deviceName,
        address: session.deviceAddress,
      },
      existingSession: session,
    });
  };

  const handleDeleteSession = (sessionId: string, deviceName: string) => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete your chat with ${deviceName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatSession(sessionId);
              await loadSessions();
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete chat session');
            }
          },
        },
      ]
    );
  };

  const getLastMessagePreview = (session: ChatSession): string => {
    if (session.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = session.messages[session.messages.length - 1];
    const maxLength = 50;
    
    if (lastMessage.text.length > maxLength) {
      return lastMessage.text.substring(0, maxLength) + '...';
    }
    
    return lastMessage.text;
  };

  const renderSessionItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={[styles.sessionItem, item.isActive && styles.activeSession]}
      onPress={() => handleSessionPress(item)}
      onLongPress={() => handleDeleteSession(item.deviceId, item.deviceName)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.deviceName}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, item.isActive ? styles.activeDot : styles.inactiveDot]} />
            <Text style={styles.statusText}>
              {item.isActive ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <View style={styles.sessionMeta}>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.lastConnected)}
          </Text>
          {item.messages.length > 0 && (
            <View style={styles.messageBadge}>
              <Text style={styles.messageCount}>{item.messages.length}</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.lastMessage}>
        {getLastMessagePreview(item)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No Chat Sessions</Text>
      <Text style={styles.emptyMessage}>
        Start a conversation by scanning for devices in the Home tab
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.scanButtonText}>Scan for Devices</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {profile.nickname} {profile.avatar}
        </Text>
      </View>

      {sessions.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.deviceId}
          style={styles.sessionsList}
          contentContainerStyle={styles.sessionsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Long press a chat to delete it
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    opacity: 0.9,
  },
  sessionsList: {
    flex: 1,
  },
  sessionsContainer: {
    padding: 16,
  },
  sessionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeSession: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  sessionMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  messageBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  messageCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ChatListScreen;