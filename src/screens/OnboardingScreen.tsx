import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RED = '#FA1818';
const WHITE = '#FFFFFF';

interface OnboardingItem {
  key: string;
  title: string;
  description: string;
  image: any;
  backgroundImage: any;
}

const ONBOARDING_DATA: OnboardingItem[] = [
  {
    key: 'train',
    title: 'TRAIN HARD',
    description: 'Access world-class equipment and expert trainers to push your limits',
    image: require('../../assets/onboard_scr1.png'),
    backgroundImage: require('../../assets/train_hard.png'),
  },
  {
    key: 'fuel',
    title: 'FUEL RIGHT',
    description: 'Get personalized nutrition plans and guidance to maximize your performance',
    image: require('../../assets/onboard_scr2.png'),
    backgroundImage: require('../../assets/fuel_right.png'),
  },
  {
    key: 'conquer',
    title: 'CONQUER GOALS',
    description: 'Track your progress, celebrate achievements, and stay motivated every day',
    image: require('../../assets/onboard_scr3.png'),
    backgroundImage: require('../../assets/conquer_goal.png'),
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<OnboardingItem>>(null);

  useEffect(() => {
    if (currentIndex === ONBOARDING_DATA.length - 1) {
      Animated.timing(skipOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(skipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex, skipOpacity]);

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, ONBOARDING_DATA.length - 1));
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
      setCurrentIndex(clamped);
    },
    []
  );

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      goToIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index >= 0 && index < ONBOARDING_DATA.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<OnboardingItem>) => (
    <View style={{ width, height }}>
      <Image
        source={item.backgroundImage}
        style={styles.slideBg}
        resizeMode="cover"
      />
      <View style={styles.dimOverlay} pointerEvents="none" />
      <View
        style={[
          styles.mainContent,
          {
            paddingTop: Math.max(insets.top, 20) + 36,
            paddingBottom: Math.max(insets.bottom, 24) + 140,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={{ width: width * 0.5, height: height * 0.22 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={ONBOARDING_DATA}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialNumToRender={3}
        windowSize={3}
        style={styles.list}
      />

      {/* Top/bottom only — middle stays clear so FlatList can receive swipes */}
      <Animated.View
        style={[
          styles.skipWrap,
          { top: Math.max(insets.top, 12), opacity: skipOpacity },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity onPress={handleSkip} hitSlop={12} style={styles.skipButton}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </Animated.View>

      <View
        style={[styles.bottomWrap, { bottom: Math.max(insets.bottom, 16) }]}
        pointerEvents="box-none"
      >
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
              onPress={() => goToIndex(index)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'GET STARTED' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  list: {
    flex: 1,
  },
  slideBg: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
    elevation: 1,
  },
  imageContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    color: WHITE,
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  skipWrap: {
    position: 'absolute',
    right: 22,
    zIndex: 5,
    elevation: 5,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: WHITE,
    letterSpacing: 1,
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 5,
    elevation: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: RED,
    width: 24,
  },
  nextButton: {
    backgroundColor: RED,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: WHITE,
    letterSpacing: 1,
  },
});
