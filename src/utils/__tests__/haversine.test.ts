import {haversineDistance, calculateBearing} from '../haversine';
import {Location} from '../../types';

describe('haversine', () => {
  describe('haversineDistance', () => {
    it('should calculate distance between two points', () => {
      const point1: Location = {
        latitude: 0,
        longitude: 0,
        timestamp: Date.now(),
      };
      const point2: Location = {
        latitude: 0,
        longitude: 1,
        timestamp: Date.now(),
      };

      // 1 degree longitude at equator ≈ 111km
      const distance = haversineDistance(point1, point2);
      expect(distance).toBeCloseTo(111000, -3); // Within 1km
    });

    it('should return 0 for same point', () => {
      const point: Location = {
        latitude: 45.5,
        longitude: -73.5,
        timestamp: Date.now(),
      };
      expect(haversineDistance(point, point)).toBeCloseTo(0, 1);
    });

    it('should calculate distance for known coordinates', () => {
      // Distance between New York and Los Angeles is approximately 3944 km
      const ny: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: Date.now(),
      };
      const la: Location = {
        latitude: 34.0522,
        longitude: -118.2437,
        timestamp: Date.now(),
      };

      const distance = haversineDistance(ny, la);
      expect(distance).toBeCloseTo(3944000, -4); // Within 10km
    });
  });

  describe('calculateBearing', () => {
    it('should calculate bearing from north', () => {
      const point1: Location = {
        latitude: 0,
        longitude: 0,
        timestamp: Date.now(),
      };
      const point2: Location = {
        latitude: 1,
        longitude: 0,
        timestamp: Date.now(),
      };

      const bearing = calculateBearing(point1, point2);
      expect(bearing).toBeCloseTo(0, 1); // North
    });

    it('should calculate bearing from east', () => {
      const point1: Location = {
        latitude: 0,
        longitude: 0,
        timestamp: Date.now(),
      };
      const point2: Location = {
        latitude: 0,
        longitude: 1,
        timestamp: Date.now(),
      };

      const bearing = calculateBearing(point1, point2);
      expect(bearing).toBeCloseTo(90, 1); // East
    });
  });
});

