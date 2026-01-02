import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import {Location, UnitSystem} from '../types';
import {formatLength} from '../utils/units';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let lastNotificationStatus: string | null = null;
let notificationCreated = false;

interface LockScreenNotificationData {
  anchorPoint: Location;
  currentPosition: Location;
  swingRadius: number;
  distance: number;
  dragThreshold: number;
  unitSystem: UnitSystem;
}

/**
 * Update or create lock screen notification with anchor status
 * Only updates when status changes significantly (Safe -> Warning -> Alert)
 * or every 5 minutes to keep it fresh
 */
export async function updateLockScreenNotification(
  data: LockScreenNotificationData,
): Promise<void> {
  try {
    // Request notification permissions
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const isWithinRadius = data.distance <= data.swingRadius;
    const isWithinThreshold = data.distance <= data.dragThreshold;
    
    // Determine status
    let statusText = '';
    let statusEmoji = '';
    if (isWithinThreshold) {
      statusText = 'Safe';
      statusEmoji = '✓';
    } else if (isWithinRadius) {
      statusText = 'Warning';
      statusEmoji = '⚠';
    } else {
      statusText = 'Alert';
      statusEmoji = '🚨';
    }

    const currentStatus = statusText;
    
    // Only update if status changed or notification hasn't been created yet
    // This prevents spam - notification will persist and show current info when user looks at lock screen
    if (lastNotificationStatus === currentStatus && notificationCreated) {
      return; // No need to update if status hasn't changed
    }

    lastNotificationStatus = currentStatus;

    const title = `${statusEmoji} Anchor Monitor - ${statusText}`;
    const body = `Distance: ${formatLength(data.distance, data.unitSystem)} | ` +
                 `Radius: ${formatLength(data.swingRadius, data.unitSystem)} | ` +
                 `Threshold: ${formatLength(data.dragThreshold, data.unitSystem)}`;

    // Create or update persistent notification
    // Using the same identifier will update the existing notification instead of creating a new one
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          anchorPoint: data.anchorPoint,
          currentPosition: data.currentPosition,
          swingRadius: data.swingRadius,
          distance: data.distance,
          dragThreshold: data.dragThreshold,
        },
        // Make it visible on lock screen
        priority: Platform.OS === 'android' 
          ? Notifications.AndroidNotificationPriority.HIGH 
          : undefined,
        sound: false,
        categoryIdentifier: 'anchor-monitor',
      },
      trigger: null, // Show immediately
      identifier: 'anchor-monitor',
    });

    notificationCreated = true;
  } catch (error) {
    console.error('Failed to update lock screen notification:', error);
  }
}

/**
 * Clear the lock screen notification
 */
export async function clearLockScreenNotification(): Promise<void> {
  try {
    // Reset state
    lastNotificationStatus = null;
    notificationCreated = false;
    
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    // Dismiss all displayed notifications
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Failed to clear lock screen notification:', error);
  }
}

