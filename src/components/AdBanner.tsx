import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';

// Conditionally import AdMob - may not be available in Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  BannerAd = mobileAds.BannerAd;
  BannerAdSize = mobileAds.BannerAdSize;
  TestIds = mobileAds.TestIds;
} catch (error) {
  console.warn('react-native-google-mobile-ads not available:', error);
}

interface AdBannerProps {
  unitId?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({unitId}) => {
  // Use test IDs in development, actual unit IDs in production
  const getAdUnitId = () => {
    if (unitId) return unitId;
    
    if (__DEV__) {
      return TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111';
    }
    
    // Production unit IDs by platform
    if (Platform.OS === 'ios') {
      return 'ca-app-pub-7120303946590068/2277069076'; // iOS Banner
    } else {
      return 'ca-app-pub-7120303946590068/1565449172'; // Android Banner
    }
  };

  const adUnitId = getAdUnitId();

  if (!BannerAd || !BannerAdSize) {
    // Fallback UI when AdMob is not available
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

