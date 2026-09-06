import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PlatformUser,
  UserRole,
  UserGender,
  UserBloodGroup,
  buildUserName,
  parseUserName,
} from '../types/user';

export const PLATFORM_USERS_STORAGE_KEY = 'gym_platform_users';
export const PLATFORM_PASSWORDS_STORAGE_KEY = 'gym_platform_passwords';

export const DEMO_PASSWORDS: Record<string, string> = {
  'superadmin@gym.com': 'superadmin123',
  'admin@gym.com': 'admin123',
  'customer@gym.com': 'customer123',
};

export const INITIAL_PLATFORM_USERS: PlatformUser[] = [
  {
    id: '0',
    email: 'superadmin@gym.com',
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=150&h=150&q=80',
    phone: '+1 555 0100',
    gender: 'Male',
    bloodGroup: 'O+',
    gymName: 'Forge Platform',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '1',
    email: 'admin@gym.com',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150&q=80',
    phone: '+1 555 0101',
    gender: 'Female',
    bloodGroup: 'A+',
    gymName: 'Forge Downtown',
    createdAt: '2024-03-15T00:00:00.000Z',
  },
  {
    id: '2',
    email: 'customer@gym.com',
    name: 'Jaxon Vance',
    firstName: 'Jaxon',
    lastName: 'Vance',
    role: 'customer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?fit=crop&w=300&h=300&q=80',
    phone: '+1 555 0102',
    gender: 'Male',
    bloodGroup: 'B+',
    gymName: 'Forge Downtown',
    createdAt: '2025-01-10T00:00:00.000Z',
  },
];

export const DEMO_CREDENTIALS = [
  { role: 'super_admin' as const, email: 'superadmin@gym.com', password: 'superadmin123', label: 'Super Admin' },
  { role: 'admin' as const, email: 'admin@gym.com', password: 'admin123', label: 'Gym Admin' },
  { role: 'customer' as const, email: 'customer@gym.com', password: 'customer123', label: 'Member' },
];

export const loadPasswords = async (): Promise<Record<string, string>> => {
  try {
    const stored = await AsyncStorage.getItem(PLATFORM_PASSWORDS_STORAGE_KEY);
    const custom = stored ? (JSON.parse(stored) as Record<string, string>) : {};
    return { ...DEMO_PASSWORDS, ...custom };
  } catch {
    return { ...DEMO_PASSWORDS };
  }
};

export const setUserPassword = async (email: string, password: string) => {
  const normalized = email.trim().toLowerCase();
  const stored = await AsyncStorage.getItem(PLATFORM_PASSWORDS_STORAGE_KEY);
  const custom = stored ? (JSON.parse(stored) as Record<string, string>) : {};
  custom[normalized] = password;
  await AsyncStorage.setItem(PLATFORM_PASSWORDS_STORAGE_KEY, JSON.stringify(custom));
};

export const removeUserPassword = async (email: string) => {
  const normalized = email.trim().toLowerCase();
  if (DEMO_PASSWORDS[normalized]) return;
  const stored = await AsyncStorage.getItem(PLATFORM_PASSWORDS_STORAGE_KEY);
  if (!stored) return;
  const custom = JSON.parse(stored) as Record<string, string>;
  delete custom[normalized];
  await AsyncStorage.setItem(PLATFORM_PASSWORDS_STORAGE_KEY, JSON.stringify(custom));
};

export const getDemoPassword = async (email: string) => {
  const passwords = await loadPasswords();
  return passwords[email.trim().toLowerCase()];
};

const migratePlatformUser = (user: PlatformUser): PlatformUser => {
  const firstName = user.firstName ?? parseUserName(user.name).firstName;
  const lastName = user.lastName ?? parseUserName(user.name).lastName;
  return {
    ...user,
    firstName,
    lastName,
    name: buildUserName(firstName, lastName) || user.name,
  };
};

export const loadPlatformUsers = async (): Promise<PlatformUser[]> => {
  try {
    const stored = await AsyncStorage.getItem(PLATFORM_USERS_STORAGE_KEY);
    if (stored) {
      return (JSON.parse(stored) as PlatformUser[]).map(migratePlatformUser);
    }
  } catch (error) {
    console.error('Failed to load platform users:', error);
  }
  return INITIAL_PLATFORM_USERS;
};

