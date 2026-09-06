import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Card from './Card';
import Button from './Button';

interface Question {
  id: string;
  question: string;
  icon: string;
  options: { label: string; value: number }[];
}

const questions: Question[] = [
  {
    id: 'activity',
    question: 'How often do you exercise per week?',
    icon: '🏃',
    options: [
      { label: 'Never', value: 1 },
      { label: '1-2 times', value: 2 },
      { label: '3-4 times', value: 3 },
      { label: '5+ times', value: 4 },
    ],
  },
  {
    id: 'cardio',
    question: 'How would you rate your cardiovascular endurance?',
    icon: '❤️',
    options: [
      { label: 'Poor - I get winded easily', value: 1 },
      { label: 'Fair - Can do light cardio', value: 2 },
      { label: 'Good - Can run 20+ mins', value: 3 },
      { label: 'Excellent - High endurance', value: 4 },
    ],
  },
  {
    id: 'strength',
    question: 'How would you rate your strength level?',
    icon: '💪',
    options: [
      { label: 'Beginner - Never lifted', value: 1 },
      { label: 'Some experience', value: 2 },
      { label: 'Intermediate', value: 3 },
      { label: 'Advanced', value: 4 },
    ],
  },
  {
    id: 'goals',
    question: 'What is your primary fitness goal?',
    icon: '🎯',
    options: [
      { label: 'Lose weight', value: 1 },
      { label: 'Build muscle', value: 2 },
      { label: 'Improve endurance', value: 3 },
      { label: 'Overall fitness', value: 4 },
    ],
  },
];

interface FitnessResult {
  level: string;
  score: number;
  recommendation: string;
  plan: string;
  color: string;
}

const FitnessAssessment: React.FC = () => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<FitnessResult | null>(null);

  const calculateResult = (finalAnswers: Record<string, number>) => {
    const totalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    let level: string;
    let recommendation: string;
    let plan: string;
    let color: string;

    if (percentage <= 25) {
      level = 'Beginner';
      recommendation = 'Start with our Basic membership to build a foundation.';
      plan = 'Basic';
      color = '#60A5FA';
    } else if (percentage <= 50) {
      level = 'Intermediate';
      recommendation = 'The Pro membership will help you reach your goals faster.';
      plan = 'Pro';
      color = '#FACC15';
    } else if (percentage <= 75) {
      level = 'Advanced';
      recommendation = "You're ready for our Pro or Elite membership with personal training.";
      plan = 'Pro';
      color = colors.primary;
    } else {
      level = 'Elite';
      recommendation = 'Our Elite membership with unlimited training is perfect for you.';
      plan = 'Elite';
      color = '#A78BFA';
    }

    setResult({ level, score: Math.round(percentage), recommendation, plan, color });
  };

  const handleAnswer = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      calculateResult(newAnswers);
    }
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const currentQuestion = questions[currentStep];

  return (
    <Card variant="glass">
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${colors.primary}20` }]}>
          <Text style={styles.icon}>🏋️</Text>
        </View>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>FITNESS ASSESSMENT</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Find your fitness level</Text>
        </View>
      </View>

      {!result ? (
        <>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              Question {currentStep + 1} of {questions.length}
            </Text>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {Math.round((currentStep / questions.length) * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(currentStep / questions.length) * 100}%`,
                },
              ]}
            />
          </View>

          <View style={styles.questionHeader}>
            <View style={[styles.questionIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={styles.icon}>{currentQuestion.icon}</Text>
            </View>
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {currentQuestion.question}
            </Text>
          </View>

          <View style={styles.options}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleAnswer(currentQuestion.id, option.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: answers[currentQuestion.id] === option.value
                      ? `${colors.primary}15`
                      : `${colors.secondary}50`,
                    borderColor: answers[currentQuestion.id] === option.value
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: colors.foreground }]}>{option.label}</Text>
                <Text style={[styles.optionArrow, { color: colors.mutedForeground }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultScore, { color: result.color }]}>{result.score}%</Text>
          <Text style={[styles.resultLevel, { color: result.color }]}>{result.level} Level</Text>

          <View style={styles.breakdown}>
            {questions.map((q) => (
              <View key={q.id} style={[styles.breakdownItem, { backgroundColor: `${colors.secondary}50` }]}>
                <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>
                  {q.icon} {q.id}
                </Text>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownTrack, { backgroundColor: colors.secondary }]}>
                    <View
                      style={[
                        styles.breakdownFill,
                        { backgroundColor: colors.primary, width: `${(answers[q.id] / 4) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={[styles.breakdownValue, { color: colors.foreground }]}>
                    {answers[q.id]}/4
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.recommendation, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
            <Text style={[styles.recommendPlan, { color: colors.primary }]}>
              Recommended Plan: {result.plan}
            </Text>
            <Text style={[styles.recommendText, { color: colors.mutedForeground }]}>
              {result.recommendation}
            </Text>
          </View>

          <Button title="Retake Assessment" onPress={resetAssessment} variant="outline" />
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
  icon: { fontSize: 22 },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
  subtitle: { fontSize: 13 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: { fontSize: 13 },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  questionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { flex: 1, fontSize: 16, fontWeight: '500' },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: { flex: 1, fontSize: 15 },
  optionArrow: { fontSize: 20 },
  resultContainer: { alignItems: 'center' },
  resultScore: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 56,
    marginBottom: 4,
  },
  resultLevel: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  breakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  breakdownItem: {
    width: '48%',
    borderRadius: 8,
    padding: 10,
  },
  breakdownLabel: { fontSize: 11, marginBottom: 6, textTransform: 'capitalize' },
  breakdownBar: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakdownTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: 3 },
  breakdownValue: { fontSize: 11, fontWeight: '600' },
  recommendation: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  recommendPlan: { fontWeight: '600', marginBottom: 4 },
  recommendText: { fontSize: 14 },
});

export default FitnessAssessment;
