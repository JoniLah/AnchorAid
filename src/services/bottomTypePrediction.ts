import AsyncStorage from '@react-native-async-storage/async-storage';
import {Location, BottomType} from '../types';
import {haversineDistance} from '../utils/haversine';

const BOTTOM_TYPE_DB_KEY = '@anchor_aid:bottom_type_db';
const MAX_RECORDS = 5000; // Keep last 5000 observations

export interface BottomTypeRecord {
  latitude: number;
  longitude: number;
  bottomType: BottomType;
  timestamp: number;
  confidence?: 'high' | 'medium' | 'low'; // User confidence in their observation
}

export interface BottomTypePrediction {
  bottomType: BottomType;
  confidence: number; // 0-1, based on nearby data
  nearbyRecords: number; // Number of nearby observations
  averageDistance: number; // Average distance to nearby records in meters
}

/**
 * Save a bottom type observation
 */
export async function saveBottomTypeObservation(
  location: Location,
  bottomType: BottomType,
  confidence: 'high' | 'medium' | 'low' = 'high',
): Promise<void> {
  try {
    const records = await loadBottomTypeRecords();
    const newRecord: BottomTypeRecord = {
      latitude: location.latitude,
      longitude: location.longitude,
      bottomType,
      timestamp: Date.now(),
      confidence,
    };

    records.push(newRecord);
    // Keep only last MAX_RECORDS
    const trimmed = records.slice(-MAX_RECORDS);
    await AsyncStorage.setItem(BOTTOM_TYPE_DB_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving bottom type observation:', error);
  }
}

/**
 * Get bottom type prediction for a location
 */
export async function predictBottomType(
  location: Location,
  searchRadiusMeters: number = 1000, // Search within 1km
): Promise<BottomTypePrediction | null> {
  try {
    const records = await loadBottomTypeRecords();

    // Find all records within search radius
    const nearby = records
      .map(record => {
        const distance = haversineDistance(location, {
          latitude: record.latitude,
          longitude: record.longitude,
          timestamp: record.timestamp,
        });
        return {record, distance};
      })
      .filter(item => item.distance <= searchRadiusMeters)
      .sort((a, b) => a.distance - b.distance);

    if (nearby.length === 0) {
      return null;
    }

    // Weight records by distance (closer = more weight) and confidence
    const weightedVotes = new Map<BottomType, number>();

    nearby.forEach(({record, distance}) => {
      // Weight decreases with distance (inverse square)
      const distanceWeight = 1 / (1 + distance / 100);
      // Confidence weight
      const confidenceWeight =
        record.confidence === 'high' ? 1.0 : record.confidence === 'medium' ? 0.7 : 0.4;
      const weight = distanceWeight * confidenceWeight;

      const current = weightedVotes.get(record.bottomType) || 0;
      weightedVotes.set(record.bottomType, current + weight);
    });

    // Find most likely bottom type
    let maxWeight = 0;
    let predictedType: BottomType | null = null;

    weightedVotes.forEach((weight, type) => {
      if (weight > maxWeight) {
        maxWeight = weight;
        predictedType = type;
      }
    });

    if (!predictedType) {
      return null;
    }

    // Calculate confidence (0-1) based on:
    // - Number of nearby records
    // - Total weight
    // - Average distance
    const totalWeight = Array.from(weightedVotes.values()).reduce((a, b) => a + b, 0);
    const averageDistance =
      nearby.reduce((sum, item) => sum + item.distance, 0) / nearby.length;

    // Confidence formula: more records + closer = higher confidence
    const recordCountConfidence = Math.min(nearby.length / 10, 1); // Max at 10+ records
    const distanceConfidence = Math.max(0, 1 - averageDistance / searchRadiusMeters);
    const weightConfidence = Math.min(maxWeight / totalWeight, 1);

    const overallConfidence =
      (recordCountConfidence * 0.3 + distanceConfidence * 0.4 + weightConfidence * 0.3);

    return {
      bottomType: predictedType,
      confidence: overallConfidence,
      nearbyRecords: nearby.length,
      averageDistance,
    };
  } catch (error) {
    console.error('Error predicting bottom type:', error);
    return null;
  }
}

/**
 * Get all bottom type records in a bounding box (for map display)
 */
export async function getBottomTypeRecordsInBounds(
  northEast: Location,
  southWest: Location,
): Promise<BottomTypeRecord[]> {
  try {
    const records = await loadBottomTypeRecords();

    return records.filter(record => {
      return (
        record.latitude >= southWest.latitude &&
        record.latitude <= northEast.latitude &&
        record.longitude >= southWest.longitude &&
        record.longitude <= northEast.longitude
      );
    });
  } catch (error) {
    console.error('Error getting records in bounds:', error);
    return [];
  }
}

/**
 * Get bottom type heatmap data for map visualization
 * Returns grid of predictions for the visible area
 */
export async function getBottomTypeHeatmap(
  center: Location,
  radiusKm: number = 5, // 5km radius
  gridSize: number = 20, // 20x20 grid
): Promise<Array<{
  latitude: number;
  longitude: number;
  bottomType: BottomType;
  confidence: number;
}>> {
  const heatmapData: Array<{
    latitude: number;
    longitude: number;
    bottomType: BottomType;
    confidence: number;
  }> = [];

  // Calculate grid cell size
  const latStep = (radiusKm * 2) / gridSize / 111; // ~111km per degree latitude
  const lonStep =
    (radiusKm * 2) / gridSize / (111 * Math.cos((center.latitude * Math.PI) / 180));

  const startLat = center.latitude - radiusKm / 111;
  const startLon = center.longitude - radiusKm / (111 * Math.cos((center.latitude * Math.PI) / 180));

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const gridPoint: Location = {
        latitude: startLat + i * latStep,
        longitude: startLon + j * lonStep,
        timestamp: Date.now(),
      };

      const prediction = await predictBottomType(gridPoint, 500); // 500m search radius

      if (prediction && prediction.confidence > 0.3) {
        // Only include if confidence is reasonable
        heatmapData.push({
          latitude: gridPoint.latitude,
          longitude: gridPoint.longitude,
          bottomType: prediction.bottomType,
          confidence: prediction.confidence,
        });
      }
    }
  }

  return heatmapData;
}

