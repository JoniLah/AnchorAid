import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Vibration,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {InputField} from '../components/InputField';
import {Button} from '../components/Button';
import {SwingCircleView} from '../components/SwingCircleView';
import {
  UnitSystem,
  RodeType,
  BottomType,
  AnchorType,
  AnchoringSession,
  AlarmState,
  Location,
  AppSettings,
} from '../types';
import {loadSettings, saveSession} from '../services/storage';
import {
  requestLocationPermission,
  getCurrentPosition,
  watchPosition,
  clearWatch,
} from '../services/location';
import {
  startBackgroundLocation,
  stopBackgroundLocation,
  checkBackgroundAlarm,
} from '../services/backgroundLocation';
import {
  initializeAudio,
  playAlarmSound,
  stopAlarmSound,
} from '../services/alarmSound';
import {calculateScope, getRecommendedScopeRatio} from '../utils/scopeCalculator';
import {calculateSwingRadius} from '../utils/swingCalculator';
import {getBottomTypeInfo, BOTTOM_TYPE_INFO} from '../utils/bottomType';
import {
  getAnchorTypeInfo,
  getRecommendedAnchorsForBottom,
  isAnchorRecommendedForBottom,
  ANCHOR_TYPE_INFO,
} from '../utils/anchorType';
import {getAnchorIconDetailed} from '../utils/anchorIcons';
import {AnchorTypeModal} from '../components/AnchorTypeModal';
import {
  shouldTriggerAlarm,
  smoothPosition,
  checkGpsAccuracy,
} from '../utils/alarmLogic';
import {formatLength, getLengthUnit, convertLength} from '../utils/units';

