import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const DottedBackground: React.FC = () => (
  <View style={styles.container}>
    <Svg width={width} height={height}>
      <Defs>
        <Pattern id="dots" width={24} height={24} patternUnits="userSpaceOnUse">
          <Circle cx={2} cy={2} r={1.2} fill="rgba(255,255,255,0.06)" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
});

export default DottedBackground;
