import {calculateSwingRadius} from '../swingCalculator';

describe('swingCalculator', () => {
  describe('calculateSwingRadius', () => {
    it('should calculate swing radius without boat length', () => {
      const result = calculateSwingRadius(50);
      expect(result.radius).toBe(50);
      expect(result.diameter).toBe(100);
    });

    it('should calculate swing radius with boat length', () => {
      const result = calculateSwingRadius(50, 10);
      expect(result.radius).toBe(55); // 50 + (10/2)
      expect(result.diameter).toBe(110);
    });

    it('should handle zero rode length', () => {
      const result = calculateSwingRadius(0, 10);
      expect(result.radius).toBe(5); // 0 + (10/2)
      expect(result.diameter).toBe(10);
    });
  });
});

