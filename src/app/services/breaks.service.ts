// ============================================================================
// Breaks Service - Break Timer & Session Management
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { mockBreakSessions, mockSettings } from './mock-data';
import type {
  BreakSession,
  CreateBreakSessionRequest,
  BreakSessionResponse,
  ApiResponse,
} from '../types';

class BreaksService {
  private mockBreakSessionsData: BreakSession[] = [...mockBreakSessions];

  /**
   * Start a new break session
   */
  async startBreak(data: CreateBreakSessionRequest): Promise<BreakSessionResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's completed breaks
      const todayBreaks = this.mockBreakSessionsData.filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime() && session.completed;
      });

      const remainingBreaks = mockSettings.maxBreaksPerDay - todayBreaks.length;

      if (remainingBreaks <= 0) {
        throw {
          success: false,
          error: 'MAX_BREAKS_EXCEEDED',
          message: 'You have reached the maximum number of breaks for today',
          statusCode: 400,
        };
      }

      // Check interval between breaks
      const lastBreak = todayBreaks[todayBreaks.length - 1];
      if (lastBreak) {
        const timeSinceLastBreak = Date.now() - new Date(lastBreak.endTime!).getTime();
        const requiredInterval = mockSettings.breakIntervalMinutes * 60 * 1000;
        
        if (timeSinceLastBreak < requiredInterval) {
          const remainingMinutes = Math.ceil((requiredInterval - timeSinceLastBreak) / 60000);
          throw {
            success: false,
            error: 'BREAK_INTERVAL_NOT_MET',
            message: `Please wait ${remainingMinutes} more minutes before taking another break`,
            statusCode: 400,
          };
        }
      }

      const newSession: BreakSession = {
        id: `break-${Date.now()}`,
        userId: 'user-1',
        startTime: new Date().toISOString(),
        duration: data.duration,
        completed: false,
        date: today.toISOString(),
      };

      this.mockBreakSessionsData.push(newSession);

      const totalBreakTimeToday = todayBreaks.reduce(
        (total, session) => total + session.duration,
        0
      );

      return {
        session: newSession,
        remainingBreaksToday: remainingBreaks - 1,
        totalBreakTimeToday,
      };
    }

    const response = await apiClient.post<BreakSessionResponse>(
      API_ENDPOINTS.BREAKS.START,
      data
    );

    return response.data;
  }

  /**
   * End a break session
   */
  async endBreak(sessionId: string): Promise<BreakSession> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(200);
      
      const sessionIndex = this.mockBreakSessionsData.findIndex(
        s => s.id === sessionId
      );

      if (sessionIndex === -1) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Break session not found',
          statusCode: 404,
        };
      }

      this.mockBreakSessionsData[sessionIndex] = {
        ...this.mockBreakSessionsData[sessionIndex],
        endTime: new Date().toISOString(),
        completed: true,
      };

      return this.mockBreakSessionsData[sessionIndex];
    }

    const response = await apiClient.post<BreakSession>(
      API_ENDPOINTS.BREAKS.END(sessionId)
    );

    return response.data;
  }

  /**
   * Get break sessions for today
   */
  async getTodayBreaks(): Promise<{
    sessions: BreakSession[];
    remainingBreaks: number;
    totalBreakTime: number;
  }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySessions = this.mockBreakSessionsData.filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });

      const completedBreaks = todaySessions.filter(s => s.completed).length;
      const totalBreakTime = todaySessions
        .filter(s => s.completed)
        .reduce((total, session) => total + session.duration, 0);

      return {
        sessions: todaySessions,
        remainingBreaks: mockSettings.maxBreaksPerDay - completedBreaks,
        totalBreakTime,
      };
    }

    const response = await apiClient.get<{
      sessions: BreakSession[];
      remainingBreaks: number;
      totalBreakTime: number;
    }>(API_ENDPOINTS.BREAKS.TODAY);

    return response.data;
  }

  /**
   * Get all break sessions
   */
  async getAllBreaks(): Promise<BreakSession[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      return [...this.mockBreakSessionsData].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    }

    const response = await apiClient.get<BreakSession[]>(
      API_ENDPOINTS.BREAKS.BASE
    );

    return response.data;
  }

  /**
   * Check if user can take a break now
   */
  async canTakeBreak(): Promise<{
    canTake: boolean;
    reason?: string;
    waitMinutes?: number;
  }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(200);
      
      const todayData = await this.getTodayBreaks();
      
      if (todayData.remainingBreaks <= 0) {
        return {
          canTake: false,
          reason: 'Maximum breaks reached for today',
        };
      }

      // Check last break time
      const completedToday = todayData.sessions.filter(s => s.completed);
      if (completedToday.length > 0) {
        const lastBreak = completedToday[completedToday.length - 1];
        const timeSinceLastBreak = Date.now() - new Date(lastBreak.endTime!).getTime();
        const requiredInterval = mockSettings.breakIntervalMinutes * 60 * 1000;
        
        if (timeSinceLastBreak < requiredInterval) {
          const waitMinutes = Math.ceil((requiredInterval - timeSinceLastBreak) / 60000);
          return {
            canTake: false,
            reason: `Please wait ${waitMinutes} more minutes`,
            waitMinutes,
          };
        }
      }

      return { canTake: true };
    }

    // In production, this would be a real API call
    const todayData = await this.getTodayBreaks();
    
    if (todayData.remainingBreaks <= 0) {
      return {
        canTake: false,
        reason: 'Maximum breaks reached for today',
      };
    }

    return { canTake: true };
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const breaksService = new BreaksService();
