import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import MapView, {Circle, Marker} from 'react-native-maps';
import {Location} from '../types';
import {haversineDistance, calculateBearing} from '../utils/haversine';
import {formatLength, getLengthUnit} from '../utils/units';
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
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 0,
              longitude: 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          />
        </View>
      </View>
    );
  }

  const center = anchorPoint;
  const position = currentPosition || anchorPoint;

  // Calculate distance from anchor
  const distance = haversineDistance(anchorPoint, position);
  const bearing = calculateBearing(anchorPoint, position);

  // Convert swing radius to degrees (approximate)
  // 1 degree latitude ≈ 111km, so radius in meters / 111000
  const radiusDegrees = swingRadius / 111000;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: Math.max(radiusDegrees * 4, 0.01),
          longitudeDelta: Math.max(radiusDegrees * 4, 0.01),
        }}
        region={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: Math.max(radiusDegrees * 4, 0.01),
          longitudeDelta: Math.max(radiusDegrees * 4, 0.01),
        }}>
        <Marker
          coordinate={center}
          title="Anchor Point"
          pinColor="red"
        />
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            title="Current Position"
            pinColor="blue"
          />
        )}
        <Circle
          center={center}
          radius={swingRadius}
          strokeWidth={2}
          strokeColor="#007AFF"
          fillColor="rgba(0, 122, 255, 0.1)"
        />
      </MapView>
      <View style={styles.infoOverlay}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Distance from anchor:</Text>
          <Text style={styles.infoValue}>
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
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Bearing:</Text>
            <Text style={styles.infoValue}>{bearing.toFixed(0)}°</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 16,
  },
  map: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

