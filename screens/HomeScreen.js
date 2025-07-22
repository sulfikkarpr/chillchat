import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking,
} from 'react-native';
import { useProfile } from '../contexts/ProfileContext';
import BluetoothService from '../services/BluetoothService';
import DeviceItem from '../components/DeviceItem';
import TestingPanel from '../components/TestingPanel';

const HomeScreen = ({ navigation }) => {
  const { profile } = useProfile();
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(null);
  const [showTestingPanel, setShowTestingPanel] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    initializeBluetooth();
  }, []);

  const initializeBluetooth = async () => {
    try {
      console.log('🚀 Initializing Bluetooth...');
      
      // Step 1: Request permissions
      const permissionsGranted = await BluetoothService.requestPermissions();
      setPermissionsGranted(permissionsGranted);
      
      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Required',
          'ChillChat needs Bluetooth and Location permissions to discover devices. Please grant permissions and restart the app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: initializeBluetooth },
            { text: 'Settings', onPress: openAppSettings },
          ]
        );
        setInitializationComplete(true);
        return;
      }

      // Step 2: Check if Bluetooth is enabled
      const enabled = await BluetoothService.isBluetoothEnabled();
      setIsBluetoothEnabled(enabled);

      if (!enabled) {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth to discover and connect to devices.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable Bluetooth', onPress: enableBluetooth },
          ]
        );
      } else {
        // Step 3: Load initial devices
        await loadBondedDevices();
      }
      
      setInitializationComplete(true);
    } catch (error) {
      console.error('❌ Error initializing Bluetooth:', error);
      Alert.alert(
        'Initialization Error', 
        'Failed to initialize Bluetooth. Please restart the app and try again.',
        [{ text: 'OK' }]
      );
      setInitializationComplete(true);
    }
  };

  const openAppSettings = () => {
    try {
      Linking.openSettings();
    } catch (error) {
      Alert.alert(
        'Manual Setup Required',
        'Please go to Settings → Apps → ChillChat → Permissions and enable:\n\n• Location\n• Nearby devices (Bluetooth)\n• Storage',
        [{ text: 'OK' }]
      );
    }
  };

  const enableBluetooth = async () => {
    try {
      const enabled = await BluetoothService.enableBluetooth();
      setIsBluetoothEnabled(enabled);
      if (enabled) {
        await loadBondedDevices();
      }
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      Alert.alert(
        'Bluetooth Error', 
        'Could not enable Bluetooth automatically. Please enable it manually in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadBondedDevices = async () => {
    try {
      console.log('📱 Loading bonded devices...');
      const bondedDevices = await BluetoothService.getBondedDevices();
      setDevices(bondedDevices);
      console.log(`✅ Loaded ${bondedDevices.length} bonded devices`);
    } catch (error) {
      console.error('❌ Error loading bonded devices:', error);
    }
  };

  const scanForDevices = async () => {
    // Allow scanning even if Bluetooth appears disabled - let the service handle it
    if (!permissionsGranted) {
      Alert.alert(
        'Permissions Required',
        'Please grant Bluetooth permissions first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permissions', onPress: initializeBluetooth },
        ]
      );
      return;
    }

    setIsScanning(true);
    try {
      console.log('🔍 Starting device scan...');
      
      // First load bonded devices
      const bondedDevices = await BluetoothService.getBondedDevices();
      
      // Then discover new devices
      const discoveredDevices = await BluetoothService.startDiscovery();
      
      // Combine both lists, avoiding duplicates
      const allDevices = [...bondedDevices];
      discoveredDevices.forEach(discovered => {
        if (!allDevices.find(device => device.address === discovered.address)) {
          allDevices.push(discovered);
        }
      });
      
      setDevices(allDevices);
      console.log(`✅ Found total of ${allDevices.length} devices`);
      
      if (allDevices.length === 0) {
        Alert.alert(
          'No Devices Found',
          'Make sure other devices have Bluetooth enabled and are discoverable. You can also try:\n\n• Move closer to other devices\n• Make sure other devices are not already connected\n• Try scanning again',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error scanning for devices:', error);
      Alert.alert(
        'Scan Error', 
        'Could not scan for devices. Please check your Bluetooth settings and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device) => {
    if (connectingDevice === device.address) return;
    
    setConnectingDevice(device.address);
    try {
      console.log(`🔗 Connecting to ${device.name} (${device.address})`);
      const connectedDevice = await BluetoothService.connectToDevice(device.address);
      if (connectedDevice) {
        console.log('✅ Connected successfully!');
        navigation.navigate('Chat', { 
          device: connectedDevice,
          fromDiscovery: true 
        });
      } else {
        Alert.alert(
          'Connection Failed', 
          `Could not connect to ${device.name}. Make sure the device is nearby and available for pairing.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error connecting to device:', error);
      Alert.alert(
        'Connection Error', 
        `Failed to connect to ${device.name}. Please make sure:\n\n• The device is nearby\n• The device is not connected to another app\n• Try pairing the device first in system settings`,
        [{ text: 'OK' }]
      );
    } finally {
      setConnectingDevice(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBondedDevices();
    setRefreshing(false);
  };

  const renderDevice = ({ item }) => (
    <DeviceItem
      device={item}
      onPress={() => connectToDevice(item)}
      isConnecting={connectingDevice === item.address}
    />
  );

  const getButtonText = () => {
    if (isScanning) return 'Scanning...';
    if (!permissionsGranted) return 'Grant Permissions';
    if (!isBluetoothEnabled) return 'Enable Bluetooth';
    return 'Scan for Devices';
  };

  const getButtonDisabled = () => {
    return isScanning; // Only disable while actually scanning
  };

  const handleButtonPress = () => {
    if (!permissionsGranted) {
      initializeBluetooth();
    } else if (!isBluetoothEnabled) {
      enableBluetooth();
    } else {
      scanForDevices();
    }
  };

  const getEmptyStateText = () => {
    if (!initializationComplete) {
      return 'Initializing Bluetooth...';
    }
    if (!permissionsGranted) {
      return 'Please grant Bluetooth permissions to discover devices.';
    }
    if (!isBluetoothEnabled) {
      return 'Please enable Bluetooth to see available devices.';
    }
    if (devices.length === 0) {
      return 'No devices found. Tap "Scan for Devices" to search for nearby Bluetooth devices.';
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Discover Devices</Text>
        <Text style={styles.subtitle}>Welcome {profile.nickname} {profile.avatar}</Text>
        
        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            📶 Bluetooth: {isBluetoothEnabled ? '✅ Enabled' : '❌ Disabled'} | 
            🔐 Permissions: {permissionsGranted ? '✅ Granted' : '❌ Pending'}
          </Text>
        </View>
        
        {/* Testing Button */}
        <TouchableOpacity 
          style={styles.testingButton}
          onPress={() => setShowTestingPanel(true)}
        >
          <Text style={styles.testingButtonText}>🧪 Testing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={[
              styles.scanButton, 
              getButtonDisabled() && styles.disabledButton
            ]}
            onPress={handleButtonPress}
            disabled={getButtonDisabled()}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.scanButtonText}>
                {getButtonText()}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Help text */}
          <Text style={styles.helpText}>
            💡 Tip: Make sure other devices have Bluetooth enabled and are discoverable
          </Text>
        </View>

        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>
            Available Devices ({devices.length})
          </Text>
          
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {getEmptyStateText()}
              </Text>
              {!permissionsGranted && (
                <TouchableOpacity 
                  style={styles.settingsButton}
                  onPress={openAppSettings}
                >
                  <Text style={styles.settingsButtonText}>
                    Open App Settings
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={devices}
              renderItem={renderDevice}
              keyExtractor={(item) => item.address}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </View>
      
      {/* Testing Panel */}
      <TestingPanel
        visible={showTestingPanel}
        onClose={() => setShowTestingPanel(false)}
        currentScreen="Discover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    opacity: 0.9,
    marginBottom: 10,
  },
  statusContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scanSection: {
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  devicesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testingButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  testingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;