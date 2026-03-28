// ============================================================================
// Mock Data for Frontend Development
// ============================================================================

import type {
  User,
  Task,
  Streak,
  Badge,
  UserBadge,
  GoogleClassroomCourse,
  GoogleClassroomAssignment,
  UserSettings,
  BreakSession,
} from '../types';

// ============================================================================
// Mock User
// ============================================================================

export const mockUser: User = {
  id: 'user-1',
  email: 'student@example.com',
  name: 'Alex Johnson',
  profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  googleId: 'google-123456',
  createdAt: new Date(2026, 0, 1).toISOString(),
  lastLogin: new Date().toISOString(),
};

// ============================================================================
// Mock Tasks
// ============================================================================

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'user-1',
    title: 'Chapter 5 Math Homework',
    description: 'Complete problems 1-25 on pages 142-143. Show all work and include step-by-step solutions. Focus on quadratic equations and factoring.',
    class: 'Algebra II',
    dueDate: new Date(2026, 2, 25).toISOString(),
    dueTime: '11:59 PM',
    completed: false,
    source: 'google-classroom',
    points: 20,
    attachments: ['Chapter_5_Worksheet.pdf', 'Formula_Sheet.pdf'],
    googleClassroomId: 'gc-assignment-1',
    courseId: 'course-1',
    courseName: 'Algebra II - Period 3',
    createdAt: new Date(2026, 2, 20).toISOString(),
    updatedAt: new Date(2026, 2, 20).toISOString(),
  },
  {
    id: 'task-2',
    userId: 'user-1',
    title: 'Essay: The Great Gatsby',
    description: 'Write a 3-5 page analytical essay discussing the symbolism of the green light in "The Great Gatsby." Requirements: MLA format, minimum 3 scholarly sources, include in-text citations.',
    class: 'English Literature',
    dueDate: new Date(2026, 2, 25).toISOString(),
    dueTime: '3:00 PM',
    completed: false,
    source: 'google-classroom',
    points: 100,
    attachments: ['Essay_Rubric.pdf', 'MLA_Guide.pdf'],
    googleClassroomId: 'gc-assignment-2',
    courseId: 'course-2',
    courseName: 'English Literature - AP',
    createdAt: new Date(2026, 2, 18).toISOString(),
    updatedAt: new Date(2026, 2, 18).toISOString(),
  },
  {
    id: 'task-3',
    userId: 'user-1',
    title: 'Biology Lab Report',
    description: 'Submit completed lab report on cellular respiration. Include: title page, introduction, methods, results with graphs, discussion, and references.',
    class: 'AP Biology',
    dueDate: new Date(2026, 2, 25).toISOString(),
    dueTime: '2:00 PM',
    completed: true,
    source: 'google-classroom',
    points: 50,
    attachments: ['Lab_Report_Template.docx', 'Data_Collection_Sheet.xlsx'],
    googleClassroomId: 'gc-assignment-3',
    courseId: 'course-3',
    courseName: 'AP Biology',
    createdAt: new Date(2026, 2, 15).toISOString(),
    updatedAt: new Date(2026, 2, 24).toISOString(),
  },
  {
    id: 'task-4',
    userId: 'user-1',
    title: 'Study for History Quiz',
    description: 'Review chapters 12-14 on World War II. Focus on key dates, events, and major figures.',
    class: 'World History',
    dueDate: new Date(2026, 2, 26).toISOString(),
    dueTime: '9:00 AM',
    completed: false,
    source: 'manual',
    createdAt: new Date(2026, 2, 23).toISOString(),
    updatedAt: new Date(2026, 2, 23).toISOString(),
  },
  {
    id: 'task-5',
    userId: 'user-1',
    title: 'Physics Problem Set',
    description: 'Complete problems on Newton\'s Laws of Motion. Show all calculations and unit conversions.',
    class: 'Physics',
    dueDate: new Date(2026, 2, 27).toISOString(),
    dueTime: '11:59 PM',
    completed: false,
    source: 'google-classroom',
    points: 30,
    googleClassroomId: 'gc-assignment-4',
    courseId: 'course-4',
    courseName: 'Physics - Honors',
    createdAt: new Date(2026, 2, 22).toISOString(),
    updatedAt: new Date(2026, 2, 22).toISOString(),
  },
];

// ============================================================================
// Mock Google Classroom Data
// ============================================================================

export const mockCourses: GoogleClassroomCourse[] = [
  {
    id: 'course-1',
    name: 'Algebra II',
    section: 'Period 3',
    room: 'Room 204',
    ownerId: 'teacher-1',
    creationTime: new Date(2025, 8, 1).toISOString(),
    updateTime: new Date(2026, 2, 20).toISOString(),
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/course-1',
  },
  {
    id: 'course-2',
    name: 'English Literature',
    section: 'AP',
    room: 'Room 312',
    ownerId: 'teacher-2',
    creationTime: new Date(2025, 8, 1).toISOString(),
    updateTime: new Date(2026, 2, 18).toISOString(),
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/course-2',
  },
  {
    id: 'course-3',
    name: 'AP Biology',
    section: 'AP',
    room: 'Science Lab B',
    ownerId: 'teacher-3',
    creationTime: new Date(2025, 8, 1).toISOString(),
    updateTime: new Date(2026, 2, 15).toISOString(),
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/course-3',
  },
];

