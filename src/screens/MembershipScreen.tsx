import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import ScreenScrollView from '../components/ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription, useGymPlanAccess } from '../context/SubscriptionContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BMICalculator from '../components/BMICalculator';
import FitnessAssessment from '../components/FitnessAssessment';
import GradientText from '../components/GradientText';
import SuperAdminSubscriptionsView from '../components/SuperAdminSubscriptionsView';
import { membershipPlans, membershipFaqs, memberBenefits } from '../data/membership';
import {
  formatLimit,
  formatAccessTier,
  formatLocationLimit,
  formatTrainerLimit,
  formatRevenueTier,
  getGymPlanById,
  gymSubscriptionFaqs,
  gymSubscriptionPlans,
} from '../data/gymSubscription';
import { getMembershipMe, getGymTrainers, isHubApiConfigured, updateHubProfile, type MembershipMe, type GymTrainer } from '../api/hub';
import MemberBillingCard from '../components/MemberBillingCard';

const SALMON = '#E88E83';

const UsageMeter = ({
  label,
  used,
  limit,
  colors,
}: {
  label: string;
  used: number;
  limit: number | 'unlimited';
  colors: any;
}) => {
  const max = limit === 'unlimited' ? used || 1 : limit;
  const percent = limit === 'unlimited' ? 35 : Math.min((used / max) * 100, 100);

  return (
    <View style={styles.usageBlock}>
      <View style={styles.usageHeader}>
        <Text style={[styles.usageLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.usageValue, { color: colors.foreground }]}>
          {used} / {formatLimit(limit)}
        </Text>
      </View>
      <View style={[styles.usageTrack, { backgroundColor: colors.secondary }]}>
        <View style={[styles.usageFill, { width: `${percent}%`, backgroundColor: SALMON }]} />
      </View>
    </View>
  );
};

