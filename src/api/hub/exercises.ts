import { apiRequest } from './client';

export type HubExercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  gifUrl: string;
};

export async function listExercises(options?: {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  limit?: number;
}) {
  const data = await apiRequest<HubExercise[] | { exercises: HubExercise[] }>('exercises', 'list', {
    query: {
      bodyPart: options?.bodyPart,
      equipment: options?.equipment,
      target: options?.target,
      limit: options?.limit ?? 24,
    },
  });
  if (Array.isArray(data)) return { exercises: data };
  return { exercises: data.exercises || [] };
}
