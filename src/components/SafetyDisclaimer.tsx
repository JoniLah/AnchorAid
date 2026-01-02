import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {t} from '../i18n';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ {t('safetyDisclaimer')}</Text>
      <Text style={styles.text}>
        {t('safetyDisclaimerText')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  text: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});

