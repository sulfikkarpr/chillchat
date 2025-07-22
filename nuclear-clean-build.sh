#!/bin/bash

# Nuclear Clean Build - Complete Vector Icons Removal
echo "💥 Nuclear Clean Build - Complete Vector Icons Removal"
echo "====================================================="

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

print_status "🚀 Starting nuclear cleanup..."

# Step 1: Remove vector icons completely
print_status "Step 1: Removing all vector icons references..."
npm uninstall react-native-vector-icons 2>/dev/null || true

# Step 2: Remove all config files
print_status "Step 2: Removing config files..."
rm -f react-native.config.js
rm -f metro.config.js.bak

# Step 3: Nuclear clean of all caches and build files
print_status "Step 3: Nuclear clean of all build files..."
rm -rf node_modules
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/build
rm -rf ~/.gradle/caches
rm -rf /tmp/metro-*
rm -rf /tmp/react-native-*
rm -rf /tmp/haste-map-*

# Step 4: Clean React Native cache
print_status "Step 4: Cleaning React Native cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null || true

# Step 5: Clean npm cache
print_status "Step 5: Cleaning npm cache..."
npm cache clean --force

# Step 6: Install fresh dependencies
print_status "Step 6: Installing fresh dependencies..."
npm install

# Step 7: Force remove any autolinking references
print_status "Step 7: Removing autolinking cache..."
rm -rf android/app/build/generated/autolinking

# Step 8: Clean Gradle completely
print_status "Step 8: Complete Gradle clean..."
cd android
./gradlew clean --refresh-dependencies
./gradlew --stop
cd ..

# Step 9: Verify no vector icons references exist
print_status "Step 9: Verifying no vector icons references..."
if grep -r "vector-icons" android/ 2>/dev/null | grep -v "Binary file"; then
    print_warning "Found vector icons references, removing..."
    # Remove any generated files that still reference vector icons
    find android/app/build -name "*.java" -exec grep -l "vector-icons" {} \; 2>/dev/null | xargs rm -f 2>/dev/null || true
fi

# Step 10: Build APK
print_status "Step 10: Building APK..."
cd android
./gradlew assembleDebug --refresh-dependencies --no-build-cache

if [ $? -eq 0 ]; then
    print_success "🎉 SUCCESS! APK Built Successfully!"
    
    # Copy APK to easy location
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        cp "$APK_PATH" "../chillchat-nuclear-clean.apk"
        cd ..
        
        print_success "📱 APK created: chillchat-nuclear-clean.apk"
        echo "📏 Size: $(du -h chillchat-nuclear-clean.apk | cut -f1)"
        echo ""
        echo "🚀 Ready for installation on your phone!"
        echo ""
        echo "📋 Installation steps:"
        echo "1. Transfer chillchat-nuclear-clean.apk to your phone"
        echo "2. Enable 'Install Unknown Apps' in settings"
        echo "3. Tap the APK file to install"
        echo "4. Launch ChillChatApp from your app drawer"
        
        exit 0
    else
        print_error "APK file not found at expected location"
        cd ..
        exit 1
    fi
else
    print_error "Build failed even after nuclear clean"
    print_status "Trying release build as last resort..."
    
    ./gradlew assembleRelease --refresh-dependencies --no-build-cache
    
    if [ $? -eq 0 ]; then
        print_success "Release APK build successful!"
        
        APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
        if [ -f "$APK_PATH" ]; then
            cp "$APK_PATH" "../chillchat-release-clean.apk"
            cd ..
            
            print_success "📱 Release APK created: chillchat-release-clean.apk"
            exit 0
        fi
    fi
    
    print_error "All build attempts failed"
    cd ..
    exit 1
fi