import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import GradientText from './GradientText';

interface TypingTextProps {
  words: string[];
  style?: StyleProp<TextStyle>;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  /** Solid color instead of gradient mask (Hub hero style) */
  solidColor?: string;
  cursorColor?: string;
}

const TypingText: React.FC<TypingTextProps> = ({
  words,
  style,
  typingSpeed = 120,
  deletingSpeed = 60,
  pauseDuration = 2000,
  solidColor,
  cursorColor = '#FA1818',
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const longestWord = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), words[0] || ''),
    [words]
  );

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (!isDeleting && displayText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText((prev) => {
        if (isDeleting) return prev.slice(0, -1);
        return currentWord.slice(0, prev.length + 1);
      });
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  const textStyle = [styles.text, style, Platform.OS === 'android' ? styles.androidText : null];

  return (
    <View style={styles.wrap}>
      {/* Invisible spacer keeps height stable (same trick as Hub) */}
      <Text style={[textStyle, styles.spacer]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {longestWord}
      </Text>
      <View style={styles.row}>
        {solidColor ? (
          <Text style={[textStyle, { color: solidColor }]}>{displayText}</Text>
        ) : (
          <GradientText style={textStyle}>{displayText}</GradientText>
        )}
        <Text style={[styles.cursor, style, { color: cursorColor }]}>|</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginBottom: 0,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  spacer: {
    opacity: 0,
    textAlign: 'left',
  },
  row: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  text: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    lineHeight: 44,
  },
  androidText: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  cursor: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    lineHeight: 44,
    marginLeft: 2,
  },
});

export default TypingText;
