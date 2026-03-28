// ============================================================================
// Services - Export All Services
// ============================================================================

export { authService } from './auth.service';
export { tasksService } from './tasks.service';
export { classroomService } from './classroom.service';
export { streaksService } from './streaks.service';
export { badgesService } from './badges.service';
export { breaksService } from './breaks.service';
export { settingsService } from './settings.service';

export { apiClient } from './api-client';
export { API_CONFIG, API_ENDPOINTS } from './config';

// Re-export types for convenience
export type * from '../types';
