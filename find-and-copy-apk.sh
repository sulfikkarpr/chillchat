#!/bin/bash

# Find and Copy APK After Successful Build
echo "🔍 Finding Your Successfully Built APK"
echo "====================================="

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

print_status "Searching for APK files in all possible locations..."

# Search in common APK output directories
APK_FOUND=0

# Location 1: Standard release output
if [ -f "android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    print_success "Found release APK (unsigned)!"
    cp android/app/build/outputs/apk/release/app-release-unsigned.apk chillchat-bluetooth-fixed.apk
    APK_FOUND=1
fi

# Location 2: Signed release APK
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    print_success "Found signed release APK!"
    cp android/app/build/outputs/apk/release/app-release.apk chillchat-bluetooth-fixed.apk
    APK_FOUND=1
fi

# Location 3: Debug APK (fallback)
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    print_success "Found debug APK!"
    cp android/app/build/outputs/apk/debug/app-debug.apk chillchat-bluetooth-debug.apk
    APK_FOUND=1
fi

# Location 4: Alternative bundle output
if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    print_success "Found Android App Bundle (.aab file)!"
    cp android/app/build/outputs/bundle/release/app-release.aab chillchat-bundle.aab
    print_warning "This is an .aab file, not .apk. You need to convert it or build APK directly."
fi

# Search everywhere as fallback
if [ $APK_FOUND -eq 0 ]; then
    print_warning "APK not found in standard locations. Searching everywhere..."
    
    APK_FILES=$(find android -name "*.apk" -type f 2>/dev/null)
    
    if [ -n "$APK_FILES" ]; then
        print_success "Found APK files:"
        echo "$APK_FILES"
        
        # Copy the first one found
        FIRST_APK=$(echo "$APK_FILES" | head -n 1)
        cp "$FIRST_APK" chillchat-found.apk
        print_success "Copied: $FIRST_APK -> chillchat-found.apk"
        APK_FOUND=1
    fi
fi

# Show results
echo ""
echo "📱 Available APK files in current directory:"
ls -la *.apk 2>/dev/null || echo "No APK files found"

if [ $APK_FOUND -eq 1 ]; then
    print_success "🎉 APK ready for installation!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Transfer the APK file to your phone"
    echo "2. Uninstall old ChillChatApp"
    echo "3. Install new APK"
    echo "4. Grant permissions"
    echo "5. Test Bluetooth button - should now work!"
    echo ""
    echo "✅ The Bluetooth button should be clickable with enhanced detection!"
else
    print_error "No APK files found."
    echo ""
    echo "💡 This might mean:"
    echo "1. Build didn't complete successfully"
    echo "2. APK is in a different location"
    echo "3. Need to run build command again"
    echo ""
    echo "🔄 Try running:"
    echo "cd android"
    echo "./gradlew assembleRelease"
    echo "find . -name '*.apk' -type f"
fi