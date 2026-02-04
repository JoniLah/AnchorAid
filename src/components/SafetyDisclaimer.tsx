import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {t} from '../i18n';
import {useTheme} from '../theme/ThemeContext';

export const SafetyDisclaimer: React.FC = () => {
  const {effectiveTheme} = useTheme();
  const [expanded, setExpanded] = useState(true);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={[styles.container, {
        backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd',
        borderColor: effectiveTheme === 'dark' ? '#ffb300' : '#ffc107',
      }]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
          ⚠️ {t('safetyDisclaimer')}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={effectiveTheme === 'dark' ? '#ffb300' : '#856404'}
        />
      </View>
      {expanded && (
        <Text style={[styles.text, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
          {t('safetyDisclaimerText')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});

