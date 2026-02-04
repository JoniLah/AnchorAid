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
  Modal,
  Linking,
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
import {loadSettings, loadSessions, saveSession} from '../services/storage';
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
import {clearLockScreenNotification} from '../services/lockScreenNotification';
import {calculateScope, getRecommendedScopeRatio} from '../utils/scopeCalculator';
import {calculateSwingRadius} from '../utils/swingCalculator';
import {getBottomTypeInfo, BOTTOM_TYPE_INFO, getBottomTypeName, getSuitabilityRating} from '../utils/bottomType';
import {
  getAnchorTypeInfo,
  getRecommendedAnchorsForBottom,
  isAnchorRecommendedForBottom,
  ANCHOR_TYPE_INFO,
} from '../utils/anchorType';
import {getAnchorDescription} from '../utils/anchorDescription';
import {getAnchorIconDetailed} from '../utils/anchorIcons';
import {AnchorTypeModal} from '../components/AnchorTypeModal';
import {Image} from 'react-native';
import {
  predictBottomType,
  saveBottomTypeObservation,
} from '../services/bottomTypePrediction';
import {
  shouldTriggerAlarm,
  smoothPosition,
  checkGpsAccuracy,
} from '../utils/alarmLogic';
import {formatLength, getLengthUnit, convertLength} from '../utils/units';
import {useTheme} from '../theme/ThemeContext';
import {t, onLanguageChange} from '../i18n';

/**
 * Get the image source for an anchor type
 */
const getAnchorImageSource = (type: AnchorType) => {
  const imageMap: Record<AnchorType, any> = {
    [AnchorType.DANFORTH]: require('../../assets/graphics/danforth.png'),
    [AnchorType.BRUCE]: require('../../assets/graphics/bruce.png'),
    [AnchorType.PLOW]: require('../../assets/graphics/plow.png'),
    [AnchorType.DELTA]: require('../../assets/graphics/delta.png'),
    [AnchorType.ROCNA]: require('../../assets/graphics/rocna.png'),
    [AnchorType.MANTUS]: require('../../assets/graphics/mantus.png'),
    [AnchorType.FORTRESS]: require('../../assets/graphics/fortress.png'),
    [AnchorType.AC14]: require('../../assets/graphics/ac14.png'),
    [AnchorType.SPADE]: require('../../assets/graphics/spade.png'),
    [AnchorType.COBRA]: require('../../assets/graphics/cobra.png'),
    [AnchorType.HERRESHOFF]: require('../../assets/graphics/herreshoff.png'),
    [AnchorType.NORTHILL]: require('../../assets/graphics/admiralty.png'),
    [AnchorType.ULTRA]: require('../../assets/graphics/ultra.png'),
    [AnchorType.EXCEL]: require('../../assets/graphics/excel.png'),
    [AnchorType.VULCAN]: require('../../assets/graphics/vulcan.png'),
    [AnchorType.SUPREME]: require('../../assets/graphics/supreme.png'),
    [AnchorType.STOCKLESS]: require('../../assets/graphics/stockless.png'),
    [AnchorType.NAVY_STOCKLESS]: require('../../assets/graphics/navy-stockless.png'),
    [AnchorType.KEDGE]: require('../../assets/graphics/basic-anchor.png'),
    [AnchorType.GRAPNEL]: require('../../assets/graphics/grapnel.png'),
    [AnchorType.MUSHROOM]: require('../../assets/graphics/mushroom.png'),
    [AnchorType.OTHER]: require('../../assets/graphics/other.png'),
  };
  return imageMap[type] || require('../../assets/graphics/other.png');
};

