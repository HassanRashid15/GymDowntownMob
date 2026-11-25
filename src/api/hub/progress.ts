import { apiRequest } from './client';

export type WorkoutExercise = {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: string | null;
};

export type PersonalRecord = {
  id: string;
  exercise_name: string;
  value: string;
  unit?: string;
  improvement?: string | null;
  achieved_at?: string;
};

export type ProgressDayView = {
  date: string;
  id: string | null;
  focus: string;
  notes: string | null;
  duration_minutes: number | null;
  calories: number | null;
  exercises: WorkoutExercise[];
};

export type ProgressStats = {
  trainedDays: number;
  totalExercises: number;
  totalSets: number;
  totalDuration: number;
  totalCalories: number;
  streak: number;
};

export type ProgressPayload = {
  days: ProgressDayView[];
  personalRecords: PersonalRecord[];
  stats: ProgressStats;
};

export const FOCUS_PRESETS = [
  'Legs',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
  'Rest',
] as const;

export async function getProgress(options?: { days?: number; from?: string; to?: string }) {
  return apiRequest<ProgressPayload>('progress', 'get', {
    query: {
      days: options?.days,
      from: options?.from,
      to: options?.to,
    },
  });
}

export async function upsertProgressDay(body: {
  day_date: string;
  focus: string;
  notes?: string | null;
  duration_minutes?: number | null;
  calories?: number | null;
}) {
  return apiRequest<{ day: { id: string; day_date: string; focus: string } }>('progress', 'save', {
    body: { action: 'upsert_day', ...body },
  });
}

export async function addProgressExercise(body: {
  workout_day_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: string | null;
}) {
  return apiRequest<{ exercise: WorkoutExercise }>('progress', 'addExercise', { body });
}

export async function deleteProgressExercise(id: string) {
  return apiRequest<{ success: boolean }>('progress', 'deleteExercise', {
    query: { id },
  });
}

export type CatalogExercise = {
  name: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  howTo?: string | null;
  equipment?: string[];
};

export async function getExerciseCatalog(focus: string) {
  return apiRequest<{ focus: string; source?: string; exercises: CatalogExercise[] }>(
    'progress',
    'exerciseCatalog',
    { query: { focus } }
  );
}

export const MOOD_OPTIONS = [
  { id: 'great', label: 'Great — feeling strong', emoji: '🔥' },
  { id: 'good', label: 'Good — ready to train', emoji: '😊' },
  { id: 'okay', label: 'Okay — steady', emoji: '😐' },
  { id: 'low', label: 'Low — need a gentle session', emoji: '😔' },
  { id: 'stressed', label: 'Stressed — need to move it out', emoji: '😤' },
] as const;

export const ENERGY_OPTIONS = [
  { id: 'high', label: 'High energy', emoji: '⚡' },
  { id: 'medium', label: 'Medium energy', emoji: '🔋' },
  { id: 'low', label: 'Low energy', emoji: '🕯️' },
] as const;

export type MoodId = (typeof MOOD_OPTIONS)[number]['id'];
export type EnergyId = (typeof ENERGY_OPTIONS)[number]['id'];

const EXERCISE_PRESETS: Record<string, string[]> = {
  Legs: ['Barbell Squat', 'Leg Press', 'Romanian Deadlift', 'Walking Lunges', 'Leg Curl'],
  Chest: ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Push-Ups'],
  Back: ['Deadlift', 'Pull-Ups', 'Barbell Row', 'Lat Pulldown'],
  Shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly'],
  Arms: ['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crushers'],
  Core: ['Plank', 'Hanging Knee Raise', 'Cable Crunch', 'Ab Wheel'],
  Cardio: ['Treadmill Intervals', 'Rowing Machine', 'Bike Sprints', 'Jump Rope'],
  'Full Body': ['Deadlift', 'Push-Ups', 'Pull-Ups', 'Goblet Squat', 'Farmers Carry'],
  Rest: ['Walk', 'Mobility Flow', 'Breathing'],
};

export function recommendFromMoodEnergy(mood: MoodId, energy: EnergyId) {
  let focus: string = 'Full Body';
  let count = 5;
  let headline = "Here's your session";
  let blurb = 'Exercises matched to how you feel today.';

  if (mood === 'stressed') {
    focus = energy === 'low' ? 'Core' : 'Cardio';
    count = energy === 'high' ? 5 : 4;
    headline = 'Move the stress out';
    blurb =
      energy === 'low'
        ? 'Gentle core work to reset without draining you.'
        : 'Cardio to clear your head and drop tension.';
  } else if (mood === 'low') {
    focus = energy === 'high' ? 'Arms' : 'Core';
    count = 3;
    headline = 'Keep it light';
    blurb = 'Short, manageable moves so you still win the day.';
  } else if (mood === 'okay') {
    focus = energy === 'high' ? 'Back' : energy === 'medium' ? 'Shoulders' : 'Core';
    count = energy === 'low' ? 4 : 5;
    headline = 'Solid steady work';
    blurb = 'Balanced picks for an okay day.';
  } else if (mood === 'good') {
    focus = energy === 'high' ? 'Legs' : energy === 'medium' ? 'Chest' : 'Arms';
    count = energy === 'high' ? 6 : 5;
    headline = 'Good day to train';
    blurb = 'Relevant lifts matched to your energy.';
  } else {
    focus = energy === 'high' ? 'Full Body' : energy === 'medium' ? 'Legs' : 'Chest';
    count = energy === 'high' ? 6 : 5;
    headline = 'Push while you feel great';
    blurb = 'Higher-output exercises while mood and energy line up.';
  }

  const exercises = (EXERCISE_PRESETS[focus] || []).slice(0, count);
  return { focus, exercises, headline, blurb };
}

export function localDateISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