const AdminSubscriptionView: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { gymSubscription, hasGymSubscription, subscribe, changePlan, cancelSubscription } =
    useSubscription();
  const {
    hasLimitedEquipment,
    revenueAnalyticsTier,
    revenueDetails,
    equipmentCheckLimit,
  } = useGymPlanAccess();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    gymSubscription?.billingPeriod ?? 'monthly'
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(gymSubscription?.planId ?? null);
  const [gymName, setGymName] = useState(gymSubscription?.gymName ?? 'Forge Downtown');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [manageMode, setManageMode] = useState(!hasGymSubscription);

  const getPrice = (price: number) =>
    billingPeriod === 'yearly' ? Math.round(price * 0.8) : price;

  const currentPlan = gymSubscription ? getGymPlanById(gymSubscription.planId) : null;

  const handleSubscribe = async (planId?: string) => {
    const nextPlan = planId ?? selectedPlan;
    if (!nextPlan) {
      Alert.alert('Select a plan', 'Choose a platform plan for your gym.');
      return;
    }
    if (!gymName.trim()) {
      Alert.alert('Gym name required', 'Enter your gym or facility name.');
      return;
    }

    if (hasGymSubscription) {
      await changePlan(nextPlan, billingPeriod);
      Alert.alert('Plan updated', 'Your gym subscription has been updated.');
      setManageMode(false);
    } else {
      await subscribe({ gymName: gymName.trim(), planId: nextPlan, billingPeriod });
      Alert.alert(
        'Subscription active',
        `${gymName.trim()} is now on Forge. Manage members and trainers from your command center.`
      );
      setManageMode(false);
    }
    setSelectedPlan(nextPlan);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel subscription?',
      'Your gym will lose owner dashboard access at the end of the billing period.',
      [
        { text: 'Keep plan', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelSubscription();
            setManageMode(true);
            setSelectedPlan(null);
          },
        },
      ]
    );
  };

  const renewDate = gymSubscription
    ? new Date(gymSubscription.renewsAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }}>
      <View style={[styles.hero, { backgroundColor: colors.card }]}>
        <View style={[styles.glowBlob, { backgroundColor: `${colors.primary}10` }]} />
        <View style={styles.heroTitleRow}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>GYM PLATFORM </Text>
          <GradientText style={styles.heroTitle}>SUBSCRIPTION</GradientText>
        </View>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          Subscribe as a gym owner to unlock your command center, member limits, and staff access for your facility.
        </Text>
      </View>

      {hasGymSubscription && currentPlan && !manageMode ? (
        <View style={styles.manageSection}>
          <View style={[styles.manageCard, { backgroundColor: colors.card, borderColor: `${SALMON}66` }]}>
            <Text style={[styles.manageEyebrow, { color: SALMON }]}>ACTIVE SUBSCRIPTION</Text>
            <Text style={[styles.manageGymName, { color: colors.foreground }]}>{gymSubscription!.gymName}</Text>
            <Text style={[styles.managePlanName, { color: colors.foreground }]}>{currentPlan.name}</Text>
            <Text style={[styles.manageRenew, { color: colors.mutedForeground }]}>
              Renews {renewDate} · {gymSubscription!.billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} billing
            </Text>

            <UsageMeter
              label="ACTIVE MEMBERS"
              used={gymSubscription!.activeMemberCount}
              limit={currentPlan.memberLimit}
              colors={colors}
            />
            <UsageMeter
              label="TRAINERS"
              used={gymSubscription!.activeTrainerCount}
              limit={currentPlan.trainerLimit}
              colors={colors}
            />

            {currentPlan.capabilities.equipmentAccess !== 'none' ? (
              <UsageMeter
                label="EQUIPMENT CHECKED"
                used={gymSubscription!.equipmentCheckedCount ?? 0}
                limit={currentPlan.capabilities.equipmentCheckLimit}
                colors={colors}
              />
            ) : null}

            <View style={[styles.accessCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.accessTitle, { color: colors.foreground }]}>YOUR GYM ACCESS</Text>
              <Text style={[styles.accessMeta, { color: colors.mutedForeground }]}>
                {formatLocationLimit(currentPlan.capabilities.locationLimit)} ·{' '}
                {gymSubscription!.locationCount ?? 1} in use
              </Text>
              <Text style={[styles.accessItem, { color: SALMON }]}>
                ◆ Revenue analytics: {formatRevenueTier(revenueAnalyticsTier)} ({revenueDetails.growth} growth)
              </Text>
              {hasLimitedEquipment ? (
                <Text style={[styles.accessItem, { color: SALMON }]}>
                  ◆ Equipment checking: up to {formatLimit(equipmentCheckLimit)} assets (limited)
                </Text>
              ) : null}
              {currentPlan.features
                .filter((feature) => feature.included)
                .map((feature) => (
                  <Text key={feature.name} style={[styles.accessItem, { color: colors.mutedForeground }]}>
                    ✓ {feature.name}
                    {feature.limited ? ' (limited)' : ''}
                  </Text>
                ))}
            </View>

            <View style={styles.manageActions}>
              <Button title="Change Plan" onPress={() => setManageMode(true)} style={styles.manageButton} />
              <Button
                title="Open Command Center"
                onPress={() => navigation.navigate('Home')}
                variant="outline"
                style={styles.manageButton}
              />
            </View>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={[styles.cancelLink, { color: colors.mutedForeground }]}>Cancel subscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.gymNameSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.gymNameLabel, { color: colors.foreground }]}>YOUR GYM NAME</Text>
            <TextInput
              value={gymName}
              onChangeText={setGymName}
              placeholder="e.g. Forge Downtown"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.gymNameInput,
                {
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />
            <Text style={[styles.gymNameHint, { color: colors.mutedForeground }]}>
              Members and trainers join under this gym once your plan is active.
            </Text>
          </View>

          <View style={styles.billingSection}>
            <Text
              style={[
                styles.billingLabel,
                { color: billingPeriod === 'monthly' ? colors.foreground : colors.mutedForeground },
              ]}
            >
              Monthly
            </Text>
            <TouchableOpacity
              onPress={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              style={[styles.toggle, { backgroundColor: colors.secondary }]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    backgroundColor: colors.primary,
                    left: billingPeriod === 'yearly' ? 28 : 4,
                  },
                ]}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.billingLabel,
                { color: billingPeriod === 'yearly' ? colors.foreground : colors.mutedForeground },
              ]}
            >
              Yearly <Text style={{ color: colors.primary, fontSize: 12 }}>(Save 20%)</Text>
            </Text>
          </View>

          <View style={styles.plansSection}>
            {gymSubscriptionPlans.map((plan) => (
              <TouchableOpacity key={plan.id} onPress={() => setSelectedPlan(plan.id)} activeOpacity={0.9}>
                <Card
                  variant="glass"
                  style={{
                    ...(selectedPlan === plan.id || plan.popular
                      ? { borderColor: colors.primary, borderWidth: 2 }
                      : {}),
                  }}
                >
                  {plan.popular ? (
                    <Badge variant="primary" style={styles.popularBadge}>
                      BEST FOR GROWING GYMS
                    </Badge>
                  ) : null}
                  <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                  <Text style={[styles.planDescription, { color: colors.mutedForeground }]}>
                    {plan.description}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: colors.foreground }]}>${getPrice(plan.price)}</Text>
                    <Text style={[styles.period, { color: colors.mutedForeground }]}>/{plan.period}</Text>
                  </View>
                  <Text style={[styles.planLimits, { color: SALMON }]}>
                    {formatLimit(plan.memberLimit)} members · {formatTrainerLimit(plan.trainerLimit)} ·{' '}
                    {formatLocationLimit(plan.capabilities.locationLimit)}
                  </Text>
                  <Text style={[styles.planCapabilityLine, { color: colors.mutedForeground }]}>
                    Equipment: {formatAccessTier(plan.capabilities.equipmentAccess)}
                    {plan.capabilities.equipmentAccess === 'limited'
                      ? ` (${formatLimit(plan.capabilities.equipmentCheckLimit)} assets)`
                      : ''}
                    {' · '}Revenue: {formatRevenueTier(plan.capabilities.revenueAnalyticsTier)}
                  </Text>
                  <View style={styles.features}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.feature}>
                        <Text
                          style={[
                            styles.featureIcon,
                            { color: feature.included ? colors.primary : colors.mutedForeground },
                          ]}
                        >
                          {feature.included ? '✓' : '✗'}
                        </Text>
                        <Text
                          style={[
                            styles.featureText,
                            {
                              color: feature.included ? colors.foreground : colors.mutedForeground,
                              opacity: feature.included ? 1 : 0.5,
                            },
                          ]}
                        >
                          {feature.name}
                          {feature.limited ? ' (limited)' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Button
                    title={hasGymSubscription ? 'Switch to this plan' : 'Subscribe as owner'}
                    onPress={() => handleSubscribe(plan.id)}
                    variant={plan.popular ? 'primary' : 'outline'}
                    style={styles.planButton}
                  />
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {hasGymSubscription ? (
            <TouchableOpacity onPress={() => setManageMode(false)} style={styles.backToManage}>
              <Text style={[styles.backToManageText, { color: SALMON }]}>← Back to manage subscription</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: 'center', marginBottom: 20 }]}>
          OWNER FAQ
        </Text>
        {gymSubscriptionFaqs.map((faq, index) => (
          <Card key={index} variant="glass" style={styles.faqCard}>
            <TouchableOpacity
              onPress={() => setOpenFaq(openFaq === index ? null : index)}
              style={styles.faqHeader}
            >
              <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{faq.question}</Text>
              <Text style={[styles.faqToggle, { color: colors.primary }]}>
                {openFaq === index ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {openFaq === index ? (
              <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.answer}</Text>
            ) : null}
          </Card>
        ))}
      </View>
    </ScreenScrollView>
  );
};

