import React, { useState, useEffect } from 'react';
import { View, Text, TextStyle, StyleSheet } from 'react-native';
import GradientText from './GradientText';

interface TypingTextProps {
  words: string[];
  style?: TextStyle;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

const TypingText: React.FC<TypingTextProps> = ({
  words,
  style,
  typingSpeed = 120,
  deletingSpeed = 60,
  pauseDuration = 2000,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <View style={styles.row}>
      <GradientText style={[styles.text, style]}>{displayText}</GradientText>
      <Text style={styles.cursor}>|</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  text: {
    fontSize: 48,
    lineHeight: 52,
    minHeight: 52,
  },
  cursor: {
    color: '#FA1818',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    lineHeight: 52,
  },
});

export default TypingText;
