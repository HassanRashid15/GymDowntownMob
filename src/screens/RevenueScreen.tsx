import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useGymPlanAccess } from '../context/SubscriptionContext';
import { revenueTierDetails } from '../data/gymSubscription';
import { getRevenueRowsForTier, RevenueRow } from '../data/revenue';
import { navigateBackOrTo } from '../navigation/navigationHelpers';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const trendColor = (trend: RevenueRow['trend']) => {
  if (trend === 'down') return '#F87171';
  if (trend === 'flat') return '#8C8C8C';
  return SALMON;
};

const RevenueScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { canViewAnalytics, revenueAnalyticsTier, revenueDetails, gymSubscription } = useGymPlanAccess();

  const rows = useMemo(
    () => getRevenueRowsForTier(revenueAnalyticsTier),
    [revenueAnalyticsTier]
  );

  const handleBack = () => {
    navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Home' } });
  };

  if (!canViewAnalytics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON }]}>REVENUE</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.lockedWrap}>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>REVENUE ANALYTICS LOCKED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Subscribe to a gym plan to view revenue breakdowns.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Join')}
            style={[styles.upgradeButton, { backgroundColor: SALMON }]}
          >
            <Text style={styles.upgradeButtonText}>VIEW PLANS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeftIcon color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: SALMON }]}>REVENUE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={[styles.eyebrow, { color: SALMON }]}>ADMIN · ANALYTICS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>REVENUE BREAKDOWN</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {gymSubscription?.gymName ?? 'Your gym'} · {revenueDetails.description}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                REV · TIER {revenueAnalyticsTier}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                {revenueDetails.sampleRevenue}
              </Text>
              <Text style={[styles.summaryTrend, { color: SALMON }]}>
                {revenueDetails.growth} vs last month
              </Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>TIER {revenueAnalyticsTier}</Text>
            </View>
          </View>
          <Text style={[styles.summaryHint, { color: colors.mutedForeground }]}>
            {revenueTierDetails[revenueAnalyticsTier].label}
          </Text>
        </View>

        <View style={[styles.table, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.tableRow, styles.tableHead, { borderBottomColor: colors.border }]}>
            <View style={styles.colSource}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>SOURCE</Text>
            </View>
            <View style={styles.colPeriod}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>PERIOD</Text>
            </View>
            <View style={styles.colRevenue}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>REVENUE</Text>
            </View>
            <View style={styles.colChange}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>CHANGE</Text>
            </View>
            <View style={styles.colShare}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>SHARE</Text>
            </View>
          </View>

          {rows.map((row, index) => {
            const isTotal = row.source === 'Total';
            return (
              <View
                key={row.id}
                style={[
                  styles.tableRow,
                  isTotal && styles.totalRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: index < rows.length - 1 ? 1 : 0,
                    backgroundColor: isTotal ? 'rgba(232,142,131,0.08)' : 'transparent',
                  },
                ]}
              >
                <View style={styles.colSource}>
                  <Text
                    style={[
                      styles.bodyText,
                      styles.sourceText,
                      { color: isTotal ? colors.foreground : colors.foreground },
                    ]}
                    numberOfLines={2}
                  >
                    {row.source}
                  </Text>
                </View>
                <View style={styles.colPeriod}>
                  <Text style={[styles.bodyText, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {row.period}
                  </Text>
                </View>
                <View style={styles.colRevenue}>
                  <Text style={[styles.bodyText, styles.revenueText, { color: colors.foreground }]}>
                    {row.revenue}
                  </Text>
                </View>
                <View style={styles.colChange}>
                  <Text style={[styles.bodyText, { color: trendColor(row.trend) }]}>{row.change}</Text>
                </View>
                <View style={styles.colShare}>
                  <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{row.share}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScreenScrollView>
    </View>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  hero: { marginBottom: 16 },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    gap: 10,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  summaryValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 40,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryTrend: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  summaryHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  tierBadge: {
    backgroundColor: 'rgba(232,142,131,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232,142,131,0.35)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tierBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    color: SALMON,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHead: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,142,131,0.25)',
  },
  headText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.7,
  },
  bodyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 15,
  },
  sourceText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  revenueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  colSource: {
    width: '28%',
    paddingRight: 6,
    minWidth: 0,
  },
  colPeriod: {
    width: '18%',
    paddingRight: 6,
    minWidth: 0,
  },
  colRevenue: {
    width: '20%',
    paddingRight: 6,
    minWidth: 0,
  },
  colChange: {
    width: '18%',
    minWidth: 0,
  },
  colShare: {
    width: '16%',
    minWidth: 0,
    alignItems: 'flex-end',
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
    textAlign: 'center',
  },
  lockedBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  upgradeButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  upgradeButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
});

export default RevenueScreen;
