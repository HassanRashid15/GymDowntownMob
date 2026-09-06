import { TextStyle } from 'react-native';

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Inter',
    display: 'Bebas Neue',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Text styles
  textStyles: {
    h1: {
      fontFamily: 'Bebas Neue',
      fontSize: 96,
      fontWeight: '400',
      letterSpacing: 2,
      lineHeight: 1.1,
    } as TextStyle,
    
    h2: {
      fontFamily: 'Bebas Neue',
      fontSize: 72,
      fontWeight: '400',
      letterSpacing: 1.5,
      lineHeight: 1.1,
    } as TextStyle,
    
    h3: {
      fontFamily: 'Bebas Neue',
      fontSize: 48,
      fontWeight: '400',
      letterSpacing: 1,
      lineHeight: 1.2,
    } as TextStyle,
    
    h4: {
      fontFamily: 'Bebas Neue',
      fontSize: 36,
      fontWeight: '400',
      letterSpacing: 0.5,
      lineHeight: 1.2,
    } as TextStyle,
    
    bodyLarge: {
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.5,
    } as TextStyle,
    
    body: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    } as TextStyle,
    
    bodySmall: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
    } as TextStyle,
    
    caption: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.3,
    } as TextStyle,
  },
};