// ============================================================================
// TypeScript Interfaces for Study First API
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  googleId?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface GoogleAuthRequest {
 idToken: string;
}

export interface GoogleAuthResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// Tasks & Assignments
// ============================================================================

export type TaskSource = "google-classroom" | "manual";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  class?: string;
  dueDate: string; // ISO 8601 format
  dueTime?: string;
  completed: boolean;
  source: TaskSource;
  points?: number;
  attachments?: string[];
  googleClassroomId?: string;
  courseId?: string;
  courseName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  class?: string;
  dueDate: string;
  dueTime?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  class?: string;
  dueDate?: string;
  dueTime?: string;
  completed?: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}

// ============================================================================
// Google Classroom
// ============================================================================

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: string;
  alternateLink: string;
}

export interface GoogleClassroomAssignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  materials?: any[];
  state: string;
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: string;
}

export interface SyncClassroomRequest {
  forceRefresh?: boolean;
}

export interface SyncClassroomResponse {
  syncedAt: string;
  coursesCount: number;
  assignmentsCount: number;
  newAssignments: number;
}

// ============================================================================
// Streaks
// ============================================================================

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  totalTasksCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreakHistory {
  date: string;
  tasksCompleted: number;
  streakDay: number;
}

export interface UpdateStreakRequest {
  date: string;
  tasksCompleted: number;
}

// ============================================================================
// Badges & Achievements
// ============================================================================

export type BadgeCategory = "streak" | "tasks" | "focus" | "special";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  requirement: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
  progress?: number;
}

export interface BadgeProgress {
  badgeId: string;
  badge: Badge;
  currentProgress: number;
  required: number;
  percentage: number;
  isEarned: boolean;
}

// ============================================================================
// Break Timer
// ============================================================================

export interface BreakSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  completed: boolean;
  date: string;
}

export interface CreateBreakSessionRequest {
  duration: number;
}

export interface BreakSessionResponse {
  session: BreakSession;
  remainingBreaksToday: number;
  totalBreakTimeToday: number;
}

// ============================================================================
// Settings & Preferences
// ============================================================================

export interface UserSettings {
  id: string;
  userId: string;
  breakDuration: number; // in minutes
  maxBreaksPerDay: number;
  breakIntervalMinutes: number;
  notificationsEnabled: boolean;
  lockAppsEnabled: boolean;
  lockedApps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  breakDuration?: number;
  maxBreaksPerDay?: number;
  breakIntervalMinutes?: number;
  notificationsEnabled?: boolean;
  lockAppsEnabled?: boolean;
  lockedApps?: string[];
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface TaskQueryParams {
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  source?: TaskSource;
  page?: number;
  pageSize?: number;
}

export interface StreakQueryParams {
  startDate?: string;
  endDate?: string;
}
