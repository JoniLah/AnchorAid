import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppSettings, AnchoringSession, UnitSystem, AlarmSoundType, RodeType} from '../types';

const SETTINGS_KEY = '@anchor_aid:settings';
const SESSIONS_KEY = '@anchor_aid:sessions';
const MAX_SESSIONS = 100; // Increased to allow more history

const DEFAULT_SETTINGS: AppSettings = {
  unitSystem: UnitSystem.METRIC,
  defaultScopeRatio: 5,
  defaultDragThreshold: 30,
  defaultUpdateInterval: 5,
  defaultSmoothingWindow: 5,
  defaultBowHeight: undefined,
  defaultSafetyMargin: undefined,
  defaultChainLength: undefined,
  defaultTotalRodeAvailable: undefined,
  defaultRodeType: RodeType.ROPE,
  language: 'en',
  alarmSoundType: AlarmSoundType.DEFAULT,
  alarmVolume: 1.0,
  theme: 'system',
};

/**
 * Load app settings from storage.
 * Merges with DEFAULT_SETTINGS so older persisted data missing new keys never causes crashes.
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data) as Partial<AppSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings to storage
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Load anchoring sessions from storage
 */
export async function loadSessions(): Promise<AnchoringSession[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

/**
 * Save an anchoring session
 */
export async function saveSession(session: AnchoringSession): Promise<void> {
  try {
    const sessions = await loadSessions();
    sessions.unshift(session); // Add to beginning
    // Keep only last MAX_SESSIONS
    const trimmed = sessions.slice(0, MAX_SESSIONS);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessions = await loadSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

/**
 * Generic function to load data from storage
 */
export async function loadData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return null;
  }
}

/**
 * Generic function to save data to storage
 */
export async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
  }
}
