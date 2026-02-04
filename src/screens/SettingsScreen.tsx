import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, PanResponder, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {InputField} from '../components/InputField';
import {SafetyDisclaimer} from '../components/SafetyDisclaimer';
import {loadSettings, saveSettings} from '../services/storage';
import {AppSettings, UnitSystem, AlarmSoundType, Theme, RodeType} from '../types';
import {setLanguage, t, Language} from '../i18n';
import {useTheme} from '../theme/ThemeContext';
import {playAlarmSound, stopAlarmSound, initializeAudio, isAlarmPlaying} from '../services/alarmSound';

// Custom Volume Slider Component
const VolumeSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  colors: any;
  effectiveTheme: 'light' | 'dark';
}> = ({value, onValueChange, colors, effectiveTheme}) => {
  const [sliderValue, setSliderValue] = useState(value);
  const trackRef = useRef<View>(null);
  const [trackLayout, setTrackLayout] = useState({x: 0, width: 0});

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const measureTrack = (callback: (x: number, width: number) => void) => {
    if (trackRef.current) {
      trackRef.current.measureInWindow((pageX, pageY, width, height) => {
        setTrackLayout({x: pageX, width});
        callback(pageX, width);
      });
    }
  };

  const updateValue = (evt: any) => {
    const touchX = evt.nativeEvent.pageX;
    
    if (trackLayout.width > 0) {
      const relativeX = touchX - trackLayout.x;
      const newValue = Math.max(0, Math.min(100, (relativeX / trackLayout.width) * 100));
      setSliderValue(newValue);
      onValueChange(newValue);
    } else {
      // Measure first if not measured yet
      measureTrack((pageX, width) => {
        const relativeX = touchX - pageX;
        const newValue = Math.max(0, Math.min(100, (relativeX / width) * 100));
        setSliderValue(newValue);
        onValueChange(newValue);
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: updateValue,
      onPanResponderMove: updateValue,
      onPanResponderRelease: () => {},
    }),
  ).current;

  const handlePress = (evt: any) => {
    const touchX = evt.nativeEvent.pageX;
    measureTrack((pageX, width) => {
      const relativeX = touchX - pageX;
      const newValue = Math.max(0, Math.min(100, (relativeX / width) * 100));
      setSliderValue(newValue);
      onValueChange(newValue);
    });
  };

  const percentage = sliderValue;
  const thumbPosition = trackLayout.width > 0 
    ? Math.max(0, Math.min(trackLayout.width - 20, (percentage / 100) * (trackLayout.width - 20))) 
    : (percentage / 100) * 200; // Fallback estimate

  return (
    <View style={styles.sliderContainer}>
      <View 
        ref={trackRef}
        onLayout={() => {
          measureTrack(() => {});
        }}
        style={[styles.sliderTrackWrapper, {marginRight: 12}]}
        {...panResponder.panHandlers}>
        <View
          style={[styles.sliderTrack, {backgroundColor: effectiveTheme === 'dark' ? '#3A3A3C' : '#E5E5EA'}]}>
          <View
            style={[
              styles.sliderFill,
              {
                width: `${percentage}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              {
                left: thumbPosition,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.sliderValue, {color: colors.text}]}>
        {Math.round(sliderValue)}%
      </Text>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, effectiveTheme, setTheme: setThemeContext, colors} = useTheme();
  const [alarmSoundModalVisible, setAlarmSoundModalVisible] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [unitSystemModalVisible, setUnitSystemModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [rodeTypeModalVisible, setRodeTypeModalVisible] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    unitSystem: UnitSystem.METRIC,
    defaultScopeRatio: 5,
    defaultDragThreshold: 30,
    defaultUpdateInterval: 5,
    defaultSmoothingWindow: 5,
    defaultBowHeight: undefined,
    defaultSafetyMargin: undefined,
    defaultChainLength: undefined,
    defaultTotalRodeAvailable: undefined,
    defaultRodeType: RodeType.ROPE,
    language: 'en',
    alarmSoundType: AlarmSoundType.DEFAULT,
    alarmVolume: 1.0,
    theme: 'system',
  });

  useEffect(() => {
    loadUserSettings();
    initializeAudio();
  }, []);

  // Periodically check if sound is still playing to update button state
  useEffect(() => {
    if (isSoundPlaying) {
      const interval = setInterval(() => {
        const playing = isAlarmPlaying();
        if (!playing) {
          setIsSoundPlaying(false);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isSoundPlaying]);

  const loadUserSettings = async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
    setSettingsLoaded(true);
    if (loaded.language) {
      setLanguage(loaded.language);
    }
    if (loaded.theme) {
      await setThemeContext(loaded.theme);
    }
  };

  const handleSave = async () => {
    await saveSettings(settings);
    if (settings.language) {
      setLanguage(settings.language);
    }
    if (settings.theme) {
      await setThemeContext(settings.theme);
    }
    Alert.alert(t('success'), t('settingsSaved'));
  };

  // Auto-save settings when they change (but not on initial load)
  useEffect(() => {
    if (!settingsLoaded) return;
    
    const autoSave = async () => {
      await saveSettings(settings);
      if (settings.language) {
        setLanguage(settings.language);
      }
      if (settings.theme) {
        await setThemeContext(settings.theme);
      }
    };
    
    autoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.unitSystem, settings.language, settings.theme, settings.defaultScopeRatio, settings.defaultDragThreshold, settings.defaultUpdateInterval, settings.defaultSmoothingWindow, settings.alarmSoundType, settings.alarmVolume, settingsLoaded]);

  const handleTestSound = async () => {
    if (!settings.alarmSoundType) {
      Alert.alert(t('noSoundSelected'), t('pleaseSelectSound'));
      return;
    }

    // Cancel any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      // Always stop any existing sound first
      await stopAlarmSound();
      setIsSoundPlaying(false);
      
      // Small delay to ensure previous sound is stopped
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsSoundPlaying(true);
      // Play the alarm sound
      await playAlarmSound(
        settings.alarmSoundType,
        settings.alarmVolume || 1.0,
      );

      // Sync state with actual sound state
      setIsSoundPlaying(isAlarmPlaying());

      // Only auto-stop for non-looping sounds
      // For looping sounds (PERSISTENT, SIREN), let user stop manually
      const isLooping = 
        settings.alarmSoundType === AlarmSoundType.PERSISTENT || 
        settings.alarmSoundType === AlarmSoundType.SIREN;

      if (!isLooping) {
        // Stop after 2 seconds for non-looping sounds
        timeoutRef.current = setTimeout(async () => {
          await stopAlarmSound();
          setIsSoundPlaying(false);
          timeoutRef.current = null;
        }, 2000);
      }
    } catch (error) {
      console.error('Error testing alarm sound:', error);
      Alert.alert(t('error'), t('failedToPlaySound'));
      setIsSoundPlaying(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleStopSound = async () => {
    // Cancel any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      // Always try to stop, regardless of state
      await stopAlarmSound();
      // Small delay to ensure sound is stopped
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sync state with actual sound state
      setIsSoundPlaying(isAlarmPlaying());
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
      // Force state to false even if there's an error
      setIsSoundPlaying(false);
    }
  };

  // Sync state periodically and on mount/unmount
  useEffect(() => {
    const interval = setInterval(() => {
      const actualState = isAlarmPlaying();
      if (actualState !== isSoundPlaying) {
        setIsSoundPlaying(actualState);
      }
    }, 500); // Check every 500ms

    return () => {
      clearInterval(interval);
      // Cleanup timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSoundPlaying]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 100}}>
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('units')}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : colors.inputBackground, borderColor: colors.border}]}
          onPress={() => setUnitSystemModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={[styles.dropdownButtonText, {color: colors.text}]}>
            {settings.unitSystem === UnitSystem.METRIC ? t('metric') : t('imperial')}
          </Text>
          <Text style={[styles.dropdownArrow, {color: colors.textSecondary}]}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={unitSystemModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setUnitSystemModalVisible(false)}>
          <TouchableOpacity
            style={[styles.modalOverlay, {backgroundColor: colors.modalOverlay}]}
            activeOpacity={1}
            onPress={() => setUnitSystemModalVisible(false)}>
            <View style={[styles.modalContent, {backgroundColor: effectiveTheme === 'dark' ? '#1C1C1E' : colors.surface}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>{t('units')}</Text>
              {Object.values(UnitSystem).map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.modalOption,
                    {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'},
                    settings.unitSystem === unit && {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary, borderWidth: 1},
                  ]}
                  onPress={() => {
                    setSettings(prev => ({...prev, unitSystem: unit}));
                    setUnitSystemModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {color: colors.text},
                      settings.unitSystem === unit && {color: colors.primary, fontWeight: '600'},
                    ]}>
                    {unit === UnitSystem.METRIC ? t('metric') : t('imperial')}
                  </Text>
                  {settings.unitSystem === unit && (
                    <Text style={[styles.modalOptionCheck, {color: colors.primary}]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('defaultValues')}</Text>

        <InputField
          label={t('defaultScopeRatio')}
          value={(settings.defaultScopeRatio ?? 5).toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultScopeRatio: num}));
            }
          }}
          placeholder="5"
          tooltip={t('defaultScopeRatioTooltip')}
        />

        <InputField
          label={t('defaultDragThreshold')}
          value={(settings.defaultDragThreshold ?? 30).toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultDragThreshold: num}));
            }
          }}
          unit={settings.unitSystem === UnitSystem.METRIC ? 'm' : 'ft'}
          placeholder="30"
          tooltip={t('defaultDragThresholdTooltip')}
        />

        <InputField
          label={t('defaultUpdateInterval')}
          value={(settings.defaultUpdateInterval ?? 5).toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultUpdateInterval: num}));
            }
          }}
          unit="seconds"
          placeholder="5"
          tooltip={t('defaultUpdateIntervalTooltip')}
        />

        <InputField
          label={t('gpsSmoothingWindow')}
          value={(settings.defaultSmoothingWindow ?? 5).toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultSmoothingWindow: num}));
            }
          }}
          unit="positions"
          placeholder="5"
          tooltip={t('defaultSmoothingWindowTooltip')}
        />
        <Text style={[styles.hint, {color: colors.textSecondary}]}>
          {t('smoothingHint')}
        </Text>

        <InputField
          label={t('defaultBowHeight')}
          value={settings.defaultBowHeight?.toString() || ''}
          onChangeText={text => {
            if (text === '') {
              setSettings(prev => ({...prev, defaultBowHeight: undefined}));
            } else {
              const num = parseFloat(text);
              if (!isNaN(num) && num >= 0) {
                setSettings(prev => ({...prev, defaultBowHeight: num}));
              }
            }
          }}
          unit={settings.unitSystem === UnitSystem.METRIC ? 'm' : 'ft'}
          placeholder="0"
        />

        <InputField
          label={t('defaultSafetyMargin')}
          value={settings.defaultSafetyMargin?.toString() || ''}
          onChangeText={text => {
            if (text === '') {
              setSettings(prev => ({...prev, defaultSafetyMargin: undefined}));
            } else {
              const num = parseFloat(text);
              if (!isNaN(num) && num >= 0) {
                setSettings(prev => ({...prev, defaultSafetyMargin: num}));
              }
            }
          }}
          unit="%"
          placeholder="10"
        />

        <InputField
          label={t('defaultChainLength')}
          value={settings.defaultChainLength?.toString() || ''}
          onChangeText={text => {
            if (text === '') {
              setSettings(prev => ({...prev, defaultChainLength: undefined}));
            } else {
              const num = parseFloat(text);
              if (!isNaN(num) && num >= 0) {
                setSettings(prev => ({...prev, defaultChainLength: num}));
              }
            }
          }}
          unit={settings.unitSystem === UnitSystem.METRIC ? 'm' : 'ft'}
          placeholder="0"
        />

        <InputField
          label={t('defaultTotalRodeAvailable')}
          value={settings.defaultTotalRodeAvailable?.toString() || ''}
          onChangeText={text => {
            if (text === '') {
              setSettings(prev => ({...prev, defaultTotalRodeAvailable: undefined}));
            } else {
              const num = parseFloat(text);
              if (!isNaN(num) && num >= 0) {
                setSettings(prev => ({...prev, defaultTotalRodeAvailable: num}));
              }
            }
          }}
          unit={settings.unitSystem === UnitSystem.METRIC ? 'm' : 'ft'}
          placeholder="0"
        />

        <Text style={[styles.label, {color: colors.text}]}>{t('defaultRodeType')}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : colors.inputBackground, borderColor: colors.border}]}
          onPress={() => setRodeTypeModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={[styles.dropdownButtonText, {color: colors.text}]}>
            {(() => {
              const type = settings.defaultRodeType || RodeType.ROPE;
              switch (type) {
                case RodeType.CHAIN:
                  return t('chain');
                case RodeType.ROPE_CHAIN:
                  return t('ropeChain');
                case RodeType.ROPE:
                  return t('rope');
                default:
                  return type;
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
              <Text style={[styles.modalTitle, {color: colors.text}]}>{t('defaultRodeType')}</Text>
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
                      (settings.defaultRodeType || RodeType.ROPE) === type && {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary, borderWidth: 1},
                    ]}
                    onPress={() => {
                      setSettings(prev => ({...prev, defaultRodeType: type}));
                      setRodeTypeModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        {color: colors.text},
                        (settings.defaultRodeType || RodeType.ROPE) === type && {color: colors.primary, fontWeight: '600'},
                      ]}>
                      {getRodeTypeLabel(type)}
                    </Text>
                    {(settings.defaultRodeType || RodeType.ROPE) === type && (
                      <Text style={[styles.modalOptionCheck, {color: colors.primary}]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('language')}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : colors.inputBackground, borderColor: colors.border}]}
          onPress={() => setLanguageModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={[styles.dropdownButtonText, {color: colors.text}]}>
            {settings.language?.toUpperCase() || 'EN'}
          </Text>
          <Text style={[styles.dropdownArrow, {color: colors.textSecondary}]}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={languageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLanguageModalVisible(false)}>
          <TouchableOpacity
            style={[styles.modalOverlay, {backgroundColor: colors.modalOverlay}]}
            activeOpacity={1}
            onPress={() => setLanguageModalVisible(false)}>
            <View style={[styles.modalContent, {backgroundColor: effectiveTheme === 'dark' ? '#1C1C1E' : colors.surface}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>{t('language')}</Text>
              {(['en', 'fi', 'sv'] as Language[]).map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.modalOption,
                    {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'},
                    settings.language === lang && {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary, borderWidth: 1},
                  ]}
                  onPress={() => {
                    setSettings(prev => ({...prev, language: lang}));
                    setLanguageModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {color: colors.text},
                      settings.language === lang && {color: colors.primary, fontWeight: '600'},
                    ]}>
                    {lang.toUpperCase()}
                  </Text>
                  {settings.language === lang && (
                    <Text style={[styles.modalOptionCheck, {color: colors.primary}]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('theme')}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : colors.inputBackground, borderColor: colors.border}]}
          onPress={() => setThemeModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={[styles.dropdownButtonText, {color: colors.text}]}>
            {(settings.theme || 'system') === 'system' 
              ? t('system')
              : (settings.theme || 'system') === 'light'
              ? t('light')
              : t('dark')}
          </Text>
          <Text style={[styles.dropdownArrow, {color: colors.textSecondary}]}>▼</Text>
        </TouchableOpacity>
        <Text style={[styles.hint, styles.themeHint, {color: colors.textSecondary}]}>
          {t('themeHint')}
        </Text>

        <Modal
          visible={themeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setThemeModalVisible(false)}>
          <TouchableOpacity
            style={[styles.modalOverlay, {backgroundColor: colors.modalOverlay}]}
            activeOpacity={1}
            onPress={() => setThemeModalVisible(false)}>
            <View style={[styles.modalContent, {backgroundColor: effectiveTheme === 'dark' ? '#1C1C1E' : colors.surface}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>{t('theme')}</Text>
              {(['system', 'light', 'dark'] as Theme[]).map(themeOption => (
                <TouchableOpacity
                  key={themeOption}
                  style={[
                    styles.modalOption,
                    {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'},
                    (settings.theme || 'system') === themeOption && {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary, borderWidth: 1},
                  ]}
                  onPress={() => {
                    setSettings(prev => ({...prev, theme: themeOption}));
                    setThemeModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {color: colors.text},
                      (settings.theme || 'system') === themeOption && {color: colors.primary, fontWeight: '600'},
                    ]}>
                    {themeOption === 'system' 
                      ? t('system')
                      : themeOption === 'light'
                      ? t('light')
                      : t('dark')}
                  </Text>
                  {(settings.theme || 'system') === themeOption && (
                    <Text style={[styles.modalOptionCheck, {color: colors.primary}]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('alarmSound')}</Text>
        
        <Text style={[styles.label, {color: colors.text}]}>{t('alarmSoundType')}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : colors.inputBackground, borderColor: colors.border}]}
          onPress={() => setAlarmSoundModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={[styles.dropdownButtonText, {color: colors.text}]}>
            {settings.alarmSoundType
              ? settings.alarmSoundType.charAt(0).toUpperCase() +
                settings.alarmSoundType.slice(1)
              : t('selectSoundType')}
          </Text>
          <Text style={[styles.dropdownArrow, {color: colors.textSecondary}]}>▼</Text>
        </TouchableOpacity>
        <Text style={[styles.hint, styles.alarmSoundHint, {color: colors.textSecondary}]}>
          {t('alarmSoundHint')}
        </Text>

        <Modal
          visible={alarmSoundModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAlarmSoundModalVisible(false)}>
          <TouchableOpacity
            style={[styles.modalOverlay, {backgroundColor: colors.modalOverlay}]}
            activeOpacity={1}
            onPress={() => setAlarmSoundModalVisible(false)}>
            <View style={[styles.modalContent, {backgroundColor: effectiveTheme === 'dark' ? '#1C1C1E' : colors.surface}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>{t('selectAlarmSoundType')}</Text>
              {Object.values(AlarmSoundType).map(soundType => (
                <TouchableOpacity
                  key={soundType}
                  style={[
                    styles.modalOption,
                    {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'},
                    settings.alarmSoundType === soundType && {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff', borderColor: colors.primary, borderWidth: 1},
                  ]}
                  onPress={() => {
                    setSettings(prev => ({...prev, alarmSoundType: soundType}));
                    setAlarmSoundModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {color: colors.text},
                      settings.alarmSoundType === soundType && {color: colors.primary, fontWeight: '600'},
                    ]}>
                    {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
                  </Text>
                  {settings.alarmSoundType === soundType && (
                    <Text style={[styles.modalOptionCheck, {color: colors.primary}]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={[styles.label, {color: colors.text}]}>{t('alarmVolume')}</Text>
        <VolumeSlider
          value={(settings.alarmVolume || 1.0) * 100}
          onValueChange={(value) => {
            setSettings(prev => ({...prev, alarmVolume: value / 100}));
          }}
          colors={colors}
          effectiveTheme={effectiveTheme}
        />
        <Text style={[styles.hint, {color: colors.textSecondary}]}>
          {t('volumeLevelHint')}
        </Text>

        <View style={styles.testButtonContainer}>
          <TouchableOpacity
            style={[
              styles.testButton,
              {backgroundColor: colors.primary},
              (!settings.alarmSoundType || isSoundPlaying) && {backgroundColor: colors.buttonDisabled, opacity: 0.6},
            ]}
            onPress={handleTestSound}
            activeOpacity={0.7}
            disabled={!settings.alarmSoundType || isSoundPlaying}>
            <Text style={[styles.testButtonText, {color: colors.buttonText}, (!settings.alarmSoundType || isSoundPlaying) && {color: colors.buttonDisabledText}]}>
              🔊 {t('testSound')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.stopButton,
              {backgroundColor: colors.error},
              // Always show enabled, but slightly dimmed if not playing
              !isSoundPlaying && {opacity: 0.7},
            ]}
            onPress={handleStopSound}
            activeOpacity={0.7}
            // Always enabled - can stop at any time
            disabled={false}>
            <Text style={[styles.stopButtonText, {color: colors.buttonText}]}>
              ⏹️ {t('stopSound')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.hint, styles.alarmSoundHint, {color: colors.textSecondary}]}>
          {t('testSoundHint')}
        </Text>
      </View>

      {/* Floating Save Button */}
      <View style={[styles.floatingButtonContainer, {paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border}]}>
        <Button title={t('saveSettings')} onPress={handleSave} fullWidth />
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('anchoringTechnique')}
          onPress={() => (navigation as any).navigate('AnchoringTechnique')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('anchorTypeGuide')}
          onPress={() => (navigation as any).navigate('AnchorGuide')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('privacyPolicy')}
          onPress={() => (navigation as any).navigate('PrivacyPolicy')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={t('termsOfService')}
          onPress={() => (navigation as any).navigate('TermsOfService')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Button
          title={`🚨 ${t('emergencyContacts')}`}
          onPress={() => (navigation as any).navigate('EmergencyContacts')}
          variant="secondary"
          fullWidth
        />
      </View>

      <SafetyDisclaimer />

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.copyright, {color: colors.textTertiary}]}>
          {t('copyrightText').replace('{year}', new Date().getFullYear().toString())}
        </Text>
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  themeHint: {
    marginTop: 8,
    marginBottom: 12,
  },
  alarmSoundHint: {
    marginTop: 8,
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderTrackWrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  copyright: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
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
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 300,
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
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalOptionCheck: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  testButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

