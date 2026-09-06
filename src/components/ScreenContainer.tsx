import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Wraps screen content with safe-area padding (status bar / notch).
 * Prefer navigator `screenLayout` for global use; this is for one-off screens.
 */
const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  edges = ['top'],
  style,
}) => (
  <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
    {children}
  </SafeAreaView>
);

export default ScreenContainer;