export const AnchoringSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.METRIC);

  // Input fields
  const [depth, setDepth] = useState('');
  const [bowHeight, setBowHeight] = useState('');
  const [scopeRatio, setScopeRatio] = useState('5');
  const [safetyMargin, setSafetyMargin] = useState('');
  const [chainLength, setChainLength] = useState('');
  const [totalRodeAvailable, setTotalRodeAvailable] = useState('');
  const [rodeType, setRodeType] = useState<RodeType>(RodeType.CHAIN);
  const [windSpeed, setWindSpeed] = useState('');
  const [gustSpeed, setGustSpeed] = useState('');
  const [bottomType, setBottomType] = useState<BottomType>(BottomType.UNKNOWN);
  const [anchorType, setAnchorType] = useState<AnchorType | undefined>(undefined);
  const [anchorModalVisible, setAnchorModalVisible] = useState(false);
  const [actualRodeDeployed, setActualRodeDeployed] = useState('');
  const [boatLength, setBoatLength] = useState('');
  const [notes, setNotes] = useState('');

  // Calculations
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [swingRadiusResult, setSwingRadiusResult] = useState<any>(null);

  // Alarm state
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isActive: false,
    dragThreshold: 30,
    updateInterval: 5,
    smoothingWindow: 5,
    distanceFromAnchor: 0,
    isAlarmTriggered: false,
  });
  const [positionHistory, setPositionHistory] = useState<Location[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    loadInitialSettings();
    initializeAudio();
    
    // Check for background alarms when component mounts
    checkBackgroundAlarm().then(alarm => {
      if (alarm && alarm.triggered) {
        Alert.alert(
          '⚠️ Anchor Drag Alarm',
          `Boat has moved ${formatLength(
            alarm.distance || 0,
            unitSystem,
          )} from anchor point (threshold: ${formatLength(
            alarm.threshold || 0,
            unitSystem,
          )})`,
        );
        if (settings) {
          playAlarmSound(
            settings.alarmSoundType,
            settings.alarmVolume || 1.0,
          );
        }
      }
    });
  }, []);

  // Check for background alarms when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkBackgroundAlarm().then(alarm => {
        if (alarm && alarm.triggered) {
          Alert.alert(
            '⚠️ Anchor Drag Alarm',
            `Boat has moved ${formatLength(
              alarm.distance || 0,
              unitSystem,
            )} from anchor point (threshold: ${formatLength(
              alarm.threshold || 0,
              unitSystem,
            )})`,
          );
          if (settings) {
            playAlarmSound(
              settings.alarmSoundType,
              settings.alarmVolume || 1.0,
            );
          }
        }
      });
    }, [unitSystem, settings]),
  );

  useEffect(() => {
    if (alarmState.isActive && watchIdRef.current === null) {
      startAlarm();
    } else if (!alarmState.isActive && watchIdRef.current !== null) {
      stopAlarm();
    }
  }, [alarmState.isActive]);

  const loadInitialSettings = async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
    setUnitSystem(loaded.unitSystem);
    setScopeRatio(loaded.defaultScopeRatio.toString());
    setAlarmState(prev => ({
      ...prev,
      dragThreshold: loaded.defaultDragThreshold,
      updateInterval: loaded.defaultUpdateInterval,
      smoothingWindow: loaded.defaultSmoothingWindow,
    }));
  };

  const handleCalculate = () => {
    const depthNum = parseFloat(depth);
    const bowHeightNum = parseFloat(bowHeight);
    const scopeRatioNum = parseFloat(scopeRatio);

    if (!depthNum || !bowHeightNum || !scopeRatioNum) {
      Alert.alert('Error', 'Please enter depth, bow height, and scope ratio');
      return;
    }

    // Convert to metric for calculations
    const depthM =
      unitSystem === UnitSystem.METRIC
        ? depthNum
        : convertLength(depthNum, UnitSystem.IMPERIAL, UnitSystem.METRIC);
    const bowHeightM =
      unitSystem === UnitSystem.METRIC
        ? bowHeightNum
        : convertLength(bowHeightNum, UnitSystem.IMPERIAL, UnitSystem.METRIC);

    const chainLengthM = chainLength
      ? unitSystem === UnitSystem.METRIC
        ? parseFloat(chainLength)
        : convertLength(
            parseFloat(chainLength),
            UnitSystem.IMPERIAL,
            UnitSystem.METRIC,
          )
      : undefined;

    const totalRodeM = totalRodeAvailable
      ? unitSystem === UnitSystem.METRIC
        ? parseFloat(totalRodeAvailable)
        : convertLength(
            parseFloat(totalRodeAvailable),
            UnitSystem.IMPERIAL,
            UnitSystem.METRIC,
          )
      : undefined;

    const result = calculateScope({
      depth: depthM,
      bowHeight: bowHeightM,
      scopeRatio: scopeRatioNum,
      safetyMargin: safetyMargin ? parseFloat(safetyMargin) : undefined,
      chainLength: chainLengthM,
      totalRodeAvailable: totalRodeM,
      rodeType,
      unitSystem: UnitSystem.METRIC, // Always calculate in metric
    });

    // Convert back to display units
    const displayResult = {
      ...result,
      totalVerticalDistance:
        unitSystem === UnitSystem.METRIC
          ? result.totalVerticalDistance
          : convertLength(
              result.totalVerticalDistance,
              UnitSystem.METRIC,
              UnitSystem.IMPERIAL,
            ),
      recommendedRodeLength:
        unitSystem === UnitSystem.METRIC
          ? result.recommendedRodeLength
          : convertLength(
              result.recommendedRodeLength,
              UnitSystem.METRIC,
              UnitSystem.IMPERIAL,
            ),
    };

    setCalculationResult(displayResult);

    // Calculate swing radius if rode deployed
    if (actualRodeDeployed) {
      const rodeM =
        unitSystem === UnitSystem.METRIC
          ? parseFloat(actualRodeDeployed)
          : convertLength(
              parseFloat(actualRodeDeployed),
              UnitSystem.IMPERIAL,
              UnitSystem.METRIC,
            );
      const boatLengthM = boatLength
        ? unitSystem === UnitSystem.METRIC
          ? parseFloat(boatLength)
          : convertLength(
              parseFloat(boatLength),
              UnitSystem.IMPERIAL,
              UnitSystem.METRIC,
            )
        : undefined;

      const swing = calculateSwingRadius(rodeM, boatLengthM);
      const displaySwing = {
        radius:
          unitSystem === UnitSystem.METRIC
            ? swing.radius
            : convertLength(swing.radius, UnitSystem.METRIC, UnitSystem.IMPERIAL),
        diameter:
          unitSystem === UnitSystem.METRIC
            ? swing.diameter
            : convertLength(
                swing.diameter,
                UnitSystem.METRIC,
                UnitSystem.IMPERIAL,
              ),
      };
      setSwingRadiusResult(displaySwing);
    }
  };

  const handleGetWindRecommendation = () => {
    if (!windSpeed) {
      Alert.alert('Error', 'Please enter wind speed');
      return;
    }

    const windNum = parseFloat(windSpeed);
    const gustNum = gustSpeed ? parseFloat(gustSpeed) : undefined;
    const recommendation = getRecommendedScopeRatio(
      windNum,
      gustNum,
      unitSystem,
    );

    Alert.alert(
      'Recommended Scope',
      `${recommendation.note}\n\nSuggested scope: ${recommendation.recommended}:1 (range: ${recommendation.min}:1 to ${recommendation.max}:1)`,
    );
  };

  const handleSetAnchorPoint = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to set anchor point and use the alarm.',
      );
      return;
    }

    try {
      const position = await getCurrentPosition();
      setAlarmState(prev => ({
        ...prev,
        anchorPoint: position,
      }));

      Alert.alert('Anchor Point Set', 'Anchor point has been set successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current position');
    }
  };

  const startAlarm = async () => {
    if (!alarmState.anchorPoint) {
      Alert.alert('Error', 'Please set anchor point first');
      setAlarmState(prev => ({...prev, isActive: false}));
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Location permission is required');
      setAlarmState(prev => ({...prev, isActive: false}));
      return;
    }

    setPositionHistory([]);

    // Start background location tracking
    const backgroundStarted = await startBackgroundLocation(
      alarmState.anchorPoint,
      alarmState.dragThreshold,
      alarmState.updateInterval,
      alarmState.smoothingWindow,
    );

    if (backgroundStarted) {
      Alert.alert(
        'Background Alarm Active',
        'Alarm will continue monitoring even when app is in background.',
      );
    }

    // Also start foreground tracking for immediate updates
    const watchId = watchPosition(
      position => {
        setPositionHistory(prev => {
          const updated = [...prev, position];
          // Keep only last N positions for smoothing
          const trimmed = updated.slice(-alarmState.smoothingWindow * 2);
          return trimmed;
        });
      },
      {
        interval: alarmState.updateInterval * 1000,
        enableHighAccuracy: true,
      },
    );

    watchIdRef.current = watchId;
  };

  const stopAlarm = async () => {
    if (watchIdRef.current !== null) {
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Stop background location
    await stopBackgroundLocation();
    
    // Stop alarm sound
    await stopAlarmSound();
    
    setAlarmState(prev => ({
      ...prev,
      isAlarmTriggered: false,
      alarmTriggerTime: undefined,
    }));
    setPositionHistory([]);
  };

  useEffect(() => {
    if (!alarmState.isActive || positionHistory.length === 0) {
      return;
    }

    const latestPosition = positionHistory[positionHistory.length - 1];
    const smoothed = smoothPosition(
      positionHistory,
      alarmState.smoothingWindow,
    );

    if (!smoothed || !alarmState.anchorPoint) {
      return;
    }

    const check = shouldTriggerAlarm(
      {
        ...alarmState,
        smoothedPosition: smoothed,
        currentPosition: latestPosition,
      },
      latestPosition,
    );

    setAlarmState(prev => {
      const wasTriggered = prev.isAlarmTriggered;
      const nowTriggered = check.shouldTrigger;

      // If alarm just triggered, sound and vibrate
      if (!wasTriggered && nowTriggered) {
        // Play alarm sound based on settings
        if (settings) {
          playAlarmSound(
            settings.alarmSoundType,
            settings.alarmVolume || 1.0,
          );
        } else {
          // Fallback to vibration
          if (Platform.OS === 'ios') {
            Vibration.vibrate([0, 500, 100, 500]);
          } else {
            Vibration.vibrate([0, 500, 100, 500], true);
          }
        }

        Alert.alert(
          '⚠️ Anchor Drag Alarm',
          `Boat has moved ${formatLength(
            check.distance,
            unitSystem,
          )} from anchor point (threshold: ${formatLength(
            alarmState.dragThreshold,
            unitSystem,
          )})`,
        );
      }

      return {
        ...prev,
        distanceFromAnchor: check.distance,
        smoothedPosition: smoothed,
        currentPosition: latestPosition,
        isAlarmTriggered: nowTriggered,
        alarmTriggerTime: nowTriggered
          ? prev.alarmTriggerTime || Date.now()
          : undefined,
        gpsAccuracy: latestPosition.accuracy,
      };
    });
  }, [positionHistory, alarmState.isActive]);

  const handleSaveSession = async () => {
    if (!calculationResult) {
      Alert.alert('Error', 'Please calculate first');
      return;
    }

    const session: AnchoringSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      location: alarmState.currentPosition,
      depth: parseFloat(depth),
      bowHeight: parseFloat(bowHeight),
      scopeRatio: parseFloat(scopeRatio),
      rodeType,
      chainLength: chainLength ? parseFloat(chainLength) : undefined,
      totalRodeAvailable: totalRodeAvailable
        ? parseFloat(totalRodeAvailable)
        : undefined,
      safetyMargin: safetyMargin ? parseFloat(safetyMargin) : undefined,
      windSpeed: windSpeed ? parseFloat(windSpeed) : undefined,
      gustSpeed: gustSpeed ? parseFloat(gustSpeed) : undefined,
      bottomType,
      anchorType,
      recommendedRodeLength: calculationResult.recommendedRodeLength,
      actualRodeDeployed: actualRodeDeployed
        ? parseFloat(actualRodeDeployed)
        : undefined,
      boatLength: boatLength ? parseFloat(boatLength) : undefined,
      swingRadius: swingRadiusResult?.radius,
      anchorPoint: alarmState.anchorPoint,
      dragThreshold: alarmState.dragThreshold,
      unitSystem,
      notes: notes || undefined,
    };

    await saveSession(session);
    Alert.alert('Success', 'Session saved');
  };

  const bottomTypeInfo = getBottomTypeInfo(bottomType);
  const gpsAccuracyCheck = checkGpsAccuracy(alarmState.gpsAccuracy);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 1: Enter Conditions</Text>

        <InputField
          label="Water Depth"
          value={depth}
          onChangeText={setDepth}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
        />

        <InputField
          label="Bow Height / Freeboard"
          value={bowHeight}
          onChangeText={setBowHeight}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
        />

        <InputField
          label="Desired Scope Ratio"
          value={scopeRatio}
          onChangeText={setScopeRatio}
          placeholder="5"
        />
        <Text style={styles.hint}>
          Common ratios: 3:1 (calm), 5:1 (normal), 7:1 (windy), 10:1 (storm)
        </Text>

        <InputField
          label="Safety Margin (%)"
          value={safetyMargin}
          onChangeText={setSafetyMargin}
          placeholder="10"
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <InputField
              label="Chain Length"
              value={chainLength}
              onChangeText={setChainLength}
              unit={getLengthUnit(unitSystem)}
              placeholder="0"
            />
          </View>
          <View style={styles.halfWidth}>
            <InputField
              label="Total Rode Available"
              value={totalRodeAvailable}
              onChangeText={setTotalRodeAvailable}
              unit={getLengthUnit(unitSystem)}
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Rode Type</Text>
          <View style={styles.pickerWrapper}>
            {Object.values(RodeType).map(type => (
              <Button
                key={type}
                title={type}
                onPress={() => setRodeType(type)}
                variant={rodeType === type ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <InputField
              label="Wind Speed"
              value={windSpeed}
              onChangeText={setWindSpeed}
              unit={unitSystem === UnitSystem.METRIC ? 'm/s' : 'knots'}
              placeholder="0"
            />
          </View>
          <View style={styles.halfWidth}>
            <InputField
              label="Gust Speed (optional)"
              value={gustSpeed}
              onChangeText={setGustSpeed}
              unit={unitSystem === UnitSystem.METRIC ? 'm/s' : 'knots'}
              placeholder="0"
            />
          </View>
        </View>

        <Button
          title="Get Wind-Based Scope Recommendation"
          onPress={handleGetWindRecommendation}
          variant="secondary"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Bottom Type</Text>
          <View style={styles.pickerWrapper}>
            {Object.values(BottomType).map(type => (
              <Button
                key={type}
                title={BOTTOM_TYPE_INFO[type].name}
                onPress={() => setBottomType(type)}
                variant={bottomType === type ? 'primary' : 'secondary'}
              />
            ))}
          </View>
          <View style={styles.bottomTypeInfo}>
            <Text style={styles.bottomTypeSuitability}>
              Suitability: {bottomTypeInfo.suitability}
            </Text>
            <Text style={styles.bottomTypeNotes}>{bottomTypeInfo.notes}</Text>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Anchor Type (Optional)</Text>
          <Text style={styles.hint}>
            Tap to select your anchor type. Recommendations shown based on bottom type.
          </Text>
          
          <TouchableOpacity
            style={[
              styles.anchorSelectorButton,
              anchorType && styles.anchorSelectorButtonSelected,
            ]}
            onPress={() => setAnchorModalVisible(true)}>
            {anchorType ? (
              <View style={styles.anchorSelectorContent}>
                <Text style={styles.anchorSelectorIcon}>
                  {getAnchorIconDetailed(anchorType)}
                </Text>
                <Text style={styles.anchorSelectorText}>
                  {getAnchorTypeInfo(anchorType).name}
                </Text>
              </View>
            ) : (
              <Text style={styles.anchorSelectorPlaceholder}>
                Tap to select anchor type
              </Text>
            )}
            <Text style={styles.anchorSelectorArrow}>›</Text>
          </TouchableOpacity>

          {anchorType && (
            <View style={styles.anchorTypeInfo}>
              <Text style={styles.anchorTypeDescription}>
                {getAnchorTypeInfo(anchorType).description}
              </Text>
            </View>
          )}
        </View>

        <AnchorTypeModal
          visible={anchorModalVisible}
          onClose={() => setAnchorModalVisible(false)}
          selectedType={anchorType}
          onSelect={setAnchorType}
          bottomType={bottomType}
        />

        <Button title="Calculate" onPress={handleCalculate} fullWidth />
      </View>

      {calculationResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 2: Calculation Results</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Total Vertical Distance:</Text>
            <Text style={styles.resultValue}>
              {formatLength(
                calculationResult.totalVerticalDistance,
                unitSystem,
              )}
            </Text>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Recommended Rode Length:</Text>
            <Text style={[styles.resultValue, styles.highlight]}>
              {formatLength(
                calculationResult.recommendedRodeLength,
                unitSystem,
              )}
            </Text>
          </View>
          {calculationResult.warning && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ {calculationResult.warning}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 3: Swing Radius & Alarm</Text>

        <InputField
          label="Actual Rode Deployed"
          value={actualRodeDeployed}
          onChangeText={setActualRodeDeployed}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
        />

        <InputField
          label="Boat Length (LOA) - Optional"
          value={boatLength}
          onChangeText={setBoatLength}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
        />

        {swingRadiusResult && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Swing Radius:</Text>
            <Text style={styles.resultValue}>
              {formatLength(swingRadiusResult.radius, unitSystem)}
            </Text>
            <Text style={styles.resultLabel}>Swing Diameter:</Text>
            <Text style={styles.resultValue}>
              {formatLength(swingRadiusResult.diameter, unitSystem)}
            </Text>
          </View>
        )}

        <Button
          title="Set Anchor Point"
          onPress={handleSetAnchorPoint}
          variant="secondary"
        />

        {alarmState.anchorPoint && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Anchor point set at:{' '}
              {alarmState.anchorPoint.latitude.toFixed(6)},{' '}
              {alarmState.anchorPoint.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        <InputField
          label="Drag Threshold"
          value={alarmState.dragThreshold.toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num)) {
              setAlarmState(prev => ({...prev, dragThreshold: num}));
            }
          }}
          unit={getLengthUnit(unitSystem)}
        />

        <Button
          title={alarmState.isActive ? 'Stop Alarm' : 'Start Alarm'}
          onPress={() =>
            setAlarmState(prev => ({...prev, isActive: !prev.isActive}))
          }
          variant={alarmState.isActive ? 'danger' : 'primary'}
          fullWidth
        />

        {alarmState.isActive && (
          <View style={styles.alarmStatus}>
            <Text style={styles.alarmStatusText}>
              Distance from anchor:{' '}
              {formatLength(alarmState.distanceFromAnchor, unitSystem)}
            </Text>
            {gpsAccuracyCheck.warning && (
              <Text style={styles.warningText}>
                {gpsAccuracyCheck.warning}
              </Text>
            )}
            {alarmState.isAlarmTriggered && (
              <View style={styles.alarmTriggered}>
                <Text style={styles.alarmTriggeredText}>
                  ⚠️ ALARM: Anchor drag detected!
                </Text>
              </View>
            )}
          </View>
        )}

        {swingRadiusResult && alarmState.anchorPoint && (
          <SwingCircleView
            anchorPoint={alarmState.anchorPoint}
            currentPosition={alarmState.currentPosition}
            swingRadius={
              unitSystem === UnitSystem.METRIC
                ? swingRadiusResult.radius
                : convertLength(
                    swingRadiusResult.radius,
                    UnitSystem.IMPERIAL,
                    UnitSystem.METRIC,
                  )
            }
            unitSystem={unitSystem}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 4: Session Notes</Text>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Record conditions, anchor type used, issues encountered..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.hint}>
          Useful for learning and troubleshooting
        </Text>
      </View>

      <View style={styles.section}>
        <Button
          title="Save Session"
          onPress={handleSaveSession}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: -12,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomTypeInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  bottomTypeSuitability: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bottomTypeNotes: {
    fontSize: 12,
    color: '#666',
  },
  recommendationBox: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#004085',
  },
  anchorTypeInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  anchorTypeDescription: {
    fontSize: 12,
    color: '#666',
  },
  anchorSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  anchorSelectorButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  anchorSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  anchorSelectorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  anchorSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  anchorSelectorPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  anchorSelectorArrow: {
    fontSize: 24,
    color: '#666',
  },
  resultBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  highlight: {
    color: '#007AFF',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#004085',
  },
  alarmStatus: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  alarmStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  alarmTriggered: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
  },
  alarmTriggeredText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721c24',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#fff',
    color: '#333',
  },
});

