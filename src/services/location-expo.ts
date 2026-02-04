import * as Location from 'expo-location';
import {Location as AppLocation} from '../types';

/**
 * Request location permissions
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const {status} = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Get current position
 */
export async function getCurrentPosition(): Promise<AppLocation> {
  try {
    // First try to get last known position (faster, works even if GPS is off)
    const lastKnownPosition = await Location.getLastKnownPositionAsync({
      maxAge: 60000, // Use if less than 1 minute old
    });
    
    if (lastKnownPosition && 
        lastKnownPosition.coords.latitude !== 0 && 
        lastKnownPosition.coords.longitude !== 0) {
      console.log('Using last known position');
      return {
        latitude: lastKnownPosition.coords.latitude,
        longitude: lastKnownPosition.coords.longitude,
        accuracy: lastKnownPosition.coords.accuracy || undefined,
        timestamp: lastKnownPosition.timestamp,
      };
    }
    
    // If no last known position, get fresh position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Use Balanced for faster response
      timeout: 10000, // 10 second timeout
    });

    if (location.coords.latitude === 0 && location.coords.longitude === 0) {
      throw new Error('Received invalid location coordinates (0,0)');
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      timestamp: location.timestamp,
    };
  } catch (error) {
    throw error;
  }
}

// Store subscriptions for cleanup
const subscriptions = new Map<number, Location.LocationSubscription>();

let nextWatchId = 1;

/**
 * Watch position with callback
 */
export function watchPosition(
  callback: (location: AppLocation) => void,
  options?: {
    interval?: number;
    enableHighAccuracy?: boolean;
  },
): number {
  const watchId = nextWatchId++;
  
  Location.watchPositionAsync(
    {
      accuracy: options?.enableHighAccuracy
        ? Location.Accuracy.High
        : Location.Accuracy.Balanced,
      timeInterval: options?.interval || 5000,
      distanceInterval: 1, // Update every meter
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      });
    },
  ).then((subscription) => {
    subscriptions.set(watchId, subscription);
  });

  return watchId;
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
  const subscription = subscriptions.get(watchId);
  if (subscription) {
    subscription.remove();
    subscriptions.delete(watchId);
  }
}

