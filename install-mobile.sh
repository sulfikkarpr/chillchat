#!/bin/bash

# ChillChat Mobile Installation Script
# Automates the process of building and installing the app on mobile device

echo "📱 ChillChat Mobile Installation Script"
echo "======================================"

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

# Check if adb is available
if ! command -v adb &> /dev/null; then
    print_error "ADB not found in PATH"
    print_warning "Add Android SDK platform-tools to your PATH:"
    print_warning "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

print_success "ADB is available"

# Check for connected devices
print_status "Checking for connected Android devices..."
devices=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)

if [ "$devices" -eq 0 ]; then
    print_error "No Android devices connected"
    echo ""
    echo "Please:"
    echo "1. Connect your Android device via USB"
    echo "2. Enable Developer Options (tap Build Number 7 times)"
    echo "3. Enable USB Debugging in Developer Options"
    echo "4. Allow USB debugging when prompted on your device"
    echo ""
    print_warning "Run 'adb devices' to verify your device is connected"
    exit 1
fi

print_success "$devices Android device(s) connected"
adb devices

# Ask user for installation method
echo ""
echo "Choose installation method:"
echo "1. Generate APK file for wireless installation (RECOMMENDED)"
echo "2. Install directly on connected device (requires USB)"
echo "3. Generate signed APK for distribution"
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        print_status "Generating APK for wireless installation..."
        print_warning "This may take several minutes on first build..."
        cd android
        if ./gradlew assembleRelease; then
            APK_PATH="app/build/outputs/apk/release/app-release.apk"
            if [ -f "$APK_PATH" ]; then
                print_success "APK generated successfully!"
                print_status "APK location: android/$APK_PATH"
                print_status "APK size: $(du -h $APK_PATH | cut -f1)"
                
                # Copy APK to convenient location
                COPY_PATH="../chillchat-app.apk"
                cp "$APK_PATH" "$COPY_PATH"
                print_status "APK also copied to: chillchat-app.apk"
                
                echo ""
                print_success "📱 APK Installation Instructions:"
                echo "1. Transfer APK to your phone (email, Google Drive, etc.)"
                echo "2. Enable 'Install Unknown Apps' in Android settings"
                echo "3. Tap APK file to install"
                echo "4. Grant permissions and launch ChillChat!"
            else
                print_error "APK file not found after build"
            fi
        else
            print_error "APK generation failed"
            exit 1
        fi
        cd ..
        ;;
        
    2)
        print_status "Installing directly on connected device..."
        print_warning "This may take several minutes on first build..."
        
        # Start Metro bundler in background
        print_status "Starting Metro bundler..."
        npx react-native start --reset-cache &
        METRO_PID=$!
        
        # Wait a moment for Metro to start
        sleep 5
        
        # Build and install
        print_status "Building and installing app..."
        if npx react-native run-android; then
            print_success "App installed successfully on your device!"
            print_status "Look for 'ChillChatApp' in your app drawer"
        else
            print_error "Installation failed"
            kill $METRO_PID 2>/dev/null
            exit 1
        fi
        
        # Keep Metro running
        print_status "Metro bundler is running for development"
        print_warning "Press Ctrl+C to stop Metro bundler"
        wait $METRO_PID
        ;;
        
    3)
        print_status "Generating signed APK..."
        print_warning "This requires setting up signing keys first"
        
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
        
        cd android
        if ./gradlew assembleRelease; then
            APK_PATH="app/build/outputs/apk/release/app-release.apk"
            if [ -f "$APK_PATH" ]; then
                print_success "Signed APK generated successfully!"
                print_status "APK location: android/$APK_PATH"
            else
                print_error "Signed APK file not found after build"
            fi
        else
            print_error "Signed APK generation failed"
            exit 1
        fi
        cd ..
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_success "Mobile installation process completed!"
echo ""
echo "🧪 Testing Notes:"
echo "- Bluetooth only works on real devices (not simulators)"
echo "- Grant all permissions when prompted"
echo "- Use two devices for full Bluetooth testing"
echo "- Check console logs with: npx react-native log-android"
echo ""
echo "📱 Need help? Check MOBILE_INSTALLATION.md for detailed instructions"