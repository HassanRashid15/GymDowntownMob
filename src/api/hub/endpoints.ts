export const endpoints = {
  auth: {
    login: { method: 'POST', path: '/api/auth/login' },
    register: { method: 'POST', path: '/api/auth/register' },
    logout: { method: 'POST', path: '/api/auth/logout' },
    me: { method: 'GET', path: '/api/auth/me' },
  },
  admin: {
    listUsers: { method: 'GET', path: '/api/admin/users' },
    createUser: { method: 'POST', path: '/api/admin/users' },
    updateUser: { method: 'PATCH', path: '/api/admin/users' },
    deleteUser: { method: 'DELETE', path: '/api/admin/users' },
    monthlyMembers: { method: 'GET', path: '/api/admin/monthly-members' },
    platformSettings: { method: 'GET', path: '/api/admin/platform-settings' },
    updatePlatformSettings: { method: 'PATCH', path: '/api/admin/platform-settings' },
    pending: { method: 'GET', path: '/api/admin/pending' },
    pendingAction: { method: 'POST', path: '/api/admin/pending' },
    promotions: { method: 'GET', path: '/api/admin/promotions' },
    createPromotion: { method: 'POST', path: '/api/admin/promotions' },
    updatePromotion: { method: 'PATCH', path: '/api/admin/promotions' },
    deletePromotion: { method: 'DELETE', path: '/api/admin/promotions' },
    newsletter: { method: 'GET', path: '/api/admin/newsletter' },
    newsletterRemove: { method: 'DELETE', path: '/api/admin/newsletter' },
    traffic: { method: 'GET', path: '/api/admin/traffic' },
    membershipFees: { method: 'GET', path: '/api/admin/membership-fees' },
    updateMembershipFee: { method: 'PATCH', path: '/api/admin/membership-fees' },
    contactMessages: { method: 'GET', path: '/api/admin/contact-messages' },
  },
  profiles: {
    get: { method: 'GET', path: '/api/profiles' },
    create: { method: 'POST', path: '/api/profiles' },
    update: { method: 'PATCH', path: '/api/profiles' },
  },
  progress: {
    get: { method: 'GET', path: '/api/progress' },
    save: { method: 'POST', path: '/api/progress' },
    addExercise: { method: 'POST', path: '/api/progress/exercises' },
    exerciseCatalog: { method: 'GET', path: '/api/progress/exercise-catalog' },
    exerciseDemo: { method: 'GET', path: '/api/progress/exercise-demo' },
    deleteExercise: { method: 'DELETE', path: '/api/progress/exercises' },
    deleteRecord: { method: 'DELETE', path: '/api/progress/records' },
  },
  attendance: {
    list: { method: 'GET', path: '/api/attendance' },
    checkIn: { method: 'POST', path: '/api/attendance' },
    checkOut: { method: 'PATCH', path: '/api/attendance' },
  },
  gyms: {
    list: { method: 'GET', path: '/api/gyms' },
    detail: { method: 'GET', path: '/api/gyms/:ownerId' },
    trainers: { method: 'GET', path: '/api/gyms/:ownerId/trainers' },
    reviews: { method: 'GET', path: '/api/gyms/:ownerId/reviews' },
    createReview: { method: 'POST', path: '/api/gyms/:ownerId/reviews' },
  },
  membership: {
    me: { method: 'GET', path: '/api/membership/me' },
  },
  classes: {
    list: { method: 'GET', path: '/api/classes' },
    create: { method: 'POST', path: '/api/classes' },
    createSession: { method: 'POST', path: '/api/classes/sessions' },
    book: { method: 'PUT', path: '/api/classes/sessions' },
  },
  notifications: {
    list: { method: 'GET', path: '/api/notifications' },
    markAllRead: { method: 'PATCH', path: '/api/notifications' },
    updateOne: { method: 'PATCH', path: '/api/notifications/:id' },
    deleteOne: { method: 'DELETE', path: '/api/notifications/:id' },
  },
  promotions: {
    public: { method: 'GET', path: '/api/promotions' },
  },
  newsletter: {
    me: { method: 'GET', path: '/api/newsletter/me' },
    setMe: { method: 'PATCH', path: '/api/newsletter/me' },
  },
  blog: {
    list: { method: 'GET', path: '/api/blog' },
    detail: { method: 'GET', path: '/api/blog/:id' },
  },
  exercises: {
    list: { method: 'GET', path: '/api/exercises' },
  },
  reviews: {
    list: { method: 'GET', path: '/api/reviews' },
    submit: { method: 'POST', path: '/api/reviews' },
    moderate: { method: 'PATCH', path: '/api/reviews' },
    remove: { method: 'DELETE', path: '/api/reviews' },
  },
  platform: {
    publicStats: { method: 'GET', path: '/api/platform/public-stats' },
  },
  contact: {
    submit: { method: 'POST', path: '/api/contact' },
  },
} as const;

export type EndpointsConfig = typeof endpoints;
