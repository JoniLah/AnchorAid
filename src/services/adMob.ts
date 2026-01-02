import {Platform} from 'react-native';

// Conditionally import AdMob - may not be available in Expo Go
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  InterstitialAd = mobileAds.InterstitialAd;
  AdEventType = mobileAds.AdEventType;
  TestIds = mobileAds.TestIds;
} catch (error) {
  console.warn('react-native-google-mobile-ads not available:', error);
}

// Get interstitial ad unit ID based on platform
const getInterstitialAdUnitId = (): string => {
  if (__DEV__) {
    return TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712';
  }
  
  // Production unit IDs by platform
  if (Platform.OS === 'ios') {
    return 'ca-app-pub-7120303946590068/1949766019'; // iOS Interstitial
  } else {
    return 'ca-app-pub-7120303946590068/3262847682'; // Android Interstitial
  }
};

let interstitialAd: any = null;

/**
 * Initialize and load interstitial ad
 */
export async function loadInterstitialAd(): Promise<void> {
  try {
    if (!InterstitialAd) {
      console.warn('AdMob not available');
      return;
    }
    
    const adUnitId = getInterstitialAdUnitId();
    interstitialAd = InterstitialAd.createForAdRequest(
      adUnitId,
      {
        requestNonPersonalizedAdsOnly: false,
      },
    );

    // Preload the ad
    await interstitialAd.load();
    
    console.log('Interstitial ad loaded');
  } catch (error) {
    console.warn('Failed to load interstitial ad:', error);
  }
}

/**
 * Show interstitial ad if loaded
 * Returns a promise that resolves when the ad is shown or fails
 */
export async function showInterstitialAd(): Promise<void> {
  return new Promise(async (resolve) => {
    try {
      if (!InterstitialAd) {
        console.warn('AdMob not available');
        resolve();
        return;
      }

      // If no ad exists, load one
      if (!interstitialAd) {
        await loadInterstitialAd();
      }

      // Wait a bit for ad to load if it's not ready
      if (interstitialAd && !interstitialAd.loaded) {
        // Wait up to 2 seconds for ad to load
        let attempts = 0;
        const checkLoaded = setInterval(() => {
          attempts++;
          if (interstitialAd && interstitialAd.loaded) {
            clearInterval(checkLoaded);
            showAd();
          } else if (attempts >= 20) {
            // 2 seconds timeout (20 * 100ms)
            clearInterval(checkLoaded);
            console.log('Interstitial ad loading timeout');
            resolve();
          }
        }, 100);
      } else if (interstitialAd && interstitialAd.loaded) {
        showAd();
      } else {
        console.log('Interstitial ad not available');
        resolve();
      }

      async function showAd() {
        if (interstitialAd && interstitialAd.loaded) {
          try {
            // Set up event listener for when ad is closed
            const unsubscribeClosed = interstitialAd.addAdEventListener(
              AdEventType?.CLOSED || 'closed',
              () => {
                console.log('Interstitial ad closed');
                unsubscribeClosed?.();
                
                // Reload for next time
                interstitialAd = null;
                loadInterstitialAd();
                
                resolve();
              },
            );

            // Show the ad
            await interstitialAd.show();
            
            // If show() succeeds but ad closes immediately, resolve after a short delay
            // This handles cases where the ad might close before the event fires
            setTimeout(() => {
              if (interstitialAd) {
                unsubscribeClosed?.();
                interstitialAd = null;
                loadInterstitialAd();
                resolve();
              }
            }, 100);
          } catch (error: any) {
            console.warn('Failed to show interstitial ad:', error);
            resolve();
          }
        } else {
          resolve();
        }
      }
    } catch (error) {
      console.warn('Failed to show interstitial ad:', error);
      resolve();
    }
  });
}

