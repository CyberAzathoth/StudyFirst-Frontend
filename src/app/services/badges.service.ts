// ============================================================================
// Badges Service - Achievement & Badge Management
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { mockBadges, mockUserBadges } from './mock-data';
import type {
  Badge,
  UserBadge,
  BadgeProgress,
  ApiResponse,
} from '../types';

class BadgesService {
  private mockBadgesData: Badge[] = [...mockBadges];
  private mockUserBadgesData: UserBadge[] = [...mockUserBadges];

  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      return [...this.mockBadgesData];
    }

    const response = await apiClient.get<Badge[]>(
      API_ENDPOINTS.BADGES.ALL
    );

    return response.data;
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(): Promise<UserBadge[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      return [...this.mockUserBadgesData];
    }

    const response = await apiClient.get<UserBadge[]>(
      API_ENDPOINTS.BADGES.USER_BADGES
    );

    return response.data;
  }

  /**
   * Get badge progress for all badges
   */
  async getBadgeProgress(): Promise<BadgeProgress[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      
      const progress: BadgeProgress[] = this.mockBadgesData.map(badge => {
        const userBadge = this.mockUserBadgesData.find(ub => ub.badgeId === badge.id);
        const isEarned = !!userBadge;

        // Mock progress calculation
        let currentProgress = 0;
        
        if (isEarned) {
          currentProgress = badge.requirement;
        } else {
          // Generate mock progress based on badge type
          switch (badge.category) {
            case 'streak':
              currentProgress = Math.min(7, badge.requirement); // Mock: 7 day streak
              break;
            case 'tasks':
              currentProgress = Math.min(142, badge.requirement); // Mock: 142 tasks completed
              break;
            case 'focus':
              currentProgress = Math.floor(badge.requirement * 0.6); // Mock: 60% progress
              break;
            default:
              currentProgress = 0;
          }
        }

        return {
          badgeId: badge.id,
          badge,
          currentProgress,
          required: badge.requirement,
          percentage: Math.min(100, (currentProgress / badge.requirement) * 100),
          isEarned,
        };
      });

      return progress;
    }

    const response = await apiClient.get<BadgeProgress[]>(
      API_ENDPOINTS.BADGES.PROGRESS
    );

    return response.data;
  }

  /**
   * Get badge by ID
   */
  async getBadgeById(id: string): Promise<Badge> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const badge = this.mockBadgesData.find(b => b.id === id);
      if (!badge) {
        throw {
          success: false,
          error: 'NOT_FOUND',
          message: 'Badge not found',
          statusCode: 404,
        };
      }

      return badge;
    }

    const response = await apiClient.get<Badge>(
      API_ENDPOINTS.BADGES.BY_ID(id)
    );

    return response.data;
  }

  /**
   * Check if user has earned a specific badge
   */
  hasBadge(badgeId: string): boolean {
    return this.mockUserBadgesData.some(ub => ub.badgeId === badgeId);
  }

  /**
   * Get total badge points earned
   */
  async getTotalPoints(): Promise<number> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(200);
      
      return this.mockUserBadgesData.reduce(
        (total, userBadge) => total + userBadge.badge.points,
        0
      );
    }

    const userBadges = await this.getUserBadges();
    return userBadges.reduce(
      (total, userBadge) => total + userBadge.badge.points,
      0
    );
  }

  /**
   * Get badges by category
   */
  async getBadgesByCategory(category: Badge['category']): Promise<Badge[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      return this.mockBadgesData.filter(b => b.category === category);
    }

    const allBadges = await this.getAllBadges();
    return allBadges.filter(b => b.category === category);
  }

  /**
   * Get recently earned badges (last 7 days)
   */
  async getRecentlyEarnedBadges(): Promise<UserBadge[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return this.mockUserBadgesData.filter(
        ub => new Date(ub.earnedAt) >= sevenDaysAgo
      ).sort((a, b) => 
        new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      );
    }

    const userBadges = await this.getUserBadges();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return userBadges.filter(
      ub => new Date(ub.earnedAt) >= sevenDaysAgo
    ).sort((a, b) => 
      new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    );
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const badgesService = new BadgesService();
