# ⚓ Anchor Aid - Anchoring Assistant Mobile App

A React Native mobile application that helps boaters anchor safely by calculating anchor rode length (scope), estimating swing radius, showing anchoring suitability hints, and providing an anchor-drag alarm using GPS.

## Features

### MVP Features

1. **Anchor Rode / Scope Calculator**

   - Calculate recommended rode length based on water depth, bow height, and scope ratio
   - Support for chain, rope+chain, and rope rode types
   - Safety margin calculation
   - Warnings when recommended length exceeds available rode

2. **Wind / Gust Input**

   - Manual wind speed and gust speed entry
   - Automatic scope ratio recommendations based on wind conditions
   - Guidance for light, moderate, and strong wind conditions

3. **Swing Radius Estimator**

   - Calculate swing radius based on deployed rode length and boat length
   - Visual swing circle on map showing anchor point and current position
   - Real-time distance and bearing calculations

4. **Anchor Drag Alarm (GPS-based)**

   - Set anchor point using GPS
   - Configurable drag threshold distance
   - GPS position smoothing to reduce jitter
   - Audio and vibration alerts when drag is detected
   - GPS accuracy monitoring and warnings

5. **Seabed / Bottom Type**

   - Manual selection of bottom type (Sand, Mud, Clay, Grass/Weeds, Rock, Coral, Unknown)
   - Anchoring suitability hints for each bottom type

6. **Units and Settings**
   - Support for metric (meters) and imperial (feet) units
   - Persistent user preferences
   - Session history (last 10 sessions)

## Tech Stack

- **React Native** 0.73.0
- **TypeScript**
- **React Navigation** (Stack Navigator)
- **React Native Maps** (for swing circle visualization)
- **AsyncStorage** (for data persistence)
- **Geolocation API** (for GPS tracking)

## Project Structure

```
anchor-aid/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── InputField.tsx
│   │   ├── PickerField.tsx
│   │   ├── SafetyDisclaimer.tsx
│   │   └── SwingCircleView.tsx
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── AnchoringSessionScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Services (storage, location)
│   │   ├── storage.ts
│   │   └── location.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── units.ts
│   │   ├── haversine.ts
│   │   ├── scopeCalculator.ts
│   │   ├── swingCalculator.ts
│   │   ├── bottomType.ts
│   │   ├── alarmLogic.ts
│   │   └── __tests__/      # Unit tests
│   └── App.tsx             # Main app component
├── index.js                # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js >= 18
- React Native development environment set up
  - For iOS: Xcode and CocoaPods
  - For Android: Android Studio and Android SDK

### Environment Setup

1. **Create a `.env` file** in the project root:

   ```bash
   cp .env.example .env
   ```

2. **Add your Google Maps API key** to `.env`:

   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

   Get your API key from: https://console.cloud.google.com/google/maps-apis

   **Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### Initial Project Setup

**Important:** This repository contains the source code and configuration files. To create a runnable React Native project:

1. **Create a new React Native project:**

   ```bash
   npx react-native init AnchorAid --version 0.73.0
   cd AnchorAid
   ```

2. **Replace the generated files with this project's files:**

   - Copy the entire `src/` folder
   - Copy `package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `.eslintrc.js`
   - Copy `index.js` and `app.json`
   - Copy `ios/AnchorAid/Info.plist` to your iOS project
   - Copy `android/app/src/main/AndroidManifest.xml` to your Android project
   - Copy `.prettierrc.js` and `jest.config.js`

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **iOS setup (if targeting iOS):**

   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Run the app:**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

**Alternative:** If you prefer to set up manually, see `SETUP.md` for detailed instructions.

## Permissions

### Required Permissions

- **Location Permission** (Always / While In Use)
  - Required for GPS-based anchor drag alarm
  - Used to set anchor point and track boat position
  - Configure in:
    - iOS: `ios/AnchorAid/Info.plist` - Add `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription`
    - Android: `android/app/src/main/AndroidManifest.xml` - Already included via `@react-native-community/geolocation`

### iOS Configuration

Add to `ios/AnchorAid/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Anchor Aid needs your location to set anchor point and monitor for anchor drag.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Anchor Aid needs your location to monitor anchor drag even when the app is in the background.</string>
```

