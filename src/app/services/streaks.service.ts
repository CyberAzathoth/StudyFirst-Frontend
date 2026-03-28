// ============================================================================
// Streaks Service - Streak Tracking & Management
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { mockStreak } from './mock-data';
import type {
  Streak,
  StreakHistory,
  UpdateStreakRequest,
  StreakQueryParams,
  ApiResponse,
} from '../types';

class StreaksService {
  private mockStreakData: Streak = { ...mockStreak };
  private mockHistoryData: StreakHistory[] = this.generateMockHistory();

  /**
   * Get current streak
   */
  async getCurrentStreak(): Promise<Streak> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      return { ...this.mockStreakData };
    }

    const response = await apiClient.get<Streak>(
      API_ENDPOINTS.STREAKS.CURRENT
    );

    return response.data;
  }

  /**
   * Get streak history
   */
  async getStreakHistory(params?: StreakQueryParams): Promise<StreakHistory[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      let history = [...this.mockHistoryData];

      if (params?.startDate) {
        history = history.filter(
          h => new Date(h.date) >= new Date(params.startDate!)
        );
      }

      if (params?.endDate) {
        history = history.filter(
          h => new Date(h.date) <= new Date(params.endDate!)
        );
      }

      return history.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    const response = await apiClient.get<StreakHistory[]>(
      API_ENDPOINTS.STREAKS.HISTORY,
      params
    );

    return response.data;
  }

  /**
   * Update streak (called when tasks are completed)
   */
  async updateStreak(data: UpdateStreakRequest): Promise<Streak> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const today = new Date(data.date);
      today.setHours(0, 0, 0, 0);
      
      const lastCompleted = new Date(this.mockStreakData.lastCompletedDate);
      lastCompleted.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if streak continues
      if (lastCompleted.getTime() === yesterday.getTime()) {
        // Continue streak
        this.mockStreakData.currentStreak += 1;
      } else if (lastCompleted.getTime() < yesterday.getTime()) {
        // Streak broken, restart
        this.mockStreakData.currentStreak = 1;
      }
      // If today === lastCompleted, just increment tasks

      // Update longest streak if necessary
      if (this.mockStreakData.currentStreak > this.mockStreakData.longestStreak) {
        this.mockStreakData.longestStreak = this.mockStreakData.currentStreak;
      }

      this.mockStreakData.lastCompletedDate = data.date;
      this.mockStreakData.totalTasksCompleted += data.tasksCompleted;
      this.mockStreakData.updatedAt = new Date().toISOString();

      // Update history
      const historyIndex = this.mockHistoryData.findIndex(
        h => h.date === data.date
      );
      
      if (historyIndex >= 0) {
        this.mockHistoryData[historyIndex].tasksCompleted += data.tasksCompleted;
      } else {
        this.mockHistoryData.push({
          date: data.date,
          tasksCompleted: data.tasksCompleted,
          streakDay: this.mockStreakData.currentStreak,
        });
      }

      return { ...this.mockStreakData };
    }

    const response = await apiClient.post<Streak>(
      API_ENDPOINTS.STREAKS.UPDATE,
      data
    );

    return response.data;
  }

  /**
   * Generate mock history data
   */
  private generateMockHistory(): StreakHistory[] {
    const history: StreakHistory[] = [];
    const today = new Date();
    
    // Generate last 30 days of history
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Skip some days randomly to show broken streaks
      if (i > 7 && Math.random() > 0.7) continue;

      history.push({
        date: date.toISOString(),
        tasksCompleted: Math.floor(Math.random() * 5) + 1,
        streakDay: Math.max(1, 30 - i),
      });
    }

    return history;
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const streaksService = new StreaksService();
