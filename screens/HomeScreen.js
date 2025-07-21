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
} from 'react-native';
import BluetoothService from '../services/BluetoothService';

const HomeScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeBluetooth();
  }, []);

  const initializeBluetooth = async () => {
    try {
      // Request permissions
      const permissionsGranted = await BluetoothService.requestPermissions();
      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Required',
          'This app needs Bluetooth permissions to function properly.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if Bluetooth is enabled
      const enabled = await BluetoothService.isBluetoothEnabled();
      setIsBluetoothEnabled(enabled);

      if (!enabled) {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth to use this app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable', onPress: enableBluetooth },
          ]
        );
      } else {
        loadBondedDevices();
      }
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      Alert.alert('Error', 'Failed to initialize Bluetooth');
    }
  };

  const enableBluetooth = async () => {
    try {
      const enabled = await BluetoothService.enableBluetooth();
      setIsBluetoothEnabled(enabled);
      if (enabled) {
        loadBondedDevices();
      }
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      Alert.alert('Error', 'Failed to enable Bluetooth');
    }
  };

  const loadBondedDevices = async () => {
    try {
      const bondedDevices = await BluetoothService.getBondedDevices();
      setDevices(bondedDevices);
    } catch (error) {
      console.error('Error loading bonded devices:', error);
    }
  };

  const scanForDevices = async () => {
    if (!isBluetoothEnabled) {
      Alert.alert('Bluetooth Disabled', 'Please enable Bluetooth first');
      return;
    }

    setIsScanning(true);
    try {
      const bondedDevices = await BluetoothService.getBondedDevices();
      const discoveredDevices = await BluetoothService.startDiscovery();
      
      // Combine bonded and discovered devices, avoiding duplicates
      const allDevices = [...bondedDevices];
      discoveredDevices.forEach(discovered => {
        if (!allDevices.find(device => device.address === discovered.address)) {
          allDevices.push(discovered);
        }
      });
      
      setDevices(allDevices);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      Alert.alert('Error', 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device) => {
    try {
      Alert.alert(
        'Connect to Device',
        `Do you want to connect to ${device.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: async () => {
              const connectedDevice = await BluetoothService.connectToDevice(device.address);
              if (connectedDevice) {
                Alert.alert('Success', 'Connected to device!', [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Chat', { device: connectedDevice }),
                  },
                ]);
              } else {
                Alert.alert('Error', 'Failed to connect to device');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error connecting to device:', error);
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBondedDevices();
    setRefreshing(false);
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={[styles.deviceItem, item.bonded && styles.bondedDevice]}
      onPress={() => connectToDevice(item)}
      activeOpacity={0.7}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
        {item.bonded && (
          <Text style={styles.bondedLabel}>Paired</Text>
        )}
      </View>
      <View style={styles.connectIcon}>
        <Text style={styles.connectText}>Connect</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      <View style={styles.header}>
        <Text style={styles.title}>ChillChat</Text>
        <Text style={styles.subtitle}>Bluetooth Chat App</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={[styles.scanButton, !isBluetoothEnabled && styles.disabledButton]}
            onPress={scanForDevices}
            disabled={isScanning || !isBluetoothEnabled}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.scanButtonText}>
                {isBluetoothEnabled ? 'Scan for Devices' : 'Enable Bluetooth'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>
            Available Devices ({devices.length})
          </Text>
          
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {isBluetoothEnabled 
                  ? 'No devices found. Tap "Scan for Devices" to search.'
                  : 'Enable Bluetooth to see available devices.'
                }
              </Text>
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
  },
  deviceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bondedDevice: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  deviceAddress: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'monospace',
  },
  bondedLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 4,
  },
  connectIcon: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  connectText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;