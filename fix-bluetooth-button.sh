#!/bin/bash

# Fix Bluetooth Button - Replace Service with Enhanced Version
echo "🔧 Fixing Disabled Bluetooth Button Issue"
echo "========================================="

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

print_status "Step 1: Backing up original BluetoothService..."
cp services/BluetoothService.js services/BluetoothService.js.backup

print_status "Step 2: Replacing with enhanced BluetoothService..."
cp services/BluetoothServiceFixed.js services/BluetoothService.js

print_status "Step 3: Clean build cache..."
rm -rf android/app/build
cd android
./gradlew clean
cd ..

print_status "Step 4: Creating new release APK with fix..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

mkdir -p android/app/src/main/assets

print_status "Step 5: Building fixed APK..."
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    print_success "🎉 Fixed APK built successfully!"
    
    # Copy APK to easy location
    if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
        cp app/build/outputs/apk/release/app-release-unsigned.apk ../chillchat-bluetooth-fixed.apk
        cd ..
        
        print_success "📱 Fixed APK created: chillchat-bluetooth-fixed.apk"
        echo "📏 Size: $(du -h chillchat-bluetooth-fixed.apk | cut -f1)"
        echo ""
        echo "🔧 What's Fixed:"
        echo "✅ Enhanced Bluetooth status checking"
        echo "✅ Fallback methods for Bluetooth detection"
        echo "✅ Better permission handling"
        echo "✅ Detailed logging for debugging"
        echo ""
        echo "📱 Installation Instructions:"
        echo "1. Uninstall old ChillChatApp from phone"
        echo "2. Transfer chillchat-bluetooth-fixed.apk to phone"
        echo "3. Install new APK"
        echo "4. Grant all permissions when asked"
        echo "5. The 'Enable Bluetooth' button should now work!"
        
    else
        print_error "APK not found at expected location"
        cd ..
        exit 1
    fi
else
    print_error "Build failed"
    cd ..
    exit 1
fi

print_status "Step 6: What to check on your phone:"
echo ""
echo "📋 Testing the fix:"
echo "1. Open ChillChatApp"
echo "2. Complete profile setup"
echo "3. Go to Discover tab"
echo "4. The 'Enable Bluetooth' button should be clickable"
echo "5. Tap it to enable Bluetooth"
echo "6. Try 'Start Scan' to find devices"
echo ""
echo "📱 If still having issues, check the app logs:"
echo "- Connect phone to computer"
echo "- Run: adb logcat | grep ChillChat"
echo "- Look for the 🔍📶✅❌ emoji logs"

print_success "Bluetooth button fix complete! 🚀"