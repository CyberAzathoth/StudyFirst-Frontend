// ============================================================================
// Classroom Service - Google Classroom Integration
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { mockCourses, mockClassroomAssignments } from './mock-data';
import type {
  GoogleClassroomCourse,
  GoogleClassroomAssignment,
  SyncClassroomRequest,
  SyncClassroomResponse,
  ApiResponse,
} from '../types';

class ClassroomService {
  /**
   * Sync Google Classroom data
   */
  async syncClassroom(request?: SyncClassroomRequest): Promise<SyncClassroomResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(2000); // Simulate longer sync time
      
      const mockResponse: SyncClassroomResponse = {
        syncedAt: new Date().toISOString(),
        coursesCount: mockCourses.length,
        assignmentsCount: mockClassroomAssignments.length,
        newAssignments: request?.forceRefresh ? mockClassroomAssignments.length : 2,
      };

      return mockResponse;
    }

    const response = await apiClient.post<SyncClassroomResponse>(
      API_ENDPOINTS.CLASSROOM.SYNC,
      request
    );

    return response.data;
  }

  /**
   * Get all courses
   */
  async getCourses(): Promise<GoogleClassroomCourse[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      return [...mockCourses];
    }

    const response = await apiClient.get<GoogleClassroomCourse[]>(
      API_ENDPOINTS.CLASSROOM.COURSES
    );

    return response.data;
  }

  /**
   * Get all assignments from Google Classroom
   */
  async getAssignments(): Promise<GoogleClassroomAssignment[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(600);
      return [...mockClassroomAssignments];
    }

    const response = await apiClient.get<GoogleClassroomAssignment[]>(
      API_ENDPOINTS.CLASSROOM.ASSIGNMENTS
    );

    return response.data;
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string): Promise<GoogleClassroomAssignment> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const assignment = mockClassroomAssignments.find(a => a.id === id);
      if (!assignment) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Assignment not found',
          statusCode: 404,
        };
      }

      return assignment;
    }

    const response = await apiClient.get<GoogleClassroomAssignment>(
      API_ENDPOINTS.CLASSROOM.ASSIGNMENT_BY_ID(id)
    );

    return response.data;
  }

  /**
   * Connect Google Classroom account
   * Returns the Google OAuth URL for authorization
   */
  async connectClassroom(): Promise<{ authUrl: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      
      // Mock OAuth URL
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?mock=true',
      };
    }

    const response = await apiClient.get<{ authUrl: string }>(
      API_ENDPOINTS.CLASSROOM.CONNECT
    );

    return response.data;
  }

  /**
   * Disconnect Google Classroom account
   */
  async disconnectClassroom(): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      return;
    }

    await apiClient.post(API_ENDPOINTS.CLASSROOM.DISCONNECT);
  }

  /**
   * Get Google Classroom connection status
   */
  async getClassroomStatus(): Promise<{
    connected: boolean;
    lastSyncedAt?: string;
    coursesCount?: number;
  }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      return {
        connected: true,
        lastSyncedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        coursesCount: mockCourses.length,
      };
    }

    const response = await apiClient.get<{
      connected: boolean;
      lastSyncedAt?: string;
      coursesCount?: number;
    }>(API_ENDPOINTS.CLASSROOM.STATUS);

    return response.data;
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const classroomService = new ClassroomService();
