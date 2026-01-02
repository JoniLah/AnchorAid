# Development Build Instructions

## Creating a Development Build with Native Maps

Since `expo-maps` requires native code, you need to create a development build. This allows you to use custom native modules while still using Expo's development tools.

## Prerequisites

✅ You have an Expo account (you're logged in as: feleroid)
✅ EAS CLI is installed
✅ `eas.json` is configured

## Steps to Create Development Build

### For Android:

1. **Build the development client:**
   ```bash
   npx eas build --profile development --platform android
   ```

2. **Wait for the build to complete** (this takes 10-20 minutes)
   - You'll get a notification when it's done
   - Or check status at: https://expo.dev/accounts/feleroid/projects/anchor-aid/builds

3. **Download and install the APK:**
   - Download the APK from the Expo dashboard
   - Install it on your Android device (enable "Install from unknown sources" if needed)
   - Or scan the QR code with your device

4. **Start the development server:**
   ```bash
   npx expo start --dev-client
   ```

5. **Connect to the app:**
   - Open the development build app on your device
   - Scan the QR code or press 'a' to open on Android

### For iOS (if you have a Mac and Apple Developer account):

1. **Build the development client:**
   ```bash
   npx eas build --profile development --platform ios
   ```

2. **Install via TestFlight or direct install**
   - Follow the instructions in the Expo dashboard

3. **Start the development server:**
   ```bash
   npx expo start --dev-client
   ```

## Alternative: Local Development Build (Faster for testing)

If you want to build locally (requires Android Studio or Xcode):

### Android (Local):
```bash
npx expo prebuild
npx expo run:android
```

### iOS (Local, requires Mac):
```bash
npx expo prebuild
npx expo run:ios
```

## After Building

Once you have the development build installed:

1. The app will work like Expo Go, but with native modules
2. You can use `expo start --dev-client` to start development
3. The map feature will now work!

## Notes

- Development builds are larger than Expo Go (~50-100MB)
- You only need to rebuild when you add/remove native modules
- Regular code changes work with hot reload, no rebuild needed
- The first build takes longer, subsequent builds are faster

## Troubleshooting

If you get errors:
- Make sure you're logged in: `npx eas whoami`
- Check build status: `npx eas build:list`
- View build logs in the Expo dashboard

