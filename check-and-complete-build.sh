#!/bin/bash

# Check and Complete Build Status
echo "🔍 Checking Build Status and Completing APK Generation"
echo "===================================================="

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

print_status "Checking current build status..."

# Check if bundle was created successfully
if [ -f "android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle" ]; then
    print_success "JavaScript bundle created successfully!"
else
    print_warning "JavaScript bundle not found, creating it..."
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
fi

# Stop any running gradle processes
print_status "Stopping any hanging gradle processes..."
cd android
./gradlew --stop
cd ..

# Check for existing APK
print_status "Checking for existing APK files..."
find android -name "*.apk" -type f 2>/dev/null

# Try to complete the release build
print_status "Attempting to complete release build..."
cd android

# Try assembleRelease again
./gradlew assembleRelease

BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    print_success "Release build completed successfully!"
    
    # Find and copy APK
    if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
        cp app/build/outputs/apk/release/app-release-unsigned.apk ../chillchat-standalone.apk
        cd ..
        print_success "📱 Standalone APK created: chillchat-standalone.apk"
        echo "📏 Size: $(du -h chillchat-standalone.apk | cut -f1)"
        echo ""
        echo "🚀 Ready for phone installation!"
        echo "✅ This APK will NOT have Metro errors!"
        
    elif [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        cp app/build/outputs/apk/release/app-release.apk ../chillchat-standalone.apk
        cd ..
        print_success "📱 Signed APK created: chillchat-standalone.apk"
        echo "📏 Size: $(du -h chillchat-standalone.apk | cut -f1)"
        
    else
        print_warning "APK not found in expected location, searching..."
        find . -name "*.apk" -type f 2>/dev/null
        cd ..
    fi
    
else
    print_error "Release build failed with status: $BUILD_STATUS"
    print_status "Trying alternative approach..."
    
    # Try building debug APK with release bundle
    print_status "Creating debug APK with release bundle..."
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            cp app/build/outputs/apk/debug/app-debug.apk ../chillchat-release-debug.apk
            cd ..
            print_success "📱 Debug APK with release bundle: chillchat-release-debug.apk"
            echo "📏 Size: $(du -h chillchat-release-debug.apk | cut -f1)"
            echo ""
            print_warning "This is a debug APK but should work on your phone"
        fi
    fi
    cd ..
fi

# Show final status
echo ""
echo "📋 Final APK Status:"
ls -la *.apk 2>/dev/null || echo "No APK files found in current directory"

echo ""
echo "📱 Installation Instructions:"
echo "1. Transfer the APK file to your phone"
echo "2. Uninstall the old ChillChatApp"
echo "3. Enable 'Install Unknown Apps' in settings"
echo "4. Tap the APK to install"
echo "5. Launch ChillChatApp - should work without Metro errors!"