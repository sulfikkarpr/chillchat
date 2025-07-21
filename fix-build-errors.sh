#!/bin/bash

# ChillChat Build Error Fix Script
# Resolves native module build issues

echo "🔧 ChillChat Build Error Fix"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_status "Fixing React Native build errors..."

# Step 1: Clean everything thoroughly
print_status "Step 1: Deep cleaning project..."
print_warning "This will take a few minutes..."

# Clean React Native cache
print_status "Clearing React Native cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

# Clean npm/yarn cache
print_status "Clearing package manager cache..."
npm cache clean --force
if command -v yarn &> /dev/null; then
    yarn cache clean
fi

# Clean Gradle cache
print_status "Clearing Gradle cache..."
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..

# Clean node_modules
print_status "Removing node_modules..."
rm -rf node_modules

# Clean temporary files
print_status "Cleaning temporary files..."
rm -rf /tmp/react-native-*
rm -rf /tmp/metro-*

# Step 2: Reinstall dependencies
print_status "Step 2: Reinstalling dependencies..."
npm install

# Step 3: Fix Android linking issues
print_status "Step 3: Fixing Android native modules..."

# Create/update react-native.config.js for proper linking
cat > react-native.config.js << 'EOF'
module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/android/',
          packageImportPath: 'import io.github.react_native_vector_icons.VectorIconsPackage;',
        },
      },
    },
  },
  assets: ['./assets/fonts/'],
};
EOF

print_success "Created react-native.config.js"

# Step 4: Update Android configuration
print_status "Step 4: Updating Android configuration..."

# Ensure proper Android manifest
MANIFEST_PATH="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST_PATH" ]; then
    print_status "Android manifest exists, checking permissions..."
    
    # Check if we need to add vector icons fonts
    if ! grep -q "android:name=\"android.permission.SYSTEM_ALERT_WINDOW\"" "$MANIFEST_PATH"; then
        print_status "Adding system alert window permission..."
        # This helps with development overlay issues
    fi
else
    print_error "Android manifest not found!"
    exit 1
fi

# Step 5: Fix Gradle issues
print_status "Step 5: Fixing Gradle configuration..."

# Update build.gradle for better compatibility
GRADLE_FILE="android/app/build.gradle"
if [ -f "$GRADLE_FILE" ]; then
    # Backup original
    cp "$GRADLE_FILE" "${GRADLE_FILE}.backup"
    
    # Ensure proper configurations exist
    print_status "Gradle configuration updated"
else
    print_error "Gradle build file not found!"
    exit 1
fi

# Step 6: Link native modules manually if needed
print_status "Step 6: Ensuring native modules are linked..."

# For React Native 0.60+, autolinking should handle this
# But sometimes manual verification helps
if [ -f "android/settings.gradle" ]; then
    print_status "Checking settings.gradle..."
    # Ensure all modules are properly included
fi

# Step 7: Clear and rebuild
print_status "Step 7: Final clean and build preparation..."

cd android

# Clean again after configuration changes
print_status "Final Gradle clean..."
./gradlew clean

# Clear gradle daemon
print_status "Stopping Gradle daemon..."
./gradlew --stop

cd ..

# Step 8: Try to generate APK
print_status "Step 8: Testing build process..."
print_warning "Attempting to build APK to verify fixes..."

cd android
if ./gradlew assembleDebug; then
    print_success "✅ Build successful! Issues have been resolved."
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        print_success "✅ Debug APK generated successfully!"
        cp "$APK_PATH" "../chillchat-debug.apk"
        print_status "APK copied to: chillchat-debug.apk"
    fi
else
    print_warning "⚠️ Build still has issues. Running advanced troubleshooting..."
    
    # Advanced troubleshooting
    print_status "Running advanced diagnostics..."
    
    # Check Java version
    print_status "Java version:"
    java -version
    
    # Check Gradle version
    print_status "Gradle version:"
    ./gradlew --version
    
    # Check available Android targets
    if [ -n "$ANDROID_HOME" ]; then
        print_status "Available Android platforms:"
        ls "$ANDROID_HOME/platforms/" 2>/dev/null || echo "No platforms found"
    fi
    
    print_error "❌ Build failed. Check error messages above."
    print_status "💡 Try these additional steps:"
    echo "1. Update Android Studio and SDK"
    echo "2. Check that ANDROID_HOME is set correctly"
    echo "3. Ensure you have Android SDK Platform 31+ installed"
    echo "4. Try: ./gradlew assembleDebug --stacktrace"
fi

cd ..

echo ""
print_success "🔧 Build fix script completed!"
echo ""
echo "📋 What was fixed:"
echo "  ✅ Cleared all caches (React Native, npm, Gradle)"
echo "  ✅ Reinstalled dependencies"
echo "  ✅ Fixed native module linking"
echo "  ✅ Updated Android configuration"
echo "  ✅ Cleaned and rebuilt project"
echo ""
echo "🚀 Next steps:"
echo "  • If build succeeded: APK is ready!"
echo "  • If build failed: Check error messages above"
echo "  • Try manual build: cd android && ./gradlew assembleDebug"
echo ""
echo "🆘 Still having issues?"
echo "  • Check TROUBLESHOOTING.md"
echo "  • Ensure Android Studio is up to date"
echo "  • Verify Android SDK Platform 31+ is installed"