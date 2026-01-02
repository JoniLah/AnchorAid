import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getCurrentPosition} from '../services/location-expo';
import {
  predictBottomType,
  getBottomTypeHeatmap,
  getBottomTypeStats,
  BottomTypePrediction,
} from '../services/bottomTypePrediction';
import {Location, BottomType} from '../types';
import {BOTTOM_TYPE_INFO} from '../utils/bottomType';
import {Button} from '../components/Button';

// Import expo-maps - requires development build with expo-maps plugin
// expo-maps uses GoogleMaps.View (Android) or AppleMaps.View (iOS)
import {Platform} from 'react-native';

let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
let mapsAvailable = false;

try {
  const expoMaps = require('expo-maps');
  console.log('expo-maps loaded, checking for View component...');
  
  // expo-maps API: Use GoogleMaps.View for Android, AppleMaps.View for iOS
  if (Platform.OS === 'android' && expoMaps?.GoogleMaps?.View) {
    MapView = expoMaps.GoogleMaps.View;
    // expo-maps might not have Marker/Circle - we'll handle that gracefully
    Marker = expoMaps.GoogleMaps.Marker || null;
    Circle = expoMaps.GoogleMaps.Circle || null;
    mapsAvailable = true;
    console.log('✅ expo-maps GoogleMaps.View is available');
  } else if (Platform.OS === 'ios' && expoMaps?.AppleMaps?.View) {
    MapView = expoMaps.AppleMaps.View;
    Marker = expoMaps.AppleMaps.Marker || null;
    Circle = expoMaps.AppleMaps.Circle || null;
    mapsAvailable = true;
    console.log('✅ expo-maps AppleMaps.View is available');
  } else {
    console.warn('⚠️ expo-maps module found but View is not available for platform:', Platform.OS);
    if (expoMaps) {
      console.warn('Available keys:', Object.keys(expoMaps));
      if (expoMaps.GoogleMaps) {
        console.warn('GoogleMaps keys:', Object.keys(expoMaps.GoogleMaps));
      }
      if (expoMaps.AppleMaps) {
        console.warn('AppleMaps keys:', Object.keys(expoMaps.AppleMaps));
      }
    }
  }
} catch (error: any) {
  console.error('❌ expo-maps import error:', error?.message || error);
  mapsAvailable = false;
}

// Color mapping for bottom types
const BOTTOM_TYPE_COLORS: Record<BottomType, string> = {
  [BottomType.SAND]: '#F4D03F', // Yellow
  [BottomType.MUD]: '#8B4513', // Brown
  [BottomType.CLAY]: '#CD853F', // Tan
  [BottomType.GRASS_WEEDS]: '#228B22', // Green
  [BottomType.ROCK]: '#696969', // Gray
  [BottomType.CORAL]: '#FF1493', // Pink
  [BottomType.UNKNOWN]: '#CCCCCC', // Light gray
};

