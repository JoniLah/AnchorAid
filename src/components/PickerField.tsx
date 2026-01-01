import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface PickerFieldProps<T> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: Array<{label: string; value: T}>;
}

export function PickerField<T>({
  label,
  value,
  onValueChange,
  options,
}: PickerFieldProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              value === option.value && styles.optionSelected,
            ]}
            onPress={() => onValueChange(option.value)}>
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

