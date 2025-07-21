# 📱 Quick Mobile Setup - ChillChat

## 🚀 Fastest Way to Get ChillChat on Your Phone

### **Method 1: Automated Script (Easiest)**
```bash
# Run the automated installer
./install-mobile.sh
```

### **Method 2: Manual Commands**
```bash
# Connect your phone via USB, then:
npx react-native run-android
```

---

## 📋 Before You Start (5-minute setup)

### **1. Prepare Your Phone:**
```
📱 Go to: Settings → About Phone
📱 Tap "Build Number" 7 times (enables Developer Mode)
📱 Go to: Settings → Developer Options  
📱 Enable "USB Debugging"
📱 Connect phone to computer via USB cable
📱 Allow debugging when prompted
```

### **2. Verify Connection:**
```bash
adb devices
# Should show your device listed
```

### **3. Install App:**
```bash
cd ChillChatApp
npx react-native run-android
```

---

## ✅ Success Checklist

After installation, you should see:
- ✅ "ChillChatApp" appears in your phone's app list
- ✅ App opens to profile setup screen
- ✅ Can enter nickname and choose avatar
- ✅ Navigates to tabs after profile setup
- ✅ Bluetooth permissions are requested
- ✅ Can start device scanning

---

## 🔧 If Something Goes Wrong

### **Phone Not Detected:**
```bash
# Try these commands:
adb kill-server
adb start-server
adb devices
```

### **Build Fails:**
```bash
# Clean and retry:
npx react-native start --reset-cache
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### **App Crashes:**
- Make sure phone has Android 6.0+
- Grant all permissions when asked
- Check logs: `npx react-native log-android`

---

## 🧪 Testing Bluetooth (Need 2 Phones)

1. **Install ChillChat on both phones**
2. **Phone A**: Open app → Discover tab → Start scanning
3. **Phone B**: Open app → Make discoverable  
4. **Phone A**: Connect to Phone B
5. **Both phones**: Test messaging!

---

## 📞 Need Help?

- **Detailed Guide**: Check `MOBILE_INSTALLATION.md`
- **Troubleshooting**: Check `TROUBLESHOOTING.md`
- **Console Logs**: Run `npx react-native log-android`

**🎉 Ready to chat via Bluetooth!**