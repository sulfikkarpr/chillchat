# 🛠️ ChillChat Troubleshooting Guide

## 📱 AsyncStorage Issues

### Problem: "NativeModule.AsyncStorage is null" Error

This error occurs when AsyncStorage is not properly linked or imported. ChillChat has been designed to handle this gracefully.

#### ✅ **Built-in Solutions (Already Implemented)**

The app includes a `safeStorage` wrapper that automatically handles AsyncStorage issues:

1. **Safe Import**: Uses try-catch to safely import AsyncStorage
2. **Fallback Storage**: Uses in-memory storage if AsyncStorage fails
3. **Graceful Degradation**: App continues to work with memory storage
4. **Debugging Tools**: Built-in storage tests to verify functionality

#### 🔧 **Manual Fix Steps (If Issues Persist)**

1. **Clean Install**:
   ```bash
   cd ChillChatApp
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Reset Metro Cache**:
   ```bash
   npx react-native start --reset-cache
   ```

3. **Clean Android Build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Rebuild App**:
   ```bash
   npx react-native run-android
   ```

#### 🔍 **Verification Steps**

1. Check console logs for storage type:
   - "✅ AsyncStorage is available" = Working correctly
   - "⚠️ AsyncStorage not available, using fallback storage" = Using memory fallback

2. Run built-in storage tests:
   - Tests automatically run 2 seconds after app start
   - Check React Native debugger console for test results

#### 📱 **Alternative Solutions**

If AsyncStorage continues to fail, the app will automatically use memory storage:
- ✅ App functionality remains intact
- ✅ Profile and chat data stored in memory during session
- ⚠️ Data lost when app closes (temporary limitation)

---

## 🔵 Bluetooth Issues

### Problem: Bluetooth Not Working

#### 📋 **Prerequisites Check**

1. **Physical Device Required**:
   - Bluetooth does NOT work in emulators
   - Must use real Android device

2. **Permissions**:
   - Location permission granted
   - Bluetooth permissions granted
   - App appears in device's permission settings

3. **Device Requirements**:
   - Android 6.0+ (API level 23+)
   - Bluetooth Classic support
   - Bluetooth turned ON

#### 🔧 **Troubleshooting Steps**

1. **Check Device Bluetooth**:
   ```
   Settings → Bluetooth → Turn ON
   ```

2. **Verify App Permissions**:
   ```
   Settings → Apps → ChillChat → Permissions
   - Location: Allow
   - Nearby devices: Allow
   ```

3. **Reset Bluetooth Stack**:
   ```
   Settings → Apps → Bluetooth → Storage → Clear Cache
   ```

4. **Restart Bluetooth Service**:
   ```
   Turn Bluetooth OFF → Wait 10 seconds → Turn ON
   ```

---

## 🚀 Build Issues

### Problem: Android SDK Not Found

#### Error Message:
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
```

#### ✅ **Solution**:

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - Complete setup including SDK installation

2. **Set Environment Variables**:
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Verify Installation**:
   ```bash
   adb --version
   ```

### Problem: Gradle Build Failed

#### ✅ **Solutions**:

1. **Clean Build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Check Java Version**:
   ```bash
   java -version
   # Should be Java 11 or newer
   ```

3. **Update Gradle Wrapper**:
   ```bash
   cd android
   ./gradlew wrapper --gradle-version=8.14.1
   ```

---

## 📦 Dependency Issues

### Problem: Package Installation Errors

#### ✅ **Solutions**:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Remove node_modules**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version**:
   ```bash
   node --version
   # Should be v16+ for React Native 0.80.1
   ```

### Problem: Metro Bundler Issues

#### ✅ **Solutions**:

1. **Reset Metro cache**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **Kill Metro process**:
   ```bash
   killall node
   npx react-native start
   ```

---

## 🐛 Debugging Tools

### Built-in Debug Features

1. **Storage Tests**: Automatically run on app start
2. **Console Logging**: Detailed logs for all operations
3. **Error Boundaries**: Graceful error handling
4. **Fallback Systems**: Memory storage, safe imports

### External Debug Tools

1. **React Native Debugger**:
   ```bash
   npm install -g react-native-debugger
   ```

2. **Flipper**: Built-in with React Native 0.80.1

3. **Chrome DevTools**: Available via Metro bundler

---

## 📞 Getting Help

### Information to Provide

When reporting issues, include:

1. **Device Info**:
   - Android version
   - Device model
   - React Native version

2. **Console Logs**:
   - Metro bundler output
   - Android logcat output
   - Chrome DevTools console

3. **Steps to Reproduce**:
   - Exact steps taken
   - Expected vs actual behavior

### Console Log Commands

```bash
# Android logs
adb logcat | grep ReactNativeJS

# Metro bundler logs
npx react-native log-android
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Using physical Android device (not emulator)
- [ ] Bluetooth is enabled on device
- [ ] All permissions granted to app
- [ ] Node.js version 16+
- [ ] Android Studio installed with SDK
- [ ] Clean install completed (rm -rf node_modules && npm install)
- [ ] Metro cache reset (--reset-cache)
- [ ] App builds without errors
- [ ] Console shows storage type detection

---

**The ChillChat app is designed to be resilient and work even when some native modules fail. Most issues can be resolved with the built-in fallback systems.** 🛡️