#!/bin/bash

# Quick Fix - Get APK Working Immediately
echo "🚀 Quick Fix - Get APK Working Now"
echo "================================="

echo "Step 1: Removing vector icons from package.json..."
npm uninstall react-native-vector-icons

echo "Step 2: Removing config files..."
rm -f react-native.config.js

echo "Step 3: Clean gradle..."
cd android
./gradlew clean
cd ..

echo "Step 4: Clean React Native cache..."
npx react-native start --reset-cache &
sleep 3
kill %1 2>/dev/null

echo "Step 5: Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS! APK Built"
    cp app/build/outputs/apk/debug/app-debug.apk ../chillchat-working.apk
    cd ..
    echo "📱 APK ready: chillchat-working.apk"
    echo "📏 Size: $(du -h chillchat-working.apk | cut -f1)"
else
    echo "❌ Debug failed, trying release..."
    ./gradlew assembleRelease
    if [ $? -eq 0 ]; then
        cp app/build/outputs/apk/release/app-release-unsigned.apk ../chillchat-working.apk
        cd ..
        echo "✅ Release APK ready: chillchat-working.apk"
    else
        echo "❌ Build failed"
        cd ..
    fi
fi