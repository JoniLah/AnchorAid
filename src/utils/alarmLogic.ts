import {Location, AlarmState} from '../types';
import {haversineDistance} from './haversine';

/**
 * Smooth GPS positions using a rolling average
 */
export function smoothPosition(
  positions: Location[],
  windowSize: number,
): Location | null {
  if (positions.length === 0) {
    return null;
  }

  if (positions.length === 1) {
    return positions[0];
  }

  // Use the last N positions
  const recentPositions = positions.slice(-windowSize);

  // Calculate average latitude and longitude
  const avgLat =
    recentPositions.reduce((sum, pos) => sum + pos.latitude, 0) /
    recentPositions.length;
  const avgLon =
    recentPositions.reduce((sum, pos) => sum + pos.longitude, 0) /
    recentPositions.length;

  // Use the most recent accuracy and timestamp
  const latest = recentPositions[recentPositions.length - 1];

  return {
    latitude: avgLat,
    longitude: avgLon,
    accuracy: latest.accuracy,
    timestamp: latest.timestamp,
  };
}

/**
 * Check if alarm should be triggered based on distance and duration
 */
export function shouldTriggerAlarm(
  currentState: AlarmState,
  newPosition: Location,
  continuousDurationSeconds: number = 25,
): {
  shouldTrigger: boolean;
  distance: number;
  smoothedPosition: Location;
} {
  if (!currentState.anchorPoint) {
    return {
      shouldTrigger: false,
      distance: 0,
      smoothedPosition: newPosition,
    };
  }

  // Add new position to history (this would be managed by the caller)
  // For now, we'll use the current position directly
  const smoothed = currentState.smoothedPosition || newPosition;

  const distance = haversineDistance(currentState.anchorPoint, smoothed);

  // Check if distance exceeds threshold
  if (distance <= currentState.dragThreshold) {
    return {
      shouldTrigger: false,
      distance,
      smoothedPosition: smoothed,
    };
  }

  // If alarm already triggered, keep it triggered
  if (currentState.isAlarmTriggered) {
    return {
      shouldTrigger: true,
      distance,
      smoothedPosition: smoothed,
    };
  }

  // Check if we've exceeded threshold for the required duration
  const now = Date.now();
  const triggerTime = currentState.alarmTriggerTime || now;

  if (now - triggerTime >= continuousDurationSeconds * 1000) {
    return {
      shouldTrigger: true,
      distance,
      smoothedPosition: smoothed,
    };
  }

  // Distance exceeded but not for long enough yet
  return {
    shouldTrigger: false,
    distance,
    smoothedPosition: smoothed,
  };
}

/**
 * Check GPS accuracy and return warning if poor
 */
export function checkGpsAccuracy(
  accuracy?: number,
  translate?: (key: string) => string,
): {
  isPoor: boolean;
  warning?: string;
} {
  if (accuracy === undefined) {
    return {
      isPoor: false,
    };
  }

  const accuracyStr = accuracy.toFixed(1);

  if (accuracy > 15) {
    return {
      isPoor: true,
      warning: translate
        ? translate('gpsAccuracyPoor').replace('{accuracy}', accuracyStr)
        : `GPS accuracy is poor (${accuracyStr}m). Alarm may be less reliable.`,
    };
  }

  if (accuracy > 10) {
    return {
      isPoor: false,
      warning: translate
        ? translate('gpsAccuracyModerate').replace('{accuracy}', accuracyStr)
        : `GPS accuracy is moderate (${accuracyStr}m). Monitor carefully.`,
    };
  }

  return {
    isPoor: false,
  };
}

