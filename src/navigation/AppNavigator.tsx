import React from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CustomTabBar from '../components/CustomTabBar';
import { safeAreaScreenLayout } from './safeAreaScreenLayout';
import { getCurrentUrlForAuthCallback, isEmailVerificationDeepLink } from '../api/auth';

import HomeScreen from '../screens/HomeScreen';
import ClassesScreen from '../screens/ClassesScreen';
import TrainersScreen from '../screens/TrainersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MembershipScreen from '../screens/MembershipScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import TrainerDetailScreen from '../screens/TrainerDetailScreen';
import EquipmentScreen from '../screens/EquipmentScreen';
import EquipmentDetailScreen from '../screens/EquipmentDetailScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import MessagingScreen from '../screens/MessagingScreen';
import RevenueScreen from '../screens/RevenueScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import NotificationPreferencesScreen from '../screens/NotificationPreferencesScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const { colors } = useTheme();
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenLayout={safeAreaScreenLayout}
      screenOptions={{
        sceneStyle: { flex: 1 },
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.foreground,
      }}
    >
      <Tab.Screen
        name="Home"
        component={isAuthenticated ? DashboardScreen : HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="Classes" component={ClassesScreen} options={{ title: 'Classes' }} />
      {isSuperAdmin ? (
        <Tab.Screen name="Users" component={UserManagementScreen} options={{ title: 'Users' }} />
      ) : (
        <Tab.Screen name="Trainers" component={TrainersScreen} options={{ title: 'Trainers' }} />
      )}
      <Tab.Screen
        name="Join"
        component={MembershipScreen}
        options={{ title: isSuperAdmin ? 'Subscriptions' : isAdmin ? 'Subscription' : 'Join' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

const RootStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenLayout={safeAreaScreenLayout}
      screenOptions={{
        cardStyle: { flex: 1 },
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontFamily: 'BebasNeue_400Regular',
          fontSize: 24,
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
      <Stack.Screen name="TrainerDetail" component={TrainerDetailScreen} />
      <Stack.Screen name="Equipment" component={EquipmentScreen} options={{ title: 'Equipment' }} />
      <Stack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Messaging" component={MessagingScreen} />
      <Stack.Screen name="Revenue" component={RevenueScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    </Stack.Navigator>
  );
};

const LoadingScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.foreground, marginTop: 16 }}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
};

const linking = {
  prefixes: [
    Linking.createURL('/'),
    'gymjourney://',
    'http://localhost:8081',
    'http://localhost:19006',
    process.env.EXPO_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],
  config: {
    screens: {
      MainTabs: {
        path: '',
        screens: {
          Home: '',
          Classes: 'classes',
          Trainers: 'trainers',
          Users: 'users',
          Join: 'join',
          Settings: 'settings',
        },
      },
      Login: 'login',
      Register: 'register',
      EmailVerification: 'email-verification',
      ForgotPassword: 'forgot-password',
      Dashboard: 'dashboard',
      ClassDetail: 'classes/:id',
      TrainerDetail: 'trainers/:id',
      Equipment: 'equipment',
      EquipmentDetail: 'equipment/:id',
      About: 'about',
      Contact: 'contact',
      HelpSupport: 'help',
      Messaging: {
        path: 'messaging',
        parse: {
          channelId: (value: string) => value,
          returnTo: (value: string) => value,
        },
      },
      Revenue: 'revenue',
      PrivacyPolicy: 'privacy',
      Notifications: 'notifications',
      Profile: 'profile',
      AccountSettings: 'account-settings',
      NotificationPreferences: 'notification-preferences',
      UserManagement: 'user-management',
    },
  },
};

const ONBOARDING_DONE_KEY = 'forge_onboarding_done';

const AppNavigator = () => {
  const { isLoading } = useAuth();
  const { colors } = useTheme();
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    let cancelled = false;

    const resolveOnboarding = async () => {
      try {
        const url =
          getCurrentUrlForAuthCallback() ||
          (await Linking.getInitialURL().catch(() => null));

        // Never show onboarding during email verification / auth callback
        if (isEmailVerificationDeepLink(url)) {
          if (!cancelled) setShowOnboarding(false);
          return;
        }

        const done = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
        if (!cancelled) setShowOnboarding(done !== '1');
      } catch {
        if (!cancelled) setShowOnboarding(true);
      }
    };

    resolveOnboarding();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (showOnboarding) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [showOnboarding, fadeAnim]);

  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_DONE_KEY, '1').catch(() => undefined);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowOnboarding(false);
      fadeAnim.setValue(1);
    });
  };

  if (isLoading || showOnboarding === null) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer linking={linking}>
        <RootStack />
      </NavigationContainer>
    </View>
  );
};

export default AppNavigator;
