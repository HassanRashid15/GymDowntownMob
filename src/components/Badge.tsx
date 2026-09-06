import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'medium', style }) => {
  const { colors } = useTheme();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 8, paddingVertical: 4 };
      case 'large':
        return { paddingHorizontal: 16, paddingVertical: 8 };
      default:
        return { paddingHorizontal: 12, paddingVertical: 6 };
    }
  };

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.badge,
      ...getSizeStyles(),
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: colors.primary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: colors.secondary };
      case 'accent':
        return { ...baseStyle, backgroundColor: colors.accent };
      case 'outline':
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

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: colors.primaryForeground };
      case 'secondary':
        return { color: colors.secondaryForeground };
      case 'accent':
        return { color: colors.accentForeground };
      case 'outline':
        return { color: colors.foreground };
      default:
        return { color: colors.primaryForeground };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), { fontSize: getFontSize() }]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default Badge;