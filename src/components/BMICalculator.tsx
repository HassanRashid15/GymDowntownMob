import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Card from './Card';
import Button from './Button';
import Input from './Input';

type Unit = 'metric' | 'imperial';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
}

const BMICalculator: React.FC = () => {
  const { colors } = useTheme();
  const [unit, setUnit] = useState<Unit>('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [result, setResult] = useState<BMIResult | null>(null);

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setHeightFt('');
    setHeightIn('');
    setResult(null);
  };

  const calculateBMI = () => {
    let bmi: number;

    if (unit === 'metric') {
      const heightM = parseFloat(height) / 100;
      const weightKg = parseFloat(weight);
      if (!heightM || !weightKg) return;
      bmi = weightKg / (heightM * heightM);
    } else {
      const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn || '0');
      const weightLbs = parseFloat(weight);
      if (!totalInches || !weightLbs) return;
      bmi = (weightLbs / (totalInches * totalInches)) * 703;
    }

    let category: string;
    let color: string;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#60A5FA';
    } else if (bmi < 25) {
      category = 'Normal';
      color = colors.primary;
    } else if (bmi < 30) {
      category = 'Overweight';
      color = '#FACC15';
    } else {
      category = 'Obese';
      color = '#F87171';
    }

    setResult({ bmi, category, color });
  };

  return (
    <Card variant="glass">
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${colors.primary}20` }]}>
          <Text style={styles.icon}>🧮</Text>
        </View>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>BMI CALCULATOR</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Calculate your Body Mass Index
          </Text>
        </View>
      </View>

      <View style={styles.unitToggle}>
        <Button
          title="Metric (kg/cm)"
          onPress={() => { setUnit('metric'); resetCalculator(); }}
          variant={unit === 'metric' ? 'primary' : 'outline'}
          size="small"
          style={styles.unitButton}
        />
        <Button
          title="Imperial (lbs/ft)"
          onPress={() => { setUnit('imperial'); resetCalculator(); }}
          variant={unit === 'imperial' ? 'primary' : 'outline'}
          size="small"
          style={styles.unitButton}
        />
      </View>

      {unit === 'metric' ? (
        <>
          <Input label="Height (cm)" placeholder="e.g., 175" value={height} onChangeText={setHeight} keyboardType="numeric" />
          <Input label="Weight (kg)" placeholder="e.g., 70" value={weight} onChangeText={setWeight} keyboardType="numeric" />
        </>
      ) : (
        <>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="Feet" placeholder="5" value={heightFt} onChangeText={setHeightFt} keyboardType="numeric" />
            </View>
            <View style={styles.halfInput}>
              <Input label="Inches" placeholder="10" value={heightIn} onChangeText={setHeightIn} keyboardType="numeric" />
            </View>
          </View>
          <Input label="Weight (lbs)" placeholder="e.g., 154" value={weight} onChangeText={setWeight} keyboardType="numeric" />
        </>
      )}

      <Button title="Calculate BMI" onPress={calculateBMI} style={styles.calculateButton} />

      {result && (
        <View style={[styles.resultBox, { backgroundColor: `${colors.secondary}80` }]}>
          <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>Your BMI</Text>
          <Text style={[styles.resultValue, { color: result.color }]}>{result.bmi.toFixed(1)}</Text>
          <Text style={[styles.resultCategory, { color: result.color }]}>{result.category}</Text>

          <View style={styles.scaleContainer}>
            <View style={styles.scaleBar}>
              <View style={[styles.scaleSegment, { backgroundColor: '#60A5FA' }]} />
              <View style={[styles.scaleSegment, { backgroundColor: colors.primary }]} />
              <View style={[styles.scaleSegment, { backgroundColor: '#FACC15' }]} />
              <View style={[styles.scaleSegment, { backgroundColor: '#F87171' }]} />
              <View
                style={[
                  styles.scaleIndicator,
                  {
                    left: `${Math.min(Math.max((result.bmi - 15) / 25 * 100, 0), 100)}%`,
                    backgroundColor: colors.foreground,
                  },
                ]}
              />
            </View>
            <View style={styles.scaleLabels}>
              {['15', '18.5', '25', '30', '40'].map((label) => (
                <Text key={label} style={[styles.scaleLabel, { color: colors.mutedForeground }]}>{label}</Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
  subtitle: { fontSize: 13 },
  unitToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  unitButton: { flex: 1 },
  row: { flexDirection: 'row', gap: 8 },
  halfInput: { flex: 1 },
  calculateButton: { marginBottom: 16 },
  resultBox: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  resultLabel: { fontSize: 14, marginBottom: 4 },
  resultValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    marginBottom: 4,
  },
  resultCategory: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  scaleContainer: { width: '100%' },
  scaleBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  scaleSegment: { flex: 1 },
  scaleIndicator: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: -8,
    marginLeft: -8,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleLabel: { fontSize: 11 },
});

export default BMICalculator;
