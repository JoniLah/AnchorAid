import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../components/Button';
import {InputField} from '../components/InputField';
import {SafetyDisclaimer} from '../components/SafetyDisclaimer';
import {loadSettings, saveSettings} from '../services/storage';
import {AppSettings, UnitSystem} from '../types';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<AppSettings>({
    unitSystem: UnitSystem.METRIC,
    defaultScopeRatio: 5,
    defaultDragThreshold: 30,
    defaultUpdateInterval: 5,
    defaultSmoothingWindow: 5,
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
  };

  const handleSave = async () => {
    await saveSettings(settings);
    Alert.alert('Success', 'Settings saved');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Units</Text>
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
              Metric (m, m/s)
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
              Imperial (ft, knots)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Values</Text>

        <InputField
          label="Default Scope Ratio"
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
          label="Default Drag Threshold"
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
          label="Default Update Interval"
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
          label="GPS Smoothing Window"
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
          Number of recent positions to average for smoothing GPS jitter
        </Text>
      </View>

      <View style={styles.section}>
        <Button title="Save Settings" onPress={handleSave} fullWidth />
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
});

