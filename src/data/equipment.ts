export interface ExecutionStep {
  title: string;
  description: string;
}

export interface ProTip {
  quote: string;
  coach: string;
  coachAvatar?: string;
}

export interface EquipmentExercise {
  name: string;
  muscle: string;
  setsReps: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  image: string;
  shortDescription: string;
  longDescription: string;
  muscleGroups: string[];
  features: string[];
  howToUse: string[];
  tips: string[];
  quantity: number;
  tag?: string;
  displayName?: string;
  maxLoad?: string;
  avgTime?: string;
  targetZones?: string[];
  executionSteps?: ExecutionStep[];
  proTip?: ProTip;
  youtubeVideoId?: string;
  youtubeTitle?: string;
  exerciseCount?: number;
  handlingNotes?: string[];
  exercises?: EquipmentExercise[];
}

export const allEquipment: Equipment[] = [
  {
    id: 'treadmill',
    name: 'Technogym Treadmill',
    displayName: 'SKILLRUN TREADMILL',
    category: 'Cardio',
    tag: 'CARDIO ENGINE',
    image: 'https://images.unsplash.com/photo-1576678927483-cc7070ad5752?w=800&h=500&fit=crop',
    shortDescription: 'State-of-the-art treadmills with entertainment screens and performance tracking.',
    longDescription:
      'The ultimate cardio station for speed work, incline training, and endurance blocks. Responsive deck, HD display, and real-time performance metrics.',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Core'],
    targetZones: ['Quads', 'Glutes', 'Calves', 'Core'],
    maxLoad: 'N/A',
    avgTime: '20-45 MIN',
    features: [
      'Speed range: 0.5 - 30 km/h',
      'Incline range: -3% to 25%',
      '19-inch HD touchscreen display',
      'Heart rate monitoring',
      'Pre-programmed workouts',
      'Bluetooth connectivity',
    ],
    executionSteps: [
      {
        title: 'CLIP IN SAFELY',
        description: 'Step onto the side rails, attach the safety clip to your clothing, and confirm the belt is clear before starting.',
      },
      {
        title: 'WARM-UP PACE',
        description: 'Begin at a slow walk for 2-3 minutes. Gradually increase speed and incline only after your heart rate rises.',
      },
      {
        title: 'POSTURE CHECK',
        description: 'Keep eyes forward, shoulders relaxed, and land midfoot. Avoid holding the handrails during running intervals.',
      },
    ],
    howToUse: [
      'Step onto the side rails before starting',
      'Attach the safety clip to your clothing',
      'Start at a slow walking pace',
      'Gradually increase speed and incline',
      'Maintain good posture throughout',
      'Cool down before stopping',
    ],
    tips: [
      'Look straight ahead, not at your feet',
      'Land midfoot, not on your heels',
      "Don't hold the handrails while running",
      'Start with interval training for better results',
    ],
    proTip: {
      quote:
        "Use incline intervals instead of max speed to build conditioning with less joint stress. 30 seconds hard, 60 seconds recover — repeat 8-10 rounds.",
      coach: 'COACH MARCUS',
      coachAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop',
    },
    youtubeVideoId: 'brFHyOtTvjI',
    youtubeTitle: 'Treadmill Running Form',
    exerciseCount: 12,
    handlingNotes: [
      'Always clip the safety cord to your clothing before stepping on the belt',
      'Mount and dismount using the side rails — never jump on a moving belt',
      'Wipe down handles and console after each session',
      'Report unusual belt slip, burning smell, or error codes to staff immediately',
    ],
    exercises: [
      { name: 'Steady-State Jog', muscle: 'Cardio', setsReps: '20-30 min' },
      { name: 'Incline Walk', muscle: 'Glutes / Calves', setsReps: '15 min @ 8-12%' },
      { name: 'Sprint Intervals', muscle: 'Cardio / Legs', setsReps: '10 × 30 sec' },
      { name: 'Hill Repeats', muscle: 'Quads / Glutes', setsReps: '8 × 1 min' },
      { name: 'Walking Lunges (Off Belt)', muscle: 'Legs', setsReps: '3 × 12 each' },
      { name: 'Side Shuffles', muscle: 'Hip / Glute Med', setsReps: '3 × 30 sec' },
    ],
    quantity: 15,
  },
  {
    id: 'cable-machine',
    name: 'Dual Cable Crossover',
    displayName: 'DUAL CABLE STATION',
    category: 'Strength',
    tag: 'FUNCTIONAL STRENGTH',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    shortDescription: 'Versatile cable machine for hundreds of exercises targeting every muscle group.',
    longDescription:
      'The most versatile station in the gym. Adjustable pulleys, dual stacks, and endless angles for isolation work and athletic movement patterns.',
    muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs'],
    targetZones: ['Chest', 'Back', 'Arms', 'Core'],
    maxLoad: '400 LBS',
    avgTime: '10-20 MIN',
    features: [
      'Dual 200lb weight stacks',
      '17 height adjustments per side',
      'Wide variety of handle attachments',
      'Smooth, consistent resistance',
      'Built-in pull-up bar',
      'Integrated dip station',
    ],
    executionSteps: [
      {
        title: 'SELECT YOUR STACK',
        description: 'Set equal weight on both sides. Start lighter than you think — cable tension stays constant through the full range.',
      },
      {
        title: 'ADJUST PULLEY HEIGHT',
        description: 'High for pulldowns, mid for presses, low for rows and curls. Lock the pin fully before loading tension.',
      },
      {
        title: 'CONTROL THE ECCENTRIC',
        description: 'Move with intent on the pull, then return slowly over 2-3 seconds. Never let the weight stack slam.',
      },
    ],
    howToUse: [
      'Select appropriate weight on both stacks',
      'Adjust pulley height for your exercise',
      'Choose the correct handle attachment',
      'Maintain stable stance throughout movement',
      'Control the weight on both concentric and eccentric phases',
      'Return handles to starting position safely',
    ],
    tips: [
      'Start with lighter weight to master form',
      'Keep your core engaged throughout',
      "Don't let the weights crash down",
      'Experiment with different angles for muscle targeting',
    ],
    proTip: {
      quote:
        'Stagger your stance on single-arm rows and presses — it recruits more core stability and mirrors real-world movement patterns.',
      coach: 'COACH SARAH',
      coachAvatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=80&h=80&fit=crop',
    },
    youtubeVideoId: 'taI4XduIVVA',
    youtubeTitle: 'Cable Machine Exercises',
    exerciseCount: 50,
    handlingNotes: [
      'Check pin is fully seated in the weight stack before each set',
      'Use controlled motion — never release handles from a stretched position',
      'Return handles to the holder when switching attachments or exercises',
      'Keep fingers clear of moving cables and pulley paths',
    ],
    exercises: [
      { name: 'Cable Chest Fly', muscle: 'Chest', setsReps: '3 × 12-15' },
      { name: 'Lat Pulldown', muscle: 'Back', setsReps: '4 × 10-12' },
      { name: 'Tricep Pushdown', muscle: 'Triceps', setsReps: '3 × 12-15' },
      { name: 'Cable Row', muscle: 'Back / Biceps', setsReps: '4 × 10' },
      { name: 'Face Pull', muscle: 'Rear Delts', setsReps: '3 × 15' },
      { name: 'Cable Curl', muscle: 'Biceps', setsReps: '3 × 12' },
    ],
    quantity: 4,
  },
  {
    id: 'barbell-rack',
    name: 'Olympic Barbell & Rack',
    displayName: 'ELITE POWER RACK',
    category: 'Strength',
    tag: 'HEAVY COMPOUND',
    image: 'https://images.unsplash.com/photo-1517963879466-eaa25efb5d5b?w=800&h=500&fit=crop',
    shortDescription: 'Professional Olympic barbells and power racks for serious strength training.',
    longDescription:
      'The ultimate station for safe, high-load compound movements. Squats, presses, and pulls with full safety support and competition-grade barbells.',
    muscleGroups: ['Full Body', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
    targetZones: ['Quads', 'Glutes', 'Core', 'Shoulders'],
    maxLoad: '1,200 LBS',
    avgTime: '15-30 MIN',
    features: [
      '20kg Olympic barbells (45lbs)',
      'Rubber-coated weight plates',
      'Adjustable safety spotter arms',
      'Multiple J-hook positions',
      'Built-in band pegs',
      'Weight plate storage',
    ],
    executionSteps: [
      {
        title: 'SET THE SAFETIES',
        description:
          'Adjust the safety pins to sit 1-2 inches below your lowest squat depth. This is your fail-safe if you miss a rep.',
      },
      {
        title: 'J-HOOK PLACEMENT',
        description:
          'Position hooks at mid-chest height. The bar should clear the hooks with a slight knee bend when unracking.',
      },
      {
        title: 'THE WALKOUT',
        description:
          'Unrack with a tight brace, take 2-3 controlled steps back, and establish your stance before descending.',
      },
    ],
    howToUse: [
      'Adjust rack height to appropriate level',
      'Set safety bars just below your lowest point',
      'Load plates evenly on both sides',
      'Secure weights with collars',
      'Unrack with control',
      'Re-rack weights after each set',
    ],
    tips: [
      'Always use a spotter for heavy lifts',
      'Master form with lighter weights first',
      'Grip the bar evenly using the knurling',
      'Breathe properly: exhale on exertion',
    ],
    proTip: {
      quote:
        "If you're failing a squat inside the rack, don't dump the bar backward. Let your knees collapse slightly forward and guide the bar straight down onto the safeties. Maintain core tension until the weight is fully supported.",
      coach: 'COACH MARCUS',
      coachAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop',
    },
    youtubeVideoId: 'ultWZbUMy8Q',
    youtubeTitle: 'Power Rack Squat Tutorial',
    exerciseCount: 24,
    handlingNotes: [
      'Load plates evenly on both sides and secure with collars before lifting',
      'Set safety pins below your lowest rep depth before unracking heavy weight',
      'Re-rack the bar on J-hooks — never drop plates or bars onto the floor',
      'Use a spotter for near-max attempts; safeties are backup, not primary',
    ],
    exercises: [
      { name: 'Back Squat', muscle: 'Quads / Glutes', setsReps: '4 × 6-8' },
      { name: 'Bench Press', muscle: 'Chest / Triceps', setsReps: '4 × 8-10' },
      { name: 'Overhead Press', muscle: 'Shoulders', setsReps: '3 × 8-10' },
      { name: 'Barbell Row', muscle: 'Back', setsReps: '4 × 8' },
      { name: 'Rack Pull', muscle: 'Posterior Chain', setsReps: '3 × 5' },
      { name: 'Pin Squat', muscle: 'Quads', setsReps: '3 × 6' },
    ],
    quantity: 8,
  },
  {
    id: 'rowing-machine',
    name: 'Concept2 Rower',
    displayName: 'CONCEPT2 ROWER',
    category: 'Cardio',
    tag: 'FULL-BODY CARDIO',
    image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=500&fit=crop',
    shortDescription: 'The industry-standard rowing machine for full-body cardio workouts.',
    longDescription:
      'Low-impact, high-output cardio that builds posterior chain strength and engine capacity. The gold standard for metabolic conditioning.',
    muscleGroups: ['Back', 'Legs', 'Arms', 'Core', 'Shoulders'],
    targetZones: ['Back', 'Legs', 'Core', 'Arms'],
    maxLoad: '500 LBS',
    avgTime: '15-25 MIN',
    features: [
      'Air resistance (adjustable damper)',
      'PM5 performance monitor',
      'Bluetooth & ANT+ connectivity',
      'Nickel-plated chain',
      'Ergonomic handle',
      'Folds for storage',
    ],
    executionSteps: [
      {
        title: 'FOOT STRAP SETUP',
        description: 'Secure feet with the strap across the ball of your foot. Shins vertical at the catch position.',
      },
      {
        title: 'DRIVE SEQUENCE',
        description: 'Legs first, then hinge back, then pull with arms. Power comes from the legs — arms finish the stroke.',
      },
      {
        title: 'RECOVERY ORDER',
        description: 'Return in reverse: arms away, body forward, knees bend. Ratio 1:2 drive to recovery for endurance.',
      },
    ],
    howToUse: [
      'Secure your feet in the footrests',
      'Adjust strap across the ball of your foot',
      'Start with legs bent, arms extended',
      'Drive through your legs first',
      'Then pull with your back and arms',
      'Return in reverse order: arms, body, legs',
    ],
    tips: [
      'Focus on leg drive, not arm pulling',
      'Keep your back straight, not rounded',
      'Damper setting 3-5 is ideal for most people',
      'Watch your stroke rate: 18-22 for endurance',
    ],
    proTip: {
      quote:
        'Think "push the floor away" on the drive instead of yanking the handle. Your split time drops when leg drive leads every stroke.',
      coach: 'COACH JAX',
      coachAvatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=80&h=80&fit=crop',
    },
    youtubeVideoId: 'zQ82FC_le9Q',
    youtubeTitle: 'Concept2 Rowing Technique',
    exerciseCount: 8,
    handlingNotes: [
      'Adjust foot straps snugly over the ball of each foot before starting',
      'Grip handle lightly — over-gripping fatigues forearms early',
      'Wipe rail and handle after use; check chain tension if stroke feels uneven',
      'Return damper to setting 3-5 for the next user',
    ],
    exercises: [
      { name: 'Steady-State Row', muscle: 'Full Body Cardio', setsReps: '20-30 min' },
      { name: '500m Intervals', muscle: 'Cardio / Legs', setsReps: '6 × 500m' },
      { name: 'Pyramid Sprints', muscle: 'Cardio', setsReps: '1-5-1 min' },
      { name: 'Row + Burpee EMOM', muscle: 'Full Body', setsReps: '12 min' },
      { name: 'Recovery Paddle', muscle: 'Active Recovery', setsReps: '10 min easy' },
      { name: '2k Time Trial', muscle: 'Endurance', setsReps: '1 × 2000m' },
    ],
    quantity: 10,
  },
  {
    id: 'kettlebells',
    name: 'Competition Kettlebells',
    displayName: 'COMPETITION KETTLEBELLS',
    category: 'Functional',
    tag: 'FUNCTIONAL POWER',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=500&fit=crop',
    shortDescription: 'Full range of competition kettlebells for functional training and conditioning.',
    longDescription:
      'Dynamic strength and conditioning tools for swings, cleans, and carries. Uniform size across weights for consistent technique progression.',
    muscleGroups: ['Full Body', 'Core', 'Shoulders', 'Glutes', 'Back'],
    targetZones: ['Glutes', 'Core', 'Shoulders', 'Back'],
    maxLoad: '106 LBS',
    avgTime: '10-20 MIN',
    features: [
      'Weight range: 4kg - 48kg',
      'Competition size (uniform dimensions)',
      'Color-coded by weight',
      'Steel construction',
      'Smooth, consistent handle',
      'Flat base for stability',
    ],
    executionSteps: [
      {
        title: 'HIP HINGE FIRST',
        description: 'Master the hinge before adding speed. Hips back, spine neutral, knees soft — feel tension in hamstrings.',
      },
      {
        title: 'SWING PATH',
        description: 'Drive hips forward explosively. The bell floats to chest height from hip power, not arm lift.',
      },
      {
        title: 'GRIP & BREATH',
        description: 'Exhale at the top of each rep, inhale on the hike pass. Keep wrists straight and knuckles down.',
      },
    ],
    howToUse: [
      'Start with a weight you can control',
      'Learn the hip hinge movement first',
      'Keep the weight close to your body',
      'Engage your core throughout',
      'Master the swing before advanced moves',
      'Progress gradually to heavier weights',
    ],
    tips: [
      'Power comes from your hips, not arms',
      'Keep your wrist straight',
      'Start with two-handed exercises',
      'Consider taking a kettlebell class first',
    ],
    proTip: {
      quote:
        'If your lower back burns before your hips do, drop weight and drill dead-stop swings. Power leaks happen when the hinge breaks down.',
      coach: 'COACH SARAH',
      coachAvatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=80&h=80&fit=crop',
    },
    youtubeVideoId: 'YSxHifyI6s8',
    youtubeTitle: 'Kettlebell Swing Form',
    exerciseCount: 18,
    handlingNotes: [
      'Pick up and set down bells with a flat back — never round your spine under load',
      'Keep clear space around you; swings need a full arm arc',
      'Return bells to the rack by weight, heaviest on bottom shelves',
      'Chalk hands if grip slips; do not use wrist straps on ballistic movements',
    ],
    exercises: [
      { name: 'Two-Hand Swing', muscle: 'Glutes / Hips', setsReps: '4 × 15' },
      { name: 'Goblet Squat', muscle: 'Quads / Core', setsReps: '3 × 12' },
      { name: 'Turkish Get-Up', muscle: 'Full Body', setsReps: '3 × 3 each' },
      { name: 'Single-Arm Press', muscle: 'Shoulders', setsReps: '3 × 8 each' },
      { name: 'Farmer Carry', muscle: 'Grip / Core', setsReps: '4 × 40m' },
      { name: 'Clean & Press', muscle: 'Full Body', setsReps: '3 × 6 each' },
    ],
    quantity: 20,
  },
  {
    id: 'leg-press',
    name: 'Plate-Loaded Leg Press',
    displayName: 'PLATE-LOADED LEG PRESS',
    category: 'Strength',
    tag: 'LOWER BODY POWER',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=500&fit=crop',
    shortDescription: 'Heavy-duty leg press machine for building serious lower body strength.',
    longDescription:
      'Train legs under heavy load with reduced spinal stress. Adjustable foot placement targets quads, glutes, and hamstrings with precision.',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    targetZones: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    maxLoad: '1,800 LBS',
    avgTime: '15-25 MIN',
    features: [
      '45-degree pressing angle',
      '800kg weight capacity',
      'Adjustable back support',
      'Multiple foot placement options',
      'Safety lock mechanism',
      'Smooth linear bearings',
    ],
    executionSteps: [
      {
        title: 'FOOT POSITION',
        description: 'Shoulder-width on the platform, toes slightly out. Higher feet bias glutes; lower feet bias quads.',
      },
      {
        title: 'RANGE OF MOTION',
        description: 'Lower until knees reach roughly 90°. Keep lower back pressed into the pad throughout the descent.',
      },
      {
        title: 'DRIVE THROUGH HEELS',
        description: 'Press without locking knees at the top. Control the negative — 2-3 seconds on the way down.',
      },
    ],
    howToUse: [
      'Adjust the back pad for comfort',
      'Load plates evenly on both sides',
      'Place feet shoulder-width on platform',
      'Release the safety handles',
      'Lower weight until 90-degree knee bend',
      'Push through your heels to extend',
    ],
    tips: [
      "Don't lock out your knees at the top",
      'Keep your lower back pressed into the pad',
      'Adjust foot position to target different muscles',
      'Higher feet = more glute/hamstring emphasis',
    ],
    proTip: {
      quote:
        'Half reps on leg press build ego, not muscle. Full depth with controlled tempo — that is where quad and glute growth actually happens.',
      coach: 'COACH MARCUS',
      coachAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop',
    },
    youtubeVideoId: 'IZxyjW7MPJQ',
    youtubeTitle: 'Leg Press Form Guide',
    exerciseCount: 6,
    handlingNotes: [
      'Engage safety locks before loading or unloading plates',
      'Keep knees tracking over toes — never let them cave inward under load',
      'Do not lock knees fully at the top of each rep',
      'Unload plates evenly; never leave one side loaded',
    ],
    exercises: [
      { name: 'Standard Leg Press', muscle: 'Quads / Glutes', setsReps: '4 × 10-12' },
      { name: 'High Foot Placement', muscle: 'Glutes / Hams', setsReps: '3 × 12' },
      { name: 'Low Foot Placement', muscle: 'Quads', setsReps: '3 × 12' },
      { name: 'Single-Leg Press', muscle: 'Unilateral Legs', setsReps: '3 × 10 each' },
      { name: 'Calf Press', muscle: 'Calves', setsReps: '4 × 15' },
      { name: 'Pause Reps', muscle: 'Quads', setsReps: '3 × 8 (3s pause)' },
    ],
    quantity: 3,
  },
];

export const getEquipmentById = (id: string): Equipment | undefined =>
  allEquipment.find((e) => e.id === id);

export const equipmentCategories = ['All', 'Cardio', 'Strength', 'Functional'];
