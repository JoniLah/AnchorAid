require('dotenv').config();

const withAdMobManifestFix = require('./plugins/withAdMobManifestFix');

module.exports = (() => {
  const config = {
  expo: {
    name: 'Anchor Aid',
    slug: 'anchor-aid',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#007AFF',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.feleroid.anchoraid',
      config: {
        googleMobileAdsAppId: 'ca-app-pub-7120303946590068~4903232417',
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Anchor Aid needs your location to set anchor point and monitor for anchor drag.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Anchor Aid needs your location to monitor anchor drag even when the app is in the background.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#007AFF',
      },
      package: 'com.feleroid.anchoraid',
      versionCode: 2,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
        googleMobileAdsAppId: 'ca-app-pub-7120303946590068~4575929356',
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
    },
    plugins: [
      'expo-dev-client',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Anchor Aid needs your location to monitor anchor drag.',
        },
      ],
      'expo-notifications',
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-7120303946590068~4575929356',
          iosAppId: 'ca-app-pub-7120303946590068~4903232417',
        },
      ],
      withAdMobManifestFix,
    ],
    extra: {
      eas: {
        projectId: '31d317eb-0c82-4717-a3c6-c2e3a81893e8',
      },
    },
    owner: 'feleroid',
  },
  };

  return config;
})();

