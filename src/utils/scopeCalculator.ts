import {UnitSystem, ScopeCalculationResult, RodeType} from '../types';
import {convertLength} from './units';

export interface ScopeInputs {
  depth: number;
  bowHeight: number;
  scopeRatio: number;
  safetyMargin?: number;
  chainLength?: number;
  totalRodeAvailable?: number;
  rodeType?: RodeType;
  unitSystem: UnitSystem;
}

/**
 * Calculate recommended anchor rode length based on scope ratio
 */
export function calculateScope(inputs: ScopeInputs): ScopeCalculationResult {
  const {depth, bowHeight, scopeRatio, safetyMargin, totalRodeAvailable} =
    inputs;

  // Total vertical distance from anchor to bow roller
  const totalVerticalDistance = depth + bowHeight;

  // Recommended rode length = vertical distance * scope ratio
  let recommendedRodeLength = totalVerticalDistance * scopeRatio;

  // Apply safety margin if provided
  if (safetyMargin && safetyMargin > 0) {
    recommendedRodeLength *= 1 + safetyMargin / 100;
  }

  // Check if recommended length exceeds available rode
  let exceedsAvailable = false;
  let warning: string | undefined;

  if (totalRodeAvailable !== undefined && totalRodeAvailable > 0) {
    if (recommendedRodeLength > totalRodeAvailable) {
      exceedsAvailable = true;
      warning = `Recommended length (${recommendedRodeLength.toFixed(
        1,
      )}) exceeds available rode (${totalRodeAvailable.toFixed(1)}). Consider increasing scope or using more rode.`;
    }
  }

  return {
    totalVerticalDistance,
    recommendedRodeLength,
    exceedsAvailable,
    warning,
  };
}

/**
 * Get scope ratio recommendation based on wind conditions
 */
export function getRecommendedScopeRatio(
  windSpeed: number,
  gustSpeed?: number,
  unitSystem: UnitSystem = UnitSystem.METRIC,
): {min: number; max: number; recommended: number; note: string} {
  // Convert to m/s if needed
  let windMs = windSpeed;
  if (unitSystem === UnitSystem.IMPERIAL) {
    // Assuming knots input for imperial
    windMs = windSpeed * 0.514444; // knots to m/s
  }

  const effectiveWind = gustSpeed
    ? Math.max(windSpeed, gustSpeed)
    : windSpeed;

  // Convert effective wind to m/s if imperial
  let effectiveWindMs = effectiveWind;
  if (unitSystem === UnitSystem.IMPERIAL) {
    effectiveWindMs = effectiveWind * 0.514444;
  }

  // Light wind: < 5 m/s (~10 knots)
  if (effectiveWindMs < 5) {
    return {
      min: 3,
      max: 5,
      recommended: 4,
      note: 'Light conditions: 3:1 to 5:1 scope is typically sufficient.',
    };
  }

  // Moderate wind: 5-10 m/s (~10-20 knots)
  if (effectiveWindMs < 10) {
    return {
      min: 5,
      max: 7,
      recommended: 6,
      note: 'Moderate conditions: 5:1 to 7:1 scope recommended.',
    };
  }

  // Strong wind: > 10 m/s (~20+ knots)
  return {
    min: 7,
    max: 10,
    recommended: 8,
    note: 'Strong/gusty conditions: 7:1 to 10:1 scope strongly recommended.',
  };
}

