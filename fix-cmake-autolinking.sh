#!/bin/bash

# Fix CMake Autolinking Issue - AsyncStorage
echo "🔧 Fixing CMake Autolinking Issue"
echo "================================="

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

print_status "Step 1: Nuclear clean of native build files..."
rm -rf android/app/.cxx
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/build
rm -rf node_modules/.bin

print_status "Step 2: Clean autolinking cache..."
rm -rf android/app/build/generated/autolinking

print_status "Step 3: Clean React Native cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null || true

print_status "Step 4: Force clean npm cache..."
npm cache clean --force

print_status "Step 5: Reinstall dependencies..."
rm -rf node_modules
npm install

print_status "Step 6: Clean Gradle completely..."
cd android
./gradlew clean --refresh-dependencies
./gradlew --stop
cd ..

print_status "Step 7: Force regenerate autolinking..."
cd android
./gradlew :app:assembleDebug --refresh-dependencies

if [ $? -eq 0 ]; then
    print_success "✅ CMake issue resolved! Proceeding with release build..."
    
    cd ..
    # Create bundle again
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
    
    mkdir -p android/app/src/main/assets
    
    cd android
    ./gradlew assembleRelease
    
    if [ $? -eq 0 ]; then
        print_success "🎉 Release APK built successfully!"
        
        # Copy APK
        if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
            cp app/build/outputs/apk/release/app-release-unsigned.apk ../chillchat-bluetooth-fixed.apk
            cd ..
            
            print_success "📱 Fixed APK created: chillchat-bluetooth-fixed.apk"
            echo "📏 Size: $(du -h chillchat-bluetooth-fixed.apk | cut -f1)"
            echo ""
            echo "🔧 What's Fixed:"
            echo "✅ CMake autolinking issues resolved"
            echo "✅ Enhanced Bluetooth detection"
            echo "✅ Fallback Bluetooth status checking"
            echo ""
            print_success "Ready for phone installation! 🚀"
            
        else
            print_error "APK not found at expected location"
            cd ..
        fi
    else
        print_error "Release build still failed"
        cd ..
    fi
else
    print_error "Debug build failed, trying alternative approach..."
    cd ..
    
    print_status "Trying gradlew without native build..."
    cd android
    ./gradlew assembleRelease -Porg.gradle.configureondemand=false
    
    if [ $? -eq 0 ]; then
        print_success "Alternative build successful!"
        if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
            cp app/build/outputs/apk/release/app-release-unsigned.apk ../chillchat-alternative.apk
            cd ..
            print_success "📱 Alternative APK: chillchat-alternative.apk"
        fi
    else
        print_error "All build attempts failed"
        cd ..
    fi
fi

echo ""
echo "📋 Available APK files:"
ls -la *.apk 2>/dev/null || echo "No APK files found"