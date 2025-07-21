#!/bin/bash

# ChillChat APK Generation Script
# Generates APK file for wireless installation

echo "📦 ChillChat APK Generation Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    exit 1
fi

# Check if Android SDK is configured
if [ -z "$ANDROID_HOME" ]; then
    print_error "ANDROID_HOME environment variable is not set"
    print_warning "Please install Android Studio and set ANDROID_HOME"
    print_warning "export ANDROID_HOME=\$HOME/Android/Sdk"
    exit 1
fi

print_status "Checking Android SDK installation..."
if [ ! -d "$ANDROID_HOME" ]; then
    print_error "Android SDK not found at $ANDROID_HOME"
    exit 1
fi

print_success "Android SDK found at $ANDROID_HOME"

# Ask user for APK type
echo ""
echo "Choose APK type to generate:"
echo "1. Debug APK (faster build, larger size)"
echo "2. Release APK (optimized, smaller size)"  
echo "3. Signed Release APK (secure, for distribution)"
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        APK_TYPE="debug"
        BUILD_COMMAND="assembleDebug"
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        print_status "Generating Debug APK..."
        ;;
    2)
        APK_TYPE="release"
        BUILD_COMMAND="assembleRelease"
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        print_status "Generating Release APK..."
        ;;
    3)
        APK_TYPE="signed-release"
        BUILD_COMMAND="assembleRelease"
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        print_status "Generating Signed Release APK..."
        
        # Check if keystore exists
        KEYSTORE_PATH="android/app/chillchat-upload-key.keystore"
        if [ ! -f "$KEYSTORE_PATH" ]; then
            print_warning "Keystore not found. Generating new keystore..."
            cd android/app
            keytool -genkeypair -v -storetype PKCS12 \
                -keystore chillchat-upload-key.keystore \
                -alias chillchat-key-alias \
                -keyalg RSA -keysize 2048 -validity 10000
            cd ../..
        fi
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

# Clean previous builds
print_status "Cleaning previous builds..."
cd android
./gradlew clean

# Generate APK
print_status "Building $APK_TYPE APK..."
print_warning "This may take several minutes..."

if ./gradlew $BUILD_COMMAND; then
    if [ -f "$APK_PATH" ]; then
        print_success "APK generated successfully!"
        echo ""
        print_status "APK Details:"
        echo "📱 Location: android/$APK_PATH"
        echo "📏 Size: $(du -h $APK_PATH | cut -f1)"
        echo "📅 Created: $(date)"
        echo ""
        
        # Generate sharing instructions
        print_success "APK Installation Instructions:"
        echo ""
        echo "🔗 Transfer Options:"
        echo "  • Email APK to yourself"
        echo "  • Upload to Google Drive/Dropbox"
        echo "  • Use USB cable to copy to phone"
        echo "  • Start local server: python3 -m http.server 8000"
        echo ""
        echo "📱 Phone Installation:"
        echo "  1. Enable 'Install Unknown Apps' in Android settings"
        echo "  2. Download/transfer APK to your phone"
        echo "  3. Tap APK file in file manager"
        echo "  4. Tap 'Install' button"
        echo "  5. Grant permissions when prompted"
        echo "  6. Launch ChillChat!"
        echo ""
        
        # Copy APK to convenient location
        COPY_PATH="../chillchat-app.apk"
        cp "$APK_PATH" "$COPY_PATH"
        print_status "APK also copied to: chillchat-app.apk (for easy access)"
        
    else
        print_error "APK file not found after build"
        exit 1
    fi
else
    print_error "APK generation failed"
    print_warning "Check the build logs above for errors"
    exit 1
fi

cd ..

echo ""
print_success "🎉 APK generation completed!"
echo ""
echo "📂 Find your APK at:"
echo "   • android/$APK_PATH"  
echo "   • chillchat-app.apk (copy for easy access)"
echo ""
echo "🧪 Testing Notes:"
echo "   • APK size: ~25-40 MB"
echo "   • Requires Android 6.0+ (API 23+)"
echo "   • Bluetooth only works on real devices"
echo "   • Need 2 devices for full Bluetooth testing"
echo ""
echo "📱 Ready for wireless installation!"