/**
 * Load all bottom type records
 */
async function loadBottomTypeRecords(): Promise<BottomTypeRecord[]> {
  try {
    const data = await AsyncStorage.getItem(BOTTOM_TYPE_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading bottom type records:', error);
    return [];
  }
}

/**
 * Clear all bottom type records (for testing/reset)
 */
export async function clearBottomTypeRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BOTTOM_TYPE_DB_KEY);
  } catch (error) {
    console.error('Error clearing bottom type records:', error);
  }
}

/**
 * Get statistics about stored observations
 */
export async function getBottomTypeStats(): Promise<{
  totalRecords: number;
  recordsByType: Record<BottomType, number>;
  oldestRecord: number | null;
  newestRecord: number | null;
}> {
  try {
    const records = await loadBottomTypeRecords();
    const recordsByType: Record<BottomType, number> = {} as Record<BottomType, number>;

    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;

    records.forEach(record => {
      recordsByType[record.bottomType] = (recordsByType[record.bottomType] || 0) + 1;

      if (!oldestTimestamp || record.timestamp < oldestTimestamp) {
        oldestTimestamp = record.timestamp;
      }
      if (!newestTimestamp || record.timestamp > newestTimestamp) {
        newestTimestamp = record.timestamp;
      }
    });

    return {
      totalRecords: records.length,
      recordsByType,
      oldestRecord: oldestTimestamp,
      newestRecord: newestTimestamp,
    };
  } catch (error) {
    console.error('Error getting bottom type stats:', error);
    return {
      totalRecords: 0,
      recordsByType: {} as Record<BottomType, number>,
      oldestRecord: null,
      newestRecord: null,
    };
  }
}

