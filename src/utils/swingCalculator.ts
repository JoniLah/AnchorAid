import {SwingRadiusResult} from '../types';

/**
 * Calculate swing radius based on rode length and boat length
 * Conservative estimate: radius = rode length + (boat length / 2)
 */
export function calculateSwingRadius(
  rodeLength: number,
  boatLength?: number,
): SwingRadiusResult {
  const boatRadius = boatLength ? boatLength / 2 : 0;
  const radius = rodeLength + boatRadius;
  const diameter = radius * 2;

  return {
    radius,
    diameter,
  };
}

