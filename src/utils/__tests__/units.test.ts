import {
  metersToFeet,
  feetToMeters,
  convertLength,
  formatLength,
} from '../units';
import {UnitSystem} from '../../types';

describe('units', () => {
  describe('metersToFeet', () => {
    it('should convert meters to feet correctly', () => {
      expect(metersToFeet(1)).toBeCloseTo(3.28084, 5);
      expect(metersToFeet(10)).toBeCloseTo(32.8084, 4);
      expect(metersToFeet(0)).toBe(0);
    });
  });

  describe('feetToMeters', () => {
    it('should convert feet to meters correctly', () => {
      expect(feetToMeters(3.28084)).toBeCloseTo(1, 5);
      expect(feetToMeters(32.8084)).toBeCloseTo(10, 4);
      expect(feetToMeters(0)).toBe(0);
    });
  });

  describe('convertLength', () => {
    it('should return same value if units are the same', () => {
      expect(convertLength(10, UnitSystem.METRIC, UnitSystem.METRIC)).toBe(10);
      expect(convertLength(10, UnitSystem.IMPERIAL, UnitSystem.IMPERIAL)).toBe(
        10,
      );
    });

    it('should convert metric to imperial', () => {
      const result = convertLength(10, UnitSystem.METRIC, UnitSystem.IMPERIAL);
      expect(result).toBeCloseTo(32.8084, 4);
    });

    it('should convert imperial to metric', () => {
      const result = convertLength(32.8084, UnitSystem.IMPERIAL, UnitSystem.METRIC);
      expect(result).toBeCloseTo(10, 4);
    });
  });

  describe('formatLength', () => {
    it('should format metric length', () => {
      expect(formatLength(10.5, UnitSystem.METRIC)).toBe('10.5 m');
    });

    it('should format imperial length', () => {
      expect(formatLength(32.8, UnitSystem.IMPERIAL)).toBe('32.8 ft');
    });

    it('should format with custom decimals', () => {
      expect(formatLength(10.567, UnitSystem.METRIC, 2)).toBe('10.57 m');
    });
  });
});

