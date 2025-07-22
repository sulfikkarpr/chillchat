import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform } from 'react-native';
import { 
  saveChatSession, 
  updateSessionActiveStatus, 
  addMessageToSession,
  generateDeviceId,
  generateMessageId 
} from '../utils/storage';
import safeStorage from '../utils/safeStorage';

class BluetoothServiceFixed {
  constructor() {
    this.connectedDevice = null;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.currentSession = null;
    this.bluetoothStatus = {
      enabled: false,
      available: false,
      permissionsGranted: false
    };
  }

  // Enhanced permission request with detailed logging
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        console.log('🔍 Requesting Bluetooth permissions...');
        
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        // Check current permission status first
        for (const permission of permissions) {
          const status = await PermissionsAndroid.check(permission);
          console.log(`📋 Permission ${permission}: ${status}`);
        }

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        console.log('📱 Permission results:', granted);

        const allGranted = (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );

        this.bluetoothStatus.permissionsGranted = allGranted;
        console.log(`✅ All permissions granted: ${allGranted}`);
        
        return allGranted;
      } catch (err) {
        console.error('❌ Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  // Enhanced Bluetooth availability check with fallbacks
  async isBluetoothAvailable() {
    try {
      console.log('🔍 Checking Bluetooth availability...');
      
      // Method 1: Check if Bluetooth is available
      const available = await RNBluetoothClassic.isBluetoothAvailable();
      console.log(`📶 Bluetooth available: ${available}`);
      
      this.bluetoothStatus.available = available;
      return available;
    } catch (error) {
      console.error('❌ Error checking Bluetooth availability:', error);
      // Assume available if we can't check (fallback)
      this.bluetoothStatus.available = true;
      return true;
    }
  }

  // Enhanced Bluetooth enabled check with fallbacks
  async isBluetoothEnabled() {
    try {
      console.log('🔍 Checking if Bluetooth is enabled...');
      
      // First check if Bluetooth is available
      await this.isBluetoothAvailable();
      
      if (!this.bluetoothStatus.available) {
        console.log('📶 Bluetooth not available on device');
        return false;
      }

      // Method 1: Standard check
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      console.log(`📶 Bluetooth enabled (method 1): ${enabled}`);
      
      this.bluetoothStatus.enabled = enabled;
      return enabled;
      
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      
      // Fallback method: Try to get bonded devices
      try {
        console.log('🔄 Trying fallback method...');
        await RNBluetoothClassic.getBondedDevices();
        console.log('✅ Fallback check: Bluetooth appears to be working');
        this.bluetoothStatus.enabled = true;
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback check failed:', fallbackError);
        this.bluetoothStatus.enabled = false;
        return false;
      }
    }
  }

  // Force enable Bluetooth with better error handling
  async enableBluetooth() {
    try {
      console.log('🔄 Attempting to enable Bluetooth...');
      
      const result = await RNBluetoothClassic.requestBluetoothEnabled();
      console.log(`📶 Bluetooth enable result: ${result}`);
      
      // Wait a moment and check again
      setTimeout(async () => {
        const isEnabled = await this.isBluetoothEnabled();
        console.log(`📶 Bluetooth status after enable attempt: ${isEnabled}`);
      }, 1000);
      
      return result;
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  // Get comprehensive Bluetooth status
  async getBluetoothStatus() {
    const permissionsGranted = await this.requestPermissions();
    const available = await this.isBluetoothAvailable();
    const enabled = await this.isBluetoothEnabled();
    
    const status = {
      permissionsGranted,
      available,
      enabled,
      ready: permissionsGranted && available && enabled
    };
    
    console.log('📋 Complete Bluetooth status:', status);
    return status;
  }

  // Get bonded devices with enhanced error handling
  async getBondedDevices() {
    try {
      console.log('🔍 Getting bonded devices...');
      const devices = await RNBluetoothClassic.getBondedDevices();
      console.log(`📱 Found ${devices.length} bonded devices`);
      
      return devices.map(device => ({
        id: device.address,
        name: device.name || 'Unknown Device',
        address: device.address,
        bonded: true,
      }));
    } catch (error) {
      console.error('❌ Error getting bonded devices:', error);
      return [];
    }
  }

  // Start discovery with enhanced logging
  async startDiscovery() {
    try {
      console.log('🔍 Starting device discovery...');
      
      // Check status first
      const status = await this.getBluetoothStatus();
      if (!status.ready) {
        throw new Error(`Bluetooth not ready: ${JSON.stringify(status)}`);
      }
      
      const devices = await RNBluetoothClassic.startDiscovery();
      console.log(`📱 Discovery found ${devices.length} devices`);
      
      return devices.map(device => ({
        id: device.address,
        name: device.name || 'Unknown Device',
        address: device.address,
        bonded: false,
      }));
    } catch (error) {
      console.error('❌ Error during device discovery:', error);
      throw error;
    }
  }

  // Combined method for getting all available devices
  async startDeviceDiscovery() {
    try {
      console.log('🔍 Starting comprehensive device discovery...');
      
      const [bondedDevices, discoveredDevices] = await Promise.all([
        this.getBondedDevices(),
        this.startDiscovery().catch(() => []) // Don't fail if discovery fails
      ]);
      
      const allDevices = [...bondedDevices, ...discoveredDevices];
      console.log(`📱 Total devices found: ${allDevices.length}`);
      
      return allDevices;
    } catch (error) {
      console.error('❌ Error in device discovery:', error);
      // Return bonded devices as fallback
      return await this.getBondedDevices();
    }
  }

  // Rest of the methods remain the same but with enhanced logging...
  async connectToDevice(deviceAddress) {
    try {
      console.log(`🔗 Connecting to device: ${deviceAddress}`);
      
      if (this.connectedDevice) {
        await this.disconnectDevice();
      }

      const device = await RNBluetoothClassic.connectToDevice(deviceAddress);
      this.connectedDevice = device;
      
      console.log(`✅ Connected to: ${device.name || deviceAddress}`);

      // Create or update session
      await this.createOrUpdateSession(device);

      // Start listening for messages
      this.startMessageListener();

      // Notify connection listeners
      this.notifyConnectionListeners(true, device);

      return device;
    } catch (error) {
      console.error('❌ Error connecting to device:', error);
      throw error;
    }
  }

  async createOrUpdateSession(device) {
    try {
      const sessionData = {
        deviceId: generateDeviceId(),
        deviceName: device.name || 'Unknown Device',
        deviceAddress: device.address,
        startTime: new Date().toISOString(),
        isActive: true,
        messages: []
      };

      await saveChatSession(device.address, sessionData);
      this.currentSession = sessionData;
      console.log(`💾 Session created for: ${device.name}`);
    } catch (error) {
      console.error('❌ Error creating session:', error);
    }
  }

  async sendMessage(message) {
    try {
      if (!this.connectedDevice) {
        throw new Error('No device connected');
      }

      console.log(`📤 Sending message: ${message}`);
      await RNBluetoothClassic.writeToDevice(this.connectedDevice.address, message);

      // Add to session
      await this.addMessageToCurrentSession(message, true);
      
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  async addMessageToCurrentSession(messageText, isSent = false) {
    try {
      if (!this.currentSession) {
        return;
      }

      const messageData = {
        id: generateMessageId(),
        text: messageText,
        timestamp: new Date().toISOString(),
        isSent: isSent
      };

      await addMessageToSession(this.currentSession.deviceAddress, messageData);
      console.log(`💾 Message saved to session`);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  }

  startMessageListener() {
    try {
      if (!this.connectedDevice) {
        return;
      }

      console.log('👂 Starting message listener...');
      
      const listener = RNBluetoothClassic.onDeviceRead(async (data) => {
        console.log(`📥 Received message: ${data.data}`);
        
        // Add to session
        await this.addMessageToCurrentSession(data.data, false);
        
        // Notify message listeners
        this.notifyMessageListeners(data.data);
      });

      this.messageListeners.push(listener);
    } catch (error) {
      console.error('❌ Error starting message listener:', error);
    }
  }

  async disconnectDevice() {
    try {
      if (this.connectedDevice) {
        console.log(`🔌 Disconnecting from: ${this.connectedDevice.name}`);
        
        await RNBluetoothClassic.disconnectFromDevice(this.connectedDevice.address);
        
        // Update session status
        if (this.currentSession) {
          await updateSessionActiveStatus(this.currentSession.deviceAddress, false);
        }

        this.connectedDevice = null;
        this.currentSession = null;

        // Clean up listeners
        this.messageListeners.forEach(listener => listener.remove());
        this.messageListeners = [];

        // Notify connection listeners
        this.notifyConnectionListeners(false, null);
        
        console.log('✅ Device disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting device:', error);
    }
  }

  // Listener management
  addMessageListener(callback) {
    this.messageListeners.push({ callback });
  }

  addConnectionListener(callback) {
    this.connectionListeners.push({ callback });
  }

  notifyMessageListeners(message) {
    this.messageListeners.forEach(listener => {
      if (listener.callback) {
        listener.callback(message);
      }
    });
  }

  notifyConnectionListeners(isConnected, device) {
    this.connectionListeners.forEach(listener => {
      if (listener.callback) {
        listener.callback(isConnected, device);
      }
    });
  }

  // Get current connection status
  isConnected() {
    return this.connectedDevice !== null;
  }

  getConnectedDevice() {
    return this.connectedDevice;
  }
}

export default new BluetoothServiceFixed();