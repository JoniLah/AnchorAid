# Setup Guide for Anchor Aid

This guide will help you set up the Anchor Aid React Native project from scratch.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```
3. **For iOS Development:**
   - macOS
   - Xcode (latest version)
   - CocoaPods: `sudo gem install cocoapods`
4. **For Android Development:**
   - Android Studio
   - Android SDK (API level 33 or higher)
   - Java Development Kit (JDK 17 or higher)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup

Ensure your `ANDROID_HOME` environment variable is set:

**Windows:**
```powershell
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

**macOS/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Running the App

### iOS

```bash
npm run ios
```

Or open `ios/AnchorAid.xcworkspace` in Xcode and run from there.

### Android

1. Start an Android emulator or connect a device
2. Run:
   ```bash
   npm run android
   ```

## Permissions Configuration

### iOS

The `Info.plist` file already includes location permission descriptions. If you need to modify them, edit:
- `ios/AnchorAid/Info.plist`

### Android

The `AndroidManifest.xml` already includes location permissions. If you need to modify them, edit:
- `android/app/src/main/AndroidManifest.xml`

## Troubleshooting

### Metro Bundler Issues

If you encounter Metro bundler errors:

```bash
npm start -- --reset-cache
```

### iOS Build Issues

1. Clean build folder in Xcode: `Product > Clean Build Folder` (Shift+Cmd+K)
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Reinstall pods:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

### Android Build Issues

1. Clean gradle cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
2. Invalidate caches in Android Studio: `File > Invalidate Caches / Restart`

### Location Permission Not Working

1. **iOS**: Check that `Info.plist` has the location permission keys
2. **Android**: Verify `AndroidManifest.xml` has location permissions
3. Check device settings to ensure location services are enabled
4. For Android, ensure you're testing on a device or emulator with Google Play Services

## Testing

Run unit tests:

```bash
npm test
```

## Project Structure Notes

- All source code is in `src/`
- Native iOS code would be in `ios/` (if using React Native CLI)
- Native Android code would be in `android/` (if using React Native CLI)
- Configuration files are in the root directory

## Next Steps

1. Run the app on a device or emulator
2. Test the anchor calculator functionality
3. Test GPS location services
4. Verify alarm functionality

## Notes

- This project uses React Native 0.73.0
- TypeScript is configured for type safety
- All core features work offline (no internet required)
- GPS functionality requires device location services to be enabled

