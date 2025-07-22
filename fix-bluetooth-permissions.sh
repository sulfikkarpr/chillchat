#!/bin/bash

echo "🔧 FIXING BLUETOOTH PERMISSIONS & DEVICE DISCOVERY"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Bluetooth permission fix...${NC}"

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
cd android
./gradlew clean
cd ..

# Install any missing dependencies
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
npm install

# Clear React Native cache
echo -e "${YELLOW}🗑️ Clearing React Native cache...${NC}"
npx react-native start --reset-cache &
RN_PID=$!
sleep 3
kill $RN_PID 2>/dev/null

# Build the release APK
echo -e "${BLUE}🔨 Building release APK with Bluetooth fixes...${NC}"
cd android
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Find and copy the APK
    APK_PATH=$(find . -name "*.apk" -path "*/outputs/apk/release/*" | head -1)
    
    if [ -n "$APK_PATH" ]; then
        # Copy to easy access location
        cp "$APK_PATH" ../ChillChatApp-Fixed.apk
        echo -e "${GREEN}📱 APK copied to: ChillChatApp-Fixed.apk${NC}"
        
        # Show APK info
        APK_SIZE=$(du -h ../ChillChatApp-Fixed.apk | cut -f1)
        echo -e "${BLUE}📊 APK Size: ${APK_SIZE}${NC}"
        
        echo ""
        echo -e "${GREEN}🎉 BLUETOOTH FIX COMPLETE!${NC}"
        echo "=================================================="
        echo -e "${YELLOW}📱 Install the new APK: ChillChatApp-Fixed.apk${NC}"
        echo ""
        echo -e "${BLUE}🔧 What's been fixed:${NC}"
        echo "✅ Enhanced permission handling for Android 12+"
        echo "✅ Better Bluetooth status detection"
        echo "✅ Improved device discovery with timeout"
        echo "✅ User-friendly error messages"
        echo "✅ Button no longer gets stuck disabled"
        echo "✅ Better guidance for manual setup"
        echo ""
        echo -e "${YELLOW}📋 After installing:${NC}"
        echo "1. Grant ALL permissions when prompted"
        echo "2. Enable Bluetooth in device settings"
        echo "3. Open ChillChat and try scanning"
        echo "4. Make sure other devices are discoverable"
        echo ""
        echo -e "${BLUE}💡 If you still have issues:${NC}"
        echo "• Check app permissions in Settings → Apps → ChillChat"
        echo "• Make sure Location is enabled (required for Bluetooth)"
        echo "• Try with another device nearby"
        echo "• Restart the app after granting permissions"
        
    else
        echo -e "${RED}❌ Could not find generated APK${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    echo -e "${YELLOW}💡 Try running: ./nuclear-clean-build.sh${NC}"
    exit 1
fi

cd ..
echo ""
echo -e "${GREEN}🚀 Ready to test! Install ChillChatApp-Fixed.apk${NC}"