import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { calculateBMI, calculateBMR, calculateTDEE, calculateIdealWeight } from '@finegym/fitness-calc';
import WheelPicker from '@quidone/react-native-wheel-picker';
import HorizontalScrollView from '../components/HorizontalScrollView';
import DesignedAlert from '../components/DesignedAlert';
import AuthCooldownHeaderBadge from '../components/AuthCooldownHeaderBadge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAuthCooldown } from '../hooks/useAuthCooldown';
import { formatCooldownTime } from '../api/auth';
import CustomRulerPicker from '../components/CustomRulerPicker';

const SALMON_COLOR = '#E88E83';

const FITNESS_GOALS = [
  'Lose Weight',
  'Build Muscle',
  'Improve Endurance',
  'Overall Fitness',
  'Gain Strength',
  'Athlete Performance',
  'Flexibility',
  'Stress Relief',
  'Recomposition',
];



const getHealthStatus = (bmiCategory: string): {
  status: string;
  color: string;
  backgroundColor: string;
  recommendedGoals: string[];
} => {
  switch (bmiCategory) {
    case 'underweight_severe':
    case 'underweight_moderate':
    case 'underweight_mild':
      return {
        status: 'Underweight',
        color: '#3498db', // Blue
        backgroundColor: 'rgba(52, 152, 219, 0.15)',
        recommendedGoals: ['Build Muscle', 'Gain Strength', 'Overall Fitness'],
      };
    case 'normal':
      return {
        status: 'Normal Weight',
        color: '#2ecc71', // Green
        backgroundColor: 'rgba(46, 204, 113, 0.15)',
        recommendedGoals: ['Overall Fitness', 'Improve Endurance', 'Athlete Performance'],
      };
    case 'overweight':
      return {
        status: 'Overweight',
        color: '#f39c12', // Orange
        backgroundColor: 'rgba(243, 156, 18, 0.15)',
        recommendedGoals: ['Lose Weight', 'Improve Endurance', 'Recomposition'],
      };
    case 'obese_class_1':
    case 'obese_class_2':
    case 'obese_class_3':
      return {
        status: 'Obese',
        color: '#e74c3c', // Red
        backgroundColor: 'rgba(231, 76, 60, 0.15)',
        recommendedGoals: ['Lose Weight', 'Improve Endurance', 'Overall Fitness'],
      };
    default:
      return {
        status: 'Normal Weight',
        color: '#2ecc71', // Green
        backgroundColor: 'rgba(46, 204, 113, 0.15)',
        recommendedGoals: ['Overall Fitness', 'Improve Endurance', 'Athlete Performance'],
      };
  }
};
const EXPERIENCE_LEVELS = ['Beginner', 'Some Experience', 'Intermediate', 'Advanced', 'Elite'];
const TARGET_AREAS = ['Arms', 'Chest', 'Back', 'Legs', 'Core', 'Shoulders', 'Glutes', 'Full Body'];
const WORKOUT_DAYS = ['2 days/week', '3 days/week', '4 days/week', '5 days/week', '6+ days/week'];
const WORKOUT_DURATIONS = ['30 min', '45 min', '60 min', '75 min', '90+ min'];
const WORKOUT_TYPES = ['Strength', 'Cardio', 'HIIT', 'Mixed', 'Mobility', 'Combat'];

const CUSTOMER_STEPS = ['INITIALIZE', 'PHYSIQUE', 'GOALS'] as const;
const ADMIN_STEPS = ['INITIALIZE', 'GYM SETUP', 'SUBMIT'] as const;

const RegisterScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  // Step 1: Identity
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>('customer');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2: Physique
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string>('');
  const [weight, setWeight] = useState(70.0);
  const [height, setHeight] = useState(175);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>('cm');
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(9);
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    color: string;
    backgroundColor: string;
    recommendedGoals: string[];
    bmi: number;
  } | null>(null);

  // Generate wheel picker data with gram precision (decimal values)
  const weightData = Array.from({ length: 2710 }, (_, i) => ({
    value: (i + 300) / 10, // Values from 30.0 to 300.9 kg
    label: `${((i + 300) / 10).toFixed(1)}`,
  }));

  const heightData = Array.from({ length: 151 }, (_, i) => ({
    value: i + 100,
    label: `${i + 100}`,
  }));

  const feetData = Array.from({ length: 8 }, (_, i) => ({
    value: i + 3,
    label: `${i + 3}`,
  }));

  const inchesData = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: `${i}`,
  }));

  // Unit conversion functions
  const convertWeightToKg = () => {
    return weight; // Weight is now always in kg with decimal precision
  };

  // Handle height unit change with conversion
  const handleHeightUnitChange = (newUnit: 'cm' | 'ft_in') => {
    if (newUnit === heightUnit) return;
    
    if (newUnit === 'ft_in' && heightUnit === 'cm') {
      const totalInches = height / 2.54;
      setFeet(Math.floor(totalInches / 12));
      setInches(Math.round(totalInches % 12));
    } else if (newUnit === 'cm' && heightUnit === 'ft_in') {
      setHeight(Math.round(feet * 30.48 + inches * 2.54));
    }
    setHeightUnit(newUnit);
  };

  const convertHeightToCm = () => {
    if (heightUnit === 'cm') {
      return height;
    }
    return feet * 30.48 + inches * 2.54;
  };

  // Auto-calculate BMI and detect health status
  useEffect(() => {
    const weightKg = convertWeightToKg();
    const heightCm = convertHeightToCm();
    
    if (weightKg > 0 && heightCm > 0) {
      const bmiResult = calculateBMI(weightKg, heightCm);
      const status = getHealthStatus(bmiResult.category);
      
      setHealthStatus({
        ...status,
        bmi: bmiResult.bmi,
      });
      
      // Auto-select recommended goal if no goal is selected yet
      if (!fitnessGoal && status.recommendedGoals.length > 0) {
        setFitnessGoal(status.recommendedGoals[0]);
      }
    } else {
      setHealthStatus(null);
    }
  }, [weight, height, heightUnit, feet, inches, age]);

  // Step 3: Goals / Workouts
  const [experienceLevel, setExperienceLevel] = useState('');
  const [targetAreas, setTargetAreas] = useState<string[]>([]);
  const [workoutDays, setWorkoutDays] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [gymName, setGymName] = useState('');
  const [phone, setPhone] = useState('');
  const [modalType, setModalType] = useState<'age' | 'gender' | 'height' | 'weight' | null>(null);
  const [cooldownError, setCooldownError] = useState('');
  const { isCoolingDown, formattedTime, remainingSeconds, progress, source, triggerCooldownFromError } =
    useAuthCooldown();

  const isAdminFlow = selectedRole === 'admin';
  const registrationSteps = isAdminFlow ? ADMIN_STEPS : CUSTOMER_STEPS;
  const showLogo = currentStep <= 3;
  const logoSmall = currentStep > 1;

  const handleRoleChange = (role: 'customer' | 'admin') => {
    if (role === selectedRole) return;
    setSelectedRole(role);
    setStep2Errors({});
    setStep3Errors({});
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
    else if (/\.(test|local|example|invalid)$/i.test(email.trim()) || /@(test|localhost)\./i.test(email.trim())) {
      errors.email = 'Use a real email provider (Gmail, Outlook, etc.)';
    }
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Must be at least 8 characters';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) errors.terms = 'Agreement required';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1 = () => {
    if (isCoolingDown) {
      setCooldownError(`Cooldown active. Try again in ${formattedTime}.`);
      return;
    }
    if (!validateStep1()) return;
    setCooldownError('');
    setCurrentStep(2);
  };

  const handleStep2 = () => {
    if (isAdminFlow) {
      const errors: Record<string, string> = {};
      const ageNum = parseInt(age);
      const weightKg = convertWeightToKg();
      const heightCm = convertHeightToCm();
      
      if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 100) errors.age = 'Enter a valid age (13-100)';
      if (weightKg < 30 || weightKg > 300) {
        errors.weight = 'Enter a valid weight (30-300 kg)';
      }
      if (heightCm < 100 || heightCm > 250) {
        errors.height = 'Enter a valid height (100-250 cm)';
      }
      if (!gymName.trim()) errors.gymName = 'Gym name is required';
      if (!phone.trim()) errors.phone = 'Phone number is required';
      else if (!/^[\d\s+()-]{7,}$/.test(phone.trim())) errors.phone = 'Enter a valid phone number';
      setStep2Errors(errors);
      if (Object.keys(errors).length === 0) setCurrentStep(3);
      return;
    }

    const errors: Record<string, string> = {};
    const ageNum = parseInt(age);
    const weightKg = convertWeightToKg();
    const heightCm = convertHeightToCm();
    
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 100) errors.age = 'Enter a valid age (13-100)';
    if (!gender) errors.gender = 'Select your gender';
    if (weightKg < 30 || weightKg > 300)
      errors.weight = 'Enter a valid weight (30-300 kg)';
    if (heightCm < 100 || heightCm > 250) {
      errors.height = 'Enter a valid height (100-250 cm)';
    }
    if (!fitnessGoal) errors.fitnessGoal = 'Select fitness goal';
    setStep2Errors(errors);
    if (Object.keys(errors).length === 0) setCurrentStep(3);
  };

  const submitRegistration = async () => {
    if (isCoolingDown) {
      setCooldownError(`Cooldown active. Try again in ${formattedTime}.`);
      return;
    }

    setLoading(true);
    setCooldownError('');
    try {
      const result = await register({
        email,
        password,
        firstName,
        lastName,
        role: selectedRole,
        ...(isAdminFlow
          ? {
              gymName,
              phone,
        fitnessProfile: {
          age,
          gender,
          weight: convertWeightToKg().toFixed(1),
          height: convertHeightToCm().toString(),
          fitnessGoal: '',
          experienceLevel: '',
          targetAreas: [],
          workoutDays: '',
          workoutDuration: '',
          workoutType: '',
        },
            }
          : {
              fitnessProfile: {
                age,
                gender,
                weight: convertWeightToKg().toFixed(1),
                height: convertHeightToCm().toString(),
                fitnessGoal,
                experienceLevel,
                targetAreas,
                workoutDays,
                workoutDuration,
                workoutType,
              },
            }),
      });

      if (result.needsEmailConfirmation) {
        navigation.replace('EmailVerification', {
          email: email.trim(),
          role: selectedRole,
        });
      } else {
        // Confirm email disabled — skip verification screen, go straight to login
        navigation.replace('Login', {
          email: email.trim(),
          emailVerified: true,
          role: selectedRole,
        });
      }
    } catch (error: any) {
      try {
        const cooldown = await triggerCooldownFromError(error);
        if (cooldown) {
          setCooldownError(
            `Rate limit reached. Cooldown active for ${formatCooldownTime(cooldown.durationSeconds)}.`
          );
          return;
        }
      } catch {
        // Cooldown helper failed — still show registration error below.
      }
      setAlert({
        title: 'Registration Failed',
        message: error?.message ?? 'Could not complete signup.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (isAdminFlow) {
      await submitRegistration();
      return;
    }

    const errors: Record<string, string> = {};
    if (!experienceLevel) errors.experienceLevel = 'Select experience level';
    if (targetAreas.length === 0) errors.targetAreas = 'Select target areas';
    if (!workoutDays) errors.workoutDays = 'Select workout days';
    if (!workoutDuration) errors.workoutDuration = 'Select workout duration';
    if (!workoutType) errors.workoutType = 'Select workout type';
    setStep3Errors(errors);
    if (Object.keys(errors).length > 0) return;

    await submitRegistration();
  };

  const toggleTargetArea = (area: string) => {
    setTargetAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const openModal = (type: 'age' | 'gender' | 'height' | 'weight') => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleModalSelect = (value: string) => {
    switch (modalType) {
      case 'age':
        setAge(value);
        if (step2Errors.age) setStep2Errors({ ...step2Errors, age: '' });
        break;
      case 'gender':
        setGender(value);
        if (step2Errors.gender) setStep2Errors({ ...step2Errors, gender: '' });
        break;
      case 'height':
        setHeight(parseInt(value));
        if (step2Errors.height) setStep2Errors({ ...step2Errors, height: '' });
        break;
      case 'weight':
        setWeight(parseFloat(value));
        if (step2Errors.weight) setStep2Errors({ ...step2Errors, weight: '' });
        break;
    }
  };

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      <View style={styles.stepperRow}>
        {registrationSteps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isFinished = currentStep > stepNum;
          return (
            <View key={step} style={styles.stepperItem}>
              <Text
                style={[
                  styles.stepperText,
                  { color: isActive || isFinished ? '#FFFFFF' : '#555555' },
                ]}
              >
                {step}
              </Text>
              <View
                style={[
                  styles.stepperLine,
                  { backgroundColor: isActive || isFinished ? SALMON_COLOR : '#2C2C2E' },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderChipGroup = (
    options: string[],
    selected: string | string[],
    onSelect: (val: string) => void,
    multi = false,
    horizontal = false,
    recommendedOptions?: string[]
  ) => {
    const chips = options.map((option) => {
      const isSelected = multi
        ? (selected as string[]).includes(option)
        : selected === option;
      const isRecommended = recommendedOptions?.includes(option);
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          style={[
            styles.chip,
            horizontal && styles.chipHorizontal,
            {
              backgroundColor: isSelected 
                ? 'rgba(232, 142, 131, 0.12)' 
                : isRecommended 
                  ? healthStatus?.backgroundColor 
                  : '#1C1C1E',
              borderColor: isSelected 
                ? SALMON_COLOR 
                : isRecommended 
                  ? healthStatus?.color 
                  : '#2E2E2E',
            },
          ]}
        >
          <Text style={[styles.chipText, { color: isSelected ? SALMON_COLOR : isRecommended ? healthStatus?.color : '#FAFAFA' }]}>
            {option}
            {isRecommended && (
              <Text style={[styles.recommendedBadge, { color: healthStatus?.color }]}> ★</Text>
            )}
          </Text>
        </TouchableOpacity>
      );
    });

    if (horizontal) {
      return (
        <HorizontalScrollView
          style={styles.horizontalChipScroll}
          contentContainerStyle={styles.horizontalChipContent}
        >
          {chips}
        </HorizontalScrollView>
      );
    }

    return <View style={styles.chipGroup}>{chips}</View>;
  };

  const renderPrimaryButton = (
    label: string,
    onPress: () => void,
    disabled = false,
    withArrow = true
  ) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        {
          backgroundColor: SALMON_COLOR,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
      {withArrow && (
        <View style={styles.buttonArrowWrapper}>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOutlineBack = () => (
    <TouchableOpacity
      onPress={handleBack}
      style={[styles.outlineButton, { borderColor: '#555555' }]}
    >
      <Text style={[styles.outlineButtonText, { color: '#FFFFFF' }]}>BACK</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={[styles.container, { backgroundColor: '#0D0D0D' }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View
          style={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Header: cooldown badge only */}
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            {currentStep <= 3 ? (
              <AuthCooldownHeaderBadge
                formattedTime={formattedTime}
                remainingSeconds={remainingSeconds}
                progress={progress}
                source={source}
              />
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>

          {/* Logo */}
          {showLogo && (
            <View style={[styles.logoSection, logoSmall && styles.logoSectionSmall]}>
              <Image
                source={require('../../assets/mobapplogo.png')}
                style={[styles.logoImage, logoSmall && styles.logoImageSmall]}
                resizeMode="contain"
              />
            </View>
          )}

          {cooldownError ? (
            <Text style={[styles.cooldownErrorText, { color: colors.primary }]}>
              {cooldownError}
            </Text>
          ) : null}

          {currentStep <= 3 && renderStepper()}

          {/* Step 1: Initialize */}
          {currentStep === 1 && (
            <View style={styles.formSection}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitleText, { color: colors.foreground }]}>INITIALIZE</Text>
                <Text style={[styles.stepSubtitleText, { color: colors.mutedForeground }]}>
                  {isAdminFlow
                    ? 'Set up your admin account. Configure your gym in the next steps.'
                    : 'Set up your account. Complete physique and goals in the next steps.'}
                </Text>
              </View>

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>FIRST NAME</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step1Errors.firstName ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
                    </View>
                    <TextInput
                      style={[styles.textInput, { color: colors.foreground }]}
                      placeholder="Jane"
                      placeholderTextColor="#555555"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (step1Errors.firstName)
                          setStep1Errors({ ...step1Errors, firstName: '' });
                      }}
                      autoCorrect={false}
                      autoCapitalize="words"
                      autoComplete="given-name"
                      textContentType="givenName"
                    />
                  </View>
                  {step1Errors.firstName ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step1Errors.firstName}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.nameField, styles.nameFieldLast]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>LAST NAME</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step1Errors.lastName ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
                    </View>
                    <TextInput
                      style={[styles.textInput, { color: colors.foreground }]}
                      placeholder="Doe"
                      placeholderTextColor="#555555"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (step1Errors.lastName)
                          setStep1Errors({ ...step1Errors, lastName: '' });
                      }}
                      autoCorrect={false}
                      autoCapitalize="words"
                      autoComplete="family-name"
                      textContentType="familyName"
                    />
                  </View>
                  {step1Errors.lastName ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step1Errors.lastName}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Email Address
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: '#1C1C1E',
                      borderColor: step1Errors.email ? colors.primary : '#2E2E2E',
                    },
                  ]}
                >
                  <View style={styles.fieldIconWrapper}>
                    <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="you@gmail.com"
                    placeholderTextColor="#555555"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (step1Errors.email) setStep1Errors({ ...step1Errors, email: '' });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                </View>
                {step1Errors.email ? (
                  <Text style={[styles.errorText, { color: colors.primary }]}>
                    {step1Errors.email}
                  </Text>
                ) : null}
              </View>

              <View style={styles.passwordRow}>
                <View style={styles.passwordField}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step1Errors.password ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.mutedForeground}
                      />
                    </View>
                    <TextInput
                      style={[styles.textInput, { color: colors.foreground }]}
                      placeholder="••••••••"
                      placeholderTextColor="#555555"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (step1Errors.password)
                          setStep1Errors({ ...step1Errors, password: '' });
                        // Auto-clear confirm password error if passwords now match
                        if (step1Errors.confirmPassword && confirmPassword === text)
                          setStep1Errors({ ...step1Errors, confirmPassword: '' });
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeToggleWrapper}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>
                  {step1Errors.password ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step1Errors.password}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.passwordField, styles.passwordFieldLast]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>
                    Confirm Password
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step1Errors.confirmPassword ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.mutedForeground}
                      />
                    </View>
                    <TextInput
                      style={[styles.textInput, { color: colors.foreground }]}
                      placeholder="••••••••"
                      placeholderTextColor="#555555"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (step1Errors.confirmPassword)
                          setStep1Errors({ ...step1Errors, confirmPassword: '' });
                        // Auto-clear password error if passwords now match
                        if (step1Errors.password && password === text)
                          setStep1Errors({ ...step1Errors, password: '' });
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeToggleWrapper}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>
                  {step1Errors.confirmPassword ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step1Errors.confirmPassword}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  ACCOUNT TYPE
                </Text>
                <View style={styles.roleSelectionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      selectedRole === 'customer' && styles.roleOptionSelected,
                      {
                        borderColor:
                          selectedRole === 'customer' ? SALMON_COLOR : '#2E2E2E',
                      },
                    ]}
                    onPress={() => handleRoleChange('customer')}
                  >
                    <Ionicons
                      name="fitness-outline"
                      size={22}
                      color={
                        selectedRole === 'customer'
                          ? SALMON_COLOR
                          : colors.mutedForeground
                      }
                      style={styles.roleIcon}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        {
                          color:
                            selectedRole === 'customer'
                              ? SALMON_COLOR
                              : colors.foreground,
                        },
                      ]}
                    >
                      Customer
                    </Text>
                    <Text
                      style={[styles.roleOptionSubtext, { color: colors.mutedForeground }]}
                    >
                      Access gym dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      styles.roleOptionLast,
                      selectedRole === 'admin' && styles.roleOptionSelected,
                      {
                        borderColor: selectedRole === 'admin' ? SALMON_COLOR : '#2E2E2E',
                      },
                    ]}
                    onPress={() => handleRoleChange('admin')}
                  >
                    <Ionicons
                      name="business-outline"
                      size={22}
                      color={
                        selectedRole === 'admin' ? SALMON_COLOR : colors.mutedForeground
                      }
                      style={styles.roleIcon}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        {
                          color:
                            selectedRole === 'admin' ? SALMON_COLOR : colors.foreground,
                        },
                      ]}
                    >
                      Admin
                    </Text>
                    <Text
                      style={[styles.roleOptionSubtext, { color: colors.mutedForeground }]}
                    >
                      Requires approval
                    </Text>
                  </TouchableOpacity>
                </View>
                {selectedRole === 'admin' && (
                  <Text style={[styles.adminNotice, { color: colors.mutedForeground }]}>
                    Note: Admin accounts require super admin approval after email verification.
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setAgreeTerms(!agreeTerms);
                  if (step1Errors.terms) setStep1Errors({ ...step1Errors, terms: '' });
                }}
                style={styles.checkboxRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: step1Errors.terms
                        ? colors.primary
                        : agreeTerms
                          ? SALMON_COLOR
                          : '#2C2C2E',
                      backgroundColor: agreeTerms ? SALMON_COLOR : 'transparent',
                    },
                  ]}
                >
                  {agreeTerms && (
                    <Ionicons name="checkmark" size={14} color="#000" />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.mutedForeground }]}>
                  I accept the Blood & Energy Protocol Terms and authorize biometric data
                  processing.
                </Text>
              </TouchableOpacity>
              {step1Errors.terms ? (
                <Text style={[styles.errorText, { color: colors.primary, marginBottom: 8 }]}>
                  {step1Errors.terms}
                </Text>
              ) : null}

              {renderPrimaryButton('INITIALIZE', handleStep1, isCoolingDown)}
            </View>
          )}

          {/* Step 2: Customer Physique */}
          {currentStep === 2 && !isAdminFlow && (
            <View style={styles.formSection}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitleText, { color: colors.foreground }]}>
                  PHYSIQUE PROTOCOL
                </Text>
                <Text style={[styles.stepSubtitleText, { color: colors.mutedForeground }]}>
                  Establish biological parameters.
                </Text>
              </View>

              {/* Age and Gender side by side */}
              <View style={styles.rowGroup}>
                <View style={styles.rowField}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>AGE</Text>
                  <TouchableOpacity
                    onPress={() => openModal('age')}
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.age ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
                    </View>
                    <Text
                      style={[
                        styles.textInput,
                        {
                          color: age ? colors.foreground : '#555555',
                          paddingTop: 14,
                          paddingBottom: 14,
                        },
                      ]}
                    >
                      {age || '25'}
                    </Text>
                  </TouchableOpacity>
                  {step2Errors.age ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step2Errors.age}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.rowField, styles.rowFieldLast]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>GENDER</Text>
                  <TouchableOpacity
                    onPress={() => openModal('gender')}
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.gender ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons name="people-outline" size={20} color={colors.mutedForeground} />
                    </View>
                    <Text
                      style={[
                        styles.textInput,
                        {
                          color: gender ? colors.foreground : '#555555',
                          paddingTop: 14,
                          paddingBottom: 14,
                        },
                      ]}
                    >
                      {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Select gender'}
                    </Text>
                  </TouchableOpacity>
                  {step2Errors.gender ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step2Errors.gender}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Weight and Height side by side */}
              <View style={styles.rowGroup}>
                <View style={styles.rowField}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>
                    WEIGHT (KG)
                  </Text>
                  <TouchableOpacity
                    onPress={() => openModal('weight')}
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.weight ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons name="fitness-outline" size={20} color={colors.mutedForeground} />
                    </View>
                    <Text
                      style={[
                        styles.textInput,
                        {
                          color: weight ? colors.foreground : '#555555',
                          paddingTop: 14,
                          paddingBottom: 14,
                        },
                      ]}
                    >
                      {weight ? `${weight.toFixed(1)} kg` : '70.0 kg'}
                    </Text>
                  </TouchableOpacity>
                  {step2Errors.weight ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step2Errors.weight}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.rowField, styles.rowFieldLast]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>
                    HEIGHT
                  </Text>
                  <TouchableOpacity
                    onPress={() => openModal('height')}
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.height ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <View style={styles.fieldIconWrapper}>
                      <Ionicons name="resize-outline" size={20} color={colors.mutedForeground} />
                    </View>
                    <Text
                      style={[
                        styles.textInput,
                        {
                          color: height ? colors.foreground : '#555555',
                          paddingTop: 14,
                          paddingBottom: 14,
                        },
                      ]}
                    >
                      {height ? `${height} cm` : '175 cm'}
                    </Text>
                  </TouchableOpacity>
                  {step2Errors.height ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step2Errors.height}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Health Status Detection */}
              {healthStatus && healthStatus.bmi && (
                <View style={[styles.healthStatusContainer, { backgroundColor: healthStatus.backgroundColor, borderColor: healthStatus.color }]}>
                  <View style={styles.healthStatusIcon}>
                    <Ionicons name="fitness-outline" size={24} color={healthStatus.color} />
                  </View>
                  <View style={styles.healthStatusContent}>
                    <Text style={[styles.healthStatusTitle, { color: healthStatus.color }]}>
                      {healthStatus.status}
                    </Text>
                    <Text style={[styles.healthStatusSubtitle, { color: colors.mutedForeground }]}>
                      BMI: {typeof healthStatus.bmi === 'number' ? healthStatus.bmi.toFixed(1) : healthStatus.bmi}
                    </Text>
                    <Text style={[styles.healthStatusRecommendation, { color: colors.foreground }]}>
                      Recommended: {healthStatus.recommendedGoals?.join(', ') || 'Select a goal'}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, marginBottom: 12 },
                  ]}
                >
                  PRIMARY FITNESS OBJECTIVE
                </Text>
                {renderChipGroup(
                  FITNESS_GOALS,
                  fitnessGoal,
                  (val) => {
                    setFitnessGoal(val);
                    if (step2Errors.fitnessGoal)
                      setStep2Errors({ ...step2Errors, fitnessGoal: '' });
                  },
                  false,
                  true,
                  healthStatus?.recommendedGoals
                )}
                {step2Errors.fitnessGoal ? (
                  <Text
                    style={[styles.errorText, { color: colors.primary, marginTop: 8 }]}
                  >
                    {step2Errors.fitnessGoal}
                  </Text>
                ) : null}
              </View>

              <View style={styles.stepNavRow}>
                {renderOutlineBack()}
                <TouchableOpacity
                  onPress={handleStep2}
                  style={[styles.solidButton, { backgroundColor: SALMON_COLOR }]}
                >
                  <Text style={styles.solidButtonText}>CONTINUE</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2: Admin Gym Setup */}
          {currentStep === 2 && isAdminFlow && (
            <View style={styles.formSection}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitleText, { color: colors.foreground }]}>
                  GYM SETUP
                </Text>
                <Text style={[styles.stepSubtitleText, { color: colors.mutedForeground }]}>
                  Your details and the gym you will manage on Forge.
                </Text>
              </View>

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>AGE</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.age ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.textInput, { color: colors.foreground }]}
                      placeholder="25"
                      placeholderTextColor="#555555"
                      value={age}
                      onChangeText={(text) => {
                        setAge(text);
                        if (step2Errors.age) setStep2Errors({ ...step2Errors, age: '' });
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  {step2Errors.age ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step2Errors.age}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.nameField, styles.nameFieldLast]}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>
                    WEIGHT (KG)
                  </Text>
                  <View
                    style={[
                      styles.wheelPickerWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.weight ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <WheelPicker
                      data={weightData}
                      value={weight}
                      onValueChanged={({ item }) => {
                        setWeight(item.value);
                        if (step2Errors.weight)
                          setStep2Errors({ ...step2Errors, weight: '' });
                      }}
                      style={styles.wheelPicker}
                      itemTextStyle={styles.wheelText}
                    />
                  </View>
                  {step2Errors.weight ? (
                    <Text style={[styles.errorText, { color: colors.primary }]}>
                      {step2Errors.weight}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  HEIGHT
                </Text>
                <View style={styles.unitToggle}>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      heightUnit === 'ft_in' && styles.unitButtonActive,
                    ]}
                    onPress={() => handleHeightUnitChange('ft_in')}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        heightUnit === 'ft_in' && styles.unitTextActive,
                      ]}
                    >
                      FT/IN
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      heightUnit === 'cm' && styles.unitButtonActive,
                    ]}
                    onPress={() => handleHeightUnitChange('cm')}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        heightUnit === 'cm' && styles.unitTextActive,
                      ]}
                    >
                      CM
                    </Text>
                  </TouchableOpacity>
                </View>

                {heightUnit === 'ft_in' ? (
                  <View style={styles.heightRow}>
                    <View style={[styles.wheelPickerWrapper, styles.wheelPickerHalf, { backgroundColor: '#1C1C1E', borderColor: step2Errors.height ? colors.primary : '#2E2E2E' }]}>
                      <Text style={[styles.wheelLabel, { color: colors.mutedForeground }]}>ft</Text>
                      <WheelPicker
                        data={feetData}
                        value={feet}
                        onValueChanged={({ item }) => {
                          setFeet(item.value);
                          if (step2Errors.height) setStep2Errors({ ...step2Errors, height: '' });
                        }}
                        style={styles.wheelPicker}
                        itemTextStyle={styles.wheelText}
                      />
                    </View>

                    <Text style={[styles.separator, { color: colors.mutedForeground }]}>'</Text>

                    <View style={[styles.wheelPickerWrapper, styles.wheelPickerHalf, { backgroundColor: '#1C1C1E', borderColor: step2Errors.height ? colors.primary : '#2E2E2E' }]}>
                      <Text style={[styles.wheelLabel, { color: colors.mutedForeground }]}>in</Text>
                      <WheelPicker
                        data={inchesData}
                        value={inches}
                        onValueChanged={({ item }) => {
                          setInches(item.value);
                          if (step2Errors.height) setStep2Errors({ ...step2Errors, height: '' });
                        }}
                        style={styles.wheelPicker}
                        itemTextStyle={styles.wheelText}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.wheelPickerWrapper,
                      {
                        backgroundColor: '#1C1C1E',
                        borderColor: step2Errors.height ? colors.primary : '#2E2E2E',
                      },
                    ]}
                  >
                    <WheelPicker
                      data={heightData}
                      value={height}
                      onValueChanged={({ item }) => {
                        setHeight(item.value);
                        if (step2Errors.height) setStep2Errors({ ...step2Errors, height: '' });
                      }}
                      style={styles.wheelPicker}
                      itemTextStyle={styles.wheelText}
                    />
                  </View>
                )}
                {step2Errors.height ? (
                  <Text style={[styles.errorText, { color: colors.primary }]}>
                    {step2Errors.height}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  GYM NAME
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: '#1C1C1E',
                      borderColor: step2Errors.gymName ? colors.primary : '#2E2E2E',
                    },
                  ]}
                >
                  <View style={styles.fieldIconWrapper}>
                    <Ionicons name="business-outline" size={20} color={colors.mutedForeground} />
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="Forge Downtown"
                    placeholderTextColor="#555555"
                    value={gymName}
                    onChangeText={(text) => {
                      setGymName(text);
                      if (step2Errors.gymName)
                        setStep2Errors({ ...step2Errors, gymName: '' });
                    }}
                    autoCorrect={false}
                  />
                </View>
                {step2Errors.gymName ? (
                  <Text style={[styles.errorText, { color: colors.primary }]}>
                    {step2Errors.gymName}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  CONTACT PHONE
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: '#1C1C1E',
                      borderColor: step2Errors.phone ? colors.primary : '#2E2E2E',
                    },
                  ]}
                >
                  <View style={styles.fieldIconWrapper}>
                    <Ionicons name="call-outline" size={20} color={colors.mutedForeground} />
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="+1 555 000 0000"
                    placeholderTextColor="#555555"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (step2Errors.phone) setStep2Errors({ ...step2Errors, phone: '' });
                    }}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                </View>
                {step2Errors.phone ? (
                  <Text style={[styles.errorText, { color: colors.primary }]}>
                    {step2Errors.phone}
                  </Text>
                ) : null}
              </View>

              <Text style={[styles.adminNotice, { color: colors.mutedForeground }]}>
                Your gym profile will be linked to your admin account after super admin
                approval.
              </Text>

              <View style={styles.stepNavRow}>
                {renderOutlineBack()}
                <TouchableOpacity
                  onPress={handleStep2}
                  style={[styles.solidButton, { backgroundColor: SALMON_COLOR }]}
                >
                  <Text style={styles.solidButtonText}>CONTINUE</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Customer Workout Preferences */}
          {currentStep === 3 && !isAdminFlow && (
            <View style={styles.formSection}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitleText, { color: colors.foreground }]}>
                  PREFERENCE ARCHITECTURE
                </Text>
                <Text style={[styles.stepSubtitleText, { color: colors.mutedForeground }]}>
                  Configure execution protocols.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, marginBottom: 12 },
                  ]}
                >
                  EXPERIENCE LEVEL
                </Text>
                {renderChipGroup(
                  EXPERIENCE_LEVELS,
                  experienceLevel,
                  (val) => {
                    setExperienceLevel(val);
                    if (step3Errors.experienceLevel)
                      setStep3Errors({ ...step3Errors, experienceLevel: '' });
                  },
                  false,
                  true
                )}
                {step3Errors.experienceLevel ? (
                  <Text
                    style={[styles.errorText, { color: colors.primary, marginTop: 6 }]}
                  >
                    {step3Errors.experienceLevel}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, marginBottom: 12 },
                  ]}
                >
                  TARGET AREAS
                </Text>
                {renderChipGroup(
                  TARGET_AREAS,
                  targetAreas,
                  (val) => {
                    toggleTargetArea(val);
                    if (step3Errors.targetAreas)
                      setStep3Errors({ ...step3Errors, targetAreas: '' });
                  },
                  true,
                  true
                )}
                {step3Errors.targetAreas ? (
                  <Text
                    style={[styles.errorText, { color: colors.primary, marginTop: 6 }]}
                  >
                    {step3Errors.targetAreas}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, marginBottom: 12 },
                  ]}
                >
                  WORKOUT DAYS
                </Text>
                {renderChipGroup(
                  WORKOUT_DAYS,
                  workoutDays,
                  (val) => {
                    setWorkoutDays(val);
                    if (step3Errors.workoutDays)
                      setStep3Errors({ ...step3Errors, workoutDays: '' });
                  },
                  false,
                  true
                )}
                {step3Errors.workoutDays ? (
                  <Text
                    style={[styles.errorText, { color: colors.primary, marginTop: 6 }]}
                  >
                    {step3Errors.workoutDays}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, marginBottom: 12 },
                  ]}
                >
                  SESSION DURATION
                </Text>
                {renderChipGroup(
                  WORKOUT_DURATIONS,
                  workoutDuration,
                  (val) => {
                    setWorkoutDuration(val);
                    if (step3Errors.workoutDuration)
                      setStep3Errors({ ...step3Errors, workoutDuration: '' });
                  },
                  false,
                  true
                )}
                {step3Errors.workoutDuration ? (
                  <Text
                    style={[styles.errorText, { color: colors.primary, marginTop: 6 }]}
                  >
                    {step3Errors.workoutDuration}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.mutedForeground, marginBottom: 12 },
                  ]}
                >
                  WORKOUT TYPE
                </Text>
                {renderChipGroup(
                  WORKOUT_TYPES,
                  workoutType,
                  (val) => {
                    setWorkoutType(val);
                    if (step3Errors.workoutType)
                      setStep3Errors({ ...step3Errors, workoutType: '' });
                  },
                  false,
                  true
                )}
                {step3Errors.workoutType ? (
                  <Text
                    style={[styles.errorText, { color: colors.primary, marginTop: 6 }]}
                  >
                    {step3Errors.workoutType}
                  </Text>
                ) : null}
              </View>

              <View style={styles.stepNavRow}>
                {renderOutlineBack()}
                <TouchableOpacity
                  onPress={handleStep3}
                  disabled={loading || isCoolingDown}
                  style={[
                    styles.solidButton,
                    {
                      backgroundColor: SALMON_COLOR,
                      opacity: loading || isCoolingDown ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={styles.solidButtonText}>
                    {loading ? 'CREATING ACCOUNT...' : 'COMPLETE SETUP'}
                  </Text>
                  {!loading && (
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#000"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Admin Submit */}
          {currentStep === 3 && isAdminFlow && (
            <View style={styles.formSection}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepTitleText, { color: colors.foreground }]}>
                  SUBMIT APPLICATION
                </Text>
                <Text style={[styles.stepSubtitleText, { color: colors.mutedForeground }]}>
                  Review your details before sending your admin application.
                </Text>
              </View>

              <View style={styles.reviewBlock}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  ADMIN
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {firstName.trim()} {lastName.trim()}
                </Text>
              </View>
              <View style={styles.reviewBlock}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  EMAIL
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {email.trim()}
                </Text>
              </View>
              <View style={styles.reviewBlock}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  AGE / WEIGHT
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {age.trim()} yrs · {convertWeightToKg().toFixed(1)} kg
                </Text>
              </View>
              <View style={styles.reviewBlock}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  GYM
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {gymName.trim()}
                </Text>
              </View>
              <View style={styles.reviewBlock}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
                  PHONE
                </Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {phone.trim()}
                </Text>
              </View>

              <Text style={[styles.adminNotice, { color: colors.mutedForeground }]}>
                A super admin will review your application. You will be notified once
                approved.
              </Text>

              <View style={styles.stepNavRow}>
                {renderOutlineBack()}
                <TouchableOpacity
                  onPress={handleStep3}
                  disabled={loading || isCoolingDown}
                  style={[
                    styles.solidButton,
                    {
                      backgroundColor: SALMON_COLOR,
                      opacity: loading || isCoolingDown ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={styles.solidButtonText}>
                    {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                  </Text>
                  {!loading && (
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#000"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer: Sign in link on steps 1–3 */}
          {currentStep <= 3 && (
            <View style={styles.signinSection}>
              <Text style={[styles.signinText, { color: colors.mutedForeground }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.signinLink, { color: SALMON_COLOR }]}>Sign in</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <DesignedAlert
        visible={!!alert}
        title={alert?.title ?? 'Registration Failed'}
        message={alert?.message ?? ''}
        icon="alert-circle-outline"
        buttonLabel="GOT IT"
        onClose={() => setAlert(null)}
      />
      <CustomRulerPicker
        visible={modalType !== null}
        title={
          modalType === 'age' ? 'SELECT AGE' :
          modalType === 'gender' ? 'SELECT GENDER' :
          modalType === 'height' ? 'SELECT HEIGHT' :
          'SELECT WEIGHT'
        }
        type={modalType || 'age'}
        selectedValue={
          modalType === 'age' ? age :
          modalType === 'gender' ? gender :
          modalType === 'height' ? height.toString() :
          modalType === 'weight' ? weight.toString() : ''
        }
        onClose={closeModal}
        onSelect={handleModalSelect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerSpacer: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  logoSectionSmall: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  logoImage: {
    width: 180,
    height: 180,
    maxWidth: '80%',
  },
  logoImageSmall: {
    width: 140,
    height: 140,
  },
  formSection: {
    paddingHorizontal: 24,
  },
  stepperContainer: {
    marginBottom: 20,
    marginTop: 4,
    paddingHorizontal: 24,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  stepperItem: {
    flex: 1,
    minWidth: 0,
  },
  stepperText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginBottom: 6,
    textAlign: 'center',
  },
  stepperLine: {
    height: 2,
    borderRadius: 1,
    width: '100%',
  },
  stepHeader: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepTitleText: {
    fontSize: 22,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  stepSubtitleText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 19,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  nameField: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  nameFieldLast: {
    marginRight: 0,
  },
  passwordRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  passwordField: {
    flex: 1,
    minWidth: 0,
  },
  passwordFieldLast: {
    marginRight: 0,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  rowField: {
    flex: 1,
    minWidth: 0,
  },
  rowFieldLast: {
    marginRight: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  fieldIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  wheelPickerWrapper: {
    height: 160,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  wheelPicker: {
    flex: 1,
    height: 140,
  },
  wheelPickerSmall: {
    flex: 1,
    height: 100,
  },
  wheelText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
  },
  unitButtonActive: {
    backgroundColor: '#3C3C3E',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  heightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wheelPickerHalf: {
    flex: 1,
  },
  wheelLabel: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8E8E93',
  },
  separator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  eyeToggleWrapper: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    lineHeight: 16,
  },
  actionButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    marginTop: 8,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  buttonArrowWrapper: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  horizontalChipScroll: {
    marginHorizontal: -4,
  },
  horizontalChipContent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipHorizontal: {
    marginRight: 10,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  recommendedBadge: {
    fontSize: 12,
    marginLeft: 4,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  healthStatusIcon: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthStatusContent: {
    flex: 1,
  },
  healthStatusTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  healthStatusSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 6,
  },
  healthStatusRecommendation: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  stepNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    width: '100%',
  },
  outlineButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 15,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  solidButton: {
    flex: 1.5,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  solidButtonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  successIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(232, 142, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  successButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    width: '100%',
  },
  successButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1.5,
  },
  roleSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  roleOption: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  roleOptionLast: {
    marginRight: 0,
  },
  roleOptionSelected: {
    backgroundColor: 'rgba(232, 142, 131, 0.1)',
  },
  roleIcon: {
    marginBottom: 8,
  },
  roleOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  roleOptionSubtext: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  adminNotice: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reviewBlock: {
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  cooldownErrorText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 28,
  },
  signinSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  signinText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  signinLink: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default RegisterScreen;
