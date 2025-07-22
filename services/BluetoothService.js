import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { 
  saveChatSession, 
  updateSessionActiveStatus, 
  addMessageToSession,
  generateDeviceId,
  generateMessageId 
} from '../utils/storage';
import safeStorage from '../utils/safeStorage';

class BluetoothService {
  constructor() {
    this.connectedDevice = null;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.currentSession = null;
  }

  // Enhanced permission request with better error handling
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        console.log('🔍 Requesting Bluetooth permissions...');
        
        // For Android 12+ (API 31+), we need different permissions
        const androidVersion = Platform.Version;
        let permissions = [];
        
        if (androidVersion >= 31) {
          // Android 12+ permissions
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        } else {
          // Android 11 and below permissions
          permissions = [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            'android.permission.BLUETOOTH',
            'android.permission.BLUETOOTH_ADMIN',
          ];
        }

        // Request permissions one by one for better debugging
        const results = {};
        for (const permission of permissions) {
          try {
            const result = await PermissionsAndroid.request(permission, {
              title: 'Bluetooth Permission',
              message: 'This app needs Bluetooth permissions to discover and connect to devices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            });
            results[permission] = result;
            console.log(`📱 Permission ${permission}: ${result}`);
          } catch (err) {
            console.warn(`❌ Error requesting ${permission}:`, err);
            results[permission] = PermissionsAndroid.RESULTS.DENIED;
          }
        }

        // Check if critical permissions are granted
        const criticalGranted = Object.values(results).some(result => 
          result === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!criticalGranted) {
          Alert.alert(
            'Permissions Required',
            'ChillChat needs Bluetooth and Location permissions to work properly. Please grant these permissions in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: this.openAppSettings }
            ]
          );
        }

        console.log('✅ Permission request completed:', criticalGranted);
        return criticalGranted;
      } catch (err) {
        console.warn('❌ Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  // Open app settings for manual permission grant
  openAppSettings() {
    try {
      const { openSettings } = require('react-native-android-open-settings');
      openSettings();
    } catch (error) {
      console.log('Could not open settings automatically');
      Alert.alert(
        'Manual Setup Required',
        'Please go to Settings → Apps → ChillChat → Permissions and enable all permissions.',
        [{ text: 'OK' }]
      );
    }
  }

  // Enhanced Bluetooth status check
  async isBluetoothEnabled() {
    try {
      console.log('🔍 Checking Bluetooth availability...');
      
      // First check if Bluetooth is available on device
      const isAvailable = await RNBluetoothClassic.isBluetoothAvailable();
      if (!isAvailable) {
        console.log('❌ Bluetooth not available on this device');
        return false;
      }

      // Then check if it's enabled
      const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
      console.log(`📶 Bluetooth enabled: ${isEnabled}`);
      return isEnabled;
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      // Return true to allow user to try anyway
      return true;
    }
  }

  // Enhanced Bluetooth enable with user guidance
  async enableBluetooth() {
    try {
      console.log('🔄 Attempting to enable Bluetooth...');
      
      // Try to request Bluetooth enable
      const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
      
      if (!enabled) {
        Alert.alert(
          'Enable Bluetooth Manually',
          'Please enable Bluetooth manually in your device settings:\n\n1. Go to Settings\n2. Tap Bluetooth\n3. Turn ON the toggle\n4. Return to ChillChat',
          [{ text: 'OK' }]
        );
      }
      
      return enabled;
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      Alert.alert(
        'Bluetooth Setup',
        'Please enable Bluetooth manually in your device settings and restart the app.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  // Enhanced device discovery with better error handling
  async getBondedDevices() {
    try {
      console.log('🔍 Getting bonded devices...');
      const devices = await RNBluetoothClassic.getBondedDevices();
      console.log(`📱 Found ${devices.length} bonded devices`);
      
      return devices.map(device => ({
        id: device.address,
        name: device.name || `Device ${device.address.slice(-4)}`,
        address: device.address,
        bonded: true,
      }));
    } catch (error) {
      console.error('❌ Error getting bonded devices:', error);
      return [];
    }
  }

  // Enhanced discovery with timeout and retry
  async startDiscovery() {
    try {
      console.log('🔍 Starting device discovery...');
      
      // Cancel any ongoing discovery first
      try {
        await RNBluetoothClassic.cancelDiscovery();
      } catch (e) {
        // Ignore error if no discovery was running
      }

      // Start fresh discovery with timeout
      const discoveryPromise = RNBluetoothClassic.startDiscovery();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Discovery timeout')), 12000)
      );

      const devices = await Promise.race([discoveryPromise, timeoutPromise]);
      console.log(`📱 Discovered ${devices.length} new devices`);
      
      return devices.map(device => ({
        id: device.address,
        name: device.name || `Device ${device.address.slice(-4)}`,
        address: device.address,
        bonded: false,
      }));
    } catch (error) {
      console.error('❌ Error during device discovery:', error);
      
      if (error.message === 'Discovery timeout') {
        Alert.alert(
          'Discovery Timeout',
          'Device discovery is taking longer than expected. Make sure other devices are discoverable and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Discovery Error',
          'Could not scan for devices. Please check Bluetooth permissions and try again.',
          [{ text: 'OK' }]
        );
      }
      return [];
    }
  }

  // Connect to a device
  async connectToDevice(deviceAddress) {
    try {
      if (this.connectedDevice) {
        await this.disconnectDevice();
      }

      console.log('Attempting to connect to:', deviceAddress);
      const device = await RNBluetoothClassic.connectToDevice(deviceAddress);
      
      if (device) {
        this.connectedDevice = device;
        await this.createOrUpdateSession(device);
        this.startListeningForMessages();
        this.notifyConnectionListeners(true, device);
        return device;
      }
      return null;
    } catch (error) {
      console.error('Error connecting to device:', error);
      this.notifyConnectionListeners(false, null);
      return null;
    }
  }

  // Disconnect from current device
  async disconnectDevice() {
    try {
      if (this.connectedDevice && this.currentSession) {
        await updateSessionActiveStatus(this.currentSession.deviceId, false);
        await this.connectedDevice.disconnect();
        this.connectedDevice = null;
        this.currentSession = null;
        this.notifyConnectionListeners(false, null);
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  }

  // Send message to connected device
  async sendMessage(message) {
    try {
      if (!this.connectedDevice) {
        throw new Error('No device connected');
      }

      const messageData = {
        text: message,
        timestamp: new Date().toISOString(),
        sender: 'me',
      };

      await this.connectedDevice.write(JSON.stringify(messageData));
      return messageData;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Start listening for incoming messages
  startListeningForMessages() {
    if (!this.connectedDevice) return;

    this.connectedDevice.onDataReceived((data) => {
      try {
        const messageData = JSON.parse(data.data);
        const receivedMessage = {
          text: messageData.text,
          timestamp: messageData.timestamp || new Date().toISOString(),
          sender: 'other',
        };
        this.notifyMessageListeners(receivedMessage);
      } catch (error) {
        // If JSON parsing fails, treat as plain text
        const receivedMessage = {
          text: data.data,
          timestamp: new Date().toISOString(),
          sender: 'other',
        };
        this.notifyMessageListeners(receivedMessage);
      }
    });
  }

  // Add message listener
  addMessageListener(callback) {
    this.messageListeners.push(callback);
  }

  // Remove message listener
  removeMessageListener(callback) {
    this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
  }

  // Notify all message listeners
  notifyMessageListeners(message) {
    this.messageListeners.forEach(listener => listener(message));
  }

  // Add connection listener
  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
  }

  // Remove connection listener
  removeConnectionListener(callback) {
    this.connectionListeners = this.connectionListeners.filter(listener => listener !== callback);
  }

  // Notify all connection listeners
  notifyConnectionListeners(isConnected, device) {
    this.connectionListeners.forEach(listener => listener(isConnected, device));
  }

  // Get current connection status
  isConnected() {
    return this.connectedDevice !== null;
  }

  // Get connected device info
  getConnectedDevice() {
    return this.connectedDevice;
  }

  // Create or update chat session
  async createOrUpdateSession(device) {
    try {
      const deviceId = generateDeviceId(device.address);
      const session = {
        deviceId,
        deviceName: device.name || 'Unknown Device',
        deviceAddress: device.address,
        lastConnected: new Date().toISOString(),
        messages: [],
        isActive: true,
      };

      this.currentSession = session;
      await saveChatSession(session);
      await updateSessionActiveStatus(deviceId, true);
    } catch (error) {
      console.error('Error creating/updating session:', error);
    }
  }

  // Add message to current session
  async addMessageToCurrentSession(messageText, sender) {
    try {
      if (!this.currentSession) return null;

      const message = {
        id: generateMessageId(),
        text: messageText,
        timestamp: new Date().toISOString(),
        sender: sender,
      };

      await addMessageToSession(this.currentSession.deviceId, message);
      return message;
    } catch (error) {
      console.error('Error adding message to session:', error);
      return null;
    }
  }

  // Get current session
  getCurrentSession() {
    return this.currentSession;
  }

  // Set existing session
  setCurrentSession(session) {
    this.currentSession = session;
  }
}

// Export singleton instance
export default new BluetoothService();