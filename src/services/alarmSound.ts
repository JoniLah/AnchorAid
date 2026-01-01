import {Audio} from 'expo-av';
import {Platform, Vibration} from 'react-native';
import {AlarmSoundType} from '../types';

let soundObject: Audio.Sound | null = null;
let currentSoundType: AlarmSoundType = AlarmSoundType.DEFAULT;
let currentVolume: number = 1.0;
let isPlaying: boolean = false;

/**
 * Initialize audio mode
 */
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

/**
 * Play alarm sound based on type
 */
export async function playAlarmSound(
  soundType: AlarmSoundType = AlarmSoundType.DEFAULT,
  volume: number = 1.0,
): Promise<void> {
  try {
    // Stop any existing sound
    await stopAlarmSound();

    currentSoundType = soundType;
    currentVolume = Math.max(0, Math.min(1, volume));

    const soundSource = getSoundSource(soundType);
    
    // If we have a sound source, try to play it
    if (soundSource !== null) {
      const {sound} = await Audio.Sound.createAsync(
        soundSource,
        {
          shouldPlay: true,
          isLooping: soundType === AlarmSoundType.PERSISTENT || soundType === AlarmSoundType.SIREN,
          volume: currentVolume,
        },
      );

      soundObject = sound;
      isPlaying = true;
    }

    // Always vibrate (works even without sound files)
    const vibrationPattern = 
      soundType === AlarmSoundType.PERSISTENT || soundType === AlarmSoundType.SIREN
        ? [0, 500, 100, 500, 100, 500] // Longer pattern for persistent
        : [0, 500, 100, 500]; // Standard pattern
    
    if (Platform.OS === 'ios') {
      Vibration.vibrate(vibrationPattern);
    } else {
      Vibration.vibrate(vibrationPattern, soundType === AlarmSoundType.PERSISTENT || soundType === AlarmSoundType.SIREN);
    }
  } catch (error) {
    console.error('Error playing alarm sound:', error);
    // Fallback to vibration only
    const vibrationPattern = 
      soundType === AlarmSoundType.PERSISTENT || soundType === AlarmSoundType.SIREN
        ? [0, 500, 100, 500, 100, 500]
        : [0, 500, 100, 500];
    
    if (Platform.OS === 'ios') {
      Vibration.vibrate(vibrationPattern);
    } else {
      Vibration.vibrate(vibrationPattern, soundType === AlarmSoundType.PERSISTENT || soundType === AlarmSoundType.SIREN);
    }
  }
}

/**
 * Stop alarm sound
 */
export async function stopAlarmSound(): Promise<void> {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
      isPlaying = false;
    }
  } catch (error) {
    console.error('Error stopping alarm sound:', error);
  }
}

/**
 * Get sound source based on type
 * Note: In production, you'd use actual sound files from assets
 * For now, we'll use a simple approach with system sounds
 * 
 * To add actual sound files:
 * 1. Add sound files to assets/sounds/ (e.g., alarm-default.mp3, alarm-loud.mp3)
 * 2. Update this function to return require('./assets/sounds/alarm-default.mp3'), etc.
 */
function getSoundSource(soundType: AlarmSoundType): any {
  // Since we don't have actual sound files, we'll use a workaround
  // In production, you'd load from require('./assets/sounds/alarm-default.mp3'), etc.
  // For now, return null which will cause the sound to fail gracefully and use vibration
  // This is acceptable for MVP - vibration will still work
  return null;
}

/**
 * Play persistent alarm (looping)
 */
export async function playPersistentAlarm(volume: number = 1.0): Promise<void> {
  await playAlarmSound(AlarmSoundType.PERSISTENT, volume);
}

/**
 * Get current sound status
 */
export function isAlarmPlaying(): boolean {
  return isPlaying;
}

/**
 * Update volume for currently playing sound
 */
export async function updateAlarmVolume(volume: number): Promise<void> {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (soundObject) {
    try {
      await soundObject.setVolumeAsync(currentVolume);
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  }
}

