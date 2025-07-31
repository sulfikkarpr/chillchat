#!/bin/bash

# ChillChatApp iOS IPA Build Script
# This script builds an IPA file for iOS distribution
# Requirements: macOS with Xcode and Xcode Command Line Tools

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ChillChatApp"
SCHEME_NAME="ChillChatApp"
WORKSPACE_PATH="ios/ChillChatApp.xcworkspace"
PROJECT_PATH="ios/ChillChatApp.xcodeproj"
BUILD_DIR="ios/build"
ARCHIVE_PATH="ios/build/ChillChatApp.xcarchive"
IPA_DIR="ios/build/ipa"
EXPORT_OPTIONS_PLIST="ios/ExportOptions.plist"

# Print colored output
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

# Check if we're on macOS
check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script must be run on macOS with Xcode installed."
        print_error "Current OS: $OSTYPE"
        exit 1
    fi
}

# Check required tools
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "xcodebuild not found. Please install Xcode and Xcode Command Line Tools."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check CocoaPods
    if ! command -v pod &> /dev/null; then
        print_warning "CocoaPods not found. Installing..."
        sudo gem install cocoapods
    fi
    
    print_success "All requirements satisfied."
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install npm dependencies
    print_status "Installing npm dependencies..."
    npm install
    
    # Install iOS dependencies
    print_status "Installing iOS dependencies with CocoaPods..."
    cd ios
    pod install --repo-update
    cd ..
    
    print_success "Dependencies installed."
}

# Create ExportOptions.plist if it doesn't exist
create_export_options() {
    if [ ! -f "$EXPORT_OPTIONS_PLIST" ]; then
        print_status "Creating ExportOptions.plist..."
        
        cat > "$EXPORT_OPTIONS_PLIST" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string></string>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF
        
        print_success "ExportOptions.plist created."
        print_warning "Please update the teamID in $EXPORT_OPTIONS_PLIST with your Apple Developer Team ID."
    fi
}

# Clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Clean Xcode build
    xcodebuild clean \
        -workspace "$WORKSPACE_PATH" \
        -scheme "$SCHEME_NAME" \
        -configuration Release
    
    print_success "Build cleaned."
}

# Build the archive
build_archive() {
    print_status "Building archive..."
    
    # Create build directory
    mkdir -p "$BUILD_DIR"
    
    # Build archive
    xcodebuild archive \
        -workspace "$WORKSPACE_PATH" \
        -scheme "$SCHEME_NAME" \
        -configuration Release \
        -archivePath "$ARCHIVE_PATH" \
        -allowProvisioningUpdates \
        CODE_SIGN_IDENTITY="" \
        CODE_SIGNING_REQUIRED=NO \
        CODE_SIGNING_ALLOWED=NO
    
    if [ $? -eq 0 ]; then
        print_success "Archive built successfully."
    else
        print_error "Archive build failed."
        exit 1
    fi
}

# Export IPA
export_ipa() {
    print_status "Exporting IPA..."
    
    # Create IPA directory
    mkdir -p "$IPA_DIR"
    
    # Export IPA
    xcodebuild -exportArchive \
        -archivePath "$ARCHIVE_PATH" \
        -exportPath "$IPA_DIR" \
        -exportOptionsPlist "$EXPORT_OPTIONS_PLIST"
    
    if [ $? -eq 0 ]; then
        print_success "IPA exported successfully."
        
        # Find and show the IPA file
        IPA_FILE=$(find "$IPA_DIR" -name "*.ipa" | head -1)
        if [ -n "$IPA_FILE" ]; then
            print_success "IPA file created: $IPA_FILE"
            
            # Get file size
            FILE_SIZE=$(ls -lh "$IPA_FILE" | awk '{print $5}')
            print_status "File size: $FILE_SIZE"
            
            # Copy to project root for easier access
            cp "$IPA_FILE" "./ChillChatApp.ipa"
            print_success "IPA copied to project root: ./ChillChatApp.ipa"
        else
            print_error "IPA file not found in export directory."
        fi
    else
        print_error "IPA export failed."
        exit 1
    fi
}

# Alternative build for simulator (development)
build_for_simulator() {
    print_status "Building for iOS Simulator (development build)..."
    
    xcodebuild \
        -workspace "$WORKSPACE_PATH" \
        -scheme "$SCHEME_NAME" \
        -configuration Release \
        -destination 'platform=iOS Simulator,name=iPhone 14' \
        -derivedDataPath "$BUILD_DIR/DerivedData"
    
    if [ $? -eq 0 ]; then
        print_success "Simulator build completed."
        print_status "App built for iOS Simulator. You can run it using: react-native run-ios"
    else
        print_error "Simulator build failed."
    fi
}

# Main build function
main() {
    print_status "Starting iOS IPA build for $PROJECT_NAME..."
    
    check_macos
    check_requirements
    install_dependencies
    create_export_options
    clean_build
    
    # Check if workspace exists, otherwise use project
    if [ -f "$WORKSPACE_PATH" ]; then
        print_status "Using workspace: $WORKSPACE_PATH"
    else
        print_warning "Workspace not found, using project file instead"
        WORKSPACE_PATH="$PROJECT_PATH"
    fi
    
    build_archive
    export_ipa
    
    print_success "iOS IPA build completed successfully!"
    print_status "Your IPA file is ready: ./ChillChatApp.ipa"
}

# Handle command line arguments
case "${1:-}" in
    --simulator)
        print_status "Building for iOS Simulator only..."
        check_macos
        check_requirements
        install_dependencies
        build_for_simulator
        ;;
    --clean)
        print_status "Cleaning build only..."
        clean_build
        ;;
    --deps)
        print_status "Installing dependencies only..."
        check_requirements
        install_dependencies
        ;;
    --help)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --simulator    Build for iOS Simulator only"
        echo "  --clean        Clean previous builds only"
        echo "  --deps         Install dependencies only"
        echo "  --help         Show this help message"
        echo ""
        echo "Default: Build complete IPA file for distribution"
        ;;
    *)
        main
        ;;
esac