#!/bin/bash

# Complete Build Fix - Removes All Vector Icons Dependencies
echo "🔧 Complete Build Fix - Removing All Vector Icons"
echo "================================================="

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the ChillChatApp directory"
    print_status "Run: cd ChillChatApp && ./complete-build-fix.sh"
    exit 1
fi

print_status "Step 1: Complete cleanup of vector icons..."

# Remove vector icons completely
npm uninstall react-native-vector-icons 2>/dev/null || true

# Remove any config files
rm -f react-native.config.js

print_status "Step 2: Cleaning all caches and build files..."

# Clean all caches
rm -rf node_modules
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/build
rm -rf /tmp/metro-*
rm -rf /tmp/react-native-*

print_status "Step 3: Clean Gradle completely..."
cd android
./gradlew clean --refresh-dependencies 2>/dev/null || true
./gradlew --stop 2>/dev/null || true
cd ..

print_status "Step 4: Installing dependencies without vector icons..."
npm install

print_status "Step 5: Force clean autolinking..."
npx react-native clean 2>/dev/null || true

print_status "Step 6: Updating package.json to remove vector icons references..."
# Create a temporary package.json without vector icons
node -e "
const pkg = require('./package.json');
delete pkg.dependencies['react-native-vector-icons'];
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

print_status "Step 7: Final dependency install..."
npm install

print_status "Step 8: Building APK..."
cd android

# Try debug build first
print_status "Building debug APK..."
./gradlew assembleDebug --refresh-dependencies

if [ $? -eq 0 ]; then
    print_success "Debug APK build successful!"
    
    # Copy APK to easy location
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        cp "$APK_PATH" "../chillchat-fixed.apk"
        cd ..
        
        print_success "APK created successfully!"
        echo ""
        echo "📱 APK File: chillchat-fixed.apk"
        echo "📏 Size: $(du -h chillchat-fixed.apk | cut -f1)"
        echo ""
        echo "🚀 Installation Instructions:"
        echo "1. Transfer APK to your phone"
        echo "2. Enable 'Install Unknown Apps' in settings"
        echo "3. Tap the APK to install"
        echo "4. Launch ChillChatApp"
        echo ""
        print_success "Build completed successfully!"
        exit 0
    else
        print_error "APK file not found at expected location"
        cd ..
        exit 1
    fi
else
    print_error "Debug build failed"
    cd ..
    
    print_status "Trying release build as fallback..."
    cd android
    ./gradlew assembleRelease --refresh-dependencies
    
    if [ $? -eq 0 ]; then
        print_success "Release APK build successful!"
        
        APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
        if [ -f "$APK_PATH" ]; then
            cp "$APK_PATH" "../chillchat-release-fixed.apk"
            cd ..
            
            print_success "Release APK created!"
            echo "📱 APK File: chillchat-release-fixed.apk"
            exit 0
        fi
    fi
    
    print_error "Both debug and release builds failed"
    cd ..
    exit 1
fi