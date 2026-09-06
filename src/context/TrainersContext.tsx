import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { allTrainers as seedTrainers, Trainer } from '../data/trainers';

export type TrainerGender = 'Male' | 'Female' | 'Other';
export type TrainerBloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type TrainerFormInput = {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  gender: TrainerGender;
  age: string;
  bloodGroup: TrainerBloodGroup;
  role: string;
  rating: string;
  status: NonNullable<Trainer['status']>;
  image: string;
  specialties: string;
};

const STORAGE_KEY = 'gym_trainers';

export const GENDER_OPTIONS: TrainerGender[] = ['Male', 'Female', 'Other'];
export const BLOOD_GROUP_OPTIONS: TrainerBloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildTrainer = (input: TrainerFormInput, id?: string): Trainer => {
  const specialties = input.specialties
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const trainerId = id ?? `${slugify(fullName)}-${Date.now()}`;

  return {
    id: trainerId,
    name: fullName,
    firstName,
    lastName,
    address: input.address.trim(),
    phone: input.phone.trim(),
    gender: input.gender,
    age: Number(input.age),
    bloodGroup: input.bloodGroup,
    role: input.role.trim(),
    image:
      input.image.trim() ||
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop',
    bio: `${fullName} coaches at Forge Gym with a focus on ${specialties[0] ?? 'performance training'}.`,
    shortBio: input.role.trim(),
    longBio: `${fullName} is part of the Forge coaching team, specializing in ${specialties.join(', ') || 'general fitness'}.`,
    certifications: ['Forge Certified'],
    certTags: specialties.length ? specialties : ['General Fitness'],
    specialties: specialties.length ? specialties : ['General Fitness'],
    experience: '3 years',
    clients: '50+',
    rating: input.rating.trim() || '4.8',
    reviewCount: 12,
    instagram: '#',
    email: input.email.trim() || `${slugify(fullName)}@forgegym.com`,
    schedule: ['Mon 6:00 AM', 'Wed 6:00 PM'],
    status: input.status,
    tagline: input.role.trim().toUpperCase(),
    titleBadge: 'COACH',
  };
};

interface TrainersContextValue {
  trainers: Trainer[];
  isLoading: boolean;
  addTrainer: (input: TrainerFormInput) => Trainer;
  updateTrainer: (id: string, input: TrainerFormInput) => void;
  deleteTrainer: (id: string) => void;
  getTrainerById: (id: string) => Trainer | undefined;
}

const TrainersContext = createContext<TrainersContextValue | undefined>(undefined);

export const TrainersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainers, setTrainers] = useState<Trainer[]>(seedTrainers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTrainers(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load trainers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrainers();
  }, []);

  const persist = async (nextTrainers: Trainer[]) => {
    setTrainers(nextTrainers);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrainers));
  };

  const addTrainer = (input: TrainerFormInput) => {
    const trainer = buildTrainer(input);
    const nextTrainers = [trainer, ...trainers];
    void persist(nextTrainers);
    return trainer;
  };

  const updateTrainer = (id: string, input: TrainerFormInput) => {
    const nextTrainers = trainers.map((trainer) =>
      trainer.id === id ? buildTrainer(input, id) : trainer
    );
    void persist(nextTrainers);
  };

  const deleteTrainer = (id: string) => {
    const nextTrainers = trainers.filter((trainer) => trainer.id !== id);
    void persist(nextTrainers);
  };

  const getTrainerById = (id: string) => trainers.find((trainer) => trainer.id === id);

  const value = useMemo(
    () => ({
      trainers,
      isLoading,
      addTrainer,
      updateTrainer,
      deleteTrainer,
      getTrainerById,
    }),
    [trainers, isLoading]
  );

  return <TrainersContext.Provider value={value}>{children}</TrainersContext.Provider>;
};

export const useTrainers = () => {
  const context = useContext(TrainersContext);
  if (!context) {
    throw new Error('useTrainers must be used within TrainersProvider');
  }
  return context;
};

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

export const trainerToForm = (trainer: Trainer): TrainerFormInput => {
  const fallback = splitName(trainer.name);

  return {
    firstName: trainer.firstName ?? fallback.firstName,
    lastName: trainer.lastName ?? fallback.lastName,
    address: trainer.address ?? '',
    email: trainer.email,
    phone: trainer.phone ?? '',
    gender: (trainer.gender as TrainerGender) ?? 'Male',
    age: trainer.age ? String(trainer.age) : '',
    bloodGroup: (trainer.bloodGroup as TrainerBloodGroup) ?? 'O+',
    role: trainer.role,
    rating: trainer.rating,
    status: trainer.status ?? 'available',
    image: trainer.image,
    specialties: trainer.specialties.join(', '),
  };
};

export const emptyTrainerForm = (): TrainerFormInput => ({
  firstName: '',
  lastName: '',
  address: '',
  email: '',
  phone: '',
  gender: 'Male',
  age: '',
  bloodGroup: 'O+',
  role: '',
  rating: '4.8',
  status: 'available',
  image: '',
  specialties: '',
});

export const trainerStatusLabel = (status?: Trainer['status']) => {
  if (status === 'live') return 'Live';
  if (status === 'booked') return 'Fully Booked';
  if (status === 'off_duty') return 'Off Duty';
  return 'Active';
};
