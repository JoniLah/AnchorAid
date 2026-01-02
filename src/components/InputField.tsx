import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {Tooltip} from './Tooltip';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  error?: string;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  keyboardType = 'numeric',
  error,
  tooltip,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {tooltip && <Tooltip content={tooltip} />}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  error: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
});

