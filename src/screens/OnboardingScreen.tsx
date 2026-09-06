import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Polyline, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const RED = '#FA1818';
const WHITE = '#FFFFFF';

interface OnboardingItem {
  key: string;
  title: string;
  description: string;
  icon: React.FC<{ color: string; size?: number }>;
  iconColor: string;
  image: any;
  backgroundImage: any;
}

const DumbbellIcon = ({ color, size = 60 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="8" width="3" height="8" rx="1" fill={color} />
    <Rect x="4" y="6" width="3" height="12" rx="1" fill={color} />
    <Rect x="7" y="10.5" width="10" height="3" rx="1" fill={color} />
    <Rect x="17" y="6" width="3" height="12" rx="1" fill={color} />
    <Rect x="20" y="8" width="3" height="8" rx="1" fill={color} />
  </Svg>
);

const HeartPulseIcon = ({ color, size = 60 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={color}
    />
    <Polyline
      points="4 12 8 12 10 9 13 15 15 12 20 12"
      stroke="#0D0D0D"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const TrophyIcon = ({ color, size = 60 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={color} />
    <Path d="M6 4H3v2a3 3 0 0 0 3 3V4z" fill={color} />
    <Path d="M18 4h3v2a3 3 0 0 1-3 3V4z" fill={color} />
    <Rect x="10" y="13" width="4" height="3" fill={color} />
    <Rect x="7" y="16" width="10" height="2.5" rx="1" fill={color} />
    <Line x1="12" y1="9" x2="12" y2="13" stroke="#0D0D0D" strokeWidth={1.5} />
  </Svg>
);

const ONBOARDING_DATA: OnboardingItem[] = [
  {
    key: 'train',
    title: 'TRAIN HARD',
    description: 'Access world-class equipment and expert trainers to push your limits',
    icon: DumbbellIcon,
    iconColor: RED,
    image: require('../../assets/onboard_scr1.png'),
    backgroundImage: require('../../assets/train_hard.png'),
  },
  {
    key: 'fuel',
    title: 'FUEL RIGHT',
    description: 'Get personalized nutrition plans and guidance to maximize your performance',
    icon: HeartPulseIcon,
    iconColor: RED,
    image: require('../../assets/onboard_scr2.png'),
    backgroundImage: require('../../assets/fuel_right.png'),
  },
  {
    key: 'conquer',
    title: 'CONQUER GOALS',
    description: 'Track your progress, celebrate achievements, and stay motivated every day',
    icon: TrophyIcon,
    iconColor: RED,
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
  const skipOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentIndex === ONBOARDING_DATA.length - 1) {
      // Show skip button with animation on third slide
      Animated.timing(skipOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Hide skip button on other slides
      Animated.timing(skipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex, skipOpacity]);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
  };

  const currentItem = ONBOARDING_DATA[currentIndex];
  const Icon = currentItem.icon;

  return (
    <View style={styles.container}>
      <Image
        source={currentItem.backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.dimOverlay} />

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {/* Skip Button - Only shows on third slide with animation */}
        <Animated.View style={[styles.skipButton, { opacity: skipOpacity }]}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            <Image
              source={currentItem.image}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>{currentItem.title}</Text>
          <Text style={styles.description}>{currentItem.description}</Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_DATA.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                ]}
                onPress={() => handleDotPress(index)}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  skipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: WHITE,
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  onboardingImage: {
    width: width * 0.5,
    height: height * 0.22,
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
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
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