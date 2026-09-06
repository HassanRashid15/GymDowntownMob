import type { RegisterFitnessProfile } from './types';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const buildSignupMetadata = (
  fullName: string,
  firstName: string,
  lastName: string,
  role: 'customer' | 'admin',
  options?: {
    fitnessProfile?: RegisterFitnessProfile;
    gymName?: string;
    phone?: string;
  }
): Record<string, string | boolean> => {
  const metadata: Record<string, string | boolean> = {
    full_name: fullName,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    role,
    // Never auto-approve on signup — customers approve after email confirm;
    // admins stay pending until super admin approval.
    is_approved: false,
  };

  if (role === 'admin') {
    if (options?.gymName) metadata.gym_name = options.gymName.trim();
    if (options?.phone) metadata.phone = options.phone.trim();
    if (options?.fitnessProfile?.age) metadata.fitness_age = options.fitnessProfile.age;
    if (options?.fitnessProfile?.weight) metadata.fitness_weight = options.fitnessProfile.weight;
    return metadata;
  }

  const fitnessProfile = options?.fitnessProfile;
  if (!fitnessProfile) return metadata;

  return {
    ...metadata,
    fitness_age: fitnessProfile.age,
    fitness_weight: fitnessProfile.weight,
    fitness_goal: fitnessProfile.fitnessGoal,
    fitness_experience_level: fitnessProfile.experienceLevel,
    fitness_target_areas: fitnessProfile.targetAreas.join(', '),
    fitness_workout_days: fitnessProfile.workoutDays,
    fitness_workout_duration: fitnessProfile.workoutDuration,
    fitness_workout_type: fitnessProfile.workoutType,
  };
};
