import {Platform} from 'react-native';
import {loadData, saveData} from './storage';
import {logger} from '../utils/logger';

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
  logger.warn('react-native-google-mobile-ads not available:', error);
}

// Ad frequency settings
const AD_FREQUENCY = 3; // Show ad every 3 actions (after first time)
const AD_COUNTER_KEY = '@anchor_aid:ad_counter';
const AD_FIRST_TIME_KEY = '@anchor_aid:ad_first_time_shown';

/**
 * Reset ad counter (useful for testing or resetting ad frequency)
 * Sets counter to null and firstTimeShown to false so next action will show ad
 */
export async function resetAdCounter(): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(AD_COUNTER_KEY);
    await AsyncStorage.removeItem(AD_FIRST_TIME_KEY);
    logger.log('Ad counter and firstTimeShown reset');
  } catch (error) {
    logger.warn('Error resetting ad counter:', error);
  }
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
    
    logger.log('Interstitial ad loaded');
  } catch (error) {
    logger.warn('Failed to load interstitial ad:', error);
  }
}

/**
 * Check if ad should be shown based on action counter
 * Returns true if ad should be shown, false otherwise
 * Shows ad on first action, then every AD_FREQUENCY actions after that
 */
async function shouldShowAd(): Promise<boolean> {
  try {
    const counter = await loadData<number>(AD_COUNTER_KEY);
    
    logger.log('Ad counter check - current counter:', counter);
    
    // Show ad on first time (counter doesn't exist yet)
    if (counter === null || counter === undefined) {
      logger.log('First time - showing ad, setting counter to', AD_FREQUENCY);
      // Set counter to AD_FREQUENCY so next ad shows after AD_FREQUENCY actions
      await saveData(AD_COUNTER_KEY, AD_FREQUENCY);
      return true;
    }
    
    // Decrement counter (starts at AD_FREQUENCY, counts down to 0)
    const newCounter = counter - 1;
    logger.log('Decrementing counter from', counter, 'to', newCounter);
    
    // Show ad when counter reaches 0, then reset to AD_FREQUENCY
    if (newCounter <= 0) {
      logger.log('Counter reached 0 - showing ad and resetting to', AD_FREQUENCY);
      await saveData(AD_COUNTER_KEY, AD_FREQUENCY);
      return true;
    }
    
    // Save updated counter
    await saveData(AD_COUNTER_KEY, newCounter);
    logger.log('Ad counter not reached (', newCounter, '> 0), skipping ad');
    return false;
  } catch (error) {
    logger.warn('Error checking ad counter:', error);
    // On error, show ad to be safe
    return true;
  }
}

/**
 * Show interstitial ad if loaded and counter threshold reached
 * Returns a promise that resolves when the ad is shown or fails
 */
export async function showInterstitialAd(): Promise<void> {
  return new Promise(async (resolve) => {
    try {
      // Check if we should show ad based on counter
      const shouldShow = await shouldShowAd();
      if (!shouldShow) {
        logger.log('Ad counter not reached, skipping ad');
        resolve();
        return;
      }
      
      if (!InterstitialAd) {
        logger.warn('AdMob not available');
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
                logger.log('Interstitial ad closed');
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