export const BottomTypeMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Debug: Log maps availability on mount
  useEffect(() => {
    console.log('BottomTypeMapScreen mounted');
    console.log('mapsAvailable:', mapsAvailable);
    console.log('MapView:', MapView);
    console.log('Marker:', Marker);
    console.log('Circle:', Circle);
  }, []);
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [prediction, setPrediction] = useState<BottomTypePrediction | null>(null);
  const [heatmapData, setHeatmapData] = useState<Array<{
    latitude: number;
    longitude: number;
    bottomType: BottomType;
    confidence: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01, // ~1km
    longitudeDelta: 0.01,
  });
  const [stats, setStats] = useState<{
    totalRecords: number;
    recordsByType: Record<BottomType, number>;
  } | null>(null);

  useEffect(() => {
    loadCurrentLocation();
    loadStats();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      updateMapRegion(currentLocation);
      loadPrediction(currentLocation);
      loadHeatmap(currentLocation);
    }
  }, [currentLocation]);

  const loadCurrentLocation = async () => {
    try {
      setLoading(true);
      // Request permission first if needed
      const {requestLocationPermission} = await import('../services/location-expo');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is required to show your position on the map. Please enable location permissions in your device settings.',
        );
        setLoading(false);
        return;
      }
      const location = await getCurrentPosition();
      setCurrentLocation(location);
    } catch (error: any) {
      console.error('Error loading location:', error);
      const errorMessage =
        error?.message || 'Failed to get current location. Please check your location settings and ensure GPS is enabled.';
      Alert.alert('Location Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMapRegion = (location: Location) => {
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const loadPrediction = async (location: Location) => {
    try {
      const pred = await predictBottomType(location);
      setPrediction(pred);
    } catch (error) {
      console.error('Error loading prediction:', error);
    }
  };

  const loadHeatmap = async (location: Location) => {
    try {
      setLoading(true);
      const data = await getBottomTypeHeatmap(location, 2, 15); // 2km radius, 15x15 grid
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const statsData = await getBottomTypeStats();
    setStats({
      totalRecords: statsData.totalRecords,
      recordsByType: statsData.recordsByType,
    });
  };

  const handleMapPress = async (event: any) => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    const location: Location = {
      latitude,
      longitude,
      timestamp: Date.now(),
    };
    await loadPrediction(location);
  };

  const handleRegionChangeComplete = async (region: any) => {
    const center: Location = {
      latitude: region.latitude,
      longitude: region.longitude,
      timestamp: Date.now(),
    };
    await loadHeatmap(center);
  };

  return (
    <View style={styles.container}>
      {/* Prediction Info Panel */}
      {prediction && (
        <View style={styles.predictionPanel}>
          <Text style={styles.predictionTitle}>Predicted Bottom Type</Text>
          <View style={styles.predictionContent}>
            <View
              style={[
                styles.bottomTypeIndicator,
                {backgroundColor: BOTTOM_TYPE_COLORS[prediction.bottomType]},
              ]}
            />
            <View style={styles.predictionInfo}>
              <Text style={styles.predictionType}>
                {BOTTOM_TYPE_INFO[prediction.bottomType].name}
              </Text>
              <Text style={styles.predictionConfidence}>
                Confidence: {Math.round(prediction.confidence * 100)}%
              </Text>
              <Text style={styles.predictionDetails}>
                Based on {prediction.nearbyRecords} nearby observation
                {prediction.nearbyRecords !== 1 ? 's' : ''} (avg {Math.round(prediction.averageDistance)}m away)
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Stats Panel */}
      {stats && stats.totalRecords > 0 && (
        <View style={styles.statsPanel}>
          <Text style={styles.statsTitle}>
            Database: {stats.totalRecords} observations
          </Text>
        </View>
      )}

      {/* Map or Fallback */}
      {mapsAvailable && MapView && mapRegion.latitude !== 0 && mapRegion.longitude !== 0 ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            onPress={handleMapPress}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType={Platform.OS === 'android' ? 'standard' : undefined}
            onError={(error: any) => {
              console.error('MapView error:', error);
            }}
            onMapReady={() => {
              console.log('Map is ready');
            }}>
            {/* Heatmap circles - only render if Circle component is available */}
            {Circle && heatmapData.map((point, index) => (
              <Circle
                key={`circle-${index}`}
                center={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                radius={50} // 50m radius circles
                fillColor={BOTTOM_TYPE_COLORS[point.bottomType] + Math.floor(point.confidence * 100).toString(16).padStart(2, '0')}
                strokeColor={BOTTOM_TYPE_COLORS[point.bottomType]}
                strokeWidth={1}
              />
            ))}

            {/* Current location prediction marker - only render if Marker component is available */}
            {currentLocation && prediction && Marker && (
              <Marker
                key="prediction-marker"
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title={`Predicted: ${BOTTOM_TYPE_INFO[prediction.bottomType].name}`}
                description={`Confidence: ${Math.round(prediction.confidence * 100)}%`}
              />
            )}
          </MapView>
        </View>
      ) : (
        <View style={styles.mapFallback}>
          <Text style={styles.fallbackTitle}>Map Not Available</Text>
          <Text style={styles.fallbackText}>
            Native maps require a development build with expo-maps included.{'\n\n'}
            If you're using a development build, you may need to rebuild it after adding expo-maps to your project.{'\n\n'}
            Run: npx eas build --profile development --platform android
          </Text>
          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location:</Text>
              <Text style={styles.locationText}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
          {prediction && (
            <View style={styles.predictionCard}>
              <View
                style={[
                  styles.bottomTypeIndicatorLarge,
                  {backgroundColor: BOTTOM_TYPE_COLORS[prediction.bottomType]},
                ]}
              />
              <Text style={styles.predictionCardTitle}>
                {BOTTOM_TYPE_INFO[prediction.bottomType].name}
              </Text>
              <Text style={styles.predictionCardConfidence}>
                Confidence: {Math.round(prediction.confidence * 100)}%
              </Text>
              <Text style={styles.predictionCardDetails}>
                Based on {prediction.nearbyRecords} nearby observation{prediction.nearbyRecords !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controls, {paddingBottom: insets.bottom + 8}]}>
        <Button
          title="Refresh Location"
          onPress={loadCurrentLocation}
          variant="secondary"
        />
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading predictions...</Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Bottom Types</Text>
        <View style={styles.legendItems}>
          {Object.values(BottomType)
            .filter(type => type !== BottomType.UNKNOWN)
            .map(type => (
              <View key={type} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    {backgroundColor: BOTTOM_TYPE_COLORS[type]},
                  ]}
                />
                <Text style={styles.legendLabel}>
                  {BOTTOM_TYPE_INFO[type].name}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  predictionPanel: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  predictionInfo: {
    flex: 1,
  },
  predictionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  predictionConfidence: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  predictionDetails: {
    fontSize: 12,
    color: '#999',
  },
  statsPanel: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
  },
  statsTitle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 1000,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
  },
  legend: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    zIndex: 1000,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendLabel: {
    fontSize: 11,
    color: '#666',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  predictionCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomTypeIndicatorLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  predictionCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  predictionCardConfidence: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  predictionCardDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

