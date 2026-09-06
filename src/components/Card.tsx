import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';

let LinearGradient: any;
if (Platform.OS !== 'web') {
  LinearGradient = require('react-native-linear-gradient').default;
}

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glass' | 'outlined';
}

const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const { colors } = useTheme();

  if (variant === 'glass' && LinearGradient && Platform.OS !== 'web') {
    return (
      <LinearGradient
        colors={colors.gradients.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.primary,
            shadowOpacity: 0.08,
          },
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
      backgroundColor: colors.card,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.primary,
          shadowOpacity: 0.08,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return baseStyle;
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default Card;
