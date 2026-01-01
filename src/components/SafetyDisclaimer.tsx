import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Safety Disclaimer</Text>
      <Text style={styles.text}>
        This app provides guidance only and does not replace nautical charts,
        seamanship, or official safety equipment. Always use proper navigation
        tools, monitor conditions, and exercise sound judgment. The developer
        assumes no liability for any consequences resulting from use of this
        app.
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

