// Application routes
export const AppRoutes = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ATTENDANCE: '/attendance',
  CGPA: '/cgpa',
  TIMETABLE: '/timetable',
  CLASS_TIMETABLE: '/class-timetable',
  INTERNALS: '/internals',
  FEEDBACK: '/feedback',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ABOUT: '/about',
  NOT_FOUND: '/404',
} as const;

// API endpoints
export const ApiEndpoints = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_GOOGLE: '/auth/google',
  AUTH_GOOGLE_CALLBACK: '/auth/google/callback',
  AUTH_PROFILE: '/auth/profile',

  // Student data
  ATTENDANCE: '/attendance',
  CGPA: '/cgpa',
  TIMETABLE: '/timetable',
  CLASS_TIMETABLE: '/class-timetable',
  INTERNALS: '/internals',
  FEEDBACK: '/feedback',
  HOME: '/home',

  // Combined
  ALL_DATA: '/all-data',

  // Health
  HEALTH: '/health',
} as const;

// Type for routes
export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];
export type ApiEndpoint = (typeof ApiEndpoints)[keyof typeof ApiEndpoints];
