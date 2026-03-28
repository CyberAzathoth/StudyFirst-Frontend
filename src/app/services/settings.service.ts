// ============================================================================
// Settings Service - User Settings Management
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS } from './config';
import { mockSettings } from './mock-data';
import type {
  UserSettings,
  UpdateSettingsRequest,
  ApiResponse,
} from '../types';

class SettingsService {
  private mockSettingsData: UserSettings = { ...mockSettings };

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      return { ...this.mockSettingsData };
    }

    const response = await apiClient.get<UserSettings>(
      API_ENDPOINTS.SETTINGS.GET
    );

    return response.data;
  }

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<UserSettings> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      this.mockSettingsData = {
        ...this.mockSettingsData,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return { ...this.mockSettingsData };
    }

    const response = await apiClient.put<UserSettings>(
      API_ENDPOINTS.SETTINGS.UPDATE,
      data
    );

    return response.data;
  }

  /**
   * Add app to locked apps list
   */
  async addLockedApp(appName: string): Promise<UserSettings> {
    const currentSettings = await this.getSettings();
    
    if (currentSettings.lockedApps.includes(appName)) {
      return currentSettings;
    }

    return this.updateSettings({
      lockedApps: [...currentSettings.lockedApps, appName],
    });
  }

  /**
   * Remove app from locked apps list
   */
  async removeLockedApp(appName: string): Promise<UserSettings> {
    const currentSettings = await this.getSettings();
    
    return this.updateSettings({
      lockedApps: currentSettings.lockedApps.filter(app => app !== appName),
    });
  }

  /**
   * Toggle app lock
   */
  async toggleAppLock(enabled: boolean): Promise<UserSettings> {
    return this.updateSettings({
      lockAppsEnabled: enabled,
    });
  }

  /**
   * Toggle notifications
   */
  async toggleNotifications(enabled: boolean): Promise<UserSettings> {
    return this.updateSettings({
      notificationsEnabled: enabled,
    });
  }

  /**
   * Update break settings
   */
  async updateBreakSettings(settings: {
    breakDuration?: number;
    maxBreaksPerDay?: number;
    breakIntervalMinutes?: number;
  }): Promise<UserSettings> {
    return this.updateSettings(settings);
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<UserSettings> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(400);
      
      const defaults: UserSettings = {
        ...this.mockSettingsData,
        breakDuration: 5,
        maxBreaksPerDay: 6,
        breakIntervalMinutes: 30,
        notificationsEnabled: true,
        lockAppsEnabled: true,
        lockedApps: ['Instagram', 'TikTok', 'YouTube', 'Twitter'],
        updatedAt: new Date().toISOString(),
      };

      this.mockSettingsData = defaults;
      return { ...defaults };
    }

    return this.updateSettings({
      breakDuration: 5,
      maxBreaksPerDay: 6,
      breakIntervalMinutes: 30,
      notificationsEnabled: true,
      lockAppsEnabled: true,
      lockedApps: ['Instagram', 'TikTok', 'YouTube', 'Twitter'],
    });
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const settingsService = new SettingsService();
