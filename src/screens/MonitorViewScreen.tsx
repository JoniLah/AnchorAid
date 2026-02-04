import React, {useState, useEffect, useCallback} from 'react';
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
import {clearLockScreenNotification} from '../services/lockScreenNotification';
import {activateKeepAwake, deactivateKeepAwake} from 'expo-keep-awake';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

interface MonitorViewScreenParams {
  anchorPoint: Location;
  swingRadius?: number;
  unitSystem: UnitSystem;
  dragThreshold: number;
  anchorStartTime?: number;
}

export const MonitorViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {colors, effectiveTheme} = useTheme();
  const params = route.params as MonitorViewScreenParams;
  // Use dragThreshold as fallback swing radius if swingRadius is not provided
  const swingRadius = params.swingRadius ?? params.dragThreshold;

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

  // Keep screen awake when this screen is focused
  useFocusEffect(
    useCallback(() => {
      activateKeepAwake();
      return () => {
        deactivateKeepAwake();
      };
    }, []),
  );

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
              setIsWithinRadius(dist <= swingRadius);
              
              // Update accuracy if available
              if (position.accuracy !== undefined) {
                setAccuracy(position.accuracy);
              }
            }
          },
          {
            interval: 5000, // Update every 5 seconds
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
          setIsWithinRadius(dist <= swingRadius);
        }
      })
      .catch((error) => {
        console.error('Failed to get initial position:', error);
      });

    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
      // Clear notifications when leaving this screen
      clearLockScreenNotification();
    };
  }, [params.anchorPoint, swingRadius, params.dragThreshold, params.unitSystem]);

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
    <View style={[styles.container, {paddingTop: insets.top, backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: colors.primary}]}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>{t('anchorMonitor')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 16}]}>
        {/* Swing Circle Visualization */}
        <View style={styles.section}>
          <SwingCircleView
            anchorPoint={params.anchorPoint}
            currentPosition={currentPosition}
            swingRadius={swingRadius}
            unitSystem={params.unitSystem}
          />
        </View>

        {/* Status Card */}
        <View style={styles.section}>
          <View style={[
            styles.statusCard, 
            !isWithinRadius && styles.statusCardWarning,
            {
              backgroundColor: isWithinRadius 
                ? (effectiveTheme === 'dark' ? '#1B5E20' : colors.success)
                : colors.warning
            }
          ]}>
            <Text style={styles.statusTitle}>
              {isWithinRadius ? `✓ ${t('withinSwingRadius')}` : `⚠ ${t('outsideSwingRadius')}`}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isWithinRadius
                ? t('boatWithinExpected')
                : t('boatMovedBeyond')}
            </Text>
            {params.anchorStartTime && (
              <View style={[
                styles.timerBox,
                {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
              ]}>
                <Text style={[styles.timerLabel, {color: colors.primary}]}>⏱️ {t('anchoredFor')}:</Text>
                <Text style={[styles.timerValue, {color: colors.primary}]}>
                  {formatElapsedTime(elapsedTime)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Position Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('positionInformation')}</Text>
          
          <View style={[styles.infoCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('distanceFromAnchor')}:</Text>
              <Text style={[styles.infoValue, {color: colors.text}, !isWithinRadius && {color: colors.error}]}>
                {formatLength(distance, params.unitSystem)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('swingRadius')}:</Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {formatLength(swingRadius, params.unitSystem)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('dragThreshold')}:</Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {formatLength(params.dragThreshold, params.unitSystem)}
              </Text>
            </View>
            
            {currentPosition && (
              <>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('bearing')}:</Text>
                  <Text style={[styles.infoValue, {color: colors.text}]}>{formatBearing(bearing)}</Text>
                </View>
                
                
                {accuracy !== undefined && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('gpsAccuracy')}:</Text>
                    <Text style={[styles.infoValue, {color: colors.text}]}>
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
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('coordinates')}</Text>
          
          <View style={[styles.infoCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <View style={styles.coordinateRow}>
              <Text style={[styles.coordinateLabel, {color: colors.textSecondary}]}>{t('anchorPoint')}:</Text>
              <View style={[styles.coordinateValue, {backgroundColor: colors.inputBackground}]}>
                <Text style={[styles.coordinateText, {color: colors.text}]}>
                  {formatCoordinate(params.anchorPoint.latitude)}, {formatCoordinate(params.anchorPoint.longitude)}
                </Text>
              </View>
            </View>
            
            {currentPosition && (
              <View style={styles.coordinateRow}>
                <Text style={[styles.coordinateLabel, {color: colors.textSecondary}]}>{t('currentPosition')}:</Text>
                <View style={[styles.coordinateValue, {backgroundColor: colors.inputBackground}]}>
                  <Text style={[styles.coordinateText, {color: colors.text}]}>
                    {formatCoordinate(currentPosition.latitude)}, {formatCoordinate(currentPosition.longitude)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('additionalInfo')}</Text>
          
          <View style={[styles.infoCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('status')}:</Text>
              <Text style={[styles.infoValue, {color: isWithinRadius ? colors.success : colors.error}]}>
                {distance <= params.dragThreshold
                  ? t('safe')
                  : distance > params.dragThreshold
                  ? `⚠ ${t('alarmThresholdExceeded')}`
                  : t('monitoring')}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{t('distanceToThreshold')}:</Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {formatLength(Math.max(0, params.dragThreshold - distance), params.unitSystem)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Safe area background to prevent content showing through */}
      {insets.bottom > 0 && (
        <View style={[styles.safeAreaBackground, {height: insets.bottom, backgroundColor: colors.background}]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statusCardWarning: {
    // Handled by inline style
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
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  coordinateRow: {
    marginBottom: 12,
  },
  coordinateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  coordinateValue: {
    borderRadius: 6,
    padding: 8,
  },
  coordinateText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timerBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  timerLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
  },
});

