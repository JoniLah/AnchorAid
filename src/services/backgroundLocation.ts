import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import {Location as AppLocation} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const ALARM_STATE_KEY = '@anchor_aid:background_alarm_state';

interface BackgroundAlarmState {
  anchorPoint: AppLocation;
  dragThreshold: number;
  smoothingWindow: number;
  updateInterval: number;
  isActive: boolean;
}

/**
 * Background location task handler
 * This runs even when the app is in the background
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({data, error}) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const {locations} = data as {locations: Location.LocationObject[]};
    if (locations && locations.length > 0) {
      const locationObj = locations[0];
      const appLocation: AppLocation = {
        latitude: locationObj.coords.latitude,
        longitude: locationObj.coords.longitude,
        accuracy: locationObj.coords.accuracy || undefined,
        timestamp: locationObj.timestamp,
      };

      // Load alarm state from storage
      try {
        const stateData = await AsyncStorage.getItem(ALARM_STATE_KEY);
        if (stateData) {
          const state: BackgroundAlarmState = JSON.parse(stateData);
          
          if (state.isActive && state.anchorPoint) {
            // Calculate distance
            const distance = calculateDistance(state.anchorPoint, appLocation);
            
            // Store position for smoothing (simplified - in production, use a more robust storage)
            const positionHistoryKey = '@anchor_aid:position_history';
            const historyData = await AsyncStorage.getItem(positionHistoryKey);
            let history: AppLocation[] = historyData ? JSON.parse(historyData) : [];
            history.push(appLocation);
            // Keep only last N positions
            history = history.slice(-state.smoothingWindow * 2);
            await AsyncStorage.setItem(positionHistoryKey, JSON.stringify(history));

            // Simple smoothing: average of last N positions
            if (history.length >= state.smoothingWindow) {
              const recent = history.slice(-state.smoothingWindow);
              const smoothed = {
                latitude: recent.reduce((sum, p) => sum + p.latitude, 0) / recent.length,
                longitude: recent.reduce((sum, p) => sum + p.longitude, 0) / recent.length,
                accuracy: recent[recent.length - 1].accuracy,
                timestamp: recent[recent.length - 1].timestamp,
              };
              
              const smoothedDistance = calculateDistance(state.anchorPoint, smoothed);
              
              // Check if alarm should trigger
              if (smoothedDistance > state.dragThreshold) {
                // Trigger alarm notification
                await triggerBackgroundAlarm(smoothedDistance, state.dragThreshold);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing background location:', error);
      }
    }
  }
});

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(point1: AppLocation, point2: AppLocation): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.latitude * Math.PI / 180) *
      Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Trigger alarm notification (will be handled by notification service)
 */
async function triggerBackgroundAlarm(distance: number, threshold: number): Promise<void> {
  // Store alarm state for the app to pick up when it comes to foreground
  await AsyncStorage.setItem('@anchor_aid:background_alarm_triggered', JSON.stringify({
    triggered: true,
    distance,
    threshold,
    timestamp: Date.now(),
  }));
  
  // Note: For actual notifications, you'd use expo-notifications here
  // This is a simplified version that stores the state
}

/**
 * Start background location tracking
 */
export async function startBackgroundLocation(
  anchorPoint: AppLocation,
  dragThreshold: number,
  updateInterval: number,
  smoothingWindow: number,
): Promise<boolean> {
  try {
    // Request background location permission
    const {status} = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }

    // Save alarm state
    const state: BackgroundAlarmState = {
      anchorPoint,
      dragThreshold,
      smoothingWindow,
      updateInterval,
      isActive: true,
    };
    await AsyncStorage.setItem(ALARM_STATE_KEY, JSON.stringify(state));
    await AsyncStorage.removeItem('@anchor_aid:position_history');

    // Start background location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: updateInterval * 1000,
      distanceInterval: 1, // Update every meter
      foregroundService: {
        notificationTitle: 'Anchor Watch Active',
        notificationBody: 'Monitoring anchor position',
        notificationColor: '#007AFF',
      },
    });

    return true;
  } catch (error) {
    console.error('Error starting background location:', error);
    return false;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundLocation(): Promise<void> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
    
    // Update state
    const stateData = await AsyncStorage.getItem(ALARM_STATE_KEY);
    if (stateData) {
      const state: BackgroundAlarmState = JSON.parse(stateData);
      state.isActive = false;
      await AsyncStorage.setItem(ALARM_STATE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error('Error stopping background location:', error);
  }
}

/**
 * Check if background location is active
 */
export async function isBackgroundLocationActive(): Promise<boolean> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (!isRunning) return false;
    
    const stateData = await AsyncStorage.getItem(ALARM_STATE_KEY);
    if (stateData) {
      const state: BackgroundAlarmState = JSON.parse(stateData);
      return state.isActive;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if alarm was triggered in background
 */
export async function checkBackgroundAlarm(): Promise<{
  triggered: boolean;
  distance?: number;
  threshold?: number;
  timestamp?: number;
} | null> {
  try {
    const data = await AsyncStorage.getItem('@anchor_aid:background_alarm_triggered');
    if (data) {
      const alarm = JSON.parse(data);
      // Clear it after reading
      await AsyncStorage.removeItem('@anchor_aid:background_alarm_triggered');
      return alarm;
    }
    return null;
  } catch (error) {
    return null;
  }
}

