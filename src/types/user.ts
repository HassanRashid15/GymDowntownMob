export type UserRole = 'super_admin' | 'admin' | 'customer';

export type UserStatus = 'active' | 'suspended';

export type UserGender = 'Male' | 'Female' | 'Other';

export type UserBloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const USER_GENDER_OPTIONS: UserGender[] = ['Male', 'Female', 'Other'];

export const USER_BLOOD_GROUP_OPTIONS: UserBloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  gender?: UserGender;
  bloodGroup?: UserBloodGroup;
  gymName?: string;
  createdAt: string;
}

export const buildUserName = (firstName: string, lastName: string) =>
  `${firstName.trim()} ${lastName.trim()}`.trim();

export const parseUserName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const getUserDisplayName = (user: Pick<PlatformUser, 'name' | 'firstName' | 'lastName'>) => {
  if (user.firstName?.trim() || user.lastName?.trim()) {
    return buildUserName(user.firstName ?? '', user.lastName ?? '');
  }
  return user.name;
};

export const hasAdminAccess = (role?: UserRole) => role === 'admin' || role === 'super_admin';

export const isSuperAdminRole = (role?: UserRole) => role === 'super_admin';

export const getRoleLabel = (role?: UserRole) => {
  switch (role) {
    case 'super_admin':
      return 'SUPER ADMIN';
    case 'admin':
      return 'GYM ADMIN';
    case 'customer':
      return 'ELITE MEMBER';
    default:
      return 'MEMBER';
  }
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Gym Admin' },
  { value: 'customer', label: 'Member' },
];
