import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';
import ScreenScrollView from '../components/ScreenScrollView';
import Card from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePlatformUsers } from '../context/PlatformUsersContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { getNameInitials } from '../utils/nameInitials';
import { getRoleLabel, UserRole, PlatformUser, UserGender, UserBloodGroup, USER_GENDER_OPTIONS, USER_BLOOD_GROUP_OPTIONS, getUserDisplayName, parseUserName } from '../types/user';
import { DEMO_CREDENTIALS, loadPasswords } from '../data/authUsers';
import { disableTwoFactorForUser, getTwoFactorSummary } from '../utils/twoFactorStorage';

const SALMON = '#E88E83';

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const roleColor = (role: UserRole) => {
  switch (role) {
    case 'super_admin':
      return '#FA1818';
    case 'admin':
      return SALMON;
    default:
      return '#8E8E93';
  }
};

const ADMIN_CREATABLE_ROLES: UserRole[] = ['super_admin', 'admin'];
const ALL_ROLE_OPTIONS: UserRole[] = ['super_admin', 'admin', 'customer'];

type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: UserGender | '';
  bloodGroup: UserBloodGroup | '';
  role: UserRole;
  gymName: string;
};

const emptyForm = (): UserFormState => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  bloodGroup: '',
  role: 'admin',
  gymName: 'Forge Gym',
});

type TwoFactorMap = Record<string, { enabled: boolean; label: string }>;

const UserManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isTabScreen = route.name === 'Users';
  const { user, isSuperAdmin } = useAuth();
  const { users, isLoading, createUser, updateUser, deleteUser, updateUserRole, updateUserStatus, stats } =
    usePlatformUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [passwordMap, setPasswordMap] = useState<Record<string, string>>({});
  const [twoFactorMap, setTwoFactorMap] = useState<TwoFactorMap>({});
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const loadPasswordsMap = useCallback(async () => {
    const passwords = await loadPasswords();
    setPasswordMap(passwords);
  }, []);

  const loadTwoFactorStatuses = useCallback(async () => {
    setTwoFactorLoading(true);
    const entries = await Promise.all(
      users.map(async (entry) => {
        const summary = await getTwoFactorSummary(entry.id);
        return [entry.id, { enabled: summary.enabled, label: summary.label }] as const;
      })
    );
    setTwoFactorMap(Object.fromEntries(entries));
    setTwoFactorLoading(false);
  }, [users]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadPasswordsMap();
    loadTwoFactorStatuses();
  }, [isSuperAdmin, loadPasswordsMap, loadTwoFactorStatuses]);

  useFocusEffect(
    useCallback(() => {
      if (!isSuperAdmin) return;
      loadTwoFactorStatuses();
    }, [isSuperAdmin, loadTwoFactorStatuses])
  );

  const handleBack = () => {
    navigateBackOrTo(navigation, { name: 'MainTabs', params: { screen: 'Users' } });
  };

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 2500);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (userId === user?.id && role !== 'super_admin') return;
    await updateUserRole(userId, role);
    showMessage(`Role updated to ${getRoleLabel(role)}.`);
  };

  const handleAccountStatusChange = async (userId: string, active: boolean) => {
    if (userId === user?.id && !active) {
      showMessage('You cannot suspend your own account.');
      return;
    }
    try {
      await updateUserStatus(userId, active ? 'active' : 'suspended');
      showMessage(active ? 'Account activated — user can sign in.' : 'Account suspended — sign-in blocked.');
    } catch (error: any) {
      showMessage(error.message ?? 'Could not update account status.');
    }
  };

  const handleTwoFactorToggle = async (userId: string, enabled: boolean) => {
    if (enabled) {
      showMessage('Users must enable 2FA from their own Account Security screen.');
      return;
    }
    try {
      await disableTwoFactorForUser(userId);
      await loadTwoFactorStatuses();
      showMessage('Two-factor authentication disabled for this user.');
    } catch (error: any) {
      showMessage(error.message ?? 'Could not update two-factor settings.');
    }
  };

  const openCreateForm = () => {
    setEditingUserId(null);
    setForm(emptyForm());
    setFormError('');
    setFormModalVisible(true);
  };

  const openEditForm = (entry: PlatformUser) => {
    const parsed = parseUserName(entry.name);
    setEditingUserId(entry.id);
    setForm({
      firstName: entry.firstName ?? parsed.firstName,
      lastName: entry.lastName ?? parsed.lastName,
      email: entry.email,
      password: '',
      phone: entry.phone ?? '',
      gender: entry.gender ?? '',
      bloodGroup: entry.bloodGroup ?? '',
      role: entry.role,
      gymName: entry.gymName ?? '',
    });
    setFormError('');
    setFormModalVisible(true);
  };

  const closeForm = () => {
    setFormModalVisible(false);
    setEditingUserId(null);
    setForm(emptyForm());
    setFormError('');
  };

  const handleSaveUser = async () => {
    setFormError('');
    if (!form.firstName.trim()) {
      setFormError('First name is required.');
      return;
    }
    if (!form.lastName.trim()) {
      setFormError('Last name is required.');
      return;
    }
    if (!form.email.trim()) {
      setFormError('Email is required.');
      return;
    }
    if (!form.phone.trim()) {
      setFormError('Phone number is required.');
      return;
    }
    if (!form.gender) {
      setFormError('Gender is required.');
      return;
    }
    if (!form.bloodGroup) {
      setFormError('Blood group is required.');
      return;
    }
    if (!editingUserId && !form.password.trim()) {
      setFormError('Password is required for new users.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password.trim() || undefined,
          phone: form.phone,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          role: form.role,
          gymName: form.gymName,
        });
        showMessage('User updated successfully.');
      } else {
        await createUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          role: form.role,
          gymName: form.gymName,
        });
        showMessage('User created successfully.');
      }
      await loadPasswordsMap();
      closeForm();
    } catch (error: any) {
      setFormError(error.message ?? 'Could not save user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === user?.id) {
      showMessage('You cannot delete your own account.');
      return;
    }
    setDeleteTarget({ id: userId, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      await loadPasswordsMap();
      if (editingUserId === deleteTarget.id) closeForm();
      showMessage(`${deleteTarget.name} removed from platform.`);
    } catch (error: any) {
      showMessage(error.message ?? 'Could not delete user.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => setDeleteTarget(null);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((entry) => {
      const matchesRole = roleFilter === 'all' || entry.role === roleFilter;
      const matchesSearch =
        !query ||
        getUserDisplayName(entry).toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        (entry.phone?.toLowerCase().includes(query) ?? false) ||
        (entry.gymName?.toLowerCase().includes(query) ?? false);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  if (!isSuperAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: SALMON }]}>USERS</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.lockedWrap}>
          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>ACCESS DENIED</Text>
          <Text style={[styles.lockedBody, { color: colors.mutedForeground }]}>
            Only super admins can manage platform users.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {!isTabScreen ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeftIcon color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <Text style={[styles.headerTitle, { color: SALMON }]}>USER MANAGEMENT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${SALMON}22` }]}>
            <UsersIcon color={SALMON} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>PLATFORM USERS</Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            Create admins, manage roles, status, and 2FA.
          </Text>
        </View>

        <View style={styles.formHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginBottom: 0 }]}>USER CRUD</Text>
          <TouchableOpacity onPress={openCreateForm} style={[styles.addButton, { backgroundColor: SALMON }]}>
            <Text style={styles.addButtonText}>+ ADD USER</Text>
          </TouchableOpacity>
        </View>

        {actionMessage ? (
          <View style={[styles.messageBanner, { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.12)' }]}>
            <Text style={styles.messageBannerText}>{actionMessage}</Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          {[
            { label: 'TOTAL', value: stats.total },
            { label: 'ADMINS', value: stats.admins + stats.superAdmins },
            { label: 'MEMBERS', value: stats.members },
            { label: 'SUSPENDED', value: stats.suspended },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DEMO CREDENTIALS</Text>
        <Card style={[styles.credentialsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {DEMO_CREDENTIALS.map((cred, index) => (
            <View key={cred.email}>
              <View style={styles.credentialRow}>
                <View style={[styles.credentialRoleBadge, { backgroundColor: `${roleColor(cred.role)}22`, borderColor: `${roleColor(cred.role)}55` }]}>
                  <Text style={[styles.credentialRoleText, { color: roleColor(cred.role) }]}>{getRoleLabel(cred.role)}</Text>
                </View>
                <View style={styles.credentialInfo}>
                  <Text style={[styles.credentialEmail, { color: colors.foreground }]}>{cred.email}</Text>
                  <Text style={[styles.credentialPassword, { color: colors.mutedForeground }]}>Password: {cred.password}</Text>
                </View>
              </View>
              {index < DEMO_CREDENTIALS.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              ) : null}
            </View>
          ))}
        </Card>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, phone, or gym..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <View style={styles.filterRow}>
          {(['all', 'super_admin', 'admin', 'customer'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setRoleFilter(filter)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: roleFilter === filter ? `${SALMON}22` : colors.card,
                  borderColor: roleFilter === filter ? SALMON : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterChipText, { color: roleFilter === filter ? SALMON : colors.mutedForeground }]}>
                {filter === 'all' ? 'ALL' : getRoleLabel(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading || twoFactorLoading ? (
          <ActivityIndicator color={SALMON} style={{ marginTop: 24 }} />
        ) : (
          filteredUsers.map((entry) => {
            const displayName = getUserDisplayName(entry);
            const initials = getNameInitials(displayName);
            const isCurrentUser = entry.id === user?.id;
            const password = passwordMap[entry.email.toLowerCase()];
            const twoFactor = twoFactorMap[entry.id];

            return (
              <View
                key={entry.id}
                style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.userHeader}>
                  <View style={[styles.avatar, { borderColor: roleColor(entry.role), backgroundColor: `${roleColor(entry.role)}22` }]}>
                    <Text style={[styles.avatarText, { color: roleColor(entry.role) }]}>{initials}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.foreground }]}>
                      {displayName}
                      {isCurrentUser ? ' (You)' : ''}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{entry.email}</Text>
                    {password ? (
                      <Text style={[styles.userPassword, { color: SALMON }]}>Pass: {password}</Text>
                    ) : null}
                    {entry.phone ? (
                      <Text style={[styles.userMeta, { color: colors.mutedForeground }]}>Phone: {entry.phone}</Text>
                    ) : null}
                    {entry.gender || entry.bloodGroup ? (
                      <Text style={[styles.userMeta, { color: colors.mutedForeground }]}>
                        {[entry.gender, entry.bloodGroup].filter(Boolean).join(' · ')}
                      </Text>
                    ) : null}
                    <Text style={[styles.userGym, { color: colors.mutedForeground }]}>{entry.gymName ?? 'No gym assigned'}</Text>
                  </View>
                  {entry.status === 'suspended' ? (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(250,24,24,0.12)', borderColor: 'rgba(250,24,24,0.35)' }]}>
                      <Text style={styles.statusBadgeText}>SUSPENDED</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.35)' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#22C55E' }]}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>ROLE</Text>
                <View style={styles.roleRow}>
                  {ALL_ROLE_OPTIONS.map((role) => {
                    const isSelected = entry.role === role;
                    const isDisabled = isCurrentUser && role !== 'super_admin';
                    return (
                      <TouchableOpacity
                        key={role}
                        disabled={isDisabled}
                        onPress={() => handleRoleChange(entry.id, role)}
                        style={[
                          styles.roleChip,
                          {
                            borderColor: isSelected ? roleColor(role) : colors.border,
                            backgroundColor: isSelected ? `${roleColor(role)}18` : 'transparent',
                            opacity: isDisabled ? 0.4 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.roleChipText, { color: isSelected ? roleColor(role) : colors.foreground }]}>
                          {getRoleLabel(role)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.controlRow}>
                  <View style={styles.controlText}>
                    <Text style={[styles.controlTitle, { color: colors.foreground }]}>Account Status</Text>
                    <Text style={[styles.controlHint, { color: colors.mutedForeground }]}>
                      {entry.status === 'active' ? 'User can sign in' : 'Sign-in blocked'}
                    </Text>
                  </View>
                  <Switch
                    value={entry.status === 'active'}
                    disabled={isCurrentUser}
                    onValueChange={(value) => handleAccountStatusChange(entry.id, value)}
                    trackColor={{ false: '#3A3A3C', true: `${SALMON}88` }}
                    thumbColor={entry.status === 'active' ? SALMON : '#8E8E93'}
                    ios_backgroundColor="#3A3A3C"
                  />
                </View>

                <View style={styles.controlRow}>
                  <View style={styles.controlText}>
                    <Text style={[styles.controlTitle, { color: colors.foreground }]}>Two-Factor Auth</Text>
                    <Text style={[styles.controlHint, { color: colors.mutedForeground }]}>
                      {twoFactor?.enabled
                        ? `Enabled · ${twoFactor.label} — toggle off to reset`
                        : 'Not enabled — user sets up in Account Security'}
                    </Text>
                  </View>
                  <Switch
                    value={!!twoFactor?.enabled}
                    onValueChange={(value) => handleTwoFactorToggle(entry.id, value)}
                    trackColor={{ false: '#3A3A3C', true: `${SALMON}88` }}
                    thumbColor={twoFactor?.enabled ? SALMON : '#8E8E93'}
                    ios_backgroundColor="#3A3A3C"
                  />
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => openEditForm(entry)}
                    style={[styles.secondaryBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>EDIT</Text>
                  </TouchableOpacity>
                  {!isCurrentUser ? (
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(entry.id, displayName)}
                      style={[styles.secondaryBtn, { borderColor: '#7F1D1D', backgroundColor: 'rgba(127,29,29,0.2)' }]}
                    >
                      <Text style={[styles.secondaryBtnText, { color: '#FCA5A5' }]}>DELETE</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScreenScrollView>

      <Modal visible={formModalVisible} animationType="slide" transparent onRequestClose={closeForm}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={closeForm} />
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
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              {editingUserId ? 'EDIT USER' : 'ADD USER'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetForm}>
              <View style={styles.formRow}>
                <TextInput
                  value={form.firstName}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
                  placeholder="First name"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, styles.halfInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                />
                <TextInput
                  value={form.lastName}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
                  placeholder="Last name"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, styles.halfInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                />
              </View>
              <TextInput
                value={form.email}
                onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
                placeholder="Email address"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                value={form.password}
                onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
                placeholder={editingUserId ? 'New password (optional)' : 'Password'}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                value={form.phone}
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                placeholder="Phone number"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>GENDER</Text>
              <View style={styles.roleRow}>
                {USER_GENDER_OPTIONS.map((gender) => {
                  const isSelected = form.gender === gender;
                  return (
                    <TouchableOpacity
                      key={gender}
                      onPress={() => setForm((prev) => ({ ...prev, gender }))}
                      style={[
                        styles.roleChip,
                        {
                          borderColor: isSelected ? SALMON : colors.border,
                          backgroundColor: isSelected ? `${SALMON}18` : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.roleChipText, { color: isSelected ? SALMON : colors.foreground }]}>{gender}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>BLOOD GROUP</Text>
              <View style={styles.roleRow}>
                {USER_BLOOD_GROUP_OPTIONS.map((bloodGroup) => {
                  const isSelected = form.bloodGroup === bloodGroup;
                  return (
                    <TouchableOpacity
                      key={bloodGroup}
                      onPress={() => setForm((prev) => ({ ...prev, bloodGroup }))}
                      style={[
                        styles.roleChip,
                        {
                          borderColor: isSelected ? SALMON : colors.border,
                          backgroundColor: isSelected ? `${SALMON}18` : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.roleChipText, { color: isSelected ? SALMON : colors.foreground }]}>{bloodGroup}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInput
                value={form.gymName}
                onChangeText={(value) => setForm((prev) => ({ ...prev, gymName: value }))}
                placeholder="Gym name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>ROLE</Text>
              <View style={styles.roleRow}>
                {(editingUserId ? ALL_ROLE_OPTIONS : ADMIN_CREATABLE_ROLES).map((role) => {
                  const isSelected = form.role === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      onPress={() => setForm((prev) => ({ ...prev, role }))}
                      style={[
                        styles.roleChip,
                        {
                          borderColor: isSelected ? roleColor(role) : colors.border,
                          backgroundColor: isSelected ? `${roleColor(role)}18` : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.roleChipText, { color: isSelected ? roleColor(role) : colors.foreground }]}>
                        {getRoleLabel(role)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeForm} style={[styles.modalButton, { borderColor: colors.border }]}>
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveUser}
                disabled={isSaving}
                style={[styles.modalButton, { backgroundColor: SALMON, borderColor: SALMON, opacity: isSaving ? 0.7 : 1 }]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#0D0D0D" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#0D0D0D' }]}>
                    {editingUserId ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={cancelDelete}>
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Delete user?</Text>
            <Text style={[styles.confirmMessage, { color: colors.mutedForeground }]}>
              Remove {deleteTarget?.name} from the platform? This cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity onPress={cancelDelete} style={[styles.confirmButton, { borderColor: colors.border }]}>
                <Text style={[styles.confirmButtonText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={[styles.confirmButton, styles.confirmDeleteButton]}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  heroCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  messageBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  messageBannerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#22C55E',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 72,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, letterSpacing: 1 },
  statLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.8, marginTop: 2 },
  credentialsCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 16 },
  credentialRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  credentialRoleBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  credentialRoleText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.5 },
  credentialInfo: { flex: 1 },
  credentialEmail: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 2 },
  credentialPassword: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginBottom: 12,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.6 },
  userCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  userHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'BebasNeue_400Regular', fontSize: 16, letterSpacing: 1 },
  userInfo: { flex: 1 },
  userName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginBottom: 2 },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 2 },
  userPassword: { fontFamily: 'Inter_500Medium', fontSize: 11, marginBottom: 2 },
  userMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginBottom: 2 },
  userGym: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  statusBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.5, color: '#FA1818' },
  fieldLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.8 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  roleChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.4 },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
  },
  controlText: { flex: 1 },
  controlTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 2 },
  controlHint: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  divider: { height: 1, marginLeft: 14 },
  lockedWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, gap: 12 },
  lockedTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 1 },
  lockedBody: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    color: '#0D0D0D',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 1,
  },
  formRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  formError: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FA1818',
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#0D0D0D',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
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
    maxHeight: '88%',
    zIndex: 2,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetForm: {
    gap: 10,
    paddingBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  confirmTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
  confirmMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  confirmButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  confirmDeleteButton: {
    borderColor: '#7F1D1D',
    backgroundColor: 'rgba(127,29,29,0.25)',
  },
  confirmDeleteText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#FCA5A5',
  },
});

export default UserManagementScreen;
