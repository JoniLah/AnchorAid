import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Location} from '../types';
import {haversineDistance, calculateBearing} from '../utils/haversine';
import {formatLength} from '../utils/units';
import {UnitSystem} from '../types';

interface SwingCircleViewProps {
  anchorPoint?: Location;
  currentPosition?: Location;
  swingRadius: number;
  unitSystem: UnitSystem;
}

export const SwingCircleView: React.FC<SwingCircleViewProps> = ({
  anchorPoint,
  currentPosition,
  swingRadius,
  unitSystem,
}) => {
  if (!anchorPoint) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Set anchor point to see swing circle
          </Text>
        </View>
      </View>
    );
  }

  const position = currentPosition || anchorPoint;
  const distance = haversineDistance(anchorPoint, position);
  const bearing = calculateBearing(anchorPoint, position);
  const isWithinRadius = distance <= swingRadius;

  // Calculate relative position (simplified visualization)
  const maxDisplayRadius = 100; // pixels
  const scale = Math.min(maxDisplayRadius / swingRadius, 1);
  const angle = (bearing * Math.PI) / 180;
  const displayDistance = Math.min(distance * scale, maxDisplayRadius);
  const x = Math.sin(angle) * displayDistance;
  const y = -Math.cos(angle) * displayDistance;

  return (
    <View style={styles.container}>
      <View style={styles.visualizationContainer}>
        <View style={styles.circleContainer}>
          {/* Swing radius circle */}
          <View style={[styles.circle, {width: maxDisplayRadius * 2, height: maxDisplayRadius * 2}]}>
            <View style={styles.circleBorder} />
          </View>
          
          {/* Anchor point (center) */}
          <View style={[styles.anchorPoint, {left: maxDisplayRadius - 5, top: maxDisplayRadius - 5}]}>
            <Text style={styles.anchorLabel}>A</Text>
          </View>
          
          {/* Current position */}
          {currentPosition && (
            <View
              style={[
                styles.currentPosition,
                {
                  left: maxDisplayRadius + x - 5,
                  top: maxDisplayRadius + y - 5,
                  backgroundColor: isWithinRadius ? '#4CAF50' : '#F44336',
                },
              ]}>
              <Text style={styles.positionLabel}>B</Text>
            </View>
          )}
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: '#F44336'}]} />
            <Text style={styles.legendText}>Anchor Point</Text>
          </View>
          {currentPosition && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: isWithinRadius ? '#4CAF50' : '#F44336'}]} />
              <Text style={styles.legendText}>Current Position</Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: '#2196F3', borderWidth: 1, borderColor: '#2196F3'}]} />
            <Text style={styles.legendText}>Swing Radius</Text>
          </View>
        </View>
      </View>

      {/* Info overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Distance from anchor:</Text>
          <Text style={[styles.infoValue, !isWithinRadius && styles.warning]}>
            {formatLength(distance, unitSystem)}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Swing radius:</Text>
          <Text style={styles.infoValue}>
            {formatLength(swingRadius, unitSystem)}
          </Text>
        </View>
        {currentPosition && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Bearing:</Text>
              <Text style={styles.infoValue}>{bearing.toFixed(0)}°</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, isWithinRadius ? styles.safe : styles.warning]}>
                {isWithinRadius ? 'Within radius ✓' : 'Outside radius ⚠'}
              </Text>
            </View>
          </>
        )}
        {!currentPosition && (
          <Text style={styles.hint}>
            Waiting for GPS position...
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  visualizationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circleContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  anchorPoint: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  anchorLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  currentPosition: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  positionLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  infoOverlay: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  warning: {
    color: '#F44336',
  },
  safe: {
    color: '#4CAF50',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
