#!/bin/bash

# Quick APK Generation - One-liner script
echo "📦 Quick APK Generation for ChillChat"

# Generate APK quickly
cd android && ./gradlew assembleRelease && cd ..

# Check if successful
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    # Copy to easy location
    cp "$APK_PATH" "chillchat-app.apk"
    
    echo ""
    echo "✅ APK Generated Successfully!"
    echo "📱 File: chillchat-app.apk"
    echo "📏 Size: $(du -h chillchat-app.apk | cut -f1)"
    echo ""
    echo "🚀 Transfer to phone and install!"
    echo "💡 Enable 'Install Unknown Apps' first"
else
    echo "❌ APK generation failed"
fi