# iOS IPA Build Guide for ChillChatApp

This guide provides complete instructions for building an IPA file for the ChillChatApp React Native project.

## 📋 Prerequisites

### System Requirements
- **macOS**: iOS builds require macOS with Xcode
- **Xcode**: Latest version from the Mac App Store
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js**: Version 18 or higher
- **CocoaPods**: For iOS dependency management

### Apple Developer Account
- Apple Developer Account (free or paid)
- iOS Development Certificate
- Provisioning Profile (for device testing/distribution)

## 🚀 Quick Start

### Method 1: Using the Build Script (Recommended)

1. **Run the build script:**
   ```bash
   ./build-ios-ipa.sh
   ```

2. **The script will automatically:**
   - Check all requirements
   - Install dependencies (npm + CocoaPods)
   - Create necessary configuration files
   - Build and archive the project
   - Export the IPA file

3. **Find your IPA:**
   - Location: `./ChillChatApp.ipa` (project root)
   - Also available in: `ios/build/ipa/`

### Method 2: Manual Build Process

#### Step 1: Install Dependencies
```bash
# Install npm dependencies
npm install

# Install iOS dependencies
cd ios
pod install --repo-update
cd ..
```

#### Step 2: Open in Xcode
```bash
# Open the workspace (not the project file)
open ios/ChillChatApp.xcworkspace
```

#### Step 3: Configure Signing
1. Select the project in Xcode
2. Go to "Signing & Capabilities"
3. Select your development team
4. Ensure "Automatically manage signing" is checked

#### Step 4: Build Archive
1. In Xcode: Product → Archive
2. Once complete, the Organizer window will open
3. Select your archive and click "Distribute App"
4. Choose your distribution method
5. Follow the export wizard

## 🛠 Build Script Options

The build script supports several options:

```bash
# Full IPA build (default)
./build-ios-ipa.sh

# Build for iOS Simulator only
./build-ios-ipa.sh --simulator

# Clean previous builds only
./build-ios-ipa.sh --clean

# Install dependencies only
./build-ios-ipa.sh --deps

# Show help
./build-ios-ipa.sh --help
```

## 📁 Project Structure

```
ChillChatApp/
├── ios/
│   ├── ChillChatApp/           # iOS app source
│   ├── ChillChatApp.xcodeproj/ # Xcode project
│   ├── ChillChatApp.xcworkspace/ # Xcode workspace (generated)
│   ├── Podfile                 # CocoaPods configuration
│   ├── ExportOptions.plist     # Export configuration (generated)
│   └── build/                  # Build output (generated)
│       ├── ChillChatApp.xcarchive
│       └── ipa/
├── build-ios-ipa.sh           # Build script
└── ChillChatApp.ipa           # Final IPA file
```

## ⚙️ Configuration Files

### ExportOptions.plist
The build script creates this file automatically. Key settings:

```xml
<dict>
    <key>method</key>
    <string>development</string>  <!-- or: app-store, ad-hoc, enterprise -->
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string> <!-- Update with your Apple Developer Team ID -->
    <key>signingStyle</key>
    <string>automatic</string>    <!-- or: manual -->
</dict>
```

### Distribution Methods
- **development**: For development/testing
- **ad-hoc**: For limited device distribution
- **app-store**: For App Store submission
- **enterprise**: For enterprise distribution

## 🔧 Troubleshooting

### Common Issues

#### 1. "No Developer Team Found"
**Solution:**
1. Sign in to Xcode with your Apple ID
2. Add your Apple Developer Account
3. Update `teamID` in `ios/ExportOptions.plist`

#### 2. "CocoaPods Not Found"
**Solution:**
```bash
# Install CocoaPods
sudo gem install cocoapods

# Or using Homebrew
brew install cocoapods
```

#### 3. "Code Signing Error"
**Solutions:**
- Ensure you have a valid iOS Development Certificate
- Check provisioning profiles in Xcode
- Try "Automatically manage signing" in Xcode
- Update `ExportOptions.plist` with correct `teamID`

#### 4. "Build Failed - Missing Dependencies"
**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules ios/Pods
npm install
cd ios && pod install --repo-update
```

#### 5. "Archive Export Failed"
**Solutions:**
- Check `ExportOptions.plist` configuration
- Ensure correct distribution method
- Verify code signing settings
- Try manual export from Xcode Organizer

### Build Script Errors

#### Linux/Windows Error
```
[ERROR] This script must be run on macOS with Xcode installed.
```
**Solution:** iOS builds require macOS. Use a Mac or macOS virtual machine.

#### Missing Xcode
```
[ERROR] xcodebuild not found. Please install Xcode and Xcode Command Line Tools.
```
**Solution:**
```bash
# Install Xcode from Mac App Store, then:
xcode-select --install
```

## 📱 Testing Your IPA

### Install on Device
1. **Using Xcode:**
   - Connect your device
   - Drag IPA to Xcode Devices window

2. **Using Apple Configurator 2:**
   - Download from Mac App Store
   - Connect device and install IPA

3. **Using TestFlight:**
   - Upload to App Store Connect
   - Add testers and distribute

### Verify Installation
- Check app appears on device
- Test app functionality
- Verify all features work correctly

## 🚀 Distribution Options

### Internal Testing
- Install directly on registered devices
- Share IPA file with team members
- Use ad-hoc distribution for multiple devices

### Beta Testing
- Upload to TestFlight via App Store Connect
- Add external testers (up to 10,000)
- Get feedback before App Store release

### App Store Release
- Submit to App Store Connect
- Complete App Store review process
- Release to the public

## 🔐 Code Signing & Certificates

### Development Certificate
- Used for development and testing
- Install on development devices
- Valid for 1 year

### Distribution Certificate
- Required for App Store/ad-hoc distribution
- Must be created by team administrator
- Valid for 1 year

### Provisioning Profiles
- Links certificates with app identifiers
- Development profiles for testing
- Distribution profiles for release

## 📋 Checklist

Before building your IPA:

- [ ] macOS with Xcode installed
- [ ] Apple Developer Account configured
- [ ] iOS Development Certificate installed
- [ ] Provisioning profile available
- [ ] Node.js and npm installed
- [ ] CocoaPods installed
- [ ] All project dependencies installed
- [ ] Team ID configured in ExportOptions.plist
- [ ] App tested in iOS Simulator

## 🆘 Getting Help

If you encounter issues:

1. **Check the build logs** for specific error messages
2. **Verify all prerequisites** are installed and configured
3. **Test in iOS Simulator** first before building IPA
4. **Check Apple Developer documentation** for code signing issues
5. **Use Xcode's built-in diagnostics** for detailed error information

## 📚 Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Xcode User Guide](https://developer.apple.com/library/archive/documentation/ToolsLanguages/Conceptual/Xcode_Overview/)
- [CocoaPods Guide](https://guides.cocoapods.org/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

**Note:** This project includes React Native Bluetooth functionality. Ensure you have the necessary permissions and certificates for Bluetooth features when distributing your app.