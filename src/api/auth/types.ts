import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '../../types/user';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  gymName?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
};

export type ProfileUpdateInput = {
  name: string;
  phone?: string;
  avatar?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
};

export type RegisterFitnessProfile = {
  age: string;
  gender?: string;
  weight: string;
  height: string;
  fitnessGoal: string;
  experienceLevel: string;
  targetAreas: string[];
  workoutDays: string;
  workoutDuration: string;
  workoutType: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  fitnessProfile?: RegisterFitnessProfile;
  gymName?: string;
  phone?: string;
};

export type RegisterResult = {
  role: 'customer' | 'admin';
  needsEmailConfirmation: boolean;
  pendingApproval: boolean;
};

export type SignUpResult = {
  user: User;
  session: Session | null;
  email: string;
  fullName: string;
};
