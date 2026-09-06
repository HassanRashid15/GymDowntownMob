import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Polyline, Line } from 'react-native-svg';

const RED = '#FA1818';
const WHITE = '#FFFFFF';
const PROGRESS_DURATION_MS = 2800;
/** Native size of assets/mob_app.png */
const LOGO_ASPECT = 774 / 322;
/** mob_img.png — horizontal FORGE mark used on verification welcome */
const FORGE_MARK_ASPECT = 774 / 322;
const LOGO_HOLD_MS = 900;
const PILLAR_STAGGER_MS = 320;
const WELCOME_HOLD_MS = 1600;

interface CustomSplashScreenProps {
  onComplete: () => void;
  /**
   * Verification-only splash: full name → WELCOME TO → forge logo (one by one).
   * No pillars / STRONGER EVERYDAY footer.
   */
  logoOnly?: boolean;
  /** Shown above WELCOME TO on verification splash */
  welcomeName?: string;
}

const DumbbellIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="8" width="3" height="8" rx="1" fill={color} />
    <Rect x="4" y="6" width="3" height="12" rx="1" fill={color} />
    <Rect x="7" y="10.5" width="10" height="3" rx="1" fill={color} />
    <Rect x="17" y="6" width="3" height="12" rx="1" fill={color} />
    <Rect x="20" y="8" width="3" height="8" rx="1" fill={color} />
  </Svg>
);

const HeartPulseIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
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

const TrophyIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={color} />
    <Path d="M6 4H3v2a3 3 0 0 0 3 3V4z" fill={color} />
    <Path d="M18 4h3v2a3 3 0 0 1-3 3V4z" fill={color} />
    <Rect x="10" y="13" width="4" height="3" fill={color} />
    <Rect x="7" y="16" width="10" height="2.5" rx="1" fill={color} />
    <Line x1="12" y1="9" x2="12" y2="13" stroke="#0D0D0D" strokeWidth={1.5} />
  </Svg>
);

const PILLARS = [
  { label: 'TRAIN.', Icon: DumbbellIcon },
  { label: 'FUEL.', Icon: HeartPulseIcon },
  { label: 'CONQUER.', Icon: TrophyIcon },
] as const;

function fadeSlideIn(opacity: Animated.Value, translateY: Animated.Value, duration = 650) {
  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
}

