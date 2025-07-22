#!/bin/bash

# Force Enable Bluetooth Button - Override UI Logic
echo "🔧 Force Enabling Bluetooth Button (Nuclear Option)"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Creating a version that ALWAYS enables the Bluetooth button..."

# Backup original files
print_status "Step 1: Backing up original files..."
cp screens/HomeScreen.js screens/HomeScreen.js.backup.$(date +%s)
cp services/BluetoothService.js services/BluetoothService.js.backup.$(date +%s)

print_status "Step 2: Creating force-enabled HomeScreen..."

# Create a new HomeScreen that forces Bluetooth to be enabled
cat > screens/HomeScreen.js << 'EOF'
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
import { useProfile } from '../contexts/ProfileContext';
import BluetoothService from '../services/BluetoothService';
import DeviceItem from '../components/DeviceItem';
import TestingPanel from '../components/TestingPanel';

const HomeScreen = ({ navigation }) => {
  const { profile } = useProfile();
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(true); // FORCE ENABLED
  const [refreshing, setRefreshing] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(null);
  const [showTestingPanel, setShowTestingPanel] = useState(false);

  useEffect(() => {
    initializeBluetooth();
    
    // Set up navigation options with testing button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.testingButton}
          onPress={() => setShowTestingPanel(true)}
        >
          <Text style={styles.testingButtonText}>🧪 Testing</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const initializeBluetooth = async () => {
    try {
      console.log('🔧 FORCE ENABLED: Bluetooth button will always be clickable');
      
      // Request permissions but don't disable button if they fail
      const permissionsGranted = await BluetoothService.requestPermissions();
      if (!permissionsGranted) {
        console.log('⚠️ Permissions not granted, but button stays enabled');
        Alert.alert(
          'Permissions Needed',
          'This app needs Bluetooth permissions. Please grant them in Settings → Apps → ChillChatApp → Permissions',
          [{ text: 'OK' }]
        );
      }

      // Try to check Bluetooth but don't disable button if it fails
      try {
        const enabled = await BluetoothService.isBluetoothEnabled();
        console.log(`📶 Bluetooth status: ${enabled}`);
        setIsBluetoothEnabled(true); // ALWAYS TRUE
      } catch (error) {
        console.log('⚠️ Bluetooth check failed, but button stays enabled:', error);
        setIsBluetoothEnabled(true); // ALWAYS TRUE
      }

      // Try to load bonded devices
      loadBondedDevices();
      
    } catch (error) {
      console.error('❌ Error initializing Bluetooth:', error);
      setIsBluetoothEnabled(true); // ALWAYS TRUE EVEN ON ERROR
      Alert.alert('Info', 'Bluetooth initialization had issues, but you can still try to use the features.');
    }
  };

  const enableBluetooth = async () => {
    try {
      console.log('🔧 Attempting to enable Bluetooth...');
      
      const enabled = await BluetoothService.enableBluetooth();
      console.log(`📶 Enable result: ${enabled}`);
      
      if (enabled) {
        setIsBluetoothEnabled(true);
        loadBondedDevices();
        Alert.alert('Success', 'Bluetooth enabled successfully!');
      } else {
        // Even if enable fails, keep button enabled and show helpful message
        setIsBluetoothEnabled(true);
        Alert.alert(
          'Bluetooth Enable',
          'Please enable Bluetooth manually in your phone settings, then try scanning for devices.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      setIsBluetoothEnabled(true); // KEEP ENABLED EVEN ON ERROR
      Alert.alert(
        'Bluetooth Access',
        'Having trouble accessing Bluetooth. Please ensure:\n\n1. Bluetooth is ON in phone settings\n2. Location permission is granted\n3. Nearby devices permission is granted\n\nThen try scanning for devices.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadBondedDevices = async () => {
    try {
      console.log('🔍 Loading bonded devices...');
      const bondedDevices = await BluetoothService.getBondedDevices();
      console.log(`📱 Found ${bondedDevices.length} bonded devices`);
      setDevices(bondedDevices);
    } catch (error) {
      console.error('⚠️ Error loading bonded devices:', error);
      // Don't show error to user, just log it
    }
  };

  const startScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    try {
      console.log('🔍 Starting device scan...');
      
      Alert.alert(
        'Scanning for Devices',
        'Make sure nearby devices have Bluetooth enabled and are discoverable.',
        [{ text: 'OK' }]
      );

      const discoveredDevices = await BluetoothService.startDeviceDiscovery();
      console.log(`📱 Discovered ${discoveredDevices.length} devices`);
      
      // Combine bonded and discovered devices
      const allDevices = [...new Map([...devices, ...discoveredDevices].map(d => [d.address, d])).values()];
      setDevices(allDevices);

      if (allDevices.length === 0) {
        Alert.alert(
          'No Devices Found',
          'No Bluetooth devices found nearby. Make sure:\n\n1. Other devices have Bluetooth ON\n2. Other devices are discoverable\n3. You have location permission granted',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error during scan:', error);
      Alert.alert(
        'Scan Error',
        `Couldn't scan for devices: ${error.message}\n\nTry:\n1. Enable Bluetooth in phone settings\n2. Grant location permission\n3. Restart the app`,
        [{ text: 'OK' }]
      );
    }
    setIsScanning(false);
  };

  const connectToDevice = async (device) => {
    if (connectingDevice) return;

    setConnectingDevice(device.address);
    try {
      console.log(`🔗 Connecting to ${device.name}...`);
      
      await BluetoothService.connectToDevice(device.address);
      
      Alert.alert(
        'Connected!',
        `Successfully connected to ${device.name}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Chat', { device }) }]
      );
    } catch (error) {
      console.error('❌ Connection error:', error);
      Alert.alert(
        'Connection Failed',
        `Couldn't connect to ${device.name}: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
    setConnectingDevice(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBondedDevices();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Discover Devices</Text>
        <Text style={styles.subtitle}>
          Welcome, {profile?.nickname || 'User'}!
        </Text>
      </View>

      <View style={styles.controls}>
        {/* FORCE ENABLED BUTTON - ALWAYS CLICKABLE */}
        <TouchableOpacity 
          style={[styles.enableButton, { backgroundColor: '#007AFF' }]} // ALWAYS BLUE
          onPress={enableBluetooth}
          // NO DISABLED PROP - ALWAYS ENABLED
        >
          <Text style={styles.enableButtonText}>
            🔧 Enable Bluetooth
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanningButton]} 
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? '🔍 Scanning...' : '📡 Start Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deviceListContainer}>
        <Text style={styles.deviceListTitle}>
          Available Devices ({devices.length})
        </Text>
        
        <FlatList
          data={devices}
          keyExtractor={(item) => item.address}
          renderItem={({item}) => (
            <DeviceItem 
              device={item} 
              onConnect={() => connectToDevice(item)}
              isConnecting={connectingDevice === item.address}
            />
          )}
          style={styles.deviceList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isScanning ? 'Scanning for devices...' : 'No devices found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isScanning ? 'Please wait...' : 'Tap "Start Scan" to find nearby devices'}
              </Text>
            </View>
          }
        />
      </View>

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  enableButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    // ALWAYS BLUE - NO GRAY STATE
  },
  enableButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanningButton: {
    backgroundColor: '#999',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceListContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 10,
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
    color: '#333',
  },
  deviceList: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  testingButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  testingButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
EOF

print_success "Force-enabled HomeScreen created!"

print_status "Step 3: Building APK with force-enabled Bluetooth button..."

# Create JS bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

mkdir -p android/app/src/main/assets

# Build APK
cd android
./gradlew clean
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    print_success "🎉 Force-enabled APK built successfully!"
    
    # Copy APK
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        cp app/build/outputs/apk/release/app-release.apk ../chillchat-force-enabled.apk
        cd ..
        
        print_success "📱 Force-enabled APK: chillchat-force-enabled.apk"
        echo "📏 Size: $(du -h chillchat-force-enabled.apk | cut -f1)"
        echo ""
        echo "🔧 What's Different:"
        echo "✅ Bluetooth button is ALWAYS enabled (never grayed out)"
        echo "✅ Handles errors gracefully with helpful messages"
        echo "✅ Works even if Bluetooth detection fails"
        echo "✅ Clear user guidance for troubleshooting"
        echo ""
        echo "📱 Install this APK and the Bluetooth button will be blue and clickable!"
        
    else
        print_error "APK not found"
        cd ..
    fi
else
    print_error "Build failed"
    cd ..
fi

print_status "🎯 Next steps:"
echo "1. Install chillchat-force-enabled.apk on your phone"
echo "2. The Bluetooth button will be blue and clickable"
echo "3. If it doesn't work, you'll get helpful error messages"
echo "4. Grant all permissions when prompted"