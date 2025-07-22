#!/bin/bash

# Build APK Directly - No Emulator/Device Required
echo "📦 Building APK Directly (No Emulator Required)"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_status "Step 1: Fixing vector icons linking..."
./fix-vector-icons.sh

print_status "Step 2: Building APK directly using Gradle..."
cd android

# Build debug APK (faster)
print_status "Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    print_success "Debug APK build successful!"
    
    # Copy APK to easy location
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        cp "$APK_PATH" "../chillchat-debug.apk"
        cd ..
        
        print_success "APK created successfully!"
        echo ""
        echo "📱 APK File: chillchat-debug.apk"
        echo "📏 Size: $(du -h chillchat-debug.apk | cut -f1)"
        echo ""
        echo "🚀 Installation Instructions:"
        echo "1. Transfer APK to your phone (email, USB, cloud drive)"
        echo "2. Enable 'Install Unknown Apps' in phone settings"
        echo "3. Tap the APK file to install"
        echo "4. Launch 'ChillChatApp' from your app drawer"
        
        exit 0
    else
        print_warning "APK file not found at expected location"
        cd ..
        exit 1
    fi
else
    print_warning "Debug build failed, trying release build..."
    
    # Try release build
    ./gradlew assembleRelease
    
    if [ $? -eq 0 ]; then
        print_success "Release APK build successful!"
        
        APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
        if [ -f "$APK_PATH" ]; then
            cp "$APK_PATH" "../chillchat-release.apk"
            cd ..
            
            print_success "Release APK created successfully!"
            echo ""
            echo "📱 APK File: chillchat-release.apk"
            echo "📏 Size: $(du -h chillchat-release.apk | cut -f1)"
            echo ""
            echo "🚀 Ready for installation on your phone!"
        else
            print_warning "Release APK not found"
            cd ..
            exit 1
        fi
    else
        print_warning "Both debug and release builds failed"
        cd ..
        exit 1
    fi
fi