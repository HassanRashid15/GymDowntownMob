import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepIndicator}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: isActive || isCompleted ? colors.primary : colors.secondary,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    { color: isActive || isCompleted ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {isCompleted ? '✓' : stepNumber}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isCompleted ? colors.primary : colors.border },
                  ]}
                />
              )}
            </View>
            <View style={styles.stepInfo}>
              <Text
                style={[
                  styles.stepTitle,
                  { color: isActive ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {step.title}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.mutedForeground }]}>
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 36,
    marginRight: 12,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  circleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 24,
    marginVertical: 4,
  },
  stepInfo: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
  },
});

export default Stepper;
