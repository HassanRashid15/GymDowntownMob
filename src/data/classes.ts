export interface GearItem {
  label: string;
  checked: boolean;
}

export interface InstructorDetail {
  name: string;
  role: string;
  avatar: string;
}

export interface GymClass {
  id: string;
  name: string;
  category: string;
  image: string;
  duration: string;
  intensity: 'Low' | 'Medium' | 'High';
  trainer: string;
  schedule: string[];
  description: string;
  longDescription: string;
  spots: number;
  maxSpots: number;
  benefits: string[];
  requirements: string[];
  calories: string;
  intensityLabel?: string;
  tags?: string[];
  instructorDetail?: InstructorDetail;
  sessionLabel?: string;
  sessionTime?: string;
  studio?: string;
  zoneTarget?: string;
  intensityCurve?: number[];
  gear?: GearItem[];
  squadAvatars?: string[];
  squadStatus?: string;
  ctaLabel?: string;
}

const squadAvatarsDefault = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
];

const defaultCurve = [0.25, 0.45, 0.7, 0.95, 0.6, 0.85, 0.5, 0.75, 0.4];

export const allClasses: GymClass[] = [
  {
    id: 'titan-lift',
    name: 'TITAN LIFT',
    category: 'STRENGTH',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=500&fit=crop',
    duration: '45 Min',
    intensity: 'High',
    intensityLabel: 'HIGH INTENSITY',
    tags: ['STRENGTH', 'HIGH INTENSITY'],
    trainer: 'Sarah Miller',
    instructorDetail: {
      name: "SARAH 'IRON' MILLER",
      role: 'ELITE STRENGTH SPECIALIST',
      avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=120&h=120&fit=crop',
    },
    schedule: ['Mon 6:00 AM', 'Wed 6:00 AM', 'Fri 6:00 AM'],
    sessionLabel: 'TONIGHT',
    sessionTime: '18:00 - 18:45',
    studio: 'Iron Floor',
    description: 'Pure raw power building. Deadlifts, squats, and compound lifts for total strength.',
    longDescription:
      'A relentless, barbell-focused session engineered for progressive overload. Heavy compound lifts, controlled tempos, and strategic rest windows — built to forge total-body strength and lean muscle mass.',
    spots: 8,
    maxSpots: 20,
    benefits: [
      'Builds lean muscle mass',
      'Increases metabolism',
      'Improves bone density',
      'Enhances functional strength',
      'Tones and defines muscles',
    ],
    requirements: [
      'All fitness levels welcome',
      'Athletic footwear required',
      'Weights provided',
      'Water bottle',
    ],
    gear: [
      { label: 'Lifting Straps (Provided)', checked: true },
      { label: 'Sweat Towel', checked: true },
      { label: 'Water Bottle (750ml+)', checked: false },
    ],
    calories: '300-500 kcal',
    zoneTarget: 'ZONE 3 TARGET',
    intensityCurve: defaultCurve,
    squadAvatars: squadAvatarsDefault,
    squadStatus: 'FILLING FAST',
    ctaLabel: 'SECURE SPOT ⚡',
  },
  {
    id: 'inferno',
    name: 'INFERNO',
    category: 'HIIT',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=500&fit=crop',
    duration: '45 Min',
    intensity: 'High',
    intensityLabel: 'HIGH INTENSITY',
    tags: ['HIIT', 'HIGH INTENSITY'],
    trainer: 'Marcus Johnson',
    instructorDetail: {
      name: "MARCUS 'FORGE' JOHNSON",
      role: 'ELITE HIIT SPECIALIST',
      avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=120&h=120&fit=crop',
    },
    schedule: ['Mon 6:00 AM', 'Wed 6:00 AM', 'Fri 6:00 AM'],
    sessionLabel: 'TONIGHT',
    sessionTime: '19:00 - 19:45',
    studio: 'Arena 01',
    description: 'Maximum intensity intervals. Burn fat, build endurance, push past limits.',
    longDescription:
      'A relentless, rhythm-based assault on your limits. Heavy work intervals, rapid sprints, and zero excuses — this session is engineered to torch calories and build unbreakable conditioning.',
    spots: 8,
    maxSpots: 20,
    benefits: [
      'Burns up to 500 calories per session',
      'Improves cardiovascular endurance',
      'Boosts metabolism for hours after workout',
      'Builds lean muscle mass',
      'Increases mental toughness',
    ],
    requirements: [
      'Moderate fitness level recommended',
      'Comfortable athletic wear',
      'Water bottle',
      'Towel',
    ],
    gear: [
      { label: 'Heart Rate Monitor', checked: true },
      { label: 'Sweat Towel', checked: true },
      { label: 'Water Bottle (750ml+)', checked: false },
    ],
    calories: '400-600 kcal',
    zoneTarget: 'ZONE 5 TARGET',
    intensityCurve: [0.3, 0.9, 0.4, 0.95, 0.5, 0.85, 0.35, 0.8, 0.45],
    squadAvatars: squadAvatarsDefault,
    squadStatus: 'FILLING FAST',
    ctaLabel: 'SECURE SPOT ⚡',
  },
  {
    id: 'endurance',
    name: 'NEON SPIN SURGE',
    category: 'CARDIO',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    duration: '45 Min',
    intensity: 'High',
    intensityLabel: 'HIGH INTENSITY',
    tags: ['CARDIO', 'HIGH INTENSITY'],
    trainer: 'James Wilson',
    instructorDetail: {
      name: "JAXSON 'VOLT' REED",
      role: 'ELITE CADENCE SPECIALIST',
      avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&h=120&fit=crop',
    },
    schedule: ['Mon 5:30 PM', 'Wed 5:30 PM', 'Sat 10:00 AM'],
    sessionLabel: 'TONIGHT',
    sessionTime: '19:00 - 19:45',
    studio: 'Vault 03',
    description: 'Cardio that never quits. Sprints, rows, and sustained heart-rate training.',
    longDescription:
      'A relentless, rhythm-based ride through heavy climbs and rapid sprints. Neon-lit intensity meets precision cadence — engineered to push your cardiovascular ceiling and ignite every muscle fiber.',
    spots: 12,
    maxSpots: 24,
    benefits: [
      'Low impact, high results',
      'Strengthens legs and core',
      'Burns 500-700 calories',
      'Improves cardiovascular health',
      'Great for all fitness levels',
    ],
    requirements: [
      'Cycling shoes optional (we have clip-ins)',
      'Water bottle essential',
      'Arrive 10 min early for bike setup',
      'Towel recommended',
    ],
    gear: [
      { label: 'SPD Cleats (Provided)', checked: true },
      { label: 'Sweat Towel', checked: true },
      { label: 'Water Bottle (750ml+)', checked: false },
    ],
    calories: '600-800 kcal',
    zoneTarget: 'ZONE 4 TARGET',
    intensityCurve: defaultCurve,
    squadAvatars: squadAvatarsDefault,
    squadStatus: 'FILLING FAST',
    ctaLabel: 'SECURE BIKE ⚡',
  },
  {
    id: 'recovery',
    name: 'RECOVERY',
    category: 'MOBILITY',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=500&fit=crop',
    duration: '60 Min',
    intensity: 'Medium',
    intensityLabel: 'MODERATE FLOW',
    tags: ['MOBILITY', 'RECOVERY'],
    trainer: 'Lisa Chen',
    instructorDetail: {
      name: "LISA 'FLOW' CHEN",
      role: 'WELLNESS & MOBILITY LEAD',
      avatar: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=120&h=120&fit=crop',
    },
    schedule: ['Tue 7:00 AM', 'Thu 7:00 AM', 'Sat 9:00 AM'],
    sessionLabel: 'TOMORROW',
    sessionTime: '07:00 - 08:00',
    studio: 'Zen Loft',
    description: 'Restore and reset. Stretching, mobility flows, and active recovery work.',
    longDescription:
      'A deliberate, breath-led session focused on restoring range of motion, reducing tension, and resetting your nervous system. Slow flows, deep stretches, and mindful recovery protocols.',
    spots: 12,
    maxSpots: 25,
    benefits: [
      'Improves flexibility and balance',
      'Builds core strength',
      'Reduces stress and anxiety',
      'Enhances mind-body connection',
      'Promotes better posture',
    ],
    requirements: [
      'All fitness levels welcome',
      'Yoga mat (provided if needed)',
      'Comfortable, stretchy clothing',
      'Empty stomach recommended',
    ],
    gear: [
      { label: 'Yoga Mat (Provided)', checked: true },
      { label: 'Sweat Towel', checked: true },
      { label: 'Water Bottle (750ml+)', checked: true },
    ],
    calories: '200-400 kcal',
    zoneTarget: 'ZONE 2 TARGET',
    intensityCurve: [0.2, 0.35, 0.3, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
    squadAvatars: squadAvatarsDefault,
    squadStatus: 'OPEN SPOTS',
    ctaLabel: 'RESERVE MAT ⚡',
  },
];

export const getClassById = (id: string): GymClass | undefined =>
  allClasses.find((c) => c.id === id);

export const categories = ['ALL', 'HIIT', 'STRENGTH', 'CARDIO', 'MOBILITY'];
