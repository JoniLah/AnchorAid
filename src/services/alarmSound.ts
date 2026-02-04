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
    const fallbackSource = getFallbackSource(soundType);
    const shouldLoop = soundType === AlarmSoundType.PERSISTENT || soundType === AlarmSoundType.SIREN;

    try {
      const {sound} = await Audio.Sound.createAsync(
        soundSource,
        {shouldPlay: true, isLooping: shouldLoop, volume: currentVolume},
      );
      soundObject = sound;
      isPlaying = true;
    } catch (soundError) {
      try {
        const {sound} = await Audio.Sound.createAsync(
          fallbackSource,
          {shouldPlay: true, isLooping: shouldLoop, volume: currentVolume},
        );
        soundObject = sound;
        isPlaying = true;
      } catch (fallbackError) {
        console.log('Sound playback error (will use vibration):', fallbackError);
      }
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
      try {
        await soundObject.stopAsync();
      } catch (e) {
        // Ignore stop errors
      }
      try {
        await soundObject.unloadAsync();
      } catch (e) {
        // Ignore unload errors
      }
      soundObject = null;
    }
    isPlaying = false;
    // Also stop vibration
    Vibration.cancel();
  } catch (error) {
    console.error('Error stopping alarm sound:', error);
    isPlaying = false;
  }
}

/**
 * Alarm sound assets (WAV files in assets/sounds).
 * Fallback base64 beeps used if a file is missing.
 */
const SOUND_ASSETS = {
  [AlarmSoundType.DEFAULT]: require('../../assets/sounds/default.wav'),
  [AlarmSoundType.LOUD]: require('../../assets/sounds/loud.wav'),
  [AlarmSoundType.PERSISTENT]: require('../../assets/sounds/persistent.wav'),
  [AlarmSoundType.SIREN]: require('../../assets/sounds/siren.wav'),
  [AlarmSoundType.BEEP]: require('../../assets/sounds/beep.wav'),
} as const;

// Fallback: minimal WAV beeps if asset load fails
const BEEP_DEFAULT = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77+efTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBdou+/nn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC';
const BEEP_LOUD = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77+efTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBdou+/nn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC';
const BEEP_PERSISTENT = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77+efTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBdou+/nn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC';
const BEEP_SIREN = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77+efTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBdou+/nn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC';

function getSoundSource(soundType: AlarmSoundType): any {
  return SOUND_ASSETS[soundType] ?? SOUND_ASSETS[AlarmSoundType.DEFAULT];
}

function getFallbackSource(soundType: AlarmSoundType): {uri: string} {
  switch (soundType) {
    case AlarmSoundType.LOUD:
      return {uri: BEEP_LOUD};
    case AlarmSoundType.PERSISTENT:
      return {uri: BEEP_PERSISTENT};
    case AlarmSoundType.SIREN:
      return {uri: BEEP_SIREN};
    case AlarmSoundType.BEEP:
      return {uri: BEEP_DEFAULT};
    default:
      return {uri: BEEP_DEFAULT};
  }
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