const MemberSubscriptionView: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<MembershipMe | null>(null);
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [preferredTrainerId, setPreferredTrainerId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isHubApiConfigured()) return;
    getMembershipMe()
      .then(async (me) => {
        setBilling(me);
        setPreferredTrainerId(me.preferredTrainerId ?? null);
        if (me.gymOwnerId) {
          const t = await getGymTrainers(me.gymOwnerId).catch(() => ({ trainers: [] }));
          setTrainers(t.trainers || []);
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  const getPrice = (price: number) =>
    billingPeriod === 'yearly' ? Math.round(price * 0.8) : price;

  const handleSubscribe = () => {
    if (!selectedPlan) return;
      if (isAuthenticated) {
        navigation.navigate('Dashboard');
      } else {
        navigation.navigate('Register');
    }
  };

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }}>
      <View style={[styles.hero, { backgroundColor: colors.card }]}>
        <View style={[styles.glowBlob, { backgroundColor: `${colors.primary}10` }]} />
        <View style={styles.heroTitleRow}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>MEMBERSHIP </Text>
          <GradientText style={styles.heroTitle}>PLANS</GradientText>
        </View>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          Choose the plan that fits your lifestyle. All memberships include access to our premium facilities.
        </Text>
      </View>

      {billing?.hasGym ? (
        <View style={{ marginHorizontal: 20, marginBottom: 8 }}>
          <MemberBillingCard billing={billing} />
          <Card>
          <TouchableOpacity onPress={() => navigation.navigate('Attendance')} style={{ marginTop: 4 }}>
            <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', letterSpacing: 1 }}>
              CHECK IN →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GymDetail', { ownerId: billing.gymOwnerId })
            }
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', letterSpacing: 1 }}>
              PREFERRED TRAINER / GYM →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('LiveClasses')} style={{ marginTop: 8 }}>
            <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', letterSpacing: 1 }}>
              BOOK CLASSES →
            </Text>
          </TouchableOpacity>
          {trainers.length > 0 ? (
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 }}>
                PREFERRED TRAINER
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  setPreferredTrainerId(null);
                  await updateHubProfile({ preferred_trainer_id: null }).catch(() => undefined);
                }}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: !preferredTrainerId ? SALMON : colors.mutedForeground }}>
                  {!preferredTrainerId ? '● ' : '○ '}No trainer
                </Text>
              </TouchableOpacity>
              {trainers.map((t) => (
                <TouchableOpacity
                  key={t.userId}
                  onPress={async () => {
                    setPreferredTrainerId(t.userId);
                    await updateHubProfile({ preferred_trainer_id: t.userId }).catch((e: any) =>
                      Alert.alert('Error', e?.message || 'Could not save trainer')
                    );
                  }}
                  style={{ marginTop: 6 }}
                >
                  <Text
                    style={{
                      color: preferredTrainerId === t.userId ? SALMON : colors.mutedForeground,
                    }}
                  >
                    {preferredTrainerId === t.userId ? '● ' : '○ '}
                    {t.fullName || 'Trainer'}
                    {t.specialization ? ` · ${t.specialization}` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </Card>
        </View>
      ) : null}

      <View style={styles.billingSection}>
        <Text style={[styles.billingLabel, { color: billingPeriod === 'monthly' ? colors.foreground : colors.mutedForeground }]}>
          Monthly
        </Text>
          <TouchableOpacity
          onPress={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          style={[styles.toggle, { backgroundColor: colors.secondary }]}
        >
          <View
            style={[
              styles.toggleKnob,
              {
                backgroundColor: colors.primary,
                left: billingPeriod === 'yearly' ? 28 : 4,
              },
            ]}
          />
        </TouchableOpacity>
        <Text style={[styles.billingLabel, { color: billingPeriod === 'yearly' ? colors.foreground : colors.mutedForeground }]}>
          Yearly <Text style={{ color: colors.primary, fontSize: 12 }}>(Save 20%)</Text>
        </Text>
      </View>

      <View style={styles.plansSection}>
        {membershipPlans.map((plan) => (
          <TouchableOpacity key={plan.id} onPress={() => setSelectedPlan(plan.id)} activeOpacity={0.9}>
            <Card
              variant="glass"
              style={{
                ...(selectedPlan === plan.id || plan.popular
                  ? { borderColor: colors.primary, borderWidth: 2 }
                  : {}),
              }}
            >
              {plan.popular ? (
              <Badge variant="primary" style={styles.popularBadge}>
                  ✨ MOST POPULAR
              </Badge>
              ) : null}
            <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
              <Text style={[styles.planDescription, { color: colors.mutedForeground }]}>
                {plan.description}
              </Text>
            <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.foreground }]}>${getPrice(plan.price)}</Text>
                <Text style={[styles.period, { color: colors.mutedForeground }]}>/{plan.period}</Text>
            </View>
            <View style={styles.features}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                    <Text style={[styles.featureIcon, { color: feature.included ? colors.primary : colors.mutedForeground }]}>
                      {feature.included ? '✓' : '✗'}
                    </Text>
                    <Text
                      style={[
                        styles.featureText,
                        {
                          color: feature.included ? colors.foreground : colors.mutedForeground,
                          opacity: feature.included ? 1 : 0.5,
                        },
                      ]}
                    >
                      {feature.name}
                    </Text>
                </View>
              ))}
            </View>
              <Button
                title="Get Started"
                onPress={() => {
                  setSelectedPlan(plan.id);
                  handleSubscribe();
                }}
                variant={plan.popular ? 'primary' : 'outline'}
                style={styles.planButton}
              />
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>ASSESS YOUR </Text>
          <GradientText style={styles.sectionTitle}>FITNESS</GradientText>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          Use our free tools to understand your current fitness level and find the perfect membership plan.
        </Text>
        <BMICalculator />
        <FitnessAssessment />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: 'center' }]}>
          ALL MEMBERS GET
        </Text>
        <View style={styles.benefitsGrid}>
          {memberBenefits.map((item) => (
            <View key={item} style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={{ color: colors.primary, fontSize: 20 }}>✓</Text>
              </View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: 'center', marginBottom: 20 }]}>
          FAQ
        </Text>
        {membershipFaqs.map((faq, index) => (
          <Card key={index} variant="glass" style={styles.faqCard}>
            <TouchableOpacity
              onPress={() => setOpenFaq(openFaq === index ? null : index)}
              style={styles.faqHeader}
            >
              <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{faq.question}</Text>
              <Text style={[styles.faqToggle, { color: colors.primary }]}>
                {openFaq === index ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {openFaq === index ? (
              <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.answer}</Text>
            ) : null}
          </Card>
        ))}
      </View>

      <View style={[styles.ctaSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.ctaTitle, { color: colors.foreground }]}>STILL HAVE QUESTIONS?</Text>
        <Text style={[styles.ctaDescription, { color: colors.mutedForeground }]}>
          Our team is here to help you choose the right plan for your fitness goals.
        </Text>
        <Button title="Contact Us" onPress={() => navigation.navigate('Contact')} size="large" />
      </View>
    </ScreenScrollView>
  );
};

