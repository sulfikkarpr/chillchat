import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Device {
  id: string;
  name: string;
  address: string;
  bonded: boolean;
}

interface DeviceItemProps {
  device: Device;
  onPress: () => void;
  isConnecting?: boolean;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ 
  device, 
  onPress, 
  isConnecting = false 
}) => {
  const getDeviceIcon = () => {
    if (device.bonded) {
      return '🔗'; // Paired device
    }
    return '📱'; // Regular device
  };

  const getSignalStrength = () => {
    // In a real implementation, this would come from the device's RSSI
    const strengths = ['📶', '📶', '📶', '📵'];
    return strengths[Math.floor(Math.random() * strengths.length)];
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        device.bonded && styles.bondedDevice,
        isConnecting && styles.connectingDevice
      ]}
      onPress={onPress}
      disabled={isConnecting}
      activeOpacity={0.7}
    >
      <View style={styles.deviceIcon}>
        <Text style={styles.iconText}>{getDeviceIcon()}</Text>
      </View>

      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName} numberOfLines={1}>
          {device.name || 'Unknown Device'}
        </Text>
        <Text style={styles.deviceAddress} numberOfLines={1}>
          {device.address}
        </Text>
        {device.bonded && (
          <Text style={styles.bondedLabel}>Paired Device</Text>
        )}
      </View>

      <View style={styles.deviceMeta}>
        <Text style={styles.signalStrength}>{getSignalStrength()}</Text>
        <View style={styles.connectButton}>
          <Text style={[
            styles.connectText,
            isConnecting && styles.connectingText
          ]}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  bondedDevice: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  connectingDevice: {
    opacity: 0.7,
    backgroundColor: '#F0F8FF',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  bondedLabel: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deviceMeta: {
    alignItems: 'center',
  },
  signalStrength: {
    fontSize: 16,
    marginBottom: 8,
  },
  connectButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  connectText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  connectingText: {
    color: '#666666',
  },
});

export default DeviceItem;