export const savePlatformUsers = async (users: PlatformUser[]) => {
  await AsyncStorage.setItem(PLATFORM_USERS_STORAGE_KEY, JSON.stringify(users));
};

export const authenticatePlatformUser = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await loadPlatformUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (!user) return null;
  if (user.status === 'suspended') {
    throw new Error('This account has been suspended. Contact platform support.');
  }

  const passwords = await loadPasswords();
  if (passwords[normalizedEmail] !== password) return null;

  return user;
};

export const findPlatformUserByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await loadPlatformUsers();
  return users.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
};

export type CreatePlatformUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: UserGender;
  bloodGroup: UserBloodGroup;
  role: Extract<UserRole, 'super_admin' | 'admin' | 'customer'>;
  gymName?: string;
};

export type UpdatePlatformUserInput = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  gender?: UserGender;
  bloodGroup?: UserBloodGroup;
  role?: UserRole;
  gymName?: string;
  status?: PlatformUser['status'];
};

export const createPlatformUser = async (input: CreatePlatformUserInput): Promise<PlatformUser> => {
  const users = await loadPlatformUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (users.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
    throw new Error('A user with this email already exists.');
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const newUser: PlatformUser = {
    id: Date.now().toString(),
    firstName,
    lastName,
    name: buildUserName(firstName, lastName),
    email: normalizedEmail,
    phone: input.phone.trim(),
    gender: input.gender,
    bloodGroup: input.bloodGroup,
    role: input.role,
    status: 'active',
    gymName: input.gymName?.trim() || 'Forge Gym',
    createdAt: new Date().toISOString(),
  };

  await savePlatformUsers([newUser, ...users]);
  await setUserPassword(normalizedEmail, input.password);
  return newUser;
};

export const updatePlatformUser = async (
  userId: string,
  input: UpdatePlatformUserInput
): Promise<PlatformUser> => {
  const users = await loadPlatformUsers();
  const index = users.findIndex((entry) => entry.id === userId);
  if (index === -1) throw new Error('User not found.');

  const current = users[index];
  const nextEmail = input.email?.trim().toLowerCase() ?? current.email;

  if (
    nextEmail !== current.email.toLowerCase() &&
    users.some((entry) => entry.id !== userId && entry.email.toLowerCase() === nextEmail)
  ) {
    throw new Error('A user with this email already exists.');
  }

  if (input.email && input.email.trim().toLowerCase() !== current.email.toLowerCase()) {
    const passwords = await loadPasswords();
    const currentPassword = passwords[current.email.toLowerCase()];
    if (currentPassword) {
      await setUserPassword(nextEmail, currentPassword);
      await removeUserPassword(current.email);
    }
  }

  if (input.password?.trim()) {
    await setUserPassword(nextEmail, input.password.trim());
  }

  const nextFirstName = input.firstName?.trim() ?? current.firstName ?? parseUserName(current.name).firstName;
  const nextLastName = input.lastName?.trim() ?? current.lastName ?? parseUserName(current.name).lastName;

  const updated: PlatformUser = {
    ...current,
    firstName: nextFirstName,
    lastName: nextLastName,
    name: buildUserName(nextFirstName, nextLastName),
    email: nextEmail,
    phone: input.phone?.trim() ?? current.phone,
    gender: input.gender ?? current.gender,
    bloodGroup: input.bloodGroup ?? current.bloodGroup,
    role: input.role ?? current.role,
    gymName: input.gymName?.trim() ?? current.gymName,
    status: input.status ?? current.status,
  };

  const next = [...users];
  next[index] = updated;
  await savePlatformUsers(next);
  return updated;
};

export const deletePlatformUser = async (userId: string) => {
  const users = await loadPlatformUsers();
  const target = users.find((entry) => entry.id === userId);
  if (!target) throw new Error('User not found.');

  const next = users.filter((entry) => entry.id !== userId);
  await savePlatformUsers(next);
  await removeUserPassword(target.email);
};
