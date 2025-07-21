# 📱 ChillChat Mobile Installation Guide

## 🚀 Method 1: Direct Development Build (Recommended)

### Prerequisites:
- ✅ Android Studio installed
- ✅ Android SDK configured  
- ✅ Physical Android device
- ✅ USB cable

### Step-by-Step Installation:

#### 1. **Enable Developer Options on Phone:**
```
Settings → About Phone → Tap "Build Number" 7 times
Settings → Developer Options → Enable "USB Debugging"
Settings → Developer Options → Enable "Install via USB"
```

#### 2. **Connect Phone to Computer:**
```bash
# Connect via USB cable
# Allow USB debugging when prompted on phone
# Verify connection:
adb devices
# Should show your device listed
```

#### 3. **Build and Install App:**
```bash
cd ChillChatApp
npx react-native run-android
# This will build the app and install it directly on your phone
```

#### 4. **Alternative - Generate APK:**
```bash
cd ChillChatApp
cd android
./gradlew assembleRelease
# APK will be generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Method 2: Generate Signed APK

### For Distribution/Sharing:

#### 1. **Generate Signing Key:**
```bash
cd ChillChatApp/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore chillchat-upload-key.keystore -alias chillchat-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. **Configure Gradle for Signing:**
Create `android/gradle.properties`:
```properties
CHILLCHAT_UPLOAD_STORE_FILE=chillchat-upload-key.keystore
CHILLCHAT_UPLOAD_KEY_ALIAS=chillchat-key-alias
CHILLCHAT_UPLOAD_STORE_PASSWORD=your_password
CHILLCHAT_UPLOAD_KEY_PASSWORD=your_password
```

#### 3. **Build Signed APK:**
```bash
cd ChillChatApp/android
./gradlew assembleRelease
```

---

## 📲 Method 3: Install APK Manually

### If you have the APK file:

#### 1. **Transfer APK to Phone:**
- Email the APK to yourself
- Use Google Drive/Dropbox
- Transfer via USB cable

#### 2. **Install on Phone:**
```
Settings → Security → Enable "Unknown Sources" or "Install Unknown Apps"
File Manager → Navigate to APK file → Tap to install
```

---

## 🔧 Troubleshooting

### Common Issues:

#### **"SDK location not found":**
```bash
# Set environment variables:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### **"Device not detected":**
```bash
# Check device connection:
adb devices
# If not listed:
adb kill-server
adb start-server
# Enable USB debugging on phone again
```

#### **"Build failed":**
```bash
# Clean and rebuild:
cd ChillChatApp
npx react-native start --reset-cache
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### **"App crashes on phone but works in simulator":**
- Check that phone has Android 6.0+ (API 23+)
- Ensure all permissions are granted
- Check console logs: `npx react-native log-android`

---

## 📋 Pre-Installation Checklist

### Phone Requirements:
- [ ] Android 6.0+ (API level 23 or higher)
- [ ] Bluetooth Classic support
- [ ] At least 100MB free storage
- [ ] Developer options enabled
- [ ] USB debugging enabled

### Development Environment:
- [ ] Node.js 16+ installed
- [ ] React Native CLI installed
- [ ] Android Studio with SDK installed
- [ ] ANDROID_HOME environment variable set
- [ ] ADB working (`adb devices` shows connected phone)

---

## 🧪 Testing on Mobile

### Important Notes:
- **Bluetooth only works on real devices** (not simulators)
- **Location permission required** for Bluetooth scanning
- **Nearby devices permission** needed on Android 12+

### First Launch Testing:
1. ✅ App opens without crashes
2. ✅ Profile setup screen appears
3. ✅ Can enter nickname and select avatar
4. ✅ Navigates to main tabs after profile setup
5. ✅ Bluetooth permissions requested
6. ✅ Device scanning works
7. ✅ Tab navigation functions properly

### Bluetooth Testing:
1. Enable Bluetooth on phone
2. Grant all requested permissions
3. Test device discovery
4. Test connection with another device
5. Test message sending/receiving

---

## 🚨 Important for Bluetooth Testing

### Bluetooth Requirements:
- **Two physical Android devices** needed for full testing
- Both devices must have the ChillChat app installed
- Both devices must have Bluetooth enabled
- Location services must be enabled
- All Bluetooth permissions must be granted

### Testing Scenarios:
1. **Device A**: Start scanning for devices
2. **Device B**: Make itself discoverable  
3. **Device A**: Connect to Device B
4. **Both**: Test message exchange
5. **Both**: Test session persistence
6. **Both**: Test tab navigation during chat

---

## 📞 Getting Help

### If installation fails:
1. Check all prerequisites are met
2. Follow troubleshooting steps above
3. Check console logs for specific errors
4. Ensure phone meets minimum requirements

### Console Commands for Debugging:
```bash
# Check connected devices
adb devices

# View app logs
npx react-native log-android

# Check app installation
adb shell pm list packages | grep chillchat

# Uninstall if needed
adb uninstall com.chillchatapp
```

---

## ✅ Success Indicators

### App Successfully Installed When:
- ✅ App appears in phone's app drawer
- ✅ App launches without immediate crashes
- ✅ Profile setup screen appears
- ✅ All tabs are accessible
- ✅ Bluetooth permissions can be granted
- ✅ Device scanning initiates
- ✅ Storage tests pass (check console)

**Ready to test ChillChat on your mobile device!** 📱🎉