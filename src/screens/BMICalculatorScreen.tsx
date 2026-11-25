import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { supabase } from '../api/client/supabase';
import ScreenScrollView from '../components/ScreenScrollView';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

interface BMIRecord {
  id: string;
  user_id: string;
  bmi: number;
  weight: number;
  height: number;
  weight_unit: 'kg' | 'g' | 'lbs';
  height_unit: 'cm' | 'ft_in';
  category: string;
  created_at: string;
}

interface BMIResult {
  bmi: string;
  title: string;
  description: string;
}

const BMICalculatorScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();
  
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g' | 'lbs'>('kg');
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);
  const [heightCm, setHeightCm] = useState(175);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>('ft_in');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<BMIResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<BMIRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Generate wheel picker data
  const weightData = Array.from({ length: 200 }, (_, i) => ({
    value: i + 30,
    label: `${i + 30}`,
  }));

  const feetData = Array.from({ length: 8 }, (_, i) => ({
    value: i + 3,
    label: `${i + 3}`,
  }));

  const inchesData = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: `${i}`,
  }));

  const heightCmData = Array.from({ length: 150 }, (_, i) => ({
    value: i + 100,
    label: `${i + 100}`,
  }));

  useEffect(() => {
    if (isAuthenticated && user) {
      loadBMIHistory();
    }
  }, [isAuthenticated, user]);

  const loadBMIHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('bmi_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading BMI history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleBack = () => {
    navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Home' } });
  };

  const convertWeightToKg = () => {
    const value = weight;
    if (weightUnit === 'kg') return value;
    if (weightUnit === 'g') return value / 1000;
    if (weightUnit === 'lbs') return value * 0.453592;
    return value;
  };

  const convertHeightToCm = () => {
    if (heightUnit === 'cm') {
      return heightCm;
    }
    const ft = feet;
    const inch = inches;
    return ft * 30.48 + inch * 2.54;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        title: 'Underweight',
        description: 'Your BMI is below the healthy range.',
      };
    }
    if (bmi < 25) {
      return {
        title: 'Healthy Weight',
        description: 'Your BMI is within the healthy range.',
      };
    }
    if (bmi < 30) {
      return {
        title: 'Overweight',
        description: 'Your BMI is above the healthy range.',
      };
    }
    return {
      title: 'Obesity',
      description: 'Your BMI is in the obesity range.',
    };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0.';
    }

    if (heightUnit === 'cm') {
      if (heightCm <= 0) {
        newErrors.heightCm = 'Height must be greater than 0.';
      }
    } else {
      if (feet <= 0) {
        newErrors.feet = 'Height must be greater than 0.';
      }
      if (inches < 0 || inches >= 12) {
        newErrors.inches = 'Inches must be between 0 and 11.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    if (!validate()) {
      setResult(null);
      return;
    }

    const weightKg = convertWeightToKg();
    const heightCmValue = convertHeightToCm();

    if (weightKg <= 0 || heightCmValue <= 0) {
      return;
    }

    const bmi = weightKg / Math.pow(heightCmValue / 100, 2);
    const category = getBMICategory(bmi);

    setResult({
      bmi: bmi.toFixed(1),
      ...category,
    });
  };

  const saveBMIRecord = async () => {
    if (!result || !user || !isAuthenticated) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('bmi_records')
        .insert({
          user_id: user.id,
          bmi: parseFloat(result.bmi),
          weight: weight,
          height: heightUnit === 'cm' ? heightCm : feet * 12 + inches,
          weight_unit: weightUnit,
          height_unit: heightUnit,
          category: result.title,
        });

      if (error) throw error;

      setSaveSuccess(true);
      loadBMIHistory();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving BMI record:', error);
      setErrors({ save: 'Failed to save BMI record. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetCalculator = () => {
    setWeight(70);
    setFeet(5);
    setInches(10);
    setHeightCm(175);
    setErrors({});
    setResult(null);
    setSaveSuccess(false);
  };

  const UnitButton = ({ unit }: { unit: string }) => (
    <TouchableOpacity
      style={[
        styles.unitButton,
        weightUnit === unit && styles.unitButtonActive,
      ]}
      onPress={() => setWeightUnit(unit as any)}
    >
      <Text
        style={[
          styles.unitText,
          weightUnit === unit && styles.unitTextActive,
        ]}
      >
        {unit.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const HeightUnitButton = ({ unit }: { unit: string }) => (
    <TouchableOpacity
      style={[
        styles.unitButton,
        heightUnit === unit && styles.unitButtonActive,
      ]}
      onPress={() => setHeightUnit(unit as any)}
    >
      <Text
        style={[
          styles.unitText,
          heightUnit === unit && styles.unitTextActive,
        ]}
      >
        {unit === 'cm' ? 'CM' : 'FT/IN'}
      </Text>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON }]}>BMI CALCULATOR</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.lockedWrap}>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>SIGN IN REQUIRED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Sign in to use the BMI calculator and track your progress.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[styles.saveButton, { backgroundColor: SALMON }]}
          >
            <Text style={styles.saveButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON }]}>BMI CALCULATOR</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScreenScrollView contentContainerStyle={styles.scrollContent}>
          {/* Calculator Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${SALMON}22` }]}>
                <Text style={styles.icon}>⚖️</Text>
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>BMI Calculator</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                  Check your body mass index
                </Text>
              </View>
            </View>

            {/* Height Unit Toggle */}
            <View style={styles.unitToggle}>
              <HeightUnitButton unit="ft_in" />
              <HeightUnitButton unit="cm" />
            </View>

            {/* Height Input */}
            <Text style={[styles.label, { color: colors.foreground }]}>Height</Text>

            {heightUnit === 'ft_in' ? (
              <View style={styles.heightRow}>
                <View style={[styles.wheelContainer, styles.wheelContainerHalf, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.wheelLabel, { color: colors.mutedForeground }]}>ft</Text>
                  <WheelPicker
                    data={feetData}
                    value={feet}
                    onValueChanged={({ item }) => {
                      setFeet(item.value);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.feet;
                        return next;
                      });
                    }}
                    style={styles.wheelPicker}
                    itemTextStyle={styles.wheelText}
                  />
                </View>

                <Text style={[styles.separator, { color: colors.mutedForeground }]}>'</Text>

                <View style={[styles.wheelContainer, styles.wheelContainerHalf, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.wheelLabel, { color: colors.mutedForeground }]}>in</Text>
                  <WheelPicker
                    data={inchesData}
                    value={inches}
                    onValueChanged={({ item }) => {
                      setInches(item.value);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.inches;
                        return next;
                      });
                    }}
                    style={styles.wheelPicker}
                    itemTextStyle={styles.wheelText}
                  />
                </View>
              </View>
            ) : (
              <View style={[styles.wheelContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.wheelLabel, { color: colors.mutedForeground }]}>cm</Text>
                <WheelPicker
                  data={heightCmData}
                  value={heightCm}
                  onValueChanged={({ item }) => {
                    setHeightCm(item.value);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.heightCm;
                      return next;
                    });
                  }}
                  style={styles.wheelPicker}
                  itemTextStyle={styles.wheelText}
                />
              </View>
            )}

            {(errors.feet || errors.inches || errors.heightCm) && (
              <Text style={styles.errorText}>
                {errors.feet || errors.inches || errors.heightCm}
              </Text>
            )}

            {/* Weight Input */}
            <Text style={[styles.label, { color: colors.foreground }]}>Weight</Text>

            <View style={[styles.wheelContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.wheelLabel, { color: colors.mutedForeground }]}>weight</Text>
              <WheelPicker
                data={weightData}
                value={weight}
                onValueChanged={({ item }) => {
                  setWeight(item.value);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.weight;
                    return next;
                  });
                }}
                style={styles.wheelPicker}
                itemTextStyle={styles.wheelText}
              />
              
              <View style={styles.unitContainer}>
                <UnitButton unit="kg" />
                <UnitButton unit="g" />
                <UnitButton unit="lbs" />
              </View>
            </View>

            {errors.weight && (
              <Text style={styles.errorText}>{errors.weight}</Text>
            )}

            {/* Calculate Button */}
            <TouchableOpacity
              style={[styles.calculateButton, { backgroundColor: SALMON }]}
              activeOpacity={0.8}
              onPress={calculateBMI}
            >
              <Text style={styles.calculateText}>Calculate BMI</Text>
            </TouchableOpacity>

            {/* Reset Button */}
            {result && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetCalculator}
              >
                <Text style={[styles.resetText, { color: SALMON }]}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Result Card */}
          {result && (
            <View style={[styles.resultCard, { backgroundColor: SALMON }]}>
              <Text style={styles.resultLabel}>Your BMI</Text>
              <Text style={styles.bmiValue}>{result.bmi}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{result.title}</Text>
              </View>
              <Text style={styles.description}>{result.description}</Text>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#FFFFFF' }]}
                onPress={saveBMIRecord}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={SALMON} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: SALMON }]}>SAVE TO HISTORY</Text>
                )}
              </TouchableOpacity>

              {saveSuccess && (
                <Text style={styles.successText}>Saved successfully!</Text>
              )}

              {errors.save && (
                <Text style={styles.errorText}>{errors.save}</Text>
              )}

              {/* BMI Scale */}
              <View style={styles.scaleContainer}>
                <View style={styles.scaleBar}>
                  <View style={[styles.scaleSegment, { flex: 18.5, backgroundColor: '#60A5FA' }]} />
                  <View style={[styles.scaleSegment, { flex: 6.5, backgroundColor: '#22C55E' }]} />
                  <View style={[styles.scaleSegment, { flex: 5, backgroundColor: '#FACC15' }]} />
                  <View style={[styles.scaleSegment, { flex: 10, backgroundColor: '#F87171' }]} />
                </View>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleText}>18.5</Text>
                  <Text style={styles.scaleText}>25</Text>
                  <Text style={styles.scaleText}>30+</Text>
                </View>
              </View>
            </View>
          )}

          {/* History Section */}
          <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.historyTitle, { color: colors.foreground }]}>BMI History</Text>
            
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading history...</Text>
              </View>
            ) : history.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No BMI records yet. Calculate and save your first BMI!
              </Text>
            ) : (
              <View style={styles.historyList}>
                {history.map((record) => (
                  <View key={record.id} style={[styles.historyItem, { borderColor: colors.border }]}>
                    <View>
                      <Text style={[styles.historyBMI, { color: colors.foreground }]}>
                        {record.bmi.toFixed(1)}
                      </Text>
                      <Text style={[styles.historyCategory, { color: colors.mutedForeground }]}>
                        {record.category}
                      </Text>
                    </View>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                      {new Date(record.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>BMI ranges</Text>

            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoName, { color: colors.foreground }]}>Underweight</Text>
              <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>Below 18.5</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoName, { color: colors.foreground }]}>Healthy</Text>
              <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>18.5 – 24.9</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoName, { color: colors.foreground }]}>Overweight</Text>
              <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>25 – 29.9</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoName, { color: colors.foreground }]}>Obesity</Text>
              <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>30+</Text>
            </View>
          </View>

          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            BMI is a screening measure and does not directly measure body fat or overall health.
          </Text>
        </ScreenScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  headerSpacer: { width: 40 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: { fontSize: 28 },
  cardTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  unitButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  unitTextActive: {
    color: '#111827',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 9,
  },
  wheelContainer: {
    height: 200,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelContainerHalf: {
    flex: 1,
  },
  wheelLabel: {
    position: 'absolute',
    top: 12,
    left: 16,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wheelPicker: {
    flex: 1,
    height: 160,
  },
  wheelText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unitContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 11,
    padding: 3,
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  heightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  separator: {
    fontSize: 20,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  calculateButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calculateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
  },
  resultLabel: {
    color: '#D1FAE5',
    fontSize: 14,
    fontWeight: '600',
  },
  bmiValue: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '800',
    marginVertical: 4,
  },
  categoryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 14,
  },
  categoryText: {
    color: SALMON,
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    color: '#E5F5EC',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  successText: {
    color: '#22C55E',
    fontSize: 12,
    marginBottom: 12,
  },
  scaleContainer: {
    width: '100%',
    marginTop: 16,
  },
  scaleBar: {
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  scaleSegment: {
    marginRight: 2,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleText: {
    color: '#D1FAE5',
    fontSize: 10,
  },
  historyCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  historyTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 1,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 13,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyBMI: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
  },
  historyCategory: {
    fontSize: 12,
  },
  historyDate: {
    fontSize: 12,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  infoTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoName: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 15,
  },
  lockedWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  lockedTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
  },
  lockedBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default BMICalculatorScreen;