export interface TimeSlot {
  time: string;
  booked?: boolean;
}

export interface AvailabilityDay {
  label: string;
  date: number;
  slots: TimeSlot[];
}

export interface FeaturedProgram {
  badge: string;
  title: string;
  description: string;
  image: string;
}

export interface Trainer {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  gender?: string;
  age?: number;
  bloodGroup?: string;
  role: string;
  image: string;
  bio: string;
  longBio: string;
  shortBio?: string;
  certifications: string[];
  specialties: string[];
  experience: string;
  clients: string;
  rating: string;
  instagram: string;
  email: string;
  schedule: string[];
  status?: 'available' | 'live' | 'booked' | 'off_duty';
  tagline?: string;
  titleBadge?: string;
  reviewCount?: number;
  philosophy?: string;
  certTags?: string[];
  availability?: AvailabilityDay[];
  featuredProgram?: FeaturedProgram;
}

const defaultAvailability: AvailabilityDay[] = [
  {
    label: 'MON',
    date: 12,
    slots: [
      { time: '06:00 AM' },
      { time: '08:00 AM' },
      { time: '10:00 AM', booked: true },
    ],
  },
  {
    label: 'TUE',
    date: 13,
    slots: [
      { time: '07:00 AM' },
      { time: '09:00 AM', booked: true },
      { time: '11:00 AM' },
    ],
  },
  {
    label: 'WED',
    date: 14,
    slots: [
      { time: '06:00 AM', booked: true },
      { time: '08:00 AM' },
      { time: '12:00 PM' },
    ],
  },
];

