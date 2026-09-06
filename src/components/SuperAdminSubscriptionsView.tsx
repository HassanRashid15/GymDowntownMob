import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenScrollView from './ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { usePlatformUsers } from '../context/PlatformUsersContext';
import { getUserDisplayName } from '../types/user';
import {
  formatAccessTier,
  formatLimit,
  formatLocationLimit,
  formatRevenueTier,
  getGymPlanById,
  GymOwnerSubscriptionRecord,
  revenueTierDetails,
} from '../data/gymSubscription';
import { loadGymOwnerSubscriptions } from '../data/gymSubscriptionsRegistry';
import GradientText from './GradientText';

const SALMON = '#E88E83';

type AdminPlanRow = {
  adminId: string;
  adminName: string;
  adminEmail: string;
  gymName: string;
  subscription: GymOwnerSubscriptionRecord | null;
};

const SuperAdminSubscriptionsView: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { users } = usePlatformUsers();
  const [subscriptions, setSubscriptions] = useState<GymOwnerSubscriptionRecord[]>([]);
  const [selected, setSelected] = useState<AdminPlanRow | null>(null);

  const loadSubscriptions = useCallback(async () => {
    const records = await loadGymOwnerSubscriptions();
    setSubscriptions(records);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [loadSubscriptions])
  );

  const adminRows = useMemo<AdminPlanRow[]>(() => {
    const activeByOwner = new Map(
      subscriptions.filter((entry) => entry.status === 'active').map((entry) => [entry.ownerId, entry])
    );

    return users
      .filter((user) => user.role === 'admin')
      .map((admin) => ({
        adminId: admin.id,
        adminName: getUserDisplayName(admin),
        adminEmail: admin.email,
        gymName: admin.gymName ?? 'Unassigned gym',
        subscription: activeByOwner.get(admin.id) ?? null,
      }))
      .sort((a, b) => a.adminName.localeCompare(b.adminName));
  }, [subscriptions, users]);

  const selectedPlan = selected?.subscription ? getGymPlanById(selected.subscription.planId) : null;
  const renewDate = selected?.subscription
    ? new Date(selected.subscription.renewsAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const usageRows = selected?.subscription && selectedPlan
    ? [
        { label: 'Active members', value: `${selected.subscription.activeMemberCount} / ${formatLimit(selectedPlan.memberLimit)}` },
        { label: 'Trainers', value: `${selected.subscription.activeTrainerCount} / ${formatLimit(selectedPlan.trainerLimit)}` },
        { label: 'Locations', value: `${selected.subscription.locationCount ?? 1} / ${formatLocationLimit(selectedPlan.capabilities.locationLimit)}` },
        {
          label: 'Equipment tracked',
          value:
            selectedPlan.capabilities.equipmentAccess === 'none'
              ? 'Not included'
              : `${selected.subscription.equipmentCheckedCount ?? 0} / ${formatLimit(selectedPlan.capabilities.equipmentCheckLimit)}`,
        },
        {
          label: 'Revenue analytics',
          value: formatRevenueTier(selectedPlan.capabilities.revenueAnalyticsTier),
        },
      ]
    : [];

  const featureRows = selectedPlan
    ? selectedPlan.features.map((feature) => ({
        feature: feature.name,
        status: feature.included ? (feature.limited ? 'Limited' : 'Included') : 'Not included',
        notes: feature.limited ? 'Restricted on this tier' : feature.included ? 'Full access' : 'Upgrade required',
      }))
    : [];

  return (
    <View style={styles.screen}>
      <ScreenScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <View style={[styles.glowBlob, { backgroundColor: `${colors.primary}10` }]} />
          <View style={styles.heroTitleRow}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>GYM ADMIN </Text>
            <GradientText style={styles.heroTitle}>SUBSCRIPTIONS</GradientText>
          </View>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            Review which gym admin is on which platform plan. Tap an admin to open plan details.
          </Text>
        </View>

        <View style={[styles.table, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.tableHeader, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
            <Text style={[styles.colAdmin, styles.headerText, { color: colors.mutedForeground }]}>ADMIN</Text>
            <Text style={[styles.colGym, styles.headerText, { color: colors.mutedForeground }]}>GYM</Text>
            <Text style={[styles.colPlan, styles.headerText, { color: colors.mutedForeground }]}>PLAN</Text>
          </View>

          {adminRows.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No gym admins found.</Text>
            </View>
          ) : (
            adminRows.map((row, index) => {
              const plan = row.subscription ? getGymPlanById(row.subscription.planId) : null;
              return (
                <TouchableOpacity
                  key={row.adminId}
                  onPress={() => setSelected(row)}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: index < adminRows.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <View style={styles.colAdmin}>
                    <Text style={[styles.adminName, { color: colors.foreground }]}>{row.adminName}</Text>
                    <Text style={[styles.adminEmail, { color: colors.mutedForeground }]}>{row.adminEmail}</Text>
                  </View>
                  <Text style={[styles.colGym, styles.bodyText, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {row.gymName}
                  </Text>
                  <View style={styles.colPlan}>
                    {plan ? (
                      <View style={[styles.planBadge, { backgroundColor: `${SALMON}22`, borderColor: `${SALMON}55` }]}>
                        <Text style={[styles.planBadgeText, { color: SALMON }]}>{plan.name}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.noPlanText, { color: colors.mutedForeground }]}>No plan</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScreenScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setSelected(null)} />
          <View
            style={[
              styles.sheetCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>PLAN DETAILS</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>
              {selected?.adminName} · {selected?.gymName}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              {!selected?.subscription || !selectedPlan ? (
                <View style={[styles.emptyDetailCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Text style={[styles.emptyDetailTitle, { color: colors.foreground }]}>No active subscription</Text>
                  <Text style={[styles.emptyDetailBody, { color: colors.mutedForeground }]}>
                    This admin has not subscribed to a Forge platform plan yet.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={[styles.summaryCard, { borderColor: `${SALMON}55`, backgroundColor: `${SALMON}12` }]}>
                    <Text style={[styles.summaryPlan, { color: colors.foreground }]}>{selectedPlan.name}</Text>
                    <Text style={[styles.summaryMeta, { color: colors.mutedForeground }]}>
                      ${selectedPlan.price}/{selectedPlan.period} ·{' '}
                      {selected.subscription.billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} billing · Renews {renewDate}
                    </Text>
                    <Text style={[styles.summaryDescription, { color: colors.mutedForeground }]}>
                      {selectedPlan.description}
                    </Text>
                  </View>

                  <Text style={[styles.tableSectionTitle, { color: colors.mutedForeground }]}>USAGE & LIMITS</Text>
                  <View style={[styles.detailTable, { borderColor: colors.border }]}>
                    <View style={[styles.detailHeaderRow, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
                      <Text style={[styles.detailColMetric, styles.detailHeaderText, { color: colors.mutedForeground }]}>METRIC</Text>
                      <Text style={[styles.detailColValue, styles.detailHeaderText, { color: colors.mutedForeground }]}>VALUE</Text>
                    </View>
                    {usageRows.map((row, index) => (
                      <View
                        key={row.label}
                        style={[
                          styles.detailRow,
                          { borderBottomColor: colors.border, borderBottomWidth: index < usageRows.length - 1 ? 1 : 0 },
                        ]}
                      >
                        <Text style={[styles.detailColMetric, styles.detailMetric, { color: colors.foreground }]}>{row.label}</Text>
                        <Text style={[styles.detailColValue, styles.detailValue, { color: SALMON }]}>{row.value}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={[styles.tableSectionTitle, { color: colors.mutedForeground }]}>PLAN FEATURES</Text>
                  <View style={[styles.detailTable, { borderColor: colors.border }]}>
                    <View style={[styles.detailHeaderRow, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
                      <Text style={[styles.detailColFeature, styles.detailHeaderText, { color: colors.mutedForeground }]}>FEATURE</Text>
                      <Text style={[styles.detailColStatus, styles.detailHeaderText, { color: colors.mutedForeground }]}>STATUS</Text>
                      <Text style={[styles.detailColNotes, styles.detailHeaderText, { color: colors.mutedForeground }]}>NOTES</Text>
                    </View>
                    {featureRows.map((row, index) => (
                      <View
                        key={row.feature}
                        style={[
                          styles.detailRow,
                          { borderBottomColor: colors.border, borderBottomWidth: index < featureRows.length - 1 ? 1 : 0 },
                        ]}
                      >
                        <Text style={[styles.detailColFeature, styles.detailMetric, { color: colors.foreground }]}>{row.feature}</Text>
                        <Text
                          style={[
                            styles.detailColStatus,
                            styles.detailValue,
                            { color: row.status === 'Included' ? '#22C55E' : row.status === 'Limited' ? SALMON : colors.mutedForeground },
                          ]}
                        >
                          {row.status}
                        </Text>
                        <Text style={[styles.detailColNotes, styles.detailNotes, { color: colors.mutedForeground }]}>{row.notes}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.revenueCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.revenueTitle, { color: colors.foreground }]}>REVENUE SNAPSHOT</Text>
                    <Text style={[styles.revenueValue, { color: SALMON }]}>
                      {revenueTierDetails[selectedPlan.capabilities.revenueAnalyticsTier].sampleRevenue}
                    </Text>
                    <Text style={[styles.revenueGrowth, { color: colors.mutedForeground }]}>
                      {revenueTierDetails[selectedPlan.capabilities.revenueAnalyticsTier].growth} ·{' '}
                      {formatAccessTier(selectedPlan.capabilities.equipmentAccess)} equipment access
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity onPress={() => setSelected(null)} style={[styles.closeButton, { borderColor: colors.border }]}>
              <Text style={[styles.closeButtonText, { color: colors.foreground }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  hero: {
    padding: 24,
    paddingTop: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  glowBlob: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  heroTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 40,
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroSubtitle: { fontSize: 16, lineHeight: 24 },
  table: {
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  colAdmin: { flex: 1.2, minWidth: 0 },
  colGym: { flex: 1, minWidth: 0 },
  colPlan: { width: 108, alignItems: 'flex-end' },
  adminName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 2,
  },
  adminEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  planBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  noPlanText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textAlign: 'right',
  },
  emptyRow: { padding: 20, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 10,
    paddingHorizontal: 20,
    maxHeight: '90%',
    zIndex: 2,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 14,
  },
  sheetContent: { gap: 14, paddingBottom: 8 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  summaryPlan: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 1,
  },
  summaryMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  summaryDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  tableSectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  detailTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  detailHeaderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  detailColMetric: { flex: 1.1, minWidth: 0 },
  detailColValue: { flex: 1, minWidth: 0, textAlign: 'right' },
  detailColFeature: { flex: 1.2, minWidth: 0 },
  detailColStatus: { width: 72 },
  detailColNotes: { flex: 1, minWidth: 0 },
  detailMetric: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  detailValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  detailNotes: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  revenueCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  revenueTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  revenueValue: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    letterSpacing: 1,
  },
  revenueGrowth: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  emptyDetailCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  emptyDetailTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  emptyDetailBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
});

export default SuperAdminSubscriptionsView;
