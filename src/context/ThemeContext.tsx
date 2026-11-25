import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';

type Theme = 'light' | 'dark';

/** Matches expo-linear-gradient: at least two color stops */
export type GradientStops = readonly [string, string, ...string[]];

interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  gradients: {
    primary: GradientStops;
    fire: GradientStops;
    dark: GradientStops;
    card: GradientStops;
  };
  shadows: {
    glow: string;
    fire: string;
    card: string;
    red: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  // Default to dark mode to match web design
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Optional: uncomment to follow system theme
    // setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors: ThemeColors = theme === 'dark' 
    ? { ...Colors.dark, shadows: Colors.shadows }
    : { ...Colors.light, shadows: Colors.shadows };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};