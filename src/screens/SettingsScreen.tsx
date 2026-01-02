import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {InputField} from '../components/InputField';
import {SafetyDisclaimer} from '../components/SafetyDisclaimer';
import {loadSettings, saveSettings} from '../services/storage';
import {AppSettings, UnitSystem, AlarmSoundType} from '../types';
import {setLanguage, t, Language} from '../i18n';
import {playAlarmSound, stopAlarmSound, initializeAudio, isAlarmPlaying} from '../services/alarmSound';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [alarmSoundModalVisible, setAlarmSoundModalVisible] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    unitSystem: UnitSystem.METRIC,
    defaultScopeRatio: 5,
    defaultDragThreshold: 30,
    defaultUpdateInterval: 5,
    defaultSmoothingWindow: 5,
    language: 'en',
    alarmSoundType: AlarmSoundType.DEFAULT,
    alarmVolume: 1.0,
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
    if (loaded.language) {
      setLanguage(loaded.language);
    }
  };

  const handleSave = async () => {
    await saveSettings(settings);
    if (settings.language) {
      setLanguage(settings.language);
    }
    Alert.alert(t('success'), t('settingsSaved'));
  };

  const handleTestSound = async () => {
    if (!settings.alarmSoundType) {
            Alert.alert(t('noSoundSelected'), t('pleaseSelectSound'));
      return;
    }

    try {
      // Stop any existing sound first
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

      // Only auto-stop for non-looping sounds
      // For looping sounds (PERSISTENT, SIREN), let user stop manually
      const isLooping = 
        settings.alarmSoundType === AlarmSoundType.PERSISTENT || 
        settings.alarmSoundType === AlarmSoundType.SIREN;

      if (!isLooping) {
        // Stop after 2 seconds for non-looping sounds
        setTimeout(async () => {
          await stopAlarmSound();
          setIsSoundPlaying(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error testing alarm sound:', error);
      Alert.alert(t('error'), t('failedToPlaySound'));
      setIsSoundPlaying(false);
    }
  };

  const handleStopSound = async () => {
    try {
      await stopAlarmSound();
      // Small delay to ensure sound is stopped
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsSoundPlaying(false);
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
      setIsSoundPlaying(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('units')}</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              settings.unitSystem === UnitSystem.METRIC && styles.optionSelected,
            ]}
            onPress={() =>
              setSettings(prev => ({...prev, unitSystem: UnitSystem.METRIC}))
            }>
            <Text
              style={[
                styles.optionText,
                settings.unitSystem === UnitSystem.METRIC &&
                  styles.optionTextSelected,
              ]}>
              {t('metric')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              settings.unitSystem === UnitSystem.IMPERIAL &&
                styles.optionSelected,
            ]}
            onPress={() =>
              setSettings(prev => ({
                ...prev,
                unitSystem: UnitSystem.IMPERIAL,
              }))
            }>
            <Text
              style={[
                styles.optionText,
                settings.unitSystem === UnitSystem.IMPERIAL &&
                  styles.optionTextSelected,
              ]}>
              {t('imperial')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('defaultValues')}</Text>

        <InputField
          label={t('defaultScopeRatio')}
          value={settings.defaultScopeRatio.toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultScopeRatio: num}));
            }
          }}
          placeholder="5"
          tooltip="The ratio of anchor rode length to water depth. For example, a 5:1 ratio means 5 meters of rode for every 1 meter of depth. Higher ratios provide better holding power but require more rode."
        />

        <InputField
          label={t('defaultDragThreshold')}
          value={settings.defaultDragThreshold.toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultDragThreshold: num}));
            }
          }}
          unit={settings.unitSystem === UnitSystem.METRIC ? 'm' : 'ft'}
          placeholder="30"
          tooltip="The maximum distance your boat can move from the anchor point before the alarm triggers. If your boat moves beyond this distance, you'll be alerted that the anchor may be dragging."
        />

        <InputField
          label={t('defaultUpdateInterval')}
          value={settings.defaultUpdateInterval.toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultUpdateInterval: num}));
            }
          }}
          unit="seconds"
          placeholder="5"
          tooltip="How often the app checks your boat's position to detect anchor drag. More frequent updates (lower values) provide faster detection but may use more battery."
        />

        <InputField
          label={t('gpsSmoothingWindow')}
          value={settings.defaultSmoothingWindow.toString()}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num > 0) {
              setSettings(prev => ({...prev, defaultSmoothingWindow: num}));
            }
          }}
          unit="positions"
          placeholder="5"
          tooltip="The number of GPS positions averaged together to reduce GPS noise and false alarms. Higher values provide smoother position tracking but may delay alarm detection slightly."
        />
        <Text style={styles.hint}>
          {t('smoothingHint')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.optionRow}>
          {(['en', 'fi', 'sv'] as Language[]).map(lang => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.optionButton,
                settings.language === lang && styles.optionSelected,
              ]}
              onPress={() =>
                setSettings(prev => ({...prev, language: lang}))
              }>
              <Text
                style={[
                  styles.optionText,
                  settings.language === lang && styles.optionTextSelected,
                ]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Sound</Text>
        
        <Text style={styles.label}>Alarm Sound Type</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setAlarmSoundModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={styles.dropdownButtonText}>
            {settings.alarmSoundType
              ? settings.alarmSoundType.charAt(0).toUpperCase() +
                settings.alarmSoundType.slice(1)
              : 'Select sound type'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Default: Standard alert. Loud: Higher volume. Persistent: Looping alarm. Siren: Continuous alert.
        </Text>

        <Modal
          visible={alarmSoundModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAlarmSoundModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAlarmSoundModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Alarm Sound Type</Text>
              {Object.values(AlarmSoundType).map(soundType => (
                <TouchableOpacity
                  key={soundType}
                  style={[
                    styles.modalOption,
                    settings.alarmSoundType === soundType && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSettings(prev => ({...prev, alarmSoundType: soundType}));
                    setAlarmSoundModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      settings.alarmSoundType === soundType && styles.modalOptionTextSelected,
                    ]}>
                    {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
                  </Text>
                  {settings.alarmSoundType === soundType && (
                    <Text style={styles.modalOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <InputField
          label={t('alarmVolume')}
          value={((settings.alarmVolume || 1.0) * 100).toFixed(0)}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num >= 0 && num <= 100) {
              setSettings(prev => ({...prev, alarmVolume: num / 100}));
            }
          }}
          unit="%"
          placeholder="100"
          tooltip="The volume level for anchor drag alarm sounds. Set to 0% to disable sound (vibration only), or 100% for maximum volume."
        />
        <Text style={styles.hint}>
          Volume level for alarm sounds (0-100%)
        </Text>

        <View style={styles.testButtonContainer}>
          <TouchableOpacity
            style={[
              styles.testButton,
              (!settings.alarmSoundType || isSoundPlaying) && styles.testButtonDisabled,
            ]}
            onPress={handleTestSound}
            activeOpacity={0.7}
            disabled={!settings.alarmSoundType || isSoundPlaying}>
            <Text style={[styles.testButtonText, (!settings.alarmSoundType || isSoundPlaying) && styles.testButtonTextDisabled]}>
              🔊 Test Sound
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.stopButton,
              !isSoundPlaying && styles.stopButtonDisabled,
            ]}
            onPress={handleStopSound}
            activeOpacity={0.7}
            disabled={!isSoundPlaying}>
            <Text style={[styles.stopButtonText, !isSoundPlaying && styles.stopButtonTextDisabled]}>
              ⏹️ Stop Sound
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Tap to play the selected alarm sound. Use Stop to end looping sounds.
        </Text>
      </View>

      <View style={styles.section}>
        <Button title={t('saveSettings')} onPress={handleSave} fullWidth />
      </View>

      <View style={styles.section}>
        <Button
          title="How to Anchor Guide"
          onPress={() => (navigation as any).navigate('AnchoringTechnique')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={styles.section}>
        <Button
          title="Anchor Type Guide"
          onPress={() => (navigation as any).navigate('AnchorGuide')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={styles.section}>
        <Button
          title={t('privacyPolicy')}
          onPress={() => (navigation as any).navigate('PrivacyPolicy')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={styles.section}>
        <Button
          title={t('termsOfService')}
          onPress={() => (navigation as any).navigate('TermsOfService')}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={styles.section}>
        <Button
          title={`🚨 ${t('emergencyContacts')}`}
          onPress={() => (navigation as any).navigate('EmergencyContacts')}
          variant="secondary"
          fullWidth
        />
      </View>

      <SafetyDisclaimer />

      <View style={styles.section}>
        <Text style={styles.copyright}>
          {t('copyrightText').replace('{year}', new Date().getFullYear().toString())}
        </Text>
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
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: -12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    color: '#333',
  },
  copyright: {
    fontSize: 11,
    color: '#999',
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
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: '#f8f9fa',
  },
  modalOptionSelected: {
    backgroundColor: '#e7f3ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOptionCheck: {
    fontSize: 18,
    color: '#007AFF',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  testButtonTextDisabled: {
    color: '#999',
  },
  stopButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  stopButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  stopButtonTextDisabled: {
    color: '#999',
  },
});

