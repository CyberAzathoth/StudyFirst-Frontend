// ============================================================================
// Auth Service - Authentication & Authorization
// ============================================================================

import { apiClient } from './api-client';
import { API_CONFIG, API_ENDPOINTS, AUTH_STORAGE_KEY } from './config';
import {
  mockUser,
} from './mock-data';
import type {
  User,
  LoginRequest,
  LoginResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse,
} from '../types';

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      await this.delay(1000);
      
      const mockResponse: LoginResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
      };

      apiClient.setTokens(mockResponse.tokens.accessToken, mockResponse.tokens.refreshToken);
      this.setUser(mockResponse.user);
      
      return mockResponse;
    }

    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.data.tokens) {
      apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<LoginResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      await this.delay(1000);
      
      const mockResponse: LoginResponse = {
        user: {
          ...mockUser,
          email: data.email,
          name: data.name,
          id: 'user-' + Date.now(),
        },
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
      };

      apiClient.setTokens(mockResponse.tokens.accessToken, mockResponse.tokens.refreshToken);
      this.setUser(mockResponse.user);
      
      return mockResponse;
    }

    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    if (response.data.tokens) {
      apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Authenticate with Google
   */
  async googleAuth(authData: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock implementation
      await this.delay(1500);
      
      const mockResponse: GoogleAuthResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'mock-google-access-token-' + Date.now(),
          refreshToken: 'mock-google-refresh-token-' + Date.now(),
          expiresIn: 3600,
        },
        isNewUser: false,
      };

      apiClient.setTokens(mockResponse.tokens.accessToken, mockResponse.tokens.refreshToken);
      this.setUser(mockResponse.user);
      
      return mockResponse;
    }

    const response = await apiClient.post<GoogleAuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE_AUTH,
      authData
    );

    if (response.data.tokens) {
      apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(500);
      
      const mockResponse: RefreshTokenResponse = {
        accessToken: 'mock-refreshed-access-token-' + Date.now(),
        refreshToken: 'mock-refreshed-refresh-token-' + Date.now(),
        expiresIn: 3600,
      };

      apiClient.setTokens(mockResponse.accessToken, mockResponse.refreshToken);
      
      return mockResponse;
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (response.data) {
      apiClient.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
    }

    return response.data;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      return mockUser;
    }

    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    this.setUser(response.data);
    return response.data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await this.delay(300);
      apiClient.clearTokens();
      this.clearUser();
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      apiClient.clearTokens();
      this.clearUser();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getUser();
    return !!user;
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Store user in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Clear user from localStorage
   */
  private clearUser(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  /**
   * Utility: delay for mock data
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();
