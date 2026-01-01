import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {InputField} from '../components/InputField';
import {SafetyDisclaimer} from '../components/SafetyDisclaimer';
import {loadSettings, saveSettings} from '../services/storage';
import {AppSettings, UnitSystem, AlarmSoundType} from '../types';
import {setLanguage, t, Language} from '../i18n';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
  }, []);

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
        />
        <Text style={styles.hint}>
          {t('smoothingHint')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
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
        <View style={styles.optionRow}>
          {Object.values(AlarmSoundType).map(soundType => (
            <TouchableOpacity
              key={soundType}
              style={[
                styles.optionButton,
                settings.alarmSoundType === soundType && styles.optionSelected,
              ]}
              onPress={() =>
                setSettings(prev => ({...prev, alarmSoundType: soundType}))
              }>
              <Text
                style={[
                  styles.optionText,
                  settings.alarmSoundType === soundType && styles.optionTextSelected,
                ]}>
                {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>
          Default: Standard alert. Loud: Higher volume. Persistent: Looping alarm. Siren: Continuous alert.
        </Text>

        <InputField
          label="Alarm Volume"
          value={((settings.alarmVolume || 1.0) * 100).toFixed(0)}
          onChangeText={text => {
            const num = parseFloat(text);
            if (!isNaN(num) && num >= 0 && num <= 100) {
              setSettings(prev => ({...prev, alarmVolume: num / 100}));
            }
          }}
          unit="%"
          placeholder="100"
        />
        <Text style={styles.hint}>
          Volume level for alarm sounds (0-100%)
        </Text>
      </View>

      <View style={styles.section}>
        <Button title={t('saveSettings')} onPress={handleSave} fullWidth />
      </View>

      <View style={styles.section}>
        <Button
          title="Anchor Type Guide"
          onPress={() => navigation.navigate('AnchorGuide' as never)}
          variant="secondary"
          fullWidth
        />
      </View>

      <View style={styles.section}>
        <Button
          title="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          variant="secondary"
          fullWidth
        />
      </View>

      <SafetyDisclaimer />
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
});