const MembershipScreen: React.FC = ({ navigation }: any) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  if (isSuperAdmin) {
    return <SuperAdminSubscriptionsView />;
  }
  return isAdmin ? (
    <AdminSubscriptionView navigation={navigation} />
  ) : (
    <MemberSubscriptionView navigation={navigation} />
  );
};

const styles = StyleSheet.create({
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
  gymNameSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gymNameLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  gymNameInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginBottom: 8,
  },
  gymNameHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  billingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  billingLabel: { fontSize: 15 },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleKnob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  plansSection: { padding: 16 },
  popularBadge: { alignSelf: 'center', marginBottom: 12 },
  planName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    marginBottom: 4,
  },
  planDescription: { fontSize: 14, marginBottom: 12 },
  planLimits: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  planCapabilityLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  price: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 44,
  },
  period: { fontSize: 16, marginLeft: 4 },
  features: { gap: 8, marginBottom: 16 },
  feature: { flexDirection: 'row', alignItems: 'flex-start' },
  featureIcon: { fontSize: 16, marginRight: 10, marginTop: 2, fontWeight: '700' },
  featureText: { fontSize: 14, flex: 1 },
  planButton: { marginTop: 4 },
  manageSection: { padding: 16 },
  manageCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  manageEyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  manageGymName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 30,
    letterSpacing: 1,
    marginBottom: 4,
  },
  managePlanName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  manageRenew: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 18,
  },
  usageBlock: { marginBottom: 14 },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  usageLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  usageValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  usageTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 4,
  },
  accessCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
    marginBottom: 18,
    gap: 6,
  },
  accessTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  accessMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginBottom: 8,
  },
  accessItem: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  manageActions: {
    gap: 10,
    marginBottom: 12,
  },
  manageButton: { width: '100%' },
  cancelLink: {
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  backToManage: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  backToManageText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  section: { padding: 24 },
  sectionTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionSubtitle: { fontSize: 16, marginBottom: 20, lineHeight: 24 },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  benefitItem: { alignItems: 'center', width: '45%', marginBottom: 20 },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  benefitText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  faqCard: { padding: 0, overflow: 'hidden' },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 12 },
  faqToggle: { fontSize: 22, fontWeight: '300' },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, fontSize: 14, lineHeight: 22 },
  ctaSection: { padding: 32, alignItems: 'center' },
  ctaTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: { fontSize: 16, textAlign: 'center', marginBottom: 24, maxWidth: 320 },
});

export default MembershipScreen;
