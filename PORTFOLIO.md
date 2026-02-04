# ⚓ Anchor Aid - Portfolio Description

## Short Description

**Anchor Aid** is a professional marine safety mobile application that helps boaters anchor safely by calculating optimal anchor scope, monitoring anchor position with GPS, and providing real-time drag alerts. Built with React Native and TypeScript for iOS and Android.

---

## Long Description

Anchor Aid is a comprehensive anchoring assistant mobile application designed to enhance boating safety and simplify anchoring operations. The app provides boaters with essential tools and real-time monitoring capabilities to ensure secure anchoring in various marine conditions.

**Core Functionality:**

The application features an intelligent anchor scope calculator that recommends optimal rode length based on water depth, bow height, wind conditions, and bottom type. It supports multiple rode configurations (chain, rope+chain, rope-only) and automatically adjusts recommendations based on environmental factors.

**Real-Time Monitoring:**

Anchor Aid's GPS-based anchor drag alarm continuously monitors your boat's position relative to the anchor point. The system uses advanced GPS smoothing algorithms to reduce false alarms while maintaining sensitivity to actual anchor movement. When drag is detected beyond a user-configurable threshold, the app triggers customizable audio alarms (including siren, persistent, and beep options) along with vibration alerts.

**Visual Tools:**

The app includes an interactive swing radius calculator that visualizes your boat's potential movement area on a map. This helps boaters ensure adequate spacing from other vessels and obstacles. The bottom type mapping feature allows users to record and reference seabed conditions at different locations, improving anchoring decisions over time.

**User Experience:**

Anchor Aid features a clean, intuitive interface with support for multiple languages (English, Finnish, Swedish), dark/light themes, and both metric and imperial units. The app works entirely offline, making it reliable in remote marine environments where internet connectivity may be unavailable.

**Safety First:**

The application emphasizes safety with comprehensive disclaimers, anchoring technique guides, and anchor type recommendations. All calculations include safety margins, and the system provides warnings when recommended configurations exceed available equipment.

---

## Features

### Core Features

- **Anchor Scope Calculator**

  - Calculate recommended rode length based on water depth, bow height, and scope ratio
  - Support for chain, rope+chain, and rope rode types
  - Automatic scope ratio recommendations based on wind conditions
  - Safety margin calculations
  - Warnings when recommended length exceeds available rode

- **GPS-Based Anchor Drag Alarm**

  - Set anchor point using GPS coordinates
  - Real-time position monitoring with configurable update intervals
  - Configurable drag threshold distance
  - GPS position smoothing to reduce jitter and false alarms
  - Multiple alarm sound types (Default, Loud, Persistent, Siren, Beep)
  - Adjustable alarm volume (0-100%)
  - Vibration alerts alongside audio alarms
  - GPS accuracy monitoring and warnings
  - Background location tracking
  - Lock screen notifications

- **Swing Radius Calculator**

  - Calculate swing radius based on deployed rode length and boat length
  - Visual swing circle on interactive map
  - Real-time distance and bearing calculations
  - Display anchor point and current position
  - Monitor view with comprehensive position information

- **Bottom Type Mapping**

  - Manual selection of bottom type (Sand, Mud, Clay, Grass/Weeds, Rock, Coral, Unknown)
  - Interactive map for recording bottom type locations
  - Draw polygons and circles to mark areas
  - Edit and manage recorded bottom type areas
  - Anchoring suitability hints for each bottom type
  - AI-powered bottom type prediction based on nearby data

- **Wind & Conditions Input**

  - Manual wind speed and gust speed entry
  - Automatic scope ratio recommendations based on wind conditions
  - Guidance for light, moderate, and strong wind conditions

- **Anchor Type Guide**

  - Comprehensive guide to 18+ anchor types
  - Visual anchor illustrations
  - Best use recommendations for each anchor type
  - Suitability information for different bottom conditions

- **Anchoring Technique Guide**
  - Step-by-step anchoring instructions
  - Safety checklists
  - Best practices and tips
  - Visual guides for proper anchoring procedures

### User Experience Features

- **Multi-Language Support**

  - English
  - Finnish (Suomi)
  - Swedish (Svenska)

- **Theme Support**

  - System theme (follows device settings)
  - Light mode
  - Dark mode

- **Unit Systems**

  - Metric (meters, meters/second)
  - Imperial (feet, knots)

- **Session Management**

  - Save anchoring sessions with notes
  - Session history (last 10 sessions)
  - View and resume previous sessions
  - Session data includes location, conditions, and calculations

