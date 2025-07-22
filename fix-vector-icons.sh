#!/bin/bash

# Fix Vector Icons Linking Issues
echo "🔧 Fixing React Native Vector Icons Linking..."

# Step 1: Update react-native.config.js with correct configuration
echo "📝 Updating react-native.config.js..."
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

# Step 2: Ensure fonts directory exists
echo "📁 Creating fonts directory..."
mkdir -p assets/fonts

# Step 3: Link vector icons assets
echo "🔗 Linking vector icons assets..."
npx react-native link react-native-vector-icons

# Step 4: Clean and rebuild
echo "🧹 Cleaning build cache..."
cd android
./gradlew clean
cd ..

echo "✅ Vector Icons fix completed!"
echo "📱 Now try: npx react-native run-android"