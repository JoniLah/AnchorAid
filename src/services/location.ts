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
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

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

