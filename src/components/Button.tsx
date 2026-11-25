import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 14 };
      case 'large':
        return { fontSize: 18 };
      default:
        return { fontSize: 16 };
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.primaryForeground} />;
    }

    return (
      <>
        {icon && <>{icon}</>}
        <Text style={[styles.text, getTextSize(), textStyle]}>
          {title}
        </Text>
      </>
    );
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...getSizeStyles(),
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: colors.primary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: colors.secondary };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: `${colors.primary}80`,
        };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      default:
        return { ...baseStyle, backgroundColor: colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: colors.primaryForeground };
      case 'secondary':
        return { color: colors.secondaryForeground };
      case 'outline':
        return { color: colors.primary };
      case 'ghost':
        return { color: colors.primary };
      default:
        return { color: colors.primaryForeground };
    }
  };

  if (variant === 'primary') {
    if (Platform.OS === 'web') {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          style={[
            getButtonStyle(), 
            { 
              backgroundColor: colors.primary, 
              borderRadius: 12,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 10,
            }, 
            style
          ]}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {getButtonContent()}
          </View>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            getButtonStyle(), 
            { 
              borderRadius: 12,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 10,
            }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {getButtonContent()}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {getButtonContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;