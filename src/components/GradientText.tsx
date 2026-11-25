import React from 'react';
import { Text, TextStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import NativeMaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

// RN MaskedView typings lag React 19 JSX; cast keeps runtime behavior.
const MaskedView = NativeMaskedView as unknown as React.ComponentType<{
  maskElement: React.ReactElement;
  children: React.ReactNode;
}>;

interface GradientTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

const GradientText: React.FC<GradientTextProps> = ({ children, style }) => {
  const { colors } = useTheme();

  if (Platform.OS === 'web') {
    return <Text style={[styles.text, { color: colors.primary }, style]}>{children}</Text>;
  }

  return (
    <MaskedView maskElement={<Text style={[styles.text, style]}>{children}</Text>}>
      <LinearGradient colors={colors.gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[styles.text, style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
  },
});

export default GradientText;
