# 📱 ChillChat - Bluetooth Chat App

A comprehensive React Native chat application that enables peer-to-peer communication over Bluetooth Classic. Built for Android devices with a beautiful, modern UI and complete session management.

## ✨ Features

### 🔵 Core Bluetooth Functionality
- **Bluetooth Classic Connectivity** - Real-time communication between Android devices
- **Device Discovery** - Scan for both paired and unpaired nearby devices
- **Auto Pairing** - Seamlessly pair with devices during connection
- **Connection Management** - Robust connect/disconnect with status indicators

### 💬 Chat & Messaging  
- **Real-time Messaging** - Instant send/receive with message bubbles
- **Chat Sessions** - Persistent chat history with automatic session management
- **Message History** - Messages saved locally with timestamps
- **Session Recovery** - Resume conversations from previous sessions

### 👤 Profile Management
- **Profile Setup** - Initial nickname and avatar selection
- **Avatar Customization** - Choose from emoji avatars
- **Profile Persistence** - Settings saved locally

### 🎨 Modern UI/UX
- **Bottom Tab Navigation** - Easy navigation between Discover, Chats, and Settings
- **Material Design** - Clean, modern interface with consistent styling
- **Dark Mode Ready** - Prepared for theme switching
- **Responsive Design** - Works across different screen sizes

## 🛠️ Technologies Used

- **React Native 0.80.1** - Cross-platform mobile development  
- **React Navigation 7.x** - Stack and tab navigation
- **react-native-bluetooth-classic** - Bluetooth Classic connectivity
- **AsyncStorage** - Local data persistence
- **Context API** - Global state management
- **TypeScript** - Type-safe development
- **Android SDK** - Native Android functionality

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **React Native CLI** (not Expo)
- **Android Studio** with Android SDK
- **Physical Android Device** (Bluetooth doesn't work in emulators)
- **Java Development Kit (JDK)**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ChillChatApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Android Setup
Make sure you have Android development environment set up:
```bash
# For Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. Run the Application
```bash
# Make sure you have an Android device connected via USB with Developer Options enabled
npx react-native run-android
```

## 📱 Usage Instructions

### First Time Setup
1. **Enable Bluetooth** - The app will prompt you to enable Bluetooth if it's disabled
2. **Grant Permissions** - Allow location and Bluetooth permissions when prompted
3. **Pair Devices** - Use Android's Bluetooth settings to pair with other devices first

### Connecting to Devices
1. **Tap "Scan for Devices"** - This will show both paired and nearby devices
2. **Select a Device** - Tap on any device from the list
3. **Confirm Connection** - Tap "Connect" in the confirmation dialog
4. **Start Chatting** - You'll be taken to the chat screen automatically

### Chatting
1. **Type Messages** - Use the text input at the bottom
2. **Send Messages** - Tap the "Send" button or press Enter
3. **View Status** - Green indicator means connected, red means disconnected
4. **Disconnect** - Use the "Disconnect" button in the top-right corner

## 🏗️ Project Structure

```
ChillChatApp/
├── android/                         # Android native code
├── screens/
│   ├── 👤 ProfileScreen.tsx         # Initial profile setup  
│   ├── 🏠 HomeScreen.js             # Device discovery & scanning
│   ├── 📋 ChatListScreen.tsx        # Active/recent chat sessions
│   ├── 💬 ChatScreen.js             # Real-time messaging interface
│   └── ⚙️ SettingsScreen.tsx        # App settings & preferences
├── services/
│   └── 🔵 BluetoothService.js       # Complete Bluetooth logic
├── components/
│   ├── 💭 MessageBubble.js          # Chat message UI component
│   └── 📱 DeviceItem.tsx            # Bluetooth device card
├── contexts/
│   └── 👤 ProfileContext.tsx        # Global profile state
├── utils/
│   └── 💾 storage.ts                # AsyncStorage helpers
├── App.tsx                          # Main app with navigation
└── package.json                     # Dependencies and scripts
```

## 🔧 Key Components

### BluetoothService
Centralized service managing all Bluetooth operations:
- Device discovery and connection
- Message sending/receiving
- Permission handling
- Connection state management

### HomeScreen
Main screen for device management:
- Bluetooth status checking
- Device scanning and listing
- Connection initiation

### ChatScreen  
Real-time messaging interface:
- Message display with chat bubbles
- Text input and sending
- Connection status monitoring
- Graceful disconnection handling

### MessageBubble
Reusable component for chat messages:
- Different styles for sent/received messages
- Timestamp display
- Responsive design

## 🔐 Permissions

The app requires these Android permissions:
- `BLUETOOTH` - Basic Bluetooth operations
- `BLUETOOTH_ADMIN` - Bluetooth device management
- `BLUETOOTH_CONNECT` - Connect to Bluetooth devices (Android 12+)
- `BLUETOOTH_SCAN` - Scan for Bluetooth devices (Android 12+)
- `ACCESS_FINE_LOCATION` - Required for Bluetooth device discovery

## 🐛 Troubleshooting

### Common Issues

**"Bluetooth not working"**
- Ensure you're testing on a physical Android device
- Check that Bluetooth is enabled in device settings
- Verify all permissions are granted

**"Cannot find devices"**
- Make sure target devices are discoverable
- Try pairing devices through Android Settings first
- Ensure location services are enabled

**"Connection fails"**
- Check that both devices support Bluetooth Classic
- Verify devices are within range (typically 10 meters)
- Try clearing Bluetooth cache in Android Settings

**"App crashes on startup"**
- Ensure all dependencies are properly installed
- Check that Android SDK is properly configured
- Verify device has minimum Android API level 24

### Debug Mode
Enable JavaScript debugging:
```bash
npx react-native log-android
```

## 🔄 Testing

### Testing the App
1. **Install on two Android devices**
2. **Pair the devices** using Android Bluetooth settings
3. **Open the app on both devices**
4. **Connect from one device to the other**
5. **Send messages back and forth**

### Automated Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Building for Production

### Generate APK
```bash
cd android
./gradlew assembleRelease
```

### Generate AAB (Android App Bundle)
```bash
cd android  
./gradlew bundleRelease
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native Community for the Bluetooth Classic library
- React Navigation team for the excellent navigation solution
- All contributors who helped improve this project

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Look through existing [GitHub Issues](issues)
3. Create a new issue with detailed information

---

**Happy Chatting! 💬📱**