- **Settings & Customization**

  - Default scope ratio configuration
  - Default drag threshold settings
  - GPS update interval configuration
  - GPS smoothing window adjustment
  - Alarm sound type selection
  - Alarm volume control
  - Language selection
  - Theme preferences
  - Unit system preferences

- **Additional Features**
  - Emergency contacts management
  - Privacy policy and terms of service
  - Safety disclaimers
  - Offline-first architecture (works without internet)
  - Keep screen awake during monitoring
  - Ad integration (Google AdMob)

---

## Technologies

### Frontend Framework

- **React Native** 0.81.5
- **React** 19.1.0
- **TypeScript** 5.9.2
- **Expo SDK** ~54.0.0

### Navigation & Routing

- **React Navigation** 7.x
  - Stack Navigator
  - Native Stack Navigator

### Maps & Location

- **React Native Maps** 1.26.20
- **Expo Location** ~19.0.8
- **Expo Maps** 0.12.10
- **Expo Task Manager** ~14.0.9

### State Management & Storage

- **AsyncStorage** 2.2.0 (React Native Async Storage)
- Local state management with React hooks

### UI Components & Styling

- **Expo Linear Gradient** ~15.0.8
- **React Native Gesture Handler** ~2.28.0
- **React Native Safe Area Context** 5.6.2
- **React Native Screens** ~4.16.0
- Custom styled components
- Theme context for dark/light mode

### Audio & Notifications

- **Expo AV** ~16.0.8 (Audio playback)
- **Expo Notifications** ~0.32.15
- **Expo Keep Awake** ~15.0.8

### Monetization

- **React Native Google Mobile Ads** 16.0.1
  - Banner ads
  - Interstitial ads

### Development Tools

- **Expo Dev Client** 6.0.20
- **Babel Preset Expo** 54.0.9
- **TypeScript** for type safety
- **Jest** for unit testing

### Build & Deployment

- **EAS Build** (Expo Application Services)
- **EAS CLI** >= 16.0.0

### Key Libraries & Utilities

- Custom haversine distance calculations
- Unit conversion utilities
- GPS smoothing algorithms
- Scope calculation algorithms
- Swing radius calculations
- Alarm trigger logic

### Architecture Patterns

- **Clean Architecture** (Domain logic separated from UI)
- **Component-Based Architecture**
- **Functional Programming** (Pure functions for calculations)
- **Context API** for theme management
- **Custom Hooks** for reusable logic

---

## Requirements

### iOS

- **Minimum iOS Version:** iOS 13.0+
- **Supported Devices:** iPhone and iPad
- **Required Permissions:**
  - Location Services (Always / While In Use)
  - Background Location Updates
- **Capabilities:**
  - Background modes for location tracking
  - Push notifications (for lock screen alerts)

### Android

- **Minimum Android Version:** Android 9.0+ (API Level 28+)
- **Target Android Version:** Latest stable
- **Required Permissions:**
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_COARSE_LOCATION`
  - `ACCESS_BACKGROUND_LOCATION`
  - `FOREGROUND_SERVICE`
  - `FOREGROUND_SERVICE_LOCATION`
- **Features:**
  - Foreground service for continuous location tracking
  - Background location updates

### Device Requirements

- **GPS:** Required for anchor monitoring features
- **Storage:** Minimal (app size ~50-100MB)
- **Battery:** Optimized for extended use with configurable update intervals
- **Internet:** Optional (app works offline, internet required only for ads and map tiles)

### Development Requirements

- **Node.js:** >= 18.0.0
- **npm** or **yarn**
- **Expo CLI:** >= 16.0.0
- **iOS Development:** Xcode (for iOS builds)
- **Android Development:** Android Studio (for Android builds)

---

## Technical Highlights

- **Offline-First Design:** All core features work without internet connectivity
- **Type Safety:** Full TypeScript coverage throughout the codebase
- **Test Coverage:** Unit tests for core calculation functions
- **Performance:** Optimized GPS smoothing algorithms to reduce battery drain
- **Accessibility:** Support for system themes and language preferences
- **Cross-Platform:** Single codebase for iOS and Android
- **Native Features:** Background location tracking, lock screen notifications, audio alarms

---

## Project Information

- **Developer:** Feleroid
- **Package Name:** com.feleroid.anchoraid
- **Version:** 0.1.0
- **License:** Private (Educational/Personal Use)
- **Repository:** Private

---

_Built with ⚓ for boaters who value safety and precision._
