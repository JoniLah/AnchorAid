import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppSettings, AnchoringSession, UnitSystem} from '../types';

const SETTINGS_KEY = '@anchor_aid:settings';
const SESSIONS_KEY = '@anchor_aid:sessions';
const MAX_SESSIONS = 10;

const DEFAULT_SETTINGS: AppSettings = {
  unitSystem: UnitSystem.METRIC,
  defaultScopeRatio: 5,
  defaultDragThreshold: 30,
  defaultUpdateInterval: 5,
  defaultSmoothingWindow: 5,
  language: 'en',
};

/**
 * Load app settings from storage
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
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