export default function CustomSplashScreen({
  onComplete,
  logoOnly = false,
  welcomeName,
}: CustomSplashScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(12)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(12)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(18)).current;
  const forgeMarkOpacity = useRef(new Animated.Value(0)).current;
  const forgeMarkTranslateY = useRef(new Animated.Value(14)).current;
  const pillarAnims = useRef(
    PILLARS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
    }))
  ).current;
  const dividerAnims = useRef(
    [0, 1].map(() => new Animated.Value(0))
  ).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTranslateY = useRef(new Animated.Value(22)).current;
  const textAnims = useRef(
    ['MIND', 'BODY', 'RELENTLESS'].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  const progressBarWidth = Math.min(screenWidth * 0.55, 220);
  const logoWidth = Math.min(screenWidth * 0.72, 320);
  const logoHeight = logoWidth / LOGO_ASPECT;
  const forgeMarkWidth = Math.min(screenWidth * 0.72, 320);
  const forgeMarkHeight = forgeMarkWidth / FORGE_MARK_ASPECT;
  const trimmedWelcomeName = welcomeName?.trim() ?? '';
  const hasWelcomeName = Boolean(trimmedWelcomeName);

  useEffect(() => {
    if (logoOnly) {
      // One-by-one: full name → WELCOME TO → forge logo
      const steps: Animated.CompositeAnimation[] = [Animated.delay(280)];

      if (hasWelcomeName) {
        steps.push(fadeSlideIn(nameOpacity, nameTranslateY, 650));
        steps.push(Animated.delay(220));
      }

      steps.push(fadeSlideIn(welcomeOpacity, welcomeTranslateY, 650));
      steps.push(Animated.delay(220));
      steps.push(fadeSlideIn(forgeMarkOpacity, forgeMarkTranslateY, 750));
      steps.push(Animated.delay(WELCOME_HOLD_MS));

      const sequence = Animated.sequence(steps);

      sequence.start(({ finished }) => {
        if (finished) onComplete();
      });

      return () => sequence.stop();
    }

    const sequence = Animated.sequence([
      // Hold, then logo fades in slowly
      Animated.delay(450),
      fadeSlideIn(logoOpacity, logoTranslateY, 1100),
      Animated.delay(LOGO_HOLD_MS),
      // TRAIN → FUEL → CONQUER, one by one
      fadeSlideIn(pillarAnims[0].opacity, pillarAnims[0].translateY, 500),
      Animated.delay(PILLAR_STAGGER_MS),
      Animated.parallel([
        Animated.timing(dividerAnims[0], {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        fadeSlideIn(pillarAnims[1].opacity, pillarAnims[1].translateY, 500),
      ]),
      Animated.delay(PILLAR_STAGGER_MS),
      Animated.parallel([
        Animated.timing(dividerAnims[1], {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        fadeSlideIn(pillarAnims[2].opacity, pillarAnims[2].translateY, 500),
      ]),
      Animated.delay(400),
      // Bottom (progress + slogan + footer)
      fadeSlideIn(bottomOpacity, bottomTranslateY, 650),
      // Text animations: MIND → BODY → RELENTLESS
      Animated.delay(200),
      fadeSlideIn(textAnims[0].opacity, textAnims[0].translateY, 400),
      Animated.delay(300),
      fadeSlideIn(textAnims[1].opacity, textAnims[1].translateY, 400),
      Animated.delay(300),
      fadeSlideIn(textAnims[2].opacity, textAnims[2].translateY, 400),
    ]);

    sequence.start(({ finished }) => {
      if (!finished) return;
      Animated.timing(progress, {
        toValue: 1,
        duration: PROGRESS_DURATION_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start(({ finished: progressDone }) => {
        if (progressDone) onComplete();
      });
    });

    return () => {
      sequence.stop();
      progress.stopAnimation();
    };
  }, [
    bottomOpacity,
    bottomTranslateY,
    dividerAnims,
    forgeMarkOpacity,
    forgeMarkTranslateY,
    hasWelcomeName,
    logoOnly,
    logoOpacity,
    logoTranslateY,
    nameOpacity,
    nameTranslateY,
    onComplete,
    pillarAnims,
    progress,
    textAnims,
    welcomeOpacity,
    welcomeTranslateY,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, progressBarWidth],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splash_img.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.dimOverlay} />

      {/* Center content */}
      <View style={[styles.centerLayer, { pointerEvents: 'none' }]}>
        <View style={styles.centerContent}>
          {logoOnly ? (
            <View style={styles.welcomeBlock}>
              {hasWelcomeName && (
                <Animated.View
                  style={[
                    styles.nameTextWrap,
                    {
                      opacity: nameOpacity,
                      transform: [{ translateY: nameTranslateY }],
                    },
                  ]}
                >
                  <Text style={styles.nameText}>{trimmedWelcomeName.toUpperCase()}</Text>
                </Animated.View>
              )}

              <Animated.View
                style={[
                  styles.welcomeTextWrap,
                  {
                    opacity: welcomeOpacity,
                    transform: [{ translateY: welcomeTranslateY }],
                  },
                ]}
              >
                <Text style={styles.welcomeText}>WELCOME TO</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.forgeMarkWrap,
                  {
                    opacity: forgeMarkOpacity,
                    transform: [{ translateY: forgeMarkTranslateY }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.forgeMarkClip,
                    { width: forgeMarkWidth, height: forgeMarkHeight * 0.78 },
                  ]}
                >
                  <Image
                    source={require('../../assets/mob_img.png')}
                    style={{
                      width: forgeMarkWidth,
                      height: forgeMarkHeight,
                      marginTop: -(forgeMarkHeight * 0.12),
                    }}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            </View>
          ) : (
            <>
              <Animated.View
                style={{
                  opacity: logoOpacity,
                  transform: [{ translateY: logoTranslateY }],
                }}
              >
                <Image
                  source={require('../../assets/mob_app.png')}
                  style={[styles.logoImage, { width: logoWidth, height: logoHeight }]}
                  resizeMode="contain"
                />
              </Animated.View>

              <View style={styles.pillarsRow}>
                {PILLARS.map(({ label, Icon }, index) => (
                  <React.Fragment key={label}>
                    {index > 0 && (
                      <Animated.View
                        style={[styles.pillarDivider, { opacity: dividerAnims[index - 1] }]}
                      />
                    )}
                    <Animated.View
                      style={[
                        styles.pillarItem,
                        {
                          opacity: pillarAnims[index].opacity,
                          transform: [{ translateY: pillarAnims[index].translateY }],
                        },
                      ]}
                    >
                      <Icon color={RED} />
                      <Text style={styles.pillarLabel}>{label}</Text>
                    </Animated.View>
                  </React.Fragment>
                ))}
              </View>
            </>
          )}
        </View>
      </View>

      {!logoOnly && (
        <Animated.View
          style={[
            styles.bottomContent,
            {
              paddingBottom: Math.max(insets.bottom, 24) + 8,
              pointerEvents: 'none',
              opacity: bottomOpacity,
              transform: [{ translateY: bottomTranslateY }],
            },
          ]}
        >
          <View style={[styles.progressTrack, { width: progressBarWidth }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <View style={styles.sloganRow}>
            <Text style={[styles.sloganText, { color: WHITE }]}>STRONGER </Text>
            <Text style={[styles.sloganText, { color: RED }]}>EVERYDAY</Text>
          </View>

          <View style={styles.animatedTextContainer}>
            {['MIND', 'BODY', 'RELENTLESS'].map((text, index) => (
              <Animated.View
                key={text}
                style={[
                  styles.animatedTextItem,
                  {
                    opacity: textAnims[index].opacity,
                    transform: [{ translateY: textAnims[index].translateY }],
                  },
                ]}
              >
                <Text style={[styles.animatedText, { color: index === 2 ? RED : WHITE }]}>
                  {text}
                </Text>
                {index < 2 && <Text style={styles.dotSeparator}>.</Text>}
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    zIndex: 2,
  },
  logoImage: {
    marginBottom: 0,
  },
  welcomeBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameTextWrap: {
    marginBottom: 10,
  },
  nameText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 2.5,
    color: WHITE,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 36,
  },
  welcomeTextWrap: {
    marginBottom: 10,
  },
  welcomeText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 3,
    color: WHITE,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 28,
  },
  forgeMarkWrap: {
    marginTop: 0,
    alignItems: 'center',
  },
  forgeMarkClip: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarItem: {
    alignItems: 'center',
    paddingHorizontal: 18,
    minWidth: 88,
  },
  pillarDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  pillarLabel: {
    marginTop: 8,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: WHITE,
  },
  bottomContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: RED,
  },
  sloganRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sloganText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 25,
    letterSpacing: 2,
    lineHeight: 25,
  },
  footerText: {
    marginTop: 10,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.85)',
  },
  animatedTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  animatedTextItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animatedText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    letterSpacing: 3,
  },
  dotSeparator: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    color: WHITE,
    marginHorizontal: 4,
  },
});
