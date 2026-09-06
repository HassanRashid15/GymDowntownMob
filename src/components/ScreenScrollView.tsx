import React from 'react';
import { ScrollView, ScrollViewProps, Platform, StyleSheet } from 'react-native';

type ScreenScrollViewProps = ScrollViewProps;

const ScreenScrollView: React.FC<ScreenScrollViewProps> = ({
  style,
  contentContainerStyle,
  children,
  ...rest
}) => (
  <ScrollView
    style={[styles.screen, style]}
    contentContainerStyle={[styles.content, contentContainerStyle]}
    keyboardShouldPersistTaps="handled"
    nestedScrollEnabled
    showsVerticalScrollIndicator={false}
    {...(Platform.OS === 'web' ? { dataSet: { hideScrollbar: 'true' } } : {})}
    {...rest}
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});

export default ScreenScrollView;
