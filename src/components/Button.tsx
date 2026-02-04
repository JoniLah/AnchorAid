import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const {colors} = useTheme();
  
  const getButtonStyle = () => {
    if (variant === 'primary') {
      return {backgroundColor: colors.buttonPrimary};
    } else if (variant === 'secondary') {
      return {backgroundColor: colors.buttonSecondary};
    } else if (variant === 'danger') {
      return {backgroundColor: colors.error};
    }
    return {backgroundColor: colors.buttonPrimary};
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger') {
      return colors.buttonText;
    }
    return colors.buttonSecondaryText;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={colors.buttonText} />
      ) : (
        <Text style={[styles.text, {color: getTextColor()}]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

