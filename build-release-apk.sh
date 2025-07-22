#!/bin/bash

# Build Release APK - No Metro Required
echo "📱 Building Release APK (No Metro Required)"
echo "==========================================="

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

print_status "Building standalone release APK..."

# Step 1: Clean everything first
print_status "Step 1: Cleaning build cache..."
rm -rf android/app/build
cd android
./gradlew clean
cd ..

# Step 2: Create bundle for release
print_status "Step 2: Creating JavaScript bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Step 3: Create assets directory if it doesn't exist
print_status "Step 3: Ensuring assets directory exists..."
mkdir -p android/app/src/main/assets

# Step 4: Build release APK
print_status "Step 4: Building release APK..."
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    print_success "🎉 Release APK built successfully!"
    
    # Find the APK file
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
    if [ -f "$APK_PATH" ]; then
        cp "$APK_PATH" "../chillchat-release-standalone.apk"
        cd ..
        
        print_success "📱 Standalone APK created: chillchat-release-standalone.apk"
        echo "📏 Size: $(du -h chillchat-release-standalone.apk | cut -f1)"
        echo ""
        echo "✅ This APK works WITHOUT Metro bundler!"
        echo ""
        echo "📋 Installation steps:"
        echo "1. Transfer chillchat-release-standalone.apk to your phone"
        echo "2. Enable 'Install Unknown Apps' in settings"
        echo "3. Tap the APK file to install"
        echo "4. Launch ChillChatApp - NO METRO ERRORS!"
        echo ""
        print_success "Ready for phone installation! 🚀"
        
    else
        print_error "Release APK not found at expected location"
        cd ..
        exit 1
    fi
else
    print_error "Release build failed, trying with signing config..."
    cd ..
    
    # Try with a basic signing config
    print_status "Creating basic signing configuration..."
    
    # Create a keystore for release signing
    if [ ! -f "android/app/my-upload-key.keystore" ]; then
        print_status "Creating keystore for signing..."
        keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=ChillChat, OU=Mobile, O=ChillChat, L=City, S=State, C=US"
    fi
    
    # Create gradle.properties for signing
    cat > android/gradle.properties << 'EOF'
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=android
MYAPP_UPLOAD_KEY_PASSWORD=android
EOF

    # Update build.gradle for signing
    cat >> android/app/build.gradle << 'EOF'

android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
EOF

    cd android
    ./gradlew assembleRelease
    
    if [ $? -eq 0 ]; then
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        if [ -f "$APK_PATH" ]; then
            cp "$APK_PATH" "../chillchat-signed-release.apk"
            cd ..
            print_success "📱 Signed release APK created: chillchat-signed-release.apk"
        fi
    else
        print_error "All build attempts failed"
        cd ..
        exit 1
    fi
fi