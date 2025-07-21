import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useProfile } from '../contexts/ProfileContext';
import BluetoothService from '../services/BluetoothService';
import MessageBubble from '../components/MessageBubble';
import { generateDeviceId } from '../utils/storage';

const ChatScreen = ({ navigation, route }) => {
  const { profile } = useProfile();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const device = route.params?.device;
    const existingSession = route.params?.existingSession;
    
    if (device) {
      setConnectedDevice(device);
      setIsConnected(true);
    }

    // Load existing session if available
    if (existingSession) {
      setCurrentSession(existingSession);
      setMessages(existingSession.messages || []);
      BluetoothService.setCurrentSession(existingSession);
    }

    // Set up navigation header
    navigation.setOptions({
      title: device?.name || 'Chat',
      headerRight: () => (
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnect}
        >
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      ),
    });

    // Listen for incoming messages
    const messageListener = async (message) => {
      // Add message to session storage
      await BluetoothService.addMessageToCurrentSession(message.text, 'other');
      
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom();
    };

    // Listen for connection changes
    const connectionListener = (connected, device) => {
      setIsConnected(connected);
      if (!connected) {
        Alert.alert(
          'Connection Lost',
          'The Bluetooth connection has been lost.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    };

    BluetoothService.addMessageListener(messageListener);
    BluetoothService.addConnectionListener(connectionListener);

    // Add welcome message only for new connections
    if (!existingSession) {
      const welcomeMessage = {
        text: `Connected to ${device?.name || 'device'}. Start chatting!`,
        timestamp: new Date().toISOString(),
        sender: 'system',
      };
      setMessages([welcomeMessage]);
    }

    return () => {
      BluetoothService.removeMessageListener(messageListener);
      BluetoothService.removeConnectionListener(connectionListener);
    };
  }, [route.params?.device, navigation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to a device first');
      return;
    }

    try {
      const messageData = await BluetoothService.sendMessage(inputText.trim());
      
      // Add message to session storage
      await BluetoothService.addMessageToCurrentSession(messageData.text, 'me');
      
      setMessages(prevMessages => [...prevMessages, messageData]);
      setInputText('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: async () => {
            await BluetoothService.disconnectDevice();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <MessageBubble
        message={item}
        isMe={item.sender === 'me'}
      />
    );
  };

  const renderConnectionStatus = () => (
    <View style={[styles.connectionStatus, isConnected ? styles.connected : styles.disconnected]}>
      <View style={[styles.statusIndicator, isConnected ? styles.connectedIndicator : styles.disconnectedIndicator]} />
      <Text style={[styles.statusText, isConnected ? styles.connectedText : styles.disconnectedText]}>
        {isConnected ? `Connected to ${connectedDevice?.name}` : 'Disconnected'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {renderConnectionStatus()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999999"
          multiline
          maxLength={500}
          editable={isConnected}
        />
        <TouchableOpacity
          style={[styles.sendButton, !isConnected && styles.disabledSendButton]}
          onPress={handleSendMessage}
          disabled={!isConnected || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  connected: {
    backgroundColor: '#E8F5E8',
  },
  disconnected: {
    backgroundColor: '#FFEBEE',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectedIndicator: {
    backgroundColor: '#4CAF50',
  },
  disconnectedIndicator: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  connectedText: {
    color: '#2E7D32',
  },
  disconnectedText: {
    color: '#C62828',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
    color: '#333333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disconnectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatScreen;