import {
  smoothPosition,
  shouldTriggerAlarm,
  checkGpsAccuracy,
} from '../alarmLogic';
import {Location, AlarmState} from '../../types';

describe('alarmLogic', () => {
  describe('smoothPosition', () => {
    it('should return null for empty array', () => {
      expect(smoothPosition([], 5)).toBeNull();
    });

    it('should return single position', () => {
      const pos: Location = {
        latitude: 45.5,
        longitude: -73.5,
        timestamp: Date.now(),
      };
      const result = smoothPosition([pos], 5);
      expect(result).toEqual(pos);
    });

    it('should average multiple positions', () => {
      const positions: Location[] = [
        {latitude: 45.0, longitude: -73.0, timestamp: 1000},
        {latitude: 45.5, longitude: -73.5, timestamp: 2000},
        {latitude: 46.0, longitude: -74.0, timestamp: 3000},
      ];

      const result = smoothPosition(positions, 5);
      expect(result?.latitude).toBeCloseTo(45.5, 1);
      expect(result?.longitude).toBeCloseTo(-73.5, 1);
    });

    it('should use only last N positions', () => {
      const positions: Location[] = [
        {latitude: 45.0, longitude: -73.0, timestamp: 1000},
        {latitude: 45.5, longitude: -73.5, timestamp: 2000},
        {latitude: 46.0, longitude: -74.0, timestamp: 3000},
      ];

      const result = smoothPosition(positions, 2);
      // Should average last 2 positions
      expect(result?.latitude).toBeCloseTo(45.75, 1);
    });
  });

  describe('shouldTriggerAlarm', () => {
    const anchorPoint: Location = {
      latitude: 45.5,
      longitude: -73.5,
      timestamp: Date.now(),
    };

    it('should not trigger if no anchor point', () => {
      const state: AlarmState = {
        isActive: true,
        dragThreshold: 30,
        updateInterval: 5,
        smoothingWindow: 5,
        distanceFromAnchor: 0,
        isAlarmTriggered: false,
      };

      const result = shouldTriggerAlarm(
        state,
        {latitude: 45.5, longitude: -73.5, timestamp: Date.now()},
      );

      expect(result.shouldTrigger).toBe(false);
    });

    it('should not trigger if within threshold', () => {
      const state: AlarmState = {
        isActive: true,
        anchorPoint,
        dragThreshold: 30,
        updateInterval: 5,
        smoothingWindow: 5,
        distanceFromAnchor: 0,
        isAlarmTriggered: false,
      };

      const nearby: Location = {
        latitude: 45.5001, // Very close
        longitude: -73.5001,
        timestamp: Date.now(),
      };

      const result = shouldTriggerAlarm(state, nearby);
      expect(result.shouldTrigger).toBe(false);
    });

    it('should trigger if exceeds threshold for duration', () => {
      const state: AlarmState = {
        isActive: true,
        anchorPoint,
        dragThreshold: 30,
        updateInterval: 5,
        smoothingWindow: 5,
        distanceFromAnchor: 50,
        isAlarmTriggered: false,
        alarmTriggerTime: Date.now() - 30000, // 30 seconds ago
      };

      const farAway: Location = {
        latitude: 45.6, // Far away
        longitude: -73.6,
        timestamp: Date.now(),
      };

      const result = shouldTriggerAlarm(state, farAway);
      expect(result.shouldTrigger).toBe(true);
    });
  });

  describe('checkGpsAccuracy', () => {
    it('should return no warning for good accuracy', () => {
      const result = checkGpsAccuracy(5);
      expect(result.isPoor).toBe(false);
      expect(result.warning).toBeUndefined();
    });

    it('should return warning for moderate accuracy', () => {
      const result = checkGpsAccuracy(12);
      expect(result.isPoor).toBe(false);
      expect(result.warning).toBeDefined();
    });

    it('should return warning for poor accuracy', () => {
      const result = checkGpsAccuracy(20);
      expect(result.isPoor).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });
});

