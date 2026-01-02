import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SwingCircleView} from '../components/SwingCircleView';
import {Location, UnitSystem} from '../types';
import {formatLength, getLengthUnit} from '../utils/units';
import {haversineDistance, calculateBearing} from '../utils/haversine';
import {getCurrentPosition, watchPosition, clearWatch} from '../services/location';
import {updateLockScreenNotification} from '../services/lockScreenNotification';
import {t} from '../i18n';

interface MonitorViewScreenParams {
  anchorPoint: Location;
  swingRadius: number;
  unitSystem: UnitSystem;
  dragThreshold: number;
  anchorStartTime?: number;
}

export const MonitorViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as MonitorViewScreenParams;

  const [currentPosition, setCurrentPosition] = useState<Location | undefined>(
    undefined,
  );
  const [watchId, setWatchId] = useState<number | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number | undefined>(undefined);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Start watching position
    const startWatching = () => {
      try {
        const id = watchPosition(
          (position) => {
            setCurrentPosition(position);
            if (params.anchorPoint) {
              const dist = haversineDistance(params.anchorPoint, position);
              const bear = calculateBearing(params.anchorPoint, position);
              setDistance(dist);
              setBearing(bear);
              setIsWithinRadius(dist <= params.swingRadius);
              
              // Update accuracy if available
              if (position.accuracy !== undefined) {
                setAccuracy(position.accuracy);
              }

              // Update lock screen notification only when status changes
              // This prevents spam - notification will persist and show info when user looks at lock screen
              updateLockScreenNotification({
                anchorPoint: params.anchorPoint,
                currentPosition: position,
                swingRadius: params.swingRadius,
                distance: dist,
                dragThreshold: params.dragThreshold,
                unitSystem: params.unitSystem,
              });
            }
          },
          {
            interval: 5000, // Update every 5 seconds instead of every second
            enableHighAccuracy: true,
          },
        );
        setWatchId(id);
      } catch (error) {
        console.error('Failed to start position watch:', error);
      }
    };

    startWatching();

    // Get initial position
    getCurrentPosition()
      .then((position) => {
        setCurrentPosition(position);
        if (params.anchorPoint) {
          const dist = haversineDistance(params.anchorPoint, position);
          const bear = calculateBearing(params.anchorPoint, position);
          setDistance(dist);
          setBearing(bear);
          setIsWithinRadius(dist <= params.swingRadius);
        }
      })
      .catch((error) => {
        console.error('Failed to get initial position:', error);
      });

    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
    };
  }, [params.anchorPoint, params.swingRadius, params.dragThreshold, params.unitSystem]);

  // Timer effect - update elapsed time every second
  useEffect(() => {
    if (!params.anchorStartTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - params.anchorStartTime!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [params.anchorStartTime]);

  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  const formatBearing = (bear: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bear / 45) % 8;
    return `${bear.toFixed(0)}° (${directions[index]})`;
  };

  const formatSpeed = (spd: number): string => {
    if (params.unitSystem === UnitSystem.METRIC) {
      return `${(spd * 3.6).toFixed(1)} km/h`; // m/s to km/h
    } else {
      return `${(spd * 1.944).toFixed(1)} knots`; // m/s to knots
    }
  };

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('anchorMonitor')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Swing Circle Visualization */}
        <View style={styles.section}>
          <SwingCircleView
            anchorPoint={params.anchorPoint}
            currentPosition={currentPosition}
            swingRadius={params.swingRadius}
            unitSystem={params.unitSystem}
          />
        </View>

        {/* Status Card */}
        <View style={styles.section}>
          <View style={[styles.statusCard, !isWithinRadius && styles.statusCardWarning]}>
            <Text style={styles.statusTitle}>
              {isWithinRadius ? `✓ ${t('withinSwingRadius')}` : `⚠ ${t('outsideSwingRadius')}`}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isWithinRadius
                ? t('boatWithinExpected')
                : t('boatMovedBeyond')}
            </Text>
            {params.anchorStartTime && (
              <View style={styles.timerBox}>
                <Text style={styles.timerLabel}>⏱️ {t('anchoredFor')}:</Text>
                <Text style={styles.timerValue}>
                  {formatElapsedTime(elapsedTime)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Position Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('positionInformation')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('distanceFromAnchor')}:</Text>
              <Text style={[styles.infoValue, !isWithinRadius && styles.warningText]}>
                {formatLength(distance, params.unitSystem)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('swingRadius')}:</Text>
              <Text style={styles.infoValue}>
                {formatLength(params.swingRadius, params.unitSystem)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('dragThreshold')}:</Text>
              <Text style={styles.infoValue}>
                {formatLength(params.dragThreshold, params.unitSystem)}
              </Text>
            </View>
            
            {currentPosition && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bearing:</Text>
                  <Text style={styles.infoValue}>{formatBearing(bearing)}</Text>
                </View>
                
                
                {accuracy !== undefined && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>GPS Accuracy:</Text>
                    <Text style={styles.infoValue}>
                      {formatLength(accuracy, params.unitSystem)} ±
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Coordinates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coordinates')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>{t('anchorPoint')}:</Text>
              <View style={styles.coordinateValue}>
                <Text style={styles.coordinateText}>
                  {formatCoordinate(params.anchorPoint.latitude)}, {formatCoordinate(params.anchorPoint.longitude)}
                </Text>
              </View>
            </View>
            
            {currentPosition && (
              <View style={styles.coordinateRow}>
                <Text style={styles.coordinateLabel}>{t('currentPosition')}:</Text>
                <View style={styles.coordinateValue}>
                  <Text style={styles.coordinateText}>
                    {formatCoordinate(currentPosition.latitude)}, {formatCoordinate(currentPosition.longitude)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('additionalInfo')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('status')}:</Text>
              <Text style={[styles.infoValue, isWithinRadius ? styles.safeText : styles.warningText]}>
                {distance <= params.dragThreshold
                  ? t('safe')
                  : distance > params.dragThreshold
                  ? `⚠ ${t('alarmThresholdExceeded')}`
                  : t('monitoring')}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('distanceToThreshold')}:</Text>
              <Text style={styles.infoValue}>
                {formatLength(Math.max(0, params.dragThreshold - distance), params.unitSystem)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statusCardWarning: {
    backgroundColor: '#FF9800',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  warningText: {
    color: '#F44336',
  },
  safeText: {
    color: '#4CAF50',
  },
  coordinateRow: {
    marginBottom: 12,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  coordinateValue: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
  },
  coordinateText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
  },
  timerBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  timerLabel: {
    fontSize: 12,
    color: '#004085',
    marginBottom: 4,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