export const allTrainers: Trainer[] = [
  {
    id: 'marcus-johnson',
    name: 'Marcus Johnson',
    role: 'Head Trainer & HIIT Specialist',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&h=1000&fit=crop',
    bio: 'With 12 years of experience, Marcus specializes in high-intensity training and functional fitness. He\'s helped hundreds of clients achieve their body transformation goals.',
    shortBio:
      'Elite Strength & Conditioning Specialist. Specializing in functional hypertrophy and metabolic conditioning.',
    longBio:
      'Marcus began his fitness career as a competitive athlete before transitioning to coaching. Over 12 years, he has trained everyone from beginners to professional athletes, developing signature HIIT programs that maximize fat loss while preserving lean muscle.',
    certifications: ['NASM-CPT', 'CrossFit Level 2', 'TRX Certified'],
    certTags: ['NSCA CSCS', 'Precision Nutrition L2', 'Olympic Weightlifting', 'Metabolic Conditioning'],
    specialties: ['Powerlifting', 'Hypertrophy', 'Strength Training'],
    experience: '8 years',
    clients: '500+',
    rating: '4.9',
    reviewCount: 128,
    instagram: '#',
    email: 'marcus@forgegym.com',
    schedule: ['Mon 6:00 AM', 'Wed 6:00 AM', 'Fri 6:00 AM', 'Sat 9:00 AM'],
    status: 'available',
    tagline: 'STRENGTH COACH',
    titleBadge: 'HEAD COACH',
    philosophy:
      '"True strength isn\'t just about moving weight; it\'s about moving weight with purpose. We don\'t just train; we engineer performance."',
    availability: defaultAvailability,
    featuredProgram: {
      badge: '8-WEEK CYCLE',
      title: 'HYPERTROPHY PROTOCOL ALPHA',
      description: 'Build lean mass. Increase work capacity.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop',
    },
  },
  {
    id: 'sarah-miller',
    name: 'Sarah Miller',
    role: 'Strength & Conditioning Coach',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=1000&fit=crop',
    bio: 'Sarah is a former competitive powerlifter who now dedicates her expertise to helping clients build strength safely and effectively.',
    shortBio:
      'National-level powerlifter focused on progressive overload, injury prevention, and peak conditioning.',
    longBio:
      'A national-level powerlifter with over a decade under the bar, Sarah brings unmatched technical precision to strength coaching. She specializes in progressive overload programming and helps clients smash plateaus while staying injury-free.',
    certifications: ['CSCS', 'USAW Level 1', 'Precision Nutrition L1'],
    certTags: ['CSCS', 'USAW Level 1', 'Precision Nutrition L1', 'Olympic Lifting'],
    specialties: ['HIIT', 'Agility', 'Conditioning'],
    experience: '10 years',
    clients: '350+',
    rating: '4.9',
    reviewCount: 96,
    instagram: '#',
    email: 'sarah@forgegym.com',
    schedule: ['Tue 6:00 PM', 'Thu 6:00 PM', 'Sat 10:00 AM'],
    status: 'live',
    tagline: 'CONDITIONING',
    titleBadge: 'LEAD COACH',
    philosophy:
      '"Strength is a skill. Every rep is practice — precision beats ego, every single session."',
    availability: defaultAvailability,
    featuredProgram: {
      badge: '6-WEEK CYCLE',
      title: 'POWER BASE BUILDER',
      description: 'Increase your 1RM safely. Master the big three.',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop',
    },
  },
  {
    id: 'james-wilson',
    name: 'Jax Miller',
    role: 'Combat & MMA Coach',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop',
    bio: 'A former marathon runner, James brings his passion for endurance sports to our spin and cardio classes. He makes cardio fun and challenging.',
    shortBio:
      'Combat sports specialist blending boxing, Muay Thai, and high-intensity conditioning.',
    longBio:
      'Boston Marathon finisher turned certified coach, James blends endurance science with high-energy group instruction. His sessions are legendary — expect hills, sprints, and a soundtrack that pushes you past your limit.',
    certifications: ['ACE-CPT', 'Spinning Certified', 'First Aid/CPR'],
    certTags: ['Combat Sports', 'Muay Thai', 'Boxing Level 2', 'First Aid/CPR'],
    specialties: ['Boxing', 'Muay Thai', 'Combat'],
    experience: '8 years',
    clients: '400+',
    rating: '4.8',
    reviewCount: 74,
    instagram: '#',
    email: 'james@forgegym.com',
    schedule: ['Mon 5:30 PM', 'Wed 5:30 PM', 'Sat 10:00 AM'],
    status: 'booked',
    tagline: 'COMBAT',
    titleBadge: 'COMBAT COACH',
    philosophy:
      '"Fight ready isn\'t a look — it\'s a mindset. Train like every round counts."',
    availability: defaultAvailability.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => ({ ...slot, booked: true })),
    })),
    featuredProgram: {
      badge: '4-WEEK CYCLE',
      title: 'FIGHT CAMP CONDITIONING',
      description: 'Explosive power. Fight-ready endurance.',
      image: 'https://images.unsplash.com/photo-1549719386-69dfdf86a558?w=800&h=400&fit=crop',
    },
  },
  {
    id: 'lisa-chen',
    name: 'Lisa Chen',
    role: 'Yoga & Mindfulness Instructor',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&h=1000&fit=crop',
    bio: 'Lisa trained in India and brings an authentic approach to yoga and meditation. She specializes in helping clients find balance between physical and mental wellness.',
    shortBio:
      'RYT-500 instructor weaving breathwork, movement, and meditation into every session.',
    longBio:
      'Trained in Rishikesh and Mysore, Lisa teaches yoga that honors tradition while meeting modern bodies where they are. Her classes weave breathwork, movement, and meditation into a single grounding practice.',
    certifications: ['RYT-500', 'Meditation Teacher', 'Breathwork Certified'],
    certTags: ['RYT-500', 'Meditation Teacher', 'Breathwork', 'Stress Reduction'],
    specialties: ['Vinyasa Yoga', 'Meditation', 'Stress Reduction'],
    experience: '9 years',
    clients: '600+',
    rating: '5.0',
    reviewCount: 142,
    instagram: '#',
    email: 'lisa@forgegym.com',
    schedule: ['Daily 7:00 AM', 'Tue 7:00 AM', 'Thu 7:00 AM'],
    status: 'available',
    tagline: 'YOGA & MINDFULNESS',
    titleBadge: 'WELLNESS LEAD',
    philosophy:
      '"The body and mind are one system. Stillness is strength — recovery is performance."',
    availability: defaultAvailability,
    featuredProgram: {
      badge: '8-WEEK CYCLE',
      title: 'MIND-BODY RESET',
      description: 'Restore mobility. Reduce stress. Recover deeper.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop',
    },
  },
];

export const getTrainerById = (id: string, trainers: Trainer[] = allTrainers): Trainer | undefined =>
  trainers.find((t) => t.id === id);
