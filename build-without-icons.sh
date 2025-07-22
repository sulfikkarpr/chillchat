#!/bin/bash

# Build APK Without Vector Icons - Quick Working Solution
echo "📦 Building APK Without Vector Icons (Quick Fix)"
echo "================================================"

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

print_status "Step 1: Temporarily removing vector icons..."
npm uninstall react-native-vector-icons

print_status "Step 2: Updating components to remove icon dependencies..."

# Update HomeScreen to remove vector icons
cat > screens/HomeScreen.js << 'EOF'
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import BluetoothService from '../services/BluetoothService';
import DeviceItem from '../components/DeviceItem';
import TestingPanel from '../components/TestingPanel';

const HomeScreen = ({navigation}) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showTestingPanel, setShowTestingPanel] = useState(false);

  useEffect(() => {
    checkPermissions();
    
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

  const checkPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      
      console.log('Permissions granted:', granted);
    } catch (err) {
      console.warn('Permission error:', err);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    try {
      const discoveredDevices = await BluetoothService.startDeviceDiscovery();
      setDevices(discoveredDevices);
    } catch (error) {
      Alert.alert('Error', 'Failed to scan for devices: ' + error.message);
    }
    setIsScanning(false);
  };

  const connectToDevice = async (device) => {
    try {
      await BluetoothService.connectToDevice(device.address);
      navigation.navigate('Chat', { device });
    } catch (error) {
      Alert.alert('Connection Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Bluetooth Devices</Text>
      
      <TouchableOpacity 
        style={[styles.scanButton, isScanning && styles.scanningButton]} 
        onPress={startScan}
        disabled={isScanning}
      >
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={({item}) => (
          <DeviceItem 
            device={item} 
            onConnect={() => connectToDevice(item)} 
          />
        )}
        style={styles.deviceList}
      />

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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanningButton: {
    backgroundColor: '#999',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
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

print_status "Step 3: Removing react-native.config.js..."
rm -f react-native.config.js

print_status "Step 4: Clean build cache..."
rm -rf node_modules/.bin
rm -rf android/app/build
cd android && ./gradlew clean && cd ..

print_status "Step 5: Reinstall dependencies..."
npm install

print_status "Step 6: Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    print_success "Debug APK build successful!"
    
    # Copy APK to easy location
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        cp "$APK_PATH" "../chillchat-debug-no-icons.apk"
        cd ..
        
        print_success "APK created successfully!"
        echo ""
        echo "📱 APK File: chillchat-debug-no-icons.apk"
        echo "📏 Size: $(du -h chillchat-debug-no-icons.apk | cut -f1)"
        echo ""
        print_warning "Note: This build doesn't include vector icons"
        echo "🚀 Ready for installation on your phone!"
    else
        print_error "APK file not found"
        cd ..
        exit 1
    fi
else
    print_error "Build failed"
    cd ..
    exit 1
fi