### Android Configuration

The location permission is automatically included via the geolocation package. Ensure your `AndroidManifest.xml` includes:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Usage

### Starting a New Anchoring Session

1. Tap "Start New Anchoring Session" on the home screen
2. Enter conditions:
   - Water depth at anchor spot
   - Bow height / freeboard
   - Desired scope ratio (or use wind-based recommendation)
   - Wind speed and gust speed (optional)
   - Bottom type
   - Available rode length (optional)
3. Tap "Calculate" to get recommended rode length
4. Enter actual rode deployed and boat length to calculate swing radius
5. Tap "Set Anchor Point" to capture current GPS position
6. Configure drag threshold and tap "Start Alarm" to begin monitoring

### Settings

- Configure default units (metric/imperial)
- Set default scope ratio, drag threshold, update interval
- Adjust GPS smoothing window

## Version Management

The app uses semantic versioning (major.minor.patch). Version is managed in both `app.config.js` and `app.json`.

### EAS Build Version Management

EAS automatically increments `versionCode` (Android) and `buildNumber` (iOS) for each build. The semantic version (`version` field) should be manually bumped before production builds.

### Bumping Version

Use the provided npm scripts to bump the version:

```bash
# Patch version (1.0.0 -> 1.0.1) - Bug fixes, small changes
npm run version:patch

# Minor version (1.0.0 -> 1.1.0) - New features, backward compatible
npm run version:minor

# Major version (1.0.0 -> 2.0.0) - Breaking changes
npm run version:major
```

The script automatically updates both `app.config.js` and `app.json`.

### Build Workflow

1. **Development builds** (`eas build --profile development`):

   - Auto-increments versionCode/buildNumber
   - Version stays the same

2. **Preview builds** (`eas build --profile preview`):

   - Auto-increments versionCode/buildNumber
   - Bump patch version before building: `npm run version:patch`

3. **Production builds** (`eas build --profile production`):
   - Auto-increments versionCode/buildNumber
   - Bump version based on changes:
     - Bug fixes: `npm run version:patch`
     - New features: `npm run version:minor`
     - Breaking changes: `npm run version:major`

Example workflow:

```bash
# Make your changes
git add .
git commit -m "Fix: Resolve anchor drag alarm issue"

# Bump patch version
npm run version:patch

# Commit version bump
git add app.config.js app.json
git commit -m "Bump version to 1.0.1"

# Build for production
eas build --profile production --platform android
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Test coverage includes:

- Unit conversion functions
- Haversine distance calculations
- Scope calculations
- Swing radius calculations
- Alarm trigger logic with GPS jitter simulation

## Safety Disclaimer

⚠️ **IMPORTANT SAFETY NOTICE**

This app provides guidance only and does not replace:

- Nautical charts
- Proper seamanship
- Official safety equipment
- Professional navigation advice

Always:

- Use proper navigation tools
- Monitor conditions continuously
- Exercise sound judgment
- Have appropriate safety equipment on board

The developer assumes no liability for any consequences resulting from use of this app.

## Edge Cases Handled

- **No GPS permission**: Clear prompt shown, alarm disabled
- **Poor GPS accuracy**: Warning displayed, increased smoothing applied
- **Missing required fields**: Calculation blocked with clear error messages
- **Insufficient rode**: Warning displayed when recommended exceeds available
- **Battery considerations**: Configurable update intervals to balance accuracy and battery life

## Development Notes

### Architecture

- **Clean Architecture**: Domain logic separated from UI
- **Pure Functions**: Core calculations are pure functions, easily testable
- **Type Safety**: Full TypeScript coverage
- **Offline-First**: All core features work without internet connection

### Future Enhancements (Post-MVP)

- Tide/current data integration
- Weather API integration for automatic wind data
- Bottom type detection via depth sounder integration
- Historical anchor drag patterns
- Export session data
- Multiple anchor monitoring
- Anchor watch scheduling

## License

This project is provided as-is for educational and personal use.

## Contributing

This is an MVP project. Contributions and feedback are welcome!

---

**Built with ⚓ for boaters who value safety and precision.**