export const AnchoringSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {colors, effectiveTheme} = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.METRIC);

  // Input fields
  const [depth, setDepth] = useState('');
  const [bowHeight, setBowHeight] = useState('');
  const [scopeRatio, setScopeRatio] = useState('5');
  const [safetyMargin, setSafetyMargin] = useState('');
  const [chainLength, setChainLength] = useState('');
  const [totalRodeAvailable, setTotalRodeAvailable] = useState('');
  const [rodeType, setRodeType] = useState<RodeType>(RodeType.ROPE);
  const [rodeTypeModalVisible, setRodeTypeModalVisible] = useState(false);
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
  const [anchorStartTime, setAnchorStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [languageKey, setLanguageKey] = useState(0);

  useEffect(() => {
    loadInitialSettings();
    initializeAudio();
  }, []);

  // Listen for language changes to force re-render of translated content
  useEffect(() => {
    const unsubscribe = onLanguageChange(() => {
      setLanguageKey(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  // When opening a saved session (from Session History), prefill all inputs from that session
  useEffect(() => {
    const sessionId = (route.params as {sessionId?: string} | undefined)?.sessionId;
    if (!sessionId) return;
    loadSessions().then(sessions => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      setUnitSystem(session.unitSystem);
      setDepth(session.depth != null ? String(session.depth) : '');
      setBowHeight(session.bowHeight != null ? String(session.bowHeight) : '');
      setScopeRatio(session.scopeRatio != null ? String(session.scopeRatio) : '5');
      setSafetyMargin(session.safetyMargin != null ? String(session.safetyMargin) : '');
      setChainLength(session.chainLength != null ? String(session.chainLength) : '');
      setTotalRodeAvailable(session.totalRodeAvailable != null ? String(session.totalRodeAvailable) : '');
      setRodeType(session.rodeType ?? RodeType.ROPE);
      setWindSpeed(session.windSpeed != null ? String(session.windSpeed) : '');
      setGustSpeed(session.gustSpeed != null ? String(session.gustSpeed) : '');
      setBottomType(session.bottomType ?? BottomType.UNKNOWN);
      setAnchorType(session.anchorType ?? undefined);
      setActualRodeDeployed(session.actualRodeDeployed != null ? String(session.actualRodeDeployed) : '');
      setBoatLength(session.boatLength != null ? String(session.boatLength) : '');
      setNotes(session.notes ?? '');
      setAlarmState(prev => ({
        ...prev,
        dragThreshold: session.dragThreshold ?? prev.dragThreshold,
        anchorPoint: session.anchorPoint,
      }));
      if (session.recommendedRodeLength != null) {
        setCalculationResult({
          totalVerticalDistance: (session.depth ?? 0) + (session.bowHeight ?? 0),
          recommendedRodeLength: session.recommendedRodeLength,
          exceedsAvailable: false,
        });
      } else {
        setCalculationResult(null);
      }
      if (session.swingRadius != null) {
        setSwingRadiusResult({
          radius: session.swingRadius,
          diameter: session.swingRadius * 2,
        });
      } else {
        setSwingRadiusResult(null);
      }
    });
  }, [(route.params as {sessionId?: string} | undefined)?.sessionId]);

  // Check for background alarms when screen comes into focus
  // checkBackgroundAlarm() clears the alarm after reading, so it can only trigger once
  useFocusEffect(
    React.useCallback(() => {
      checkBackgroundAlarm().then(alarm => {
        if (alarm && alarm.triggered) {
          Alert.alert(
            `⚠️ ${t('anchorDragAlarm')}`,
            `${t('boatMoved')} ${formatLength(
              alarm.distance || 0,
              unitSystem,
            )} ${t('fromAnchorPoint')} (${t('threshold')}: ${formatLength(
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

  // Timer effect - update elapsed time every second
  useEffect(() => {
    if (!anchorStartTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - anchorStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [anchorStartTime]);

  const loadInitialSettings = async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
    setUnitSystem(loaded.unitSystem ?? UnitSystem.METRIC);
    setScopeRatio((loaded.defaultScopeRatio ?? 5).toString());
    setAlarmState(prev => ({
      ...prev,
      dragThreshold: loaded.defaultDragThreshold ?? 30,
      updateInterval: loaded.defaultUpdateInterval ?? 5,
      smoothingWindow: loaded.defaultSmoothingWindow ?? 5,
    }));

    // Load default values if they exist
    if (loaded.defaultBowHeight !== undefined && loaded.defaultBowHeight !== null) {
      setBowHeight(loaded.defaultBowHeight.toString());
    }
    if (loaded.defaultSafetyMargin !== undefined && loaded.defaultSafetyMargin !== null) {
      setSafetyMargin(loaded.defaultSafetyMargin.toString());
    }
    if (loaded.defaultChainLength !== undefined && loaded.defaultChainLength !== null) {
      setChainLength(loaded.defaultChainLength.toString());
    }
    if (loaded.defaultTotalRodeAvailable !== undefined && loaded.defaultTotalRodeAvailable !== null) {
      setTotalRodeAvailable(loaded.defaultTotalRodeAvailable.toString());
    }
    if (loaded.defaultRodeType !== undefined && loaded.defaultRodeType !== null) {
      setRodeType(loaded.defaultRodeType);
    }
  };

  const handleLoadDefaults = () => {
    if (!settings) return;

    setScopeRatio((settings.defaultScopeRatio ?? 5).toString());
    if (settings.defaultBowHeight !== undefined && settings.defaultBowHeight !== null) {
      setBowHeight(settings.defaultBowHeight.toString());
    } else {
      setBowHeight('');
    }
    if (settings.defaultSafetyMargin !== undefined) {
      setSafetyMargin(settings.defaultSafetyMargin.toString());
    } else {
      setSafetyMargin('');
    }
    if (settings.defaultChainLength !== undefined) {
      setChainLength(settings.defaultChainLength.toString());
    } else {
      setChainLength('');
    }
    if (settings.defaultTotalRodeAvailable !== undefined) {
      setTotalRodeAvailable(settings.defaultTotalRodeAvailable.toString());
    } else {
      setTotalRodeAvailable('');
    }
    if (settings.defaultRodeType !== undefined) {
      setRodeType(settings.defaultRodeType);
    } else {
      setRodeType(RodeType.ROPE);
    }
  };

  const handleClearFields = () => {
    setDepth('');
    setBowHeight('');
    setScopeRatio('5');
    setSafetyMargin('');
    setChainLength('');
    setTotalRodeAvailable('');
    setRodeType(RodeType.ROPE);
    setWindSpeed('');
    setGustSpeed('');
    setBottomType(BottomType.UNKNOWN);
    setAnchorType(undefined);
    setActualRodeDeployed('');
    setBoatLength('');
    setNotes('');
  };

  const handleCreateNewSession = () => {
    // Navigate to new session (without sessionId) but keep current values
    // Use setParams to update the route params, which will update the title
    // but keep all the current form values
    (navigation as any).setParams({sessionId: undefined});
  };

  const handleCalculate = () => {
    const depthTrimmed = depth.trim();
    const bowHeightTrimmed = bowHeight.trim();
    const scopeRatioTrimmed = scopeRatio.trim();

    if (!depthTrimmed || !bowHeightTrimmed || !scopeRatioTrimmed) {
      Alert.alert(t('error'), `${t('pleaseEnter')} depth, bow height, and scope ratio`);
      return;
    }

    const depthNum = parseFloat(depthTrimmed);
    const bowHeightNum = parseFloat(bowHeightTrimmed);
    const scopeRatioNum = parseFloat(scopeRatioTrimmed);

    if (isNaN(depthNum) || isNaN(bowHeightNum) || isNaN(scopeRatioNum)) {
      Alert.alert(t('error'), `${t('pleaseEnter')} depth, bow height, and scope ratio`);
      return;
    }

    if (depthNum <= 0 || bowHeightNum < 0 || scopeRatioNum <= 0) {
      Alert.alert(t('error'), 'Depth and scope ratio must be greater than 0. Bow height must be 0 or greater.');
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

    const result = calculateScope(
      {
        depth: depthM,
        bowHeight: bowHeightM,
        scopeRatio: scopeRatioNum,
        safetyMargin: safetyMargin ? parseFloat(safetyMargin) : undefined,
        chainLength: chainLengthM,
        totalRodeAvailable: totalRodeM,
        rodeType,
        unitSystem: UnitSystem.METRIC, // Always calculate in metric
      },
      (key: string) => t(key as any),
    );

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
      Alert.alert(t('error'), t('pleaseEnterWindSpeed'));
      return;
    }

    const windNum = parseFloat(windSpeed);
    const gustNum = gustSpeed ? parseFloat(gustSpeed) : undefined;
    const recommendation = getRecommendedScopeRatio(
      windNum,
      gustNum,
      unitSystem,
    );

    // Get translated note based on recommendation type
    let translatedNote = '';
    if (recommendation.recommended === 4) {
      translatedNote = t('lightConditionsNote');
    } else if (recommendation.recommended === 6) {
      translatedNote = t('moderateConditionsNote');
    } else {
      translatedNote = t('strongConditionsNote');
    }

    Alert.alert(
      t('recommendedScope'),
      `${translatedNote}\n\n${t('suggestedScope')}: ${recommendation.recommended}:1 (${t('range')}: ${recommendation.min}:1 to ${recommendation.max}:1)`,
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
      
      // Try to predict bottom type
      const prediction = await predictBottomType(position);
      
      if (prediction && prediction.confidence > 0.4) {
        Alert.alert(
          t('suggestedBottomType'),
          `${t('basedOnNearbyData')}: ${getBottomTypeName(prediction.bottomType, t)}\n\n${t('confidence')}: ${Math.round(prediction.confidence * 100)}% (${prediction.nearbyRecords} ${t('nearbyObservations')})\n\n${t('wouldYouLikeToUse')}?`,
          [
            {text: t('no'), style: 'cancel'},
            {
              text: t('yes'),
              onPress: () => {
                setBottomType(prediction.bottomType);
                setAlarmState(prev => ({
                  ...prev,
                  anchorPoint: position,
                }));
                setAnchorStartTime(Date.now());
              },
            },
          ],
        );
      } else {
        setAlarmState(prev => ({
          ...prev,
          anchorPoint: position,
        }));
        setAnchorStartTime(Date.now());
        Alert.alert(t('setAnchorPoint'), t('anchorPointSetSuccess'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToGetPosition'));
    }
  };

  const handleShowAnchorPointOnMap = () => {
    if (!alarmState.anchorPoint) return;
    const {latitude, longitude} = alarmState.anchorPoint;
    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}`
        : `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleStopAnchoring = () => {
    Alert.alert(
      t('stopAnchoring'),
      t('clearAnchorPoint') + '?',
      [
        {text: t('cancel'), style: 'cancel'},
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            // Stop alarm if active
            if (alarmState.isActive) {
              await stopAlarm();
              setAlarmState(prev => ({...prev, isActive: false}));
            }
            // Clear anchor point and reset timer
            setAlarmState(prev => ({
              ...prev,
              anchorPoint: undefined,
              currentPosition: undefined,
              distanceFromAnchor: 0,
              isAlarmTriggered: false,
            }));
            setAnchorStartTime(null);
            setElapsedTime(0);
            setPositionHistory([]);
          },
        },
      ],
    );
  };

  const startAlarm = async () => {
    if (!alarmState.anchorPoint) {
      Alert.alert(t('error'), t('pleaseSetAnchorPoint'));
      setAlarmState(prev => ({...prev, isActive: false}));
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(t('permissionRequired'), t('locationPermissionRequiredShort'));
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
        t('backgroundAlarmActive'),
        t('backgroundAlarmMessage'),
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
    
    // Clear notifications
    await clearLockScreenNotification();
    
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
          `⚠️ ${t('anchorDragAlarm')}`,
          `${t('boatMoved')} ${formatLength(
            check.distance,
            unitSystem,
          )} ${t('fromAnchorPoint')} (${t('threshold')}: ${formatLength(
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
      Alert.alert(t('error'), t('pleaseCalculateFirst'));
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
    
    // Save bottom type observation for future predictions
    if (alarmState.anchorPoint && bottomType) {
      await saveBottomTypeObservation(
        alarmState.anchorPoint,
        bottomType,
        'high', // User confirmed, so high confidence
      );
    }
    
    Alert.alert(t('success'), t('sessionSaved'));
  };

  const bottomTypeInfo = getBottomTypeInfo(bottomType, t);
  const gpsAccuracyCheck = checkGpsAccuracy(alarmState.gpsAccuracy, (key: string) => t(key as any));

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
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <View style={styles.sectionHeaderWithButtons}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('enterConditions')}</Text>
          <View style={styles.actionButtonsContainer}>
            {!(route.params as {sessionId?: string} | undefined)?.sessionId && (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: colors.primary}]}
                  onPress={handleLoadDefaults}
                  activeOpacity={0.8}>
                  <Text style={[styles.actionButtonText, {color: '#fff'}]}>{t('loadDefaults')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: colors.error}]}
                  onPress={handleClearFields}
                  activeOpacity={0.8}>
                  <Text style={[styles.actionButtonText, {color: '#fff'}]}>{t('clearFields')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {(route.params as {sessionId?: string} | undefined)?.sessionId && (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionButtonFullWidth, {backgroundColor: colors.success}]}
                  onPress={handleCreateNewSession}
                  activeOpacity={0.8}>
                  <Text style={[styles.actionButtonText, {color: '#fff'}]}>{t('createNewSessionWithValues')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <InputField
          label={t('waterDepth')}
          value={depth}
          onChangeText={setDepth}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
          tooltip={t('waterDepthTooltip')}
          required
        />

        <InputField
          label={t('bowHeight')}
          value={bowHeight}
          onChangeText={setBowHeight}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
          tooltip={t('bowHeightTooltip')}
          required
        />

        <InputField
          label={t('desiredScopeRatio')}
          value={scopeRatio}
          onChangeText={setScopeRatio}
          placeholder="5"
          suffix=":1"
          tooltip={t('desiredScopeRatioTooltip')}
          required
        />
        <Text style={[styles.hint, {color: colors.textSecondary}]}>
          {t('scopeHint')}
        </Text>

        <InputField
          label={t('safetyMargin')}
          value={safetyMargin}
          onChangeText={setSafetyMargin}
          placeholder="10"
          tooltip={t('safetyMarginTooltip')}
        />

        <InputField
          label={t('chainLength')}
          value={chainLength}
          onChangeText={setChainLength}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
          tooltip={t('chainLengthTooltip')}
        />
        <InputField
          label={t('totalRodeAvailable')}
          value={totalRodeAvailable}
          onChangeText={setTotalRodeAvailable}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
          tooltip={t('totalRodeAvailableTooltip')}
        />

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, {color: colors.text}]}>
            {t('rodeType')}<Text style={{color: colors.error}}> *</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdownButton, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : colors.inputBackground, borderColor: colors.border}]}
            onPress={() => setRodeTypeModalVisible(true)}
            activeOpacity={0.7}>
            <Text style={[styles.dropdownButtonText, {color: colors.text}]}>
              {(() => {
                switch (rodeType) {
                  case RodeType.CHAIN:
                    return t('chain');
                  case RodeType.ROPE_CHAIN:
                    return t('ropeChain');
                  case RodeType.ROPE:
                    return t('rope');
                  default:
                    return rodeType;
                }
              })()}
            </Text>
            <Text style={[styles.dropdownArrow, {color: colors.textSecondary}]}>▼</Text>
          </TouchableOpacity>

          <Modal
            visible={rodeTypeModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setRodeTypeModalVisible(false)}>
            <TouchableOpacity
              style={[styles.modalOverlay, {backgroundColor: colors.modalOverlay || 'rgba(0, 0, 0, 0.5)'}]}
              activeOpacity={1}
              onPress={() => setRodeTypeModalVisible(false)}>
              <View style={[styles.modalContent, {backgroundColor: effectiveTheme === 'dark' ? '#1C1C1E' : colors.surface}]}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>{t('rodeType')}</Text>
                {Object.values(RodeType).map(type => {
                  const getRodeTypeLabel = (rodeType: RodeType): string => {
                    switch (rodeType) {
                      case RodeType.CHAIN:
                        return t('chain');
                      case RodeType.ROPE_CHAIN:
                        return t('ropeChain');
                      case RodeType.ROPE:
                        return t('rope');
                      default:
                        return rodeType;
                    }
                  };
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.modalOption,
                        {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'},
                        rodeType === type && {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary, borderWidth: 1},
                      ]}
                      onPress={() => {
                        setRodeType(type);
                        setRodeTypeModalVisible(false);
                      }}>
                      <Text
                        style={[
                          styles.modalOptionText,
                          {color: colors.text},
                          rodeType === type && {color: colors.primary, fontWeight: '600'},
                        ]}>
                        {getRodeTypeLabel(type)}
                      </Text>
                      {rodeType === type && (
                        <Text style={[styles.modalOptionCheck, {color: colors.primary}]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <InputField
          label={t('windSpeed')}
          value={windSpeed}
          onChangeText={setWindSpeed}
          unit={unitSystem === UnitSystem.METRIC ? 'm/s' : 'knots'}
          placeholder="0"
          tooltip={t('windSpeedTooltip')}
        />
        <InputField
          label={t('gustSpeed')}
          value={gustSpeed}
          onChangeText={setGustSpeed}
          unit={unitSystem === UnitSystem.METRIC ? 'm/s' : 'knots'}
          placeholder="0"
          tooltip={t('gustSpeedTooltip')}
        />

        <Button
          title={t('getWindRecommendation')}
          onPress={handleGetWindRecommendation}
          variant="secondary"
        />

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, {color: colors.text}]}>{t('bottomType')}</Text>
          <View style={styles.pickerWrapper}>
            {Object.values(BottomType).map(type => (
              <Button
                key={type}
                title={getBottomTypeName(type, t)}
                onPress={() => setBottomType(type)}
                variant={bottomType === type ? 'primary' : 'secondary'}
              />
            ))}
          </View>
          <View style={[styles.bottomTypeInfo, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f0f0f0'}]}>
            <Text style={[styles.bottomTypeSuitability, {color: colors.text}]}>
              {t('suitability')}: {getSuitabilityRating(bottomTypeInfo.suitability, t)}
            </Text>
            <Text style={[styles.bottomTypeNotes, {color: colors.textSecondary}]}>{bottomTypeInfo.notes}</Text>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, {color: colors.text}]}>{t('anchorTypeOptional')}</Text>
          <Text style={[styles.hint, {color: colors.textSecondary}]}>
            {t('tapToSelectAnchorType')}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.anchorSelectorButton,
              {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border},
              anchorType && {borderColor: colors.primary, backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'},
            ]}
            onPress={() => setAnchorModalVisible(true)}>
            {anchorType ? (
              <View style={styles.anchorSelectorContent}>
                <Image
                  source={getAnchorImageSource(anchorType)}
                  style={styles.anchorSelectorImage}
                  resizeMode="contain"
                />
                <Text style={[styles.anchorSelectorText, {color: colors.text}]}>
                  {getAnchorTypeInfo(anchorType).name}
                </Text>
              </View>
            ) : (
              <Text style={[styles.anchorSelectorPlaceholder, {color: colors.textTertiary}]}>
                {t('tapToSelectAnchorType')}
              </Text>
            )}
            <Text style={[styles.anchorSelectorArrow, {color: colors.textSecondary}]}>›</Text>
          </TouchableOpacity>

          {anchorType && (
            <View style={[styles.anchorTypeInfo, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f0f0f0'}]}>
              <Text style={[styles.anchorTypeDescription, {color: colors.textSecondary}]}>
                {getAnchorDescription(anchorType, t)}
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

        <Button title={t('calculate')} onPress={handleCalculate} fullWidth />
      </View>

      {calculationResult && (
        <View style={[styles.section, {backgroundColor: colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('calculationResults')}</Text>
          <View style={[styles.resultBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f0f0f0'}]}>
            <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>{t('totalVerticalDistance')}:</Text>
            <Text style={[styles.resultValue, {color: colors.text}]}>
              {formatLength(
                calculationResult.totalVerticalDistance,
                unitSystem,
              )}
            </Text>
          </View>
          <View style={[styles.resultBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f0f0f0'}]}>
            <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>{t('recommendedRodeLength')}:</Text>
            <Text style={[styles.resultValue, {color: colors.primary}]}>
              {formatLength(
                calculationResult.recommendedRodeLength,
                unitSystem,
              )}
            </Text>
          </View>
          {calculationResult.warning && (
            <View style={[styles.warningBox, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd'}]}>
              <Text style={[styles.warningText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
                ⚠️ {calculationResult.warning}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('swingRadiusAlarm')}</Text>

        <InputField
          label={t('actualRodeDeployed')}
          value={actualRodeDeployed}
          onChangeText={setActualRodeDeployed}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
          tooltip={t('actualRodeDeployedTooltip')}
        />

        <InputField
          label={t('boatLength')}
          value={boatLength}
          onChangeText={setBoatLength}
          unit={getLengthUnit(unitSystem)}
          placeholder="0"
          tooltip={t('boatLengthTooltip')}
        />

        {swingRadiusResult && (
          <View style={[styles.resultBox, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f0f0f0'}]}>
            <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>{t('swingRadius')}:</Text>
            <Text style={[styles.resultValue, {color: colors.text}]}>
              {formatLength(swingRadiusResult.radius, unitSystem)}
            </Text>
            <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>{t('swingDiameter')}:</Text>
            <Text style={[styles.resultValue, {color: colors.text}]}>
              {formatLength(swingRadiusResult.diameter, unitSystem)}
            </Text>
          </View>
        )}

        <Button
          title={t('setAnchorPoint')}
          onPress={handleSetAnchorPoint}
          variant="secondary"
        />

        {alarmState.anchorPoint && (
          <View style={[styles.infoBox, {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'}]}>
            <Text style={[styles.infoText, {color: effectiveTheme === 'dark' ? '#0A84FF' : '#004085'}]}>
              {t('anchorPointSet')}:{' '}
              {alarmState.anchorPoint.latitude.toFixed(6)},{' '}
              {alarmState.anchorPoint.longitude.toFixed(6)}
            </Text>
            <View style={styles.anchorPointButtons}>
              <TouchableOpacity
                style={[styles.mapButton, {backgroundColor: colors.primary, flex: 1, marginRight: 8}]}
                onPress={handleShowAnchorPointOnMap}
                activeOpacity={0.7}>
                <Text style={[styles.mapButtonText, {color: '#fff'}]}>📍 {t('viewOnMap')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stopAnchoringButton, {backgroundColor: colors.error, flex: 1}]}
                onPress={handleStopAnchoring}
                activeOpacity={0.7}>
                <Text style={[styles.mapButtonText, {color: '#fff'}]}>⛔ {t('stopAnchoring')}</Text>
              </TouchableOpacity>
            </View>
            {anchorStartTime && (
              <View style={[styles.timerBox, {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary}]}>
                <Text style={[styles.timerLabel, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085'}]}>⏱️ {t('anchoredFor')}:</Text>
                <Text style={[styles.timerValue, {color: colors.primary}]}>
                  {formatElapsedTime(elapsedTime)}
                </Text>
              </View>
            )}
          </View>
        )}

        <InputField
          label={t('dragThreshold')}
          value={alarmState.dragThreshold.toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num)) {
              setAlarmState(prev => ({...prev, dragThreshold: num}));
            }
          }}
          unit={getLengthUnit(unitSystem)}
          tooltip={t('dragThresholdTooltip')}
        />

        <Button
          title={alarmState.isActive ? t('stopAlarm') : t('startAlarm')}
          onPress={() =>
            setAlarmState(prev => ({...prev, isActive: !prev.isActive}))
          }
          variant={alarmState.isActive ? 'danger' : 'primary'}
          fullWidth
        />

        {alarmState.isActive && (
          <View style={[styles.alarmStatus, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f0f0f0'}]}>
            <Text style={[styles.alarmStatusText, {color: colors.text}]}>
              {t('distanceFromAnchor')}:{' '}
              {formatLength(alarmState.distanceFromAnchor, unitSystem)}
            </Text>
            {gpsAccuracyCheck.warning && (
              <Text style={[styles.warningText, {color: colors.warning}]}>
                {gpsAccuracyCheck.warning}
              </Text>
            )}
            {alarmState.isAlarmTriggered && (
              <View style={[styles.alarmTriggered, {backgroundColor: effectiveTheme === 'dark' ? '#4a1f24' : '#f8d7da'}]}>
                <Text style={[styles.alarmTriggeredText, {color: colors.error}]}>
                  ⚠️ {t('alarmTriggered')}
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
        {alarmState.anchorPoint && (
          <View style={styles.monitorButtonContainer}>
            <TouchableOpacity
              style={[
                styles.monitorButton,
                {
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                if (!alarmState.anchorPoint) {
                  Alert.alert(t('error'), t('pleaseSetAnchorPoint'));
                  return;
                }
                (navigation as any).navigate('MonitorView', {
                  anchorPoint: alarmState.anchorPoint,
                  swingRadius:
                    swingRadiusResult
                      ? unitSystem === UnitSystem.METRIC
                        ? swingRadiusResult.radius
                        : convertLength(
                            swingRadiusResult.radius,
                            UnitSystem.IMPERIAL,
                            UnitSystem.METRIC,
                          )
                      : undefined,
                  unitSystem,
                  dragThreshold: alarmState.dragThreshold,
                  anchorStartTime: anchorStartTime ?? undefined,
                });
              }}
              activeOpacity={0.7}>
              <Text style={[styles.monitorButtonText, {color: colors.primary}]}>
                📊 {t('openMonitorView')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('sessionNotes')}</Text>
        <Text style={[styles.label, {color: colors.text}]}>{t('notesOptional')}</Text>
        <TextInput
          style={[styles.notesInput, {backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text}]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('notesPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={[styles.hint, {color: colors.textSecondary}]}>
          {t('notesHint')}
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('saveSession')}
          onPress={handleSaveSession}
          variant="secondary"
          fullWidth
        />
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
  scrollView: {
    flex: 1,
  },
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
  },
  monitorButtonContainer: {
    marginTop: 12,
  },
  monitorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1.5,
    width: '100%',
  },
  monitorButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeaderWithButtons: {
    marginBottom: 16,
  },
  actionButtonsContainer: {
    marginTop: 12,
    gap: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonFullWidth: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
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
    marginTop: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomTypeInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  bottomTypeSuitability: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bottomTypeNotes: {
    fontSize: 12,
  },
  recommendationBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
  },
  anchorTypeInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  anchorTypeDescription: {
    fontSize: 12,
  },
  anchorSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  anchorSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  anchorSelectorImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  anchorSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  anchorSelectorPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  anchorSelectorArrow: {
    fontSize: 24,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 8,
  },
  anchorPointButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  mapButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopAnchoringButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  alarmStatus: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  alarmStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alarmTriggered: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  alarmTriggeredText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalOptionCheck: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

