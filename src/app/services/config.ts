// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  BASE_URL: 'https://studyfirstapi-production.up.railway.app',
  TIMEOUT: 30000, // 30 seconds
  USE_MOCK_DATA: false, // Set to false when backend is ready
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_AUTH: '/auth/google',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Tasks
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    TODAY: '/tasks/today',
    UPCOMING: '/tasks/upcoming',
    COMPLETE: (id: string) => `/tasks/${id}/complete`,
    UNCOMPLETE: (id: string) => `/tasks/${id}/uncomplete`,
  },
  
  // Google Classroom
  CLASSROOM: {
    SYNC: '/classroom/sync',
    COURSES: '/classroom/courses',
    ASSIGNMENTS: '/classroom/assignments',
    ASSIGNMENT_BY_ID: (id: string) => `/classroom/assignments/${id}`,
    CONNECT: '/classroom/connect',
    DISCONNECT: '/classroom/disconnect',
    STATUS: '/classroom/status',
  },
  
  // Streaks
  STREAKS: {
    CURRENT: '/streaks/current',
    HISTORY: '/streaks/history',
    UPDATE: '/streaks/update',
  },
  
  // Badges
  BADGES: {
    ALL: '/badges',
    USER_BADGES: '/badges/user',
    PROGRESS: '/badges/progress',
    BY_ID: (id: string) => `/badges/${id}`,
  },
  
  // Break Sessions
  BREAKS: {
    BASE: '/breaks',
    START: '/breaks/start',
    END: (id: string) => `/breaks/${id}/end`,
    TODAY: '/breaks/today',
  },
  
  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
};

export const AUTH_STORAGE_KEY = 'study_first_auth';
export const TOKEN_STORAGE_KEY = 'study_first_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'study_first_refresh_token';
