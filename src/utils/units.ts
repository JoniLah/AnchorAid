import {UnitSystem} from '../types';

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Convert feet to meters
 */
export function feetToMeters(feet: number): number {
  return feet / 3.28084;
}

/**
 * Convert a value from one unit system to another
 */
export function convertLength(
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) {
    return value;
  }
  if (from === UnitSystem.METRIC && to === UnitSystem.IMPERIAL) {
    return metersToFeet(value);
  }
  return feetToMeters(value);
}

/**
 * Get the unit label for length
 */
export function getLengthUnit(unitSystem: UnitSystem): string {
  return unitSystem === UnitSystem.METRIC ? 'm' : 'ft';
}

/**
 * Format a length value with unit
 */
export function formatLength(
  value: number,
  unitSystem: UnitSystem,
  decimals: number = 1,
): string {
  const unit = getLengthUnit(unitSystem);
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Get the unit label for speed
 */
export function getSpeedUnit(unitSystem: UnitSystem): string {
  return unitSystem === UnitSystem.METRIC ? 'm/s' : 'knots';
}

/**
 * Convert m/s to knots
 */
export function msToKnots(ms: number): number {
  return ms * 1.94384;
}

/**
 * Convert knots to m/s
 */
export function knotsToMs(knots: number): number {
  return knots / 1.94384;
}

