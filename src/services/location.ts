import Geolocation from '@react-native-community/geolocation';
import {Location} from '../types';

/**
 * Request location permissions
 */
export async function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
}

/**
 * Get current position
 */
export function getCurrentPosition(): Promise<Location> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

/**
 * Watch position with callback
 */
export function watchPosition(
  callback: (location: Location) => void,
  options?: {
    interval?: number;
    enableHighAccuracy?: boolean;
  },
): number {
  const watchId = Geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error('Location watch error:', error);
    },
    {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      distanceFilter: 1, // Update every meter
      interval: (options?.interval || 5000) as number,
    },
  );

  return watchId;
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
  Geolocation.clearWatch(watchId);
}

