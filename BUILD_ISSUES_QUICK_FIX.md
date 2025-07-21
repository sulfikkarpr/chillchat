# 🚨 Build Issues - Quick Fix Reference

## ⚡ **Most Common Error: Native Module Build Failed**

### **Error Message:**
```
> Task :app:externalNativeBuildCleanDebug FAILED
Clean react_codegen_RNVectorIconsSpec-armeabi-v7a, react_codegen_safeareacontext-armeabi-v7a, react_codegen_rnscreens-armeabi-v7a, appmodules-armeabi-v7a, react_codegen_rnasyncstorage-armeabi-v7a
```

### 🔥 **One-Command Fix:**
```bash
./fix-build-errors.sh
```

### 🛠️ **Manual 3-Step Fix:**
```bash
# 1. Deep clean
rm -rf node_modules && npm cache clean --force
cd android && ./gradlew clean && ./gradlew --stop && cd ..

# 2. Reinstall
npm install

# 3. Build
cd android && ./gradlew assembleDebug
```

---

## 📋 **Quick Troubleshooting Checklist**

### ✅ **Before Building APK:**
- [ ] Android Studio installed and updated
- [ ] Android SDK Platform 31+ installed  
- [ ] ANDROID_HOME environment variable set
- [ ] Java 11 or 17 installed
- [ ] No other React Native projects running

### 🔍 **Verification Commands:**
```bash
# Check environment
echo $ANDROID_HOME
java -version
cd android && ./gradlew --version

# Test build
cd android && ./gradlew assembleDebug --info
```

---

## 🚀 **APK Generation After Fix**

### **Once build is working:**
```bash
# Quick APK
./quick-apk.sh

# Full options
./generate-apk.sh

# Installation helper  
./install-mobile.sh
```

---

## 🆘 **If Nothing Works**

### **Nuclear Option (Complete Reset):**
```bash
# 1. Backup your project
cp -r ChillChatApp ChillChatApp_backup

# 2. Complete clean
rm -rf node_modules package-lock.json
rm -rf android/build android/app/build
rm -rf ~/.gradle/caches

# 3. Fresh install
npm install

# 4. Try build
./fix-build-errors.sh
```

### **Environment Issues:**
1. **Update Android Studio** - Get latest version
2. **Install Missing SDKs** - Android SDK Platform 31+
3. **Check Java Version** - Must be 11 or 17
4. **Restart Computer** - Sometimes helps with environment variables

---

## 📱 **Success Indicators**

### **Build Success:**
```
BUILD SUCCESSFUL in 2m 34s
```

### **APK Generated:**
```
✅ APK generated successfully!
📱 Location: android/app/build/outputs/apk/debug/app-debug.apk
```

### **Ready for Installation:**
- APK file exists and is ~25-40MB
- Can transfer to phone and install
- App launches and shows profile setup

---

## 🔧 **Common Error Solutions**

| Error | Quick Fix |
|-------|-----------|
| **SDK location not found** | Set `ANDROID_HOME` environment variable |
| **Gradle daemon issues** | `cd android && ./gradlew --stop` |
| **Out of memory** | Add `org.gradle.jvmargs=-Xmx4g` to `gradle.properties` |
| **Permission denied** | `chmod +x` on shell scripts |
| **Metro bundler conflicts** | `npx react-native start --reset-cache` |

---

## 📞 **Getting Help**

1. **Run diagnostics**: `./fix-build-errors.sh`
2. **Check full guide**: `TROUBLESHOOTING.md`
3. **Build with logs**: `cd android && ./gradlew assembleDebug --stacktrace`
4. **Verify environment**: Check Java, Android Studio, SDK versions

**🎯 Goal: Get from error → working APK in under 10 minutes!**