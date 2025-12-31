import {calculateScope, getRecommendedScopeRatio} from '../scopeCalculator';
import {UnitSystem, RodeType} from '../../types';

describe('scopeCalculator', () => {
  describe('calculateScope', () => {
    it('should calculate basic scope', () => {
      const result = calculateScope({
        depth: 10,
        bowHeight: 2,
        scopeRatio: 5,
        unitSystem: UnitSystem.METRIC,
      });

      expect(result.totalVerticalDistance).toBe(12);
      expect(result.recommendedRodeLength).toBe(60); // 12 * 5
      expect(result.exceedsAvailable).toBe(false);
    });

    it('should apply safety margin', () => {
      const result = calculateScope({
        depth: 10,
        bowHeight: 2,
        scopeRatio: 5,
        safetyMargin: 10,
        unitSystem: UnitSystem.METRIC,
      });

      expect(result.recommendedRodeLength).toBe(66); // 60 * 1.1
    });

    it('should detect when recommended exceeds available', () => {
      const result = calculateScope({
        depth: 10,
        bowHeight: 2,
        scopeRatio: 5,
        totalRodeAvailable: 50,
        unitSystem: UnitSystem.METRIC,
      });

      expect(result.exceedsAvailable).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it('should not warn when recommended is within available', () => {
      const result = calculateScope({
        depth: 10,
        bowHeight: 2,
        scopeRatio: 5,
        totalRodeAvailable: 100,
        unitSystem: UnitSystem.METRIC,
      });

      expect(result.exceedsAvailable).toBe(false);
      expect(result.warning).toBeUndefined();
    });
  });

  describe('getRecommendedScopeRatio', () => {
    it('should recommend 3-5:1 for light wind', () => {
      const result = getRecommendedScopeRatio(3, undefined, UnitSystem.METRIC);
      expect(result.min).toBe(3);
      expect(result.max).toBe(5);
      expect(result.recommended).toBe(4);
    });

    it('should recommend 5-7:1 for moderate wind', () => {
      const result = getRecommendedScopeRatio(7, undefined, UnitSystem.METRIC);
      expect(result.min).toBe(5);
      expect(result.max).toBe(7);
      expect(result.recommended).toBe(6);
    });

    it('should recommend 7-10:1 for strong wind', () => {
      const result = getRecommendedScopeRatio(15, undefined, UnitSystem.METRIC);
      expect(result.min).toBe(7);
      expect(result.max).toBe(10);
      expect(result.recommended).toBe(8);
    });

    it('should consider gust speed', () => {
      const result = getRecommendedScopeRatio(5, 12, UnitSystem.METRIC);
      // Should use gust speed (12 m/s) which is strong wind
      expect(result.min).toBe(7);
    });
  });
});

