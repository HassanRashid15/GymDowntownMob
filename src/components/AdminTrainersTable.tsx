import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenScrollView from './ScreenScrollView';
import { useTheme } from '../context/ThemeContext';
import {
  useTrainers,
  TrainerFormInput,
  emptyTrainerForm,
  trainerStatusLabel,
  trainerToForm,
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from '../context/TrainersContext';
import { useGymPlanAccess } from '../context/SubscriptionContext';
import { Trainer } from '../data/trainers';
import { formatLimit } from '../data/gymSubscription';
import {
  TrainerFormErrors,
  hasFormErrors,
  validateTrainerForm,
} from '../utils/trainerFormValidation';

const SALMON = '#E88E83';

type TrainerStatus = NonNullable<Trainer['status']>;

const STATUS_OPTIONS: TrainerStatus[] = ['available', 'live', 'booked', 'off_duty'];

const STATUS_DROPDOWN_OPTIONS = STATUS_OPTIONS.map((status) => ({
  value: status,
  label: trainerStatusLabel(status),
}));

const GENDER_DROPDOWN_OPTIONS = GENDER_OPTIONS.map((gender) => ({
  value: gender,
  label: gender,
}));

const BLOOD_GROUP_DROPDOWN_OPTIONS = BLOOD_GROUP_OPTIONS.map((bloodGroup) => ({
  value: bloodGroup,
  label: bloodGroup,
}));

const statusColor = (status?: Trainer['status']) => {
  if (status === 'live') return '#FA1818';
  if (status === 'booked') return '#8C8C8C';
  if (status === 'off_duty') return '#6B7280';
  return SALMON;
};

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, colors, children }) => (
  <View style={styles.field}>
    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
      {label}
      {required ? <Text style={{ color: SALMON }}> *</Text> : null}
    </Text>
    {children}
    {error ? <Text style={styles.fieldError}>{error}</Text> : null}
  </View>
);

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

interface FormDropdownProps<T extends string> {
  label: string;
  required?: boolean;
  error?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  valueColor?: string;
}