export const mockClassroomAssignments: GoogleClassroomAssignment[] = [
  {
    id: 'gc-assignment-1',
    courseId: 'course-1',
    courseName: 'Algebra II',
    title: 'Chapter 5 Math Homework',
    description: 'Complete problems 1-25 on pages 142-143.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/course-1/a/gc-assignment-1',
    creationTime: new Date(2026, 2, 20).toISOString(),
    updateTime: new Date(2026, 2, 20).toISOString(),
    dueDate: { year: 2026, month: 3, day: 25 },
    dueTime: { hours: 23, minutes: 59 },
    maxPoints: 20,
    workType: 'ASSIGNMENT',
  },
  {
    id: 'gc-assignment-2',
    courseId: 'course-2',
    courseName: 'English Literature',
    title: 'Essay: The Great Gatsby',
    description: 'Write a 3-5 page analytical essay.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/course-2/a/gc-assignment-2',
    creationTime: new Date(2026, 2, 18).toISOString(),
    updateTime: new Date(2026, 2, 18).toISOString(),
    dueDate: { year: 2026, month: 3, day: 25 },
    dueTime: { hours: 15, minutes: 0 },
    maxPoints: 100,
    workType: 'ASSIGNMENT',
  },
];

// ============================================================================
// Mock Streak
// ============================================================================

export const mockStreak: Streak = {
  id: 'streak-1',
  userId: 'user-1',
  currentStreak: 7,
  longestStreak: 14,
  lastCompletedDate: new Date(2026, 2, 24).toISOString(),
  totalTasksCompleted: 142,
  createdAt: new Date(2026, 0, 1).toISOString(),
  updatedAt: new Date(2026, 2, 24).toISOString(),
};

// ============================================================================
// Mock Badges
// ============================================================================

export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Complete your first task',
    category: 'tasks',
    icon: '🎯',
    requirement: 1,
    rarity: 'common',
    points: 10,
  },
  {
    id: 'badge-2',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    icon: '🔥',
    requirement: 7,
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'badge-3',
    name: 'Perfect Month',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    icon: '⭐',
    requirement: 30,
    rarity: 'epic',
    points: 200,
  },
  {
    id: 'badge-4',
    name: 'Productivity Master',
    description: 'Complete 100 tasks',
    category: 'tasks',
    icon: '👑',
    requirement: 100,
    rarity: 'epic',
    points: 150,
  },
  {
    id: 'badge-5',
    name: 'Focus Champion',
    description: 'Complete 50 focus sessions',
    category: 'focus',
    icon: '🎓',
    requirement: 50,
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'badge-6',
    name: 'Early Bird',
    description: 'Complete a task before 8 AM',
    category: 'special',
    icon: '🌅',
    requirement: 1,
    rarity: 'common',
    points: 25,
  },
];

export const mockUserBadges: UserBadge[] = [
  {
    id: 'user-badge-1',
    userId: 'user-1',
    badgeId: 'badge-1',
    badge: mockBadges[0],
    earnedAt: new Date(2026, 0, 2).toISOString(),
  },
  {
    id: 'user-badge-2',
    userId: 'user-1',
    badgeId: 'badge-2',
    badge: mockBadges[1],
    earnedAt: new Date(2026, 0, 8).toISOString(),
  },
  {
    id: 'user-badge-5',
    userId: 'user-1',
    badgeId: 'badge-6',
    badge: mockBadges[5],
    earnedAt: new Date(2026, 1, 5).toISOString(),
  },
];

// ============================================================================
// Mock Settings
// ============================================================================

export const mockSettings: UserSettings = {
  id: 'settings-1',
  userId: 'user-1',
  breakDuration: 5,
  maxBreaksPerDay: 6,
  breakIntervalMinutes: 30,
  notificationsEnabled: true,
  lockAppsEnabled: true,
  lockedApps: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Snapchat'],
  createdAt: new Date(2026, 0, 1).toISOString(),
  updatedAt: new Date(2026, 2, 20).toISOString(),
};

// ============================================================================
// Mock Break Sessions
// ============================================================================

export const mockBreakSessions: BreakSession[] = [
  {
    id: 'break-1',
    userId: 'user-1',
    startTime: new Date(2026, 2, 25, 10, 30).toISOString(),
    endTime: new Date(2026, 2, 25, 10, 35).toISOString(),
    duration: 300,
    completed: true,
    date: new Date(2026, 2, 25).toISOString(),
  },
  {
    id: 'break-2',
    userId: 'user-1',
    startTime: new Date(2026, 2, 25, 14, 15).toISOString(),
    endTime: new Date(2026, 2, 25, 14, 20).toISOString(),
    duration: 300,
    completed: true,
    date: new Date(2026, 2, 25).toISOString(),
  },
];
