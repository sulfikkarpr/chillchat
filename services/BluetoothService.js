import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform } from 'react-native';

class BluetoothService {
  constructor() {
    this.connectedDevice = null;
    this.messageListeners = [];
    this.connectionListeners = [];
  }

  // Request necessary permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  // Check if Bluetooth is enabled
  async isBluetoothEnabled() {
    try {
      return await RNBluetoothClassic.isBluetoothEnabled();
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return false;
    }
  }

  // Enable Bluetooth
  async enableBluetooth() {
    try {
      return await RNBluetoothClassic.requestBluetoothEnabled();
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  // Get bonded devices
  async getBondedDevices() {
    try {
      const devices = await RNBluetoothClassic.getBondedDevices();
      return devices.map(device => ({
        id: device.address,
        name: device.name || 'Unknown Device',
        address: device.address,
        bonded: true,
      }));
    } catch (error) {
      console.error('Error getting bonded devices:', error);
      return [];
    }
  }

  // Start discovery for nearby devices
  async startDiscovery() {
    try {
      const devices = await RNBluetoothClassic.startDiscovery();
      return devices.map(device => ({
        id: device.address,
        name: device.name || 'Unknown Device',
        address: device.address,
        bonded: false,
      }));
    } catch (error) {
      console.error('Error during device discovery:', error);
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
      if (this.connectedDevice) {
        await this.connectedDevice.disconnect();
        this.connectedDevice = null;
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
}

// Export singleton instance
export default new BluetoothService();