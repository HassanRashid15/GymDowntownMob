import React from 'react';
import { ScrollView, ScrollViewProps, Platform, StyleSheet } from 'react-native';

type HorizontalScrollViewProps = ScrollViewProps;

const HorizontalScrollView: React.FC<HorizontalScrollViewProps> = ({
  style,
  contentContainerStyle,
  children,
  ...rest
}) => (
  <ScrollView
    horizontal
    nestedScrollEnabled
    directionalLockEnabled
    showsHorizontalScrollIndicator={Platform.OS !== 'web'}
    style={[styles.horizontal, style]}
    contentContainerStyle={[styles.content, contentContainerStyle]}
    {...rest}
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  horizontal: {
    flexGrow: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  content: {
    alignItems: 'center',
    paddingRight: 4,
  },
});

export default HorizontalScrollView;
