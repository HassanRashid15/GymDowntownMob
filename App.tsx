import React from 'react';
import { View, ActivityIndicator, Platform, Animated } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { NotificationPreferencesProvider } from './src/context/NotificationPreferencesContext';
import { TwoFactorProvider } from './src/context/TwoFactorContext';
import { PlatformUsersProvider } from './src/context/PlatformUsersContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { TrainersProvider } from './src/context/TrainersContext';
import { MessagingProvider } from './src/context/MessagingContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalAuthCooldownBadge from './src/components/GlobalAuthCooldownBadge';
import { useTheme } from './src/context/ThemeContext';
import CustomSplashScreen from './src/components/CustomSplashScreen';
import {
  getCurrentUrlForAuthCallback,
  isEmailVerificationDeepLink,
  markVerificationWelcomeSplashPlayed,
  peekFullNameFromAuthCallbackUrl,
} from './src/api/auth';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const rootStyle = document.getElementById('root-scroll-fix');
  if (!rootStyle) {
    const style = document.createElement('style');
    style.id = 'root-scroll-fix';
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; overflow-x: hidden; }
      #root { display: flex; flex-direction: column; overflow: hidden; }
      input, textarea { outline: none; box-shadow: none; }
      /* Keep dark theme when Chrome/Safari autofill paints fields */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus {
        -webkit-text-fill-color: #FAFAFA !important;
        caret-color: #FAFAFA;
        box-shadow: 0 0 0 1000px #1C1C1E inset !important;
        transition: background-color 99999s ease-in-out 0s;
      }
      [data-hide-scrollbar="true"] {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      [data-hide-scrollbar="true"]::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    `;
    document.head.appendChild(style);
  }
}

function AppContent() {
  const { isDark } = useTheme();
  return (
    <>
      <AppNavigator />
      <GlobalAuthCooldownBadge />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [splashModeReady, setSplashModeReady] = React.useState(false);
  const [isVerificationSplash, setIsVerificationSplash] = React.useState(false);
  const [verificationWelcomeName, setVerificationWelcomeName] = React.useState('');
  const [splashFadeAnim] = React.useState(new Animated.Value(0));
  const [mainFadeAnim] = React.useState(new Animated.Value(0));

  const [fontsLoaded, fontError] = useFonts({
    BebasNeue_400Regular: require('@expo-google-fonts/bebas-neue/400Regular/BebasNeue_400Regular.ttf'),
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  });

  // Decide splash variant: verification link → welcome only; otherwise full default splash
  React.useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let cancelled = false;

    const resolveSplashMode = async () => {
      try {
        let url = getCurrentUrlForAuthCallback();
        if (!url) {
          url = await Linking.getInitialURL().catch(() => null);
        }
        if (!cancelled) {
          const isVerification = isEmailVerificationDeepLink(url);
          setIsVerificationSplash(isVerification);
          if (isVerification) {
            setVerificationWelcomeName(peekFullNameFromAuthCallbackUrl(url) ?? '');
          }
        }
      } catch {
        if (!cancelled) setIsVerificationSplash(false);
      } finally {
        if (!cancelled) setSplashModeReady(true);
      }
    };

    resolveSplashMode();
    return () => {
      cancelled = true;
    };
  }, [fontsLoaded, fontError]);

  React.useEffect(() => {
    if (fontsLoaded && splashModeReady && !isAppReady) {
      Animated.timing(splashFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded, splashModeReady, isAppReady, splashFadeAnim]);

  const handleSplashComplete = () => {
    if (isVerificationSplash) {
      markVerificationWelcomeSplashPlayed();
    }

    Animated.timing(splashFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsAppReady(true);
      Animated.timing(mainFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!isAppReady) {
    if ((!fontsLoaded && !fontError) || !splashModeReady) {
      return (
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
            <ActivityIndicator size="large" color="#FA1818" />
          </View>
          <StatusBar style="light" />
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <Animated.View style={{ flex: 1, opacity: splashFadeAnim }}>
              {isVerificationSplash ? (
                <CustomSplashScreen
                  logoOnly
                  welcomeName={verificationWelcomeName}
                  onComplete={handleSplashComplete}
                />
              ) : (
                <CustomSplashScreen onComplete={handleSplashComplete} />
              )}
            </Animated.View>
          </ThemeProvider>
        </GestureHandlerRootView>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <TwoFactorProvider>
              <PlatformUsersProvider>
                <NotificationsProvider>
                  <NotificationPreferencesProvider>
                    <SubscriptionProvider>
                      <TrainersProvider>
                        <MessagingProvider>
                          <Animated.View style={{ flex: 1, opacity: mainFadeAnim }}>
                            <AppContent />
                          </Animated.View>
                        </MessagingProvider>
                      </TrainersProvider>
                    </SubscriptionProvider>
                  </NotificationPreferencesProvider>
                </NotificationsProvider>
              </PlatformUsersProvider>
            </TwoFactorProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
