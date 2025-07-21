import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: 'me' | 'other';
  senderName?: string;
}

export interface ChatSession {
  deviceId: string;
  deviceName: string;
  deviceAddress: string;
  lastConnected: string;
  messages: ChatMessage[];
  isActive: boolean;
}

export interface AppSettings {
  autoConnect: boolean;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
}

// Storage keys
const CHAT_SESSIONS_KEY = '@chillchat_sessions';
const APP_SETTINGS_KEY = '@chillchat_settings';

// Chat Sessions Management
export const saveChatSession = async (session: ChatSession): Promise<void> => {
  try {
    const existingSessions = await getChatSessions();
    const sessionIndex = existingSessions.findIndex(s => s.deviceId === session.deviceId);
    
    if (sessionIndex >= 0) {
      existingSessions[sessionIndex] = session;
    } else {
      existingSessions.push(session);
    }
    
    await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(existingSessions));
  } catch (error) {
    console.error('Error saving chat session:', error);
    throw error;
  }
};

export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const sessionsData = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
    return sessionsData ? JSON.parse(sessionsData) : [];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

export const getChatSession = async (deviceId: string): Promise<ChatSession | null> => {
  try {
    const sessions = await getChatSessions();
    return sessions.find(s => s.deviceId === deviceId) || null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

export const deleteChatSession = async (deviceId: string): Promise<void> => {
  try {
    const sessions = await getChatSessions();
    const filteredSessions = sessions.filter(s => s.deviceId !== deviceId);
    await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filteredSessions));
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
};

export const clearAllChatSessions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAT_SESSIONS_KEY);
  } catch (error) {
    console.error('Error clearing chat sessions:', error);
    throw error;
  }
};

export const updateSessionActiveStatus = async (deviceId: string, isActive: boolean): Promise<void> => {
  try {
    const sessions = await getChatSessions();
    const sessionIndex = sessions.findIndex(s => s.deviceId === deviceId);
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex].isActive = isActive;
      if (isActive) {
        sessions[sessionIndex].lastConnected = new Date().toISOString();
      }
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

export const addMessageToSession = async (deviceId: string, message: ChatMessage): Promise<void> => {
  try {
    const sessions = await getChatSessions();
    const sessionIndex = sessions.findIndex(s => s.deviceId === deviceId);
    
    if (sessionIndex >= 0) {
      sessions[sessionIndex].messages.push(message);
      sessions[sessionIndex].lastConnected = new Date().toISOString();
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error adding message to session:', error);
    throw error;
  }
};

// App Settings Management
export const saveAppSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getAppSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const settingsData = await AsyncStorage.getItem(APP_SETTINGS_KEY);
    const defaultSettings: AppSettings = {
      autoConnect: false,
      theme: 'light',
      soundEnabled: true,
    };
    
    return settingsData ? { ...defaultSettings, ...JSON.parse(settingsData) } : defaultSettings;
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {
      autoConnect: false,
      theme: 'light',
      soundEnabled: true,
    };
  }
};

// Utility functions
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

export const generateDeviceId = (deviceAddress: string): string => {
  return deviceAddress.replace(/:/g, '_');
};