import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

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
  const {colors, effectiveTheme} = useTheme();
  const isDark = effectiveTheme === 'dark';
  
  // Use much darker blue in dark mode for better visibility
  const primaryColor = isDark ? '#1E88E5' : colors.primary;
  // Increase contrast for selected items - use more opaque background
  const selectedBgColor = isDark ? 'rgba(30, 136, 229, 0.4)' : '#e7f3ff';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
              value === option.value && {
                borderColor: primaryColor,
                backgroundColor: selectedBgColor,
                borderWidth: 2,
              },
            ]}
            onPress={() => onValueChange(option.value)}>
            <Text
              style={[
                styles.optionText,
                {color: colors.textSecondary},
                value === option.value && {
                  color: primaryColor,
                  fontWeight: '600',
                },
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
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
  },
});