function FormDropdown<T extends string>({
  label,
  required,
  error,
  value,
  options,
  onChange,
  colors,
  valueColor,
}: FormDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (nextValue: T) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <>
      <FormField label={label} required={required} error={error} colors={colors}>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={[
            styles.dropdownTrigger,
            {
              borderColor: error ? '#FA1818' : colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Text
            style={[
              styles.dropdownValue,
              { color: valueColor ?? colors.foreground },
            ]}
            numberOfLines={1}
          >
            {selected?.label ?? 'Select'}
          </Text>
          <Text style={[styles.dropdownChevron, { color: colors.mutedForeground }]}>▼</Text>
        </TouchableOpacity>
      </FormField>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.dropdownOverlay}>
          <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)} />
          <View style={[styles.dropdownSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dropdownTitle, { color: colors.foreground }]}>{label}</Text>
            <ScrollView
              bounces={false}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              {...(Platform.OS === 'web' ? { dataSet: { hideScrollbar: 'true' } } : {})}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={[
                      styles.dropdownOption,
                      {
                        borderColor: isSelected ? SALMON : colors.border,
                        backgroundColor: isSelected ? 'rgba(232, 142, 131, 0.12)' : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        { color: isSelected ? SALMON : colors.foreground },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

interface AdminTrainersTableProps {
  navigation: any;
}

const AdminTrainersTable: React.FC<AdminTrainersTableProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { trainers, addTrainer, updateTrainer, deleteTrainer } = useTrainers();
  const { plan, hasGymSubscription } = useGymPlanAccess();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TrainerFormInput>(emptyTrainerForm());
  const [formErrors, setFormErrors] = useState<TrainerFormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);

  const trainerLimit = plan?.trainerLimit ?? 'unlimited';
  const atTrainerLimit =
    trainerLimit !== 'unlimited' && trainers.length >= trainerLimit;

  const sortedTrainers = useMemo(
    () => [...trainers].sort((a, b) => a.name.localeCompare(b.name)),
    [trainers]
  );

  const openCreate = () => {
    if (hasGymSubscription && atTrainerLimit && !editingId) {
      Alert.alert(
        'Trainer limit reached',
        `Your ${plan?.name ?? 'plan'} allows ${formatLimit(trainerLimit)}. Upgrade to add more trainers.`
      );
      return;
    }
    setEditingId(null);
    setForm(emptyTrainerForm());
    setFormErrors({});
    setModalVisible(true);
  };

  const openEdit = (trainer: Trainer) => {
    setEditingId(trainer.id);
    setForm(trainerToForm(trainer));
    setFormErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setForm(emptyTrainerForm());
    setFormErrors({});
  };

  const handleSave = () => {
    const errors = validateTrainerForm(form, { isEdit: !!editingId });
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    if (editingId) {
      updateTrainer(editingId, form);
    } else {
      addTrainer(form);
    }

    closeModal();
  };

  const handleDelete = (trainer: Trainer) => {
    setDeleteTarget(trainer);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteTrainer(deleteTarget.id);
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const updateField = <K extends keyof TrainerFormInput>(key: K, value: TrainerFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const pickTrainerImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo library access to upload a trainer image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateField('image', result.assets[0].uri);
    }
  };

  const removeTrainerImage = () => {
    updateField('image', '');
  };

  const inputStyle = (hasError: boolean) => [
    styles.input,
    {
      color: colors.foreground,
      borderColor: hasError ? '#FA1818' : colors.border,
      backgroundColor: colors.background,
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: SALMON }]}>ADMIN · TRAINERS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>MANAGE TRAINERS</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Create, update, and remove coaches for your gym roster.
          </Text>
          <View style={styles.headerMeta}>
            <Text style={[styles.countText, { color: colors.mutedForeground }]}>
              {trainers.length}
              {trainerLimit !== 'unlimited' ? ` / ${trainerLimit}` : ''} trainers
            </Text>
            <TouchableOpacity onPress={openCreate} style={[styles.addButton, { backgroundColor: SALMON }]}>
              <Text style={styles.addButtonText}>+ ADD TRAINER</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.table, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.tableRow, styles.tableHead, { borderBottomColor: colors.border }]}>
            <View style={styles.colTrainer}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>TRAINER</Text>
            </View>
            <View style={styles.colRole}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>ROLE</Text>
            </View>
            <View style={styles.colStatus}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>STATUS</Text>
            </View>
            <View style={styles.colRating}>
              <Text style={[styles.headText, { color: colors.mutedForeground }]}>RATING</Text>
            </View>
            <View style={styles.colActions}>
              <Text style={[styles.headText, styles.actionsHeadText, { color: colors.mutedForeground }]}>
                ACTIONS
              </Text>
            </View>
          </View>

          {sortedTrainers.map((trainer, index) => (
              <View
                key={trainer.id}
                style={[
                  styles.tableRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: index < sortedTrainers.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.colTrainer}
                  onPress={() => navigation.navigate('TrainerDetail', { trainerId: trainer.id })}
                >
                  <Image source={{ uri: trainer.image }} style={styles.avatar} />
                  <View style={styles.nameBlock}>
                    <Text style={[styles.nameText, { color: colors.foreground }]} numberOfLines={1}>
                      {trainer.name}
                    </Text>
                    <Text style={[styles.emailText, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {trainer.email}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.colRole}>
                  <Text style={[styles.bodyText, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {trainer.role}
                  </Text>
                </View>

                <View style={styles.colStatus}>
                  <View style={[styles.statusBadge, { borderColor: `${statusColor(trainer.status)}55` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(trainer.status) }]} />
                    <Text style={[styles.statusText, { color: statusColor(trainer.status) }]}>
                      {trainerStatusLabel(trainer.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.colRating}>
                  <Text style={[styles.bodyText, { color: colors.foreground }]}>★ {trainer.rating}</Text>
                </View>

                <View style={styles.colActions}>
                  <TouchableOpacity onPress={() => openEdit(trainer)} style={[styles.actionBtn, { borderColor: colors.border }]}>
                    <Text style={[styles.actionText, { color: colors.foreground }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(trainer)} style={[styles.actionBtn, styles.deleteBtn]}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </ScreenScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetBackdrop} />
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
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editingId ? 'EDIT TRAINER' : 'ADD TRAINER'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetForm}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <FormField label="First Name" required error={formErrors.firstName} colors={colors}>
                    <TextInput
                      value={form.firstName}
                      onChangeText={(value) => updateField('firstName', value)}
                      placeholder="e.g. Marcus"
                      placeholderTextColor={colors.mutedForeground}
                      style={inputStyle(!!formErrors.firstName)}
                    />
                  </FormField>
                </View>
                <View style={styles.fieldHalf}>
                  <FormField label="Last Name" required error={formErrors.lastName} colors={colors}>
                    <TextInput
                      value={form.lastName}
                      onChangeText={(value) => updateField('lastName', value)}
                      placeholder="e.g. Johnson"
                      placeholderTextColor={colors.mutedForeground}
                      style={inputStyle(!!formErrors.lastName)}
                    />
                  </FormField>
                </View>
              </View>

              <FormField label="Address" required error={formErrors.address} colors={colors}>
                <TextInput
                  value={form.address}
                  onChangeText={(value) => updateField('address', value)}
                  placeholder="Street, city, state"
                  placeholderTextColor={colors.mutedForeground}
                  style={inputStyle(!!formErrors.address)}
                />
              </FormField>

              <FormField label="Email Address" required error={formErrors.email} colors={colors}>
                <TextInput
                  value={form.email}
                  onChangeText={(value) => updateField('email', value)}
                  placeholder="coach@forgegym.com"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={inputStyle(!!formErrors.email)}
                />
              </FormField>

              <FormField label="Phone No" required error={formErrors.phone} colors={colors}>
                <TextInput
                  value={form.phone}
                  onChangeText={(value) => updateField('phone', value)}
                  placeholder="+1 555 123 4567"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  style={inputStyle(!!formErrors.phone)}
                />
              </FormField>

              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <FormDropdown
                    label="Gender"
                    required
                    error={formErrors.gender}
                    value={form.gender}
                    options={GENDER_DROPDOWN_OPTIONS}
                    onChange={(value) => updateField('gender', value)}
                    colors={colors}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <FormField label="Age" required error={formErrors.age} colors={colors}>
                    <TextInput
                      value={form.age}
                      onChangeText={(value) => updateField('age', value)}
                      placeholder="28"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      style={inputStyle(!!formErrors.age)}
                    />
                  </FormField>
                </View>
              </View>

              <FormDropdown
                label="Blood Group"
                required
                error={formErrors.bloodGroup}
                value={form.bloodGroup}
                options={BLOOD_GROUP_DROPDOWN_OPTIONS}
                onChange={(value) => updateField('bloodGroup', value)}
                colors={colors}
              />

              <FormField label="Role / Specialty" required error={formErrors.role} colors={colors}>
                <TextInput
                  value={form.role}
                  onChangeText={(value) => updateField('role', value)}
                  placeholder="e.g. HIIT Specialist"
                  placeholderTextColor={colors.mutedForeground}
                  style={inputStyle(!!formErrors.role)}
                />
              </FormField>

              <FormField label="Rating" required error={formErrors.rating} colors={colors}>
                <TextInput
                  value={form.rating}
                  onChangeText={(value) => updateField('rating', value)}
                  placeholder="4.9"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  style={inputStyle(!!formErrors.rating)}
                />
              </FormField>

              <FormField label="Trainer Photo" required error={formErrors.image} colors={colors}>
                {form.image ? (
                  <View style={styles.imagePreviewWrap}>
                    <Image source={{ uri: form.image }} style={styles.imagePreview} resizeMode="cover" />
                    <View style={styles.imageActions}>
                      <TouchableOpacity onPress={pickTrainerImage} style={[styles.imageActionBtn, { borderColor: colors.border }]}>
                        <Text style={[styles.imageActionText, { color: colors.foreground }]}>Change Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={removeTrainerImage} style={[styles.imageActionBtn, styles.removeImageBtn]}>
                        <Text style={styles.removeImageText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickTrainerImage}
                    style={[
                      styles.uploadBox,
                      {
                        borderColor: formErrors.image ? '#FA1818' : colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload Photo</Text>
                    <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>
                      Tap to choose from your device
                    </Text>
                  </TouchableOpacity>
                )}
              </FormField>

              <FormField label="Specialties" required error={formErrors.specialties} colors={colors}>
                <TextInput
                  value={form.specialties}
                  onChangeText={(value) => updateField('specialties', value)}
                  placeholder="HIIT, Strength, Mobility"
                  placeholderTextColor={colors.mutedForeground}
                  style={inputStyle(!!formErrors.specialties)}
                />
              </FormField>

              <FormDropdown
                label="Status"
                value={form.status}
                options={STATUS_DROPDOWN_OPTIONS}
                onChange={(value) => updateField('status', value)}
                colors={colors}
                valueColor={statusColor(form.status)}
              />
            </ScrollView>

              <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={[styles.modalButton, { borderColor: colors.border }]}>
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.modalButton, { backgroundColor: SALMON, borderColor: SALMON }]}>
                <Text style={[styles.modalButtonText, { color: '#0D0D0D' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={cancelDelete}>
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Delete trainer?</Text>
            <Text style={[styles.confirmMessage, { color: colors.mutedForeground }]}>
              Remove {deleteTarget?.name} from your gym roster? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={cancelDelete}
                style={[styles.confirmButton, { borderColor: colors.border }]}
              >
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
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, alignItems: 'stretch' },
  header: { marginBottom: 18 },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 38,
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  countText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  addButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#0D0D0D',
  },
  table: {
    width: '100%',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tableHead: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
  },
  headText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  actionsHeadText: {
    textAlign: 'right',
    width: '100%',
  },
  bodyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  colTrainer: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
    minWidth: 0,
  },
  colRole: {
    width: '22%',
    paddingRight: 8,
    minWidth: 0,
    justifyContent: 'center',
  },
  colStatus: {
    width: '16%',
    paddingRight: 8,
    minWidth: 0,
    justifyContent: 'center',
  },
  colRating: {
    width: '10%',
    minWidth: 0,
    justifyContent: 'center',
  },
  colActions: {
    width: '22%',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  nameBlock: { flex: 1, minWidth: 0 },
  nameText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  emailText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  deleteBtn: {
    borderColor: '#7F1D1D',
    backgroundColor: 'rgba(127,29,29,0.25)',
  },
  deleteText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FCA5A5',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    pointerEvents: 'none',
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
    gap: 14,
    paddingBottom: 8,
  },
  field: {
    gap: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldError: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FA1818',
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  uploadTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  uploadHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  imagePreviewWrap: {
    gap: 10,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  removeImageBtn: {
    borderColor: '#7F1D1D',
    backgroundColor: 'rgba(127,29,29,0.2)',
  },
  removeImageText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FCA5A5',
  },
  modalTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownValue: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  dropdownChevron: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  dropdownSheet: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    maxHeight: '70%',
    zIndex: 2,
  },
  dropdownTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  dropdownList: {
    maxHeight: 280,
    ...(Platform.OS === 'web'
      ? ({
          scrollbarWidth: 'none',
        } as const)
      : {}),
  },
  dropdownOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  dropdownOptionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  confirmCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  confirmTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
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
    fontSize: 13,
  },
  confirmDeleteButton: {
    borderColor: '#7F1D1D',
    backgroundColor: 'rgba(127,29,29,0.35)',
  },
  confirmDeleteText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FCA5A5',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
});

export default AdminTrainersTable;
