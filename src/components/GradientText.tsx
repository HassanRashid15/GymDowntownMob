import React from 'react';
import { Text, TextStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme } from '../context/ThemeContext';

let LinearGradient: any;
if (Platform.OS !== 'web') {
  LinearGradient = require('react-native-linear-gradient').default;
}

interface GradientTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

const GradientText: React.FC<GradientTextProps> = ({ children, style }) => {
  const { colors } = useTheme();

  if (Platform.OS === 'web' || !LinearGradient) {
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
