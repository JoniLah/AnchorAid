import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {Tooltip} from './Tooltip';
import {useTheme} from '../theme/ThemeContext';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  suffix?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  error?: string;
  tooltip?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  unit,
  suffix,
  placeholder,
  keyboardType = 'numeric',
  error,
  tooltip,
  required = false,
}) => {
  const {colors} = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, {color: colors.text}]}>
          {label}{required && <Text style={{color: colors.error}}> *</Text>}
        </Text>
        {tooltip && <Tooltip content={tooltip} />}
      </View>
      <View style={[styles.inputContainer, {backgroundColor: colors.inputBackground, borderColor: error ? colors.error : colors.inputBorder}]}>
        <View style={styles.inputWithSuffix}>
          <TextInput
            style={[styles.input, {color: colors.text}, error && {borderColor: colors.error}]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={keyboardType}
          />
          {suffix && <Text style={[styles.suffix, {color: colors.text}]}>{suffix}</Text>}
        </View>
        {unit && <Text style={[styles.unit, {color: colors.textSecondary}]}>{unit}</Text>}
      </View>
      {error && <Text style={[styles.error, {color: colors.error}]}>{error}</Text>}
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputWithSuffix: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  suffix: {
    fontSize: 16,
    paddingVertical: 10,
  },
  unit: {
    fontSize: 14,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

