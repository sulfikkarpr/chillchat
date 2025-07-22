#!/bin/bash

# Complete Vector Icons Fix - Addresses Package Import Issues
echo "🔧 Complete Vector Icons Fix"
echo "============================"

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

print_status "Step 1: Removing react-native-vector-icons completely..."
npm uninstall react-native-vector-icons

print_status "Step 2: Cleaning autolinking cache..."
rm -rf node_modules/.bin
rm -rf android/app/build
cd android && ./gradlew clean && cd ..

print_status "Step 3: Reinstalling react-native-vector-icons with correct version..."
npm install react-native-vector-icons@10.0.3

print_status "Step 4: Creating proper react-native.config.js..."
cat > react-native.config.js << 'EOF'
module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/android/',
          packageImportPath: 'import com.oblador.vectoricons.VectorIconsPackage;',
        },
      },
    },
  },
  assets: ['./assets/fonts/'],
};
EOF

print_status "Step 5: Creating manual PackageList fix..."
# Create a patch for the PackageList if needed
PACKAGE_LIST_PATH="android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java"
if [ -f "$PACKAGE_LIST_PATH" ]; then
    print_status "Removing generated PackageList to force regeneration..."
    rm -f "$PACKAGE_LIST_PATH"
fi

print_status "Step 6: Clean reinstall of dependencies..."
rm -rf node_modules
npm install

print_status "Step 7: Force autolinking refresh..."
npx react-native unlink react-native-vector-icons 2>/dev/null || true
npx react-native link react-native-vector-icons

print_status "Step 8: Ensuring fonts directory exists..."
mkdir -p assets/fonts

print_status "Step 9: Clean gradle build..."
cd android
./gradlew clean
./gradlew --stop
cd ..

print_success "Vector Icons fix completed!"
print_status "Now try building APK with: ./build-apk-directly.